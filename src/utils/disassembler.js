import { OPCODES, toHex } from '../data/cpu8085';

/**
 * Disassembles a chunk of memory into an array of instruction objects.
 * Stops after maxLines or when it hits 5 consecutive 0x00 (NOP) bytes, 
 * assuming it reached the end of the program.
 */
export function disassembleMemory(memory, startAddr = 0x2000, maxLines = 100) {
  const lines = [];
  let addr = startAddr & 0xFFFF;
  let consecutiveNops = 0;

  for (let i = 0; i < maxLines; i++) {
    if (addr >= 0xFFFF) break;

    const opcodeHex = memory[addr];
    const opInfo = OPCODES[opcodeHex];
    
    // Count consecutive NOPs (0x00) to heuristically stop disassembling empty space
    if (opcodeHex === 0x00) {
      consecutiveNops++;
    } else {
      consecutiveNops = 0;
    }

    if (consecutiveNops > 5) {
      // Remove the last few NOPs from the output if we're stopping
      for(let j=0; j<5; j++) lines.pop();
      break;
    }

    let mnemonic = 'UNKNOWN';
    let bytes = 1;
    let hexStr = toHex(opcodeHex);
    let operandStr = '';

    if (opInfo) {
      mnemonic = opInfo.mnemonic;
      bytes = opInfo.bytes;
      
      if (bytes === 2 && addr + 1 <= 0xFFFF) {
        const data8 = memory[addr + 1];
        hexStr += ' ' + toHex(data8);
        operandStr = toHex(data8);
        // Replace "Data" or placeholder in mnemonic if we want, but currently our mnemonics don't have "Data" in the string itself (e.g. "MVI A"). 
        // Wait, OPCODES has "MVI A" not "MVI A, Data". So we append the operand.
        // Some mnemonics might need operands appended.
        if (mnemonic.includes(' ')) {
           mnemonic += ', ' + operandStr + 'H';
        } else {
           mnemonic += ' ' + operandStr + 'H';
        }
      } else if (bytes === 3 && addr + 2 <= 0xFFFF) {
        const low = memory[addr + 1];
        const high = memory[addr + 2];
        hexStr += ' ' + toHex(low) + ' ' + toHex(high);
        const data16 = (high << 8) | low;
        operandStr = toHex(data16, 4);
        if (mnemonic.includes(' ')) {
           mnemonic += ', ' + operandStr + 'H';
        } else {
           mnemonic += ' ' + operandStr + 'H';
        }
      }
    }

    lines.push({
      address: addr,
      hex: hexStr,
      mnemonic: mnemonic,
      bytes: bytes
    });

    addr += bytes;
  }

  return lines;
}
