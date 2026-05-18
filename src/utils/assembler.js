import { OPCODES } from '../data/cpu8085';

// Build a reverse mapping from normalized mnemonic to opcode info.
// We sort by mnemonic length descending so longer, more-specific mnemonics
// (e.g. "MOV B,C") match before shorter ones (e.g. "MOV B").
const MNEMONIC_MAP = [];
for (const [, info] of Object.entries(OPCODES)) {
  // Normalize: collapse surrounding spaces on commas, squeeze multi-spaces
  const normMnemonic = info.mnemonic
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',');

  MNEMONIC_MAP.push({
    mnemonic: normMnemonic,
    opcode:   info.opcode ?? parseInt(Object.keys(OPCODES).find(k => OPCODES[k] === info), 10),
    bytes:    info.bytes,
  });
}

// Re-build with correct opcode values by iterating entries properly
MNEMONIC_MAP.length = 0;
for (const [hexKey, info] of Object.entries(OPCODES)) {
  const opcode = Number(hexKey); // Object.entries gives decimal string keys for numeric keys
  const normMnemonic = info.mnemonic
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',');

  MNEMONIC_MAP.push({ mnemonic: normMnemonic, opcode, bytes: info.bytes });
}
MNEMONIC_MAP.sort((a, b) => b.mnemonic.length - a.mnemonic.length);

/**
 * Parses a hex operand string.
 * Supports: 05, 05H, 0x05, 0X05
 * Returns NaN for invalid input.
 */
function parseOperand(opStr) {
  if (!opStr) return NaN;
  let str = opStr.trim().toUpperCase();

  if (str.startsWith('0X')) return parseInt(str.slice(2), 16);
  if (str.endsWith('H'))   return parseInt(str.slice(0, -1), 16);
  // Default: treat as hex (standard for 8085 assembly)
  return parseInt(str, 16);
}

/**
 * Assembles a multi-line string of 8085 assembly code into machine code bytes.
 *
 * @param {string} sourceText  The raw assembly source.
 * @param {number} baseAddr    Starting load address (default 0x0000).
 * @returns {{ success: boolean, bytes?: number[], errors?: string[] }}
 */
export function assemble(sourceText, baseAddr = 0x0000) {
  const rawLines  = sourceText.split('\n');
  const errors    = [];
  const parsedLines = [];
  const symbolMap = {}; // label (uppercase) -> absolute address
  let currentAddr = baseAddr & 0xFFFF;

  // ── Pass 1: tokenise, resolve label positions ──────────────────────────────
  for (let i = 0; i < rawLines.length; i++) {
    const lineNum = i + 1;

    // Strip inline comment and normalise whitespace
    let line = rawLines[i].split(';')[0].trim().replace(/\s+/g, ' ');

    if (!line) {
      parsedLines.push({ type: 'empty', lineNum });
      continue;
    }

    // Extract leading label (anything before the first colon)
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const labelRaw = line.slice(0, colonIdx).trim().toUpperCase();

      // Validate label: must be a valid identifier (letters/digits/_), no spaces
      if (!/^[A-Z_][A-Z0-9_]*$/.test(labelRaw)) {
        errors.push(`Line ${lineNum}: Invalid label '${labelRaw}'`);
      } else if (symbolMap[labelRaw] !== undefined) {
        errors.push(`Line ${lineNum}: Duplicate label '${labelRaw}'`);
      } else {
        symbolMap[labelRaw] = currentAddr;
      }

      // Rest of the line after the colon (may be empty or contain an instruction)
      line = line.slice(colonIdx + 1).trim().replace(/\s+/g, ' ');
    }

    if (!line) {
      // Label-only line
      parsedLines.push({ type: 'label_only', lineNum });
      continue;
    }

    // Normalise operand separators: collapse spaces around commas
    const normLine = line.toUpperCase().replace(/\s*,\s*/g, ',');

    // Find the matching mnemonic (longest match wins because of sort order)
    let matchedEntry = null;
    let operandStr   = '';

    for (const entry of MNEMONIC_MAP) {
      if (!normLine.startsWith(entry.mnemonic)) continue;

      const remainder = normLine.slice(entry.mnemonic.length);

      // Guard against prefix false-matches (e.g. "JMP" matching "JMPX")
      // A valid match means the remainder is empty, starts with space or comma.
      if (remainder.length === 0 || remainder[0] === ' ' || remainder[0] === ',') {
        matchedEntry = entry;
        // Strip leading separator characters to get the raw operand token
        operandStr = remainder.replace(/^[,\s]+/, '').trim();
        break;
      }
    }

    if (!matchedEntry) {
      errors.push(`Line ${lineNum}: Unknown instruction '${normLine}'`);
      parsedLines.push({ type: 'error', lineNum });
      // Still advance addr by 1 so subsequent label offsets are plausible
      currentAddr = (currentAddr + 1) & 0xFFFF;
      continue;
    }

    parsedLines.push({
      type:       'instruction',
      lineNum,
      addr:       currentAddr,
      opcode:     matchedEntry.opcode,
      bytes:      matchedEntry.bytes,
      operandStr,
    });

    currentAddr = (currentAddr + matchedEntry.bytes) & 0xFFFF;
  }

  // Bail early if pass 1 had errors (symbol table may be incomplete)
  if (errors.length > 0) return { success: false, errors };

  // ── Pass 2: emit bytes, resolve labels ────────────────────────────────────
  const outBytes = [];

  for (const pLine of parsedLines) {
    if (pLine.type !== 'instruction') continue;

    // Emit opcode byte
    outBytes.push(pLine.opcode & 0xFF);

    if (pLine.bytes === 1) continue; // no operand bytes needed

    // Resolve operand --------------------------------------------------------
    const opToken = pLine.operandStr.toUpperCase();

    if (!opToken) {
      // Instruction requires operand bytes but none provided
      errors.push(`Line ${pLine.lineNum}: Missing operand for '${MNEMONIC_MAP.find(e => e.opcode === pLine.opcode)?.mnemonic ?? pLine.opcode.toString(16).toUpperCase()}'`);
      // Push zeros as placeholder so byte-count stays correct
      for (let k = 1; k < pLine.bytes; k++) outBytes.push(0x00);
      continue;
    }

    // Is the operand a known label?
    if (symbolMap[opToken] !== undefined) {
      const targetAddr = symbolMap[opToken] & 0xFFFF;
      if (pLine.bytes === 2) {
        // 8-bit operand taking a label is unusual but handle gracefully
        outBytes.push(targetAddr & 0xFF);
      } else {
        // 16-bit address, little-endian
        outBytes.push(targetAddr & 0xFF);
        outBytes.push((targetAddr >> 8) & 0xFF);
      }
      continue;
    }

    // Otherwise treat as a numeric literal
    const num = parseOperand(opToken);
    if (isNaN(num)) {
      errors.push(`Line ${pLine.lineNum}: Invalid operand or undefined label '${pLine.operandStr}'`);
      for (let k = 1; k < pLine.bytes; k++) outBytes.push(0x00);
    } else {
      if (pLine.bytes === 2) {
        outBytes.push(num & 0xFF);
      } else {
        // 3-byte instruction, 16-bit little-endian operand
        outBytes.push(num & 0xFF);
        outBytes.push((num >> 8) & 0xFF);
      }
    }
  }

  if (errors.length > 0) return { success: false, errors };
  return { success: true, bytes: outBytes };
}
