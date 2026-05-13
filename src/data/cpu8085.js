/**
 * 8085 Simulator State & Logic
 * Manages registers, flags, memory, and input state for the trainer kit
 */

export const INITIAL_REGISTERS = {
  A: 0x00,
  B: 0x00,
  C: 0x00,
  D: 0x00,
  E: 0x00,
  H: 0x00,
  L: 0x00,
  PC: 0x0000,
  SP: 0xFFFF,
};

export const INITIAL_FLAGS = {
  S: 0,  // Sign
  Z: 0,  // Zero
  AC: 0, // Auxiliary Carry
  P: 0,  // Parity
  CY: 0, // Carry
};

export const MEMORY_SIZE = 65536;

export function createInitialMemory() {
  return new Uint8Array(MEMORY_SIZE);
}

// 8085 Opcode table (partial - key instructions for display)
export const OPCODES = {
  0x00: { mnemonic: 'NOP',     bytes: 1, cycles: 4,  desc: 'No Operation' },
  0x01: { mnemonic: 'LXI B',   bytes: 3, cycles: 10, desc: 'Load immediate into BC' },
  0x02: { mnemonic: 'STAX B',  bytes: 1, cycles: 7,  desc: 'Store A indirect through BC' },
  0x03: { mnemonic: 'INX B',   bytes: 1, cycles: 6,  desc: 'Increment BC' },
  0x04: { mnemonic: 'INR B',   bytes: 1, cycles: 4,  desc: 'Increment B' },
  0x05: { mnemonic: 'DCR B',   bytes: 1, cycles: 4,  desc: 'Decrement B' },
  0x06: { mnemonic: 'MVI B',   bytes: 2, cycles: 7,  desc: 'Move immediate to B' },
  0x07: { mnemonic: 'RLC',     bytes: 1, cycles: 4,  desc: 'Rotate A left through carry' },
  0x09: { mnemonic: 'DAD B',   bytes: 1, cycles: 10, desc: 'Add BC to HL' },
  0x0A: { mnemonic: 'LDAX B',  bytes: 1, cycles: 7,  desc: 'Load A indirect through BC' },
  0x0B: { mnemonic: 'DCX B',   bytes: 1, cycles: 6,  desc: 'Decrement BC' },
  0x0C: { mnemonic: 'INR C',   bytes: 1, cycles: 4,  desc: 'Increment C' },
  0x0D: { mnemonic: 'DCR C',   bytes: 1, cycles: 4,  desc: 'Decrement C' },
  0x0E: { mnemonic: 'MVI C',   bytes: 2, cycles: 7,  desc: 'Move immediate to C' },
  0x0F: { mnemonic: 'RRC',     bytes: 1, cycles: 4,  desc: 'Rotate A right through carry' },
  0x11: { mnemonic: 'LXI D',   bytes: 3, cycles: 10, desc: 'Load immediate into DE' },
  0x13: { mnemonic: 'INX D',   bytes: 1, cycles: 6,  desc: 'Increment DE' },
  0x14: { mnemonic: 'INR D',   bytes: 1, cycles: 4,  desc: 'Increment D' },
  0x15: { mnemonic: 'DCR D',   bytes: 1, cycles: 4,  desc: 'Decrement D' },
  0x16: { mnemonic: 'MVI D',   bytes: 2, cycles: 7,  desc: 'Move immediate to D' },
  0x19: { mnemonic: 'DAD D',   bytes: 1, cycles: 10, desc: 'Add DE to HL' },
  0x1A: { mnemonic: 'LDAX D',  bytes: 1, cycles: 7,  desc: 'Load A indirect through DE' },
  0x1B: { mnemonic: 'DCX D',   bytes: 1, cycles: 6,  desc: 'Decrement DE' },
  0x1C: { mnemonic: 'INR E',   bytes: 1, cycles: 4,  desc: 'Increment E' },
  0x1D: { mnemonic: 'DCR E',   bytes: 1, cycles: 4,  desc: 'Decrement E' },
  0x1E: { mnemonic: 'MVI E',   bytes: 2, cycles: 7,  desc: 'Move immediate to E' },
  0x21: { mnemonic: 'LXI H',   bytes: 3, cycles: 10, desc: 'Load immediate into HL' },
  0x22: { mnemonic: 'SHLD',    bytes: 3, cycles: 16, desc: 'Store HL direct' },
  0x23: { mnemonic: 'INX H',   bytes: 1, cycles: 6,  desc: 'Increment HL' },
  0x24: { mnemonic: 'INR H',   bytes: 1, cycles: 4,  desc: 'Increment H' },
  0x25: { mnemonic: 'DCR H',   bytes: 1, cycles: 4,  desc: 'Decrement H' },
  0x26: { mnemonic: 'MVI H',   bytes: 2, cycles: 7,  desc: 'Move immediate to H' },
  0x27: { mnemonic: 'DAA',     bytes: 1, cycles: 4,  desc: 'Decimal adjust accumulator' },
  0x29: { mnemonic: 'DAD H',   bytes: 1, cycles: 10, desc: 'Add HL to HL' },
  0x2A: { mnemonic: 'LHLD',    bytes: 3, cycles: 16, desc: 'Load HL direct' },
  0x2B: { mnemonic: 'DCX H',   bytes: 1, cycles: 6,  desc: 'Decrement HL' },
  0x2C: { mnemonic: 'INR L',   bytes: 1, cycles: 4,  desc: 'Increment L' },
  0x2D: { mnemonic: 'DCR L',   bytes: 1, cycles: 4,  desc: 'Decrement L' },
  0x2E: { mnemonic: 'MVI L',   bytes: 2, cycles: 7,  desc: 'Move immediate to L' },
  0x2F: { mnemonic: 'CMA',     bytes: 1, cycles: 4,  desc: 'Complement accumulator' },
  0x31: { mnemonic: 'LXI SP',  bytes: 3, cycles: 10, desc: 'Load immediate into SP' },
  0x32: { mnemonic: 'STA',     bytes: 3, cycles: 13, desc: 'Store A direct' },
  0x33: { mnemonic: 'INX SP',  bytes: 1, cycles: 6,  desc: 'Increment SP' },
  0x34: { mnemonic: 'INR M',   bytes: 1, cycles: 10, desc: 'Increment memory (HL)' },
  0x35: { mnemonic: 'DCR M',   bytes: 1, cycles: 10, desc: 'Decrement memory (HL)' },
  0x36: { mnemonic: 'MVI M',   bytes: 2, cycles: 10, desc: 'Move immediate to memory (HL)' },
  0x37: { mnemonic: 'STC',     bytes: 1, cycles: 4,  desc: 'Set carry' },
  0x39: { mnemonic: 'DAD SP',  bytes: 1, cycles: 10, desc: 'Add SP to HL' },
  0x3A: { mnemonic: 'LDA',     bytes: 3, cycles: 13, desc: 'Load A direct' },
  0x3B: { mnemonic: 'DCX SP',  bytes: 1, cycles: 6,  desc: 'Decrement SP' },
  0x3C: { mnemonic: 'INR A',   bytes: 1, cycles: 4,  desc: 'Increment A' },
  0x3D: { mnemonic: 'DCR A',   bytes: 1, cycles: 4,  desc: 'Decrement A' },
  0x3E: { mnemonic: 'MVI A',   bytes: 2, cycles: 7,  desc: 'Move immediate to A' },
  0x3F: { mnemonic: 'CMC',     bytes: 1, cycles: 4,  desc: 'Complement carry' },
  0x40: { mnemonic: 'MOV B,B', bytes: 1, cycles: 4,  desc: 'Move B to B' },
  0x41: { mnemonic: 'MOV B,C', bytes: 1, cycles: 4,  desc: 'Move C to B' },
  0x42: { mnemonic: 'MOV B,D', bytes: 1, cycles: 4,  desc: 'Move D to B' },
  0x43: { mnemonic: 'MOV B,E', bytes: 1, cycles: 4,  desc: 'Move E to B' },
  0x44: { mnemonic: 'MOV B,H', bytes: 1, cycles: 4,  desc: 'Move H to B' },
  0x45: { mnemonic: 'MOV B,L', bytes: 1, cycles: 4,  desc: 'Move L to B' },
  0x46: { mnemonic: 'MOV B,M', bytes: 1, cycles: 7,  desc: 'Move memory (HL) to B' },
  0x47: { mnemonic: 'MOV B,A', bytes: 1, cycles: 4,  desc: 'Move A to B' },
  0x48: { mnemonic: 'MOV C,B', bytes: 1, cycles: 4,  desc: 'Move B to C' },
  0x49: { mnemonic: 'MOV C,C', bytes: 1, cycles: 4,  desc: 'Move C to C' },
  0x4A: { mnemonic: 'MOV C,D', bytes: 1, cycles: 4,  desc: 'Move D to C' },
  0x4B: { mnemonic: 'MOV C,E', bytes: 1, cycles: 4,  desc: 'Move E to C' },
  0x4C: { mnemonic: 'MOV C,H', bytes: 1, cycles: 4,  desc: 'Move H to C' },
  0x4D: { mnemonic: 'MOV C,L', bytes: 1, cycles: 4,  desc: 'Move L to C' },
  0x4E: { mnemonic: 'MOV C,M', bytes: 1, cycles: 7,  desc: 'Move memory (HL) to C' },
  0x4F: { mnemonic: 'MOV C,A', bytes: 1, cycles: 4,  desc: 'Move A to C' },
  0x56: { mnemonic: 'MOV D,M', bytes: 1, cycles: 7,  desc: 'Move memory (HL) to D' },
  0x57: { mnemonic: 'MOV D,A', bytes: 1, cycles: 4,  desc: 'Move A to D' },
  0x5E: { mnemonic: 'MOV E,M', bytes: 1, cycles: 7,  desc: 'Move memory (HL) to E' },
  0x5F: { mnemonic: 'MOV E,A', bytes: 1, cycles: 4,  desc: 'Move A to E' },
  0x66: { mnemonic: 'MOV H,M', bytes: 1, cycles: 7,  desc: 'Move memory (HL) to H' },
  0x67: { mnemonic: 'MOV H,A', bytes: 1, cycles: 4,  desc: 'Move A to H' },
  0x6E: { mnemonic: 'MOV L,M', bytes: 1, cycles: 7,  desc: 'Move memory (HL) to L' },
  0x6F: { mnemonic: 'MOV L,A', bytes: 1, cycles: 4,  desc: 'Move A to L' },
  0x76: { mnemonic: 'HLT',     bytes: 1, cycles: 5,  desc: 'Halt (wait for interrupt)' },
  0x77: { mnemonic: 'MOV M,A', bytes: 1, cycles: 7,  desc: 'Move A to memory (HL)' },
  0x78: { mnemonic: 'MOV A,B', bytes: 1, cycles: 4,  desc: 'Move B to A' },
  0x79: { mnemonic: 'MOV A,C', bytes: 1, cycles: 4,  desc: 'Move C to A' },
  0x7A: { mnemonic: 'MOV A,D', bytes: 1, cycles: 4,  desc: 'Move D to A' },
  0x7B: { mnemonic: 'MOV A,E', bytes: 1, cycles: 4,  desc: 'Move E to A' },
  0x7C: { mnemonic: 'MOV A,H', bytes: 1, cycles: 4,  desc: 'Move H to A' },
  0x7D: { mnemonic: 'MOV A,L', bytes: 1, cycles: 4,  desc: 'Move L to A' },
  0x7E: { mnemonic: 'MOV A,M', bytes: 1, cycles: 7,  desc: 'Move memory (HL) to A' },
  0x7F: { mnemonic: 'MOV A,A', bytes: 1, cycles: 4,  desc: 'Move A to A' },
  0x80: { mnemonic: 'ADD B',   bytes: 1, cycles: 4,  desc: 'Add B to A' },
  0x81: { mnemonic: 'ADD C',   bytes: 1, cycles: 4,  desc: 'Add C to A' },
  0x82: { mnemonic: 'ADD D',   bytes: 1, cycles: 4,  desc: 'Add D to A' },
  0x83: { mnemonic: 'ADD E',   bytes: 1, cycles: 4,  desc: 'Add E to A' },
  0x84: { mnemonic: 'ADD H',   bytes: 1, cycles: 4,  desc: 'Add H to A' },
  0x85: { mnemonic: 'ADD L',   bytes: 1, cycles: 4,  desc: 'Add L to A' },
  0x86: { mnemonic: 'ADD M',   bytes: 1, cycles: 7,  desc: 'Add memory (HL) to A' },
  0x87: { mnemonic: 'ADD A',   bytes: 1, cycles: 4,  desc: 'Add A to A' },
  0x88: { mnemonic: 'ADC B',   bytes: 1, cycles: 4,  desc: 'Add B + carry to A' },
  0x90: { mnemonic: 'SUB B',   bytes: 1, cycles: 4,  desc: 'Subtract B from A' },
  0x97: { mnemonic: 'SUB A',   bytes: 1, cycles: 4,  desc: 'Subtract A from A' },
  0xA0: { mnemonic: 'ANA B',   bytes: 1, cycles: 4,  desc: 'AND B with A' },
  0xA7: { mnemonic: 'ANA A',   bytes: 1, cycles: 4,  desc: 'AND A with A' },
  0xA8: { mnemonic: 'XRA B',   bytes: 1, cycles: 4,  desc: 'XOR B with A' },
  0xAF: { mnemonic: 'XRA A',   bytes: 1, cycles: 4,  desc: 'XOR A with A (clear A)' },
  0xB0: { mnemonic: 'ORA B',   bytes: 1, cycles: 4,  desc: 'OR B with A' },
  0xB7: { mnemonic: 'ORA A',   bytes: 1, cycles: 4,  desc: 'OR A with A' },
  0xB8: { mnemonic: 'CMP B',   bytes: 1, cycles: 4,  desc: 'Compare B with A' },
  0xBF: { mnemonic: 'CMP A',   bytes: 1, cycles: 4,  desc: 'Compare A with A' },
  0xC0: { mnemonic: 'RNZ',     bytes: 1, cycles: 6,  desc: 'Return if not zero' },
  0xC1: { mnemonic: 'POP B',   bytes: 1, cycles: 10, desc: 'Pop BC from stack' },
  0xC2: { mnemonic: 'JNZ',     bytes: 3, cycles: 10, desc: 'Jump if not zero' },
  0xC3: { mnemonic: 'JMP',     bytes: 3, cycles: 10, desc: 'Unconditional jump' },
  0xC4: { mnemonic: 'CNZ',     bytes: 3, cycles: 9,  desc: 'Call if not zero' },
  0xC5: { mnemonic: 'PUSH B',  bytes: 1, cycles: 12, desc: 'Push BC onto stack' },
  0xC6: { mnemonic: 'ADI',     bytes: 2, cycles: 7,  desc: 'Add immediate to A' },
  0xC7: { mnemonic: 'RST 0',   bytes: 1, cycles: 12, desc: 'Restart at 0x0000' },
  0xC8: { mnemonic: 'RZ',      bytes: 1, cycles: 6,  desc: 'Return if zero' },
  0xC9: { mnemonic: 'RET',     bytes: 1, cycles: 10, desc: 'Return from subroutine' },
  0xCA: { mnemonic: 'JZ',      bytes: 3, cycles: 10, desc: 'Jump if zero' },
  0xCC: { mnemonic: 'CZ',      bytes: 3, cycles: 9,  desc: 'Call if zero' },
  0xCD: { mnemonic: 'CALL',    bytes: 3, cycles: 18, desc: 'Call subroutine' },
  0xCE: { mnemonic: 'ACI',     bytes: 2, cycles: 7,  desc: 'Add immediate + carry to A' },
  0xD1: { mnemonic: 'POP D',   bytes: 1, cycles: 10, desc: 'Pop DE from stack' },
  0xD2: { mnemonic: 'JNC',     bytes: 3, cycles: 10, desc: 'Jump if no carry' },
  0xD3: { mnemonic: 'OUT',     bytes: 2, cycles: 10, desc: 'Output to port' },
  0xD5: { mnemonic: 'PUSH D',  bytes: 1, cycles: 12, desc: 'Push DE onto stack' },
  0xD6: { mnemonic: 'SUI',     bytes: 2, cycles: 7,  desc: 'Subtract immediate from A' },
  0xDA: { mnemonic: 'JC',      bytes: 3, cycles: 10, desc: 'Jump if carry' },
  0xDB: { mnemonic: 'IN',      bytes: 2, cycles: 10, desc: 'Input from port' },
  0xE1: { mnemonic: 'POP H',   bytes: 1, cycles: 10, desc: 'Pop HL from stack' },
  0xE2: { mnemonic: 'JPO',     bytes: 3, cycles: 10, desc: 'Jump if parity odd' },
  0xE3: { mnemonic: 'XTHL',    bytes: 1, cycles: 16, desc: 'Exchange HL with top of stack' },
  0xE5: { mnemonic: 'PUSH H',  bytes: 1, cycles: 12, desc: 'Push HL onto stack' },
  0xE6: { mnemonic: 'ANI',     bytes: 2, cycles: 7,  desc: 'AND immediate with A' },
  0xE9: { mnemonic: 'PCHL',    bytes: 1, cycles: 6,  desc: 'Jump to HL address' },
  0xEA: { mnemonic: 'JPE',     bytes: 3, cycles: 10, desc: 'Jump if parity even' },
  0xEB: { mnemonic: 'XCHG',    bytes: 1, cycles: 4,  desc: 'Exchange HL with DE' },
  0xEE: { mnemonic: 'XRI',     bytes: 2, cycles: 7,  desc: 'XOR immediate with A' },
  0xF1: { mnemonic: 'POP PSW', bytes: 1, cycles: 10, desc: 'Pop A and flags from stack' },
  0xF3: { mnemonic: 'DI',      bytes: 1, cycles: 4,  desc: 'Disable interrupts' },
  0xF5: { mnemonic: 'PUSH PSW',bytes: 1, cycles: 12, desc: 'Push A and flags onto stack' },
  0xF6: { mnemonic: 'ORI',     bytes: 2, cycles: 7,  desc: 'OR immediate with A' },
  0xF9: { mnemonic: 'SPHL',    bytes: 1, cycles: 6,  desc: 'Move HL to SP' },
  0xFA: { mnemonic: 'JM',      bytes: 3, cycles: 10, desc: 'Jump if minus (sign)' },
  0xFB: { mnemonic: 'EI',      bytes: 1, cycles: 4,  desc: 'Enable interrupts' },
  0xFE: { mnemonic: 'CPI',     bytes: 2, cycles: 7,  desc: 'Compare immediate with A' },
  0xFF: { mnemonic: 'RST 7',   bytes: 1, cycles: 12, desc: 'Restart at 0x0038' },
};

export const IC_INFO = {
  '8085': {
    label: 'Intel 8085',
    role: '8-bit Microprocessor',
    desc: 'The Intel 8085 is an 8-bit NMOS microprocessor operating at 3–6 MHz. It has a 40-pin DIP package, multiplexed address/data bus (AD0–AD7), 74 instructions, and 7 working registers (A, B, C, D, E, H, L) plus PC and SP.',
    pins: 40,
  },
  '8155': {
    label: 'Intel 8155',
    role: 'RAM + I/O + Timer',
    desc: '256-byte RAM, 22 programmable I/O lines (Port A, B, C), and a 14-bit timer. Connected to the 8085 via the multiplexed bus. Provides system RAM and timer for the trainer kit.',
    pins: 40,
  },
  '8255': {
    label: 'Intel 8255',
    role: 'Programmable Peripheral Interface (PPI)',
    desc: 'General-purpose I/O chip with 3 8-bit ports (A, B, C). Used for interfacing keyboards, displays, and other peripherals. Can operate in 3 modes: simple I/O, strobed I/O, and bidirectional.',
    pins: 40,
  },
  '8253': {
    label: 'Intel 8253',
    role: 'Programmable Interval Timer',
    desc: 'Three independent 16-bit timers/counters. Used for baud-rate generation for serial communication (TTY, SER ports). Each counter can operate in 6 different modes.',
    pins: 24,
  },
  'EPROM': {
    label: 'EPROM (2732/2764)',
    role: 'Monitor ROM',
    desc: 'Erasable Programmable Read-Only Memory containing the monitor program (firmware). The monitor handles all keyboard input, display, memory examine/modify, and program execution functions.',
    pins: 28,
  },
  '74138': {
    label: '74138',
    role: '3-to-8 Line Decoder',
    desc: 'Used as an address decoder to select individual memory and I/O chips from the upper address lines. Enables chip-select signals for RAM, ROM, and peripheral ICs.',
    pins: 16,
  },
  '74373': {
    label: '74373',
    role: 'Octal D-Type Latch',
    desc: 'Used to demultiplex the 8085\'s multiplexed address/data bus (AD0–AD7). Latches the lower 8 bits of the address during the ALE (Address Latch Enable) signal.',
    pins: 20,
  },
};

export function toHex(value, digits = 2) {
  return value.toString(16).toUpperCase().padStart(digits, '0');
}

export function calcParity(value) {
  let count = 0;
  for (let i = 0; i < 8; i++) {
    if ((value >> i) & 1) count++;
  }
  return count % 2 === 0 ? 1 : 0;
}
