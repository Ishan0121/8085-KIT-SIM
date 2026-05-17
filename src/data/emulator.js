import { OPCODES, calcParity } from './cpu8085';

/**
 * 8085 Instruction Execution Engine
 */

export function executeProgram(memory, startAddr, initialRegisters, initialFlags, maxSteps = 100000) {
  // Clone state so we don't mutate React state directly during run (we'll return final state)
  const regs = { ...initialRegisters };
  const flags = { ...initialFlags };
  
  // memory is a Uint8Array, we'll modify it in place because it's too large to clone efficiently,
  // but we assume the caller passes a reference that's safe to mutate for the simulation.
  // Wait, in React, mutating memRef.current is exactly what we want!

  regs.PC = startAddr & 0xFFFF;

  let steps = 0;
  let halted = false;

  // Helper: Read byte from memory
  const readMem = (addr) => memory[addr & 0xFFFF];
  
  // Helper: Write byte to memory
  const writeMem = (addr, val) => { memory[addr & 0xFFFF] = val & 0xFF; };

  // Helper: Read 16-bit word from memory
  const readWord = (addr) => {
    const low = readMem(addr);
    const high = readMem(addr + 1);
    return (high << 8) | low;
  };

  // Helper: Write 16-bit word to memory
  const writeWord = (addr, val) => {
    writeMem(addr, val & 0xFF);
    writeMem(addr + 1, (val >> 8) & 0xFF);
  };

  // Helper: Get HL pair
  const getHL = () => (regs.H << 8) | regs.L;
  const setHL = (val) => { regs.H = (val >> 8) & 0xFF; regs.L = val & 0xFF; };

  // Helper: Get BC pair
  const getBC = () => (regs.B << 8) | regs.C;
  const setBC = (val) => { regs.B = (val >> 8) & 0xFF; regs.C = val & 0xFF; };

  // Helper: Get DE pair
  const getDE = () => (regs.D << 8) | regs.E;
  const setDE = (val) => { regs.D = (val >> 8) & 0xFF; regs.E = val & 0xFF; };

  // Helper: Update Z, S, P flags based on an 8-bit result
  const updateZSP = (result) => {
    const res8 = result & 0xFF;
    flags.Z = res8 === 0 ? 1 : 0;
    flags.S = (res8 & 0x80) ? 1 : 0;
    flags.P = calcParity(res8);
  };

  // Execution Loop
  while (!halted && steps < maxSteps) {
    steps++;
    const opcode = readMem(regs.PC);
    regs.PC = (regs.PC + 1) & 0xFFFF; // advance PC

    switch (opcode) {
      // ── Control ──────────────────────────────
      case 0x00: break; // NOP
      case 0x76: halted = true; break; // HLT
      case 0xF3: flags.IE = 0; break; // DI (Interrupt Enable flag)
      case 0xFB: flags.IE = 1; break; // EI
      case 0x20: regs.A = (flags.IE ? 0x08 : 0x00); break; // RIM (Minimal implementation)
      case 0x30: break; // SIM (Minimal implementation)
      case 0x27: { // DAA
        let al = regs.A & 0x0F;
        let ah = (regs.A >> 4) & 0x0F;
        let c = flags.CY;
        if (al > 9 || flags.AC) {
            al += 6;
            if (al > 0x0F) {
                al &= 0x0F;
                ah += 1;
                flags.AC = 1;
            } else {
                flags.AC = 0;
            }
        }
        if (ah > 9 || c) {
            ah += 6;
            if (ah > 0x0F) {
                ah &= 0x0F;
                flags.CY = 1;
            }
        }
        regs.A = (ah << 4) | al;
        updateZSP(regs.A);
      } break;
      case 0x2F: regs.A = (~regs.A) & 0xFF; break; // CMA
      case 0x3F: flags.CY = flags.CY ? 0 : 1; break; // CMC
      case 0x37: flags.CY = 1; break; // STC

      // ── LXI (Load Register Pair Immediate) ───
      case 0x01: setBC(readWord(regs.PC)); regs.PC += 2; break; // LXI B
      case 0x11: setDE(readWord(regs.PC)); regs.PC += 2; break; // LXI D
      case 0x21: setHL(readWord(regs.PC)); regs.PC += 2; break; // LXI H
      case 0x31: regs.SP = readWord(regs.PC); regs.PC += 2; break; // LXI SP

      // ── MVI (Move Immediate) ─────────────────
      case 0x06: regs.B = readMem(regs.PC); regs.PC++; break; // MVI B
      case 0x0E: regs.C = readMem(regs.PC); regs.PC++; break; // MVI C
      case 0x16: regs.D = readMem(regs.PC); regs.PC++; break; // MVI D
      case 0x1E: regs.E = readMem(regs.PC); regs.PC++; break; // MVI E
      case 0x26: regs.H = readMem(regs.PC); regs.PC++; break; // MVI H
      case 0x2E: regs.L = readMem(regs.PC); regs.PC++; break; // MVI L
      case 0x36: writeMem(getHL(), readMem(regs.PC)); regs.PC++; break; // MVI M
      case 0x3E: regs.A = readMem(regs.PC); regs.PC++; break; // MVI A

      // ── MOV (Move) ───────────────────────────
      case 0x40: regs.B = regs.B; break; // MOV B,B
      case 0x41: regs.B = regs.C; break; // MOV B,C
      case 0x42: regs.B = regs.D; break; // MOV B,D
      case 0x43: regs.B = regs.E; break; // MOV B,E
      case 0x44: regs.B = regs.H; break; // MOV B,H
      case 0x45: regs.B = regs.L; break; // MOV B,L
      case 0x46: regs.B = readMem(getHL()); break; // MOV B,M
      case 0x47: regs.B = regs.A; break; // MOV B,A
      case 0x48: regs.C = regs.B; break; // MOV C,B
      case 0x49: regs.C = regs.C; break; // MOV C,C
      case 0x4A: regs.C = regs.D; break; // MOV C,D
      case 0x4B: regs.C = regs.E; break; // MOV C,E
      case 0x4C: regs.C = regs.H; break; // MOV C,H
      case 0x4D: regs.C = regs.L; break; // MOV C,L
      case 0x4E: regs.C = readMem(getHL()); break; // MOV C,M
      case 0x4F: regs.C = regs.A; break; // MOV C,A
      case 0x50: regs.D = regs.B; break; // MOV D,B
      case 0x51: regs.D = regs.C; break; // MOV D,C
      case 0x52: regs.D = regs.D; break; // MOV D,D
      case 0x53: regs.D = regs.E; break; // MOV D,E
      case 0x54: regs.D = regs.H; break; // MOV D,H
      case 0x55: regs.D = regs.L; break; // MOV D,L
      case 0x56: regs.D = readMem(getHL()); break; // MOV D,M
      case 0x57: regs.D = regs.A; break; // MOV D,A
      case 0x58: regs.E = regs.B; break; // MOV E,B
      case 0x59: regs.E = regs.C; break; // MOV E,C
      case 0x5A: regs.E = regs.D; break; // MOV E,D
      case 0x5B: regs.E = regs.E; break; // MOV E,E
      case 0x5C: regs.E = regs.H; break; // MOV E,H
      case 0x5D: regs.E = regs.L; break; // MOV E,L
      case 0x5E: regs.E = readMem(getHL()); break; // MOV E,M
      case 0x5F: regs.E = regs.A; break; // MOV E,A
      case 0x60: regs.H = regs.B; break; // MOV H,B
      case 0x61: regs.H = regs.C; break; // MOV H,C
      case 0x62: regs.H = regs.D; break; // MOV H,D
      case 0x63: regs.H = regs.E; break; // MOV H,E
      case 0x64: regs.H = regs.H; break; // MOV H,H
      case 0x65: regs.H = regs.L; break; // MOV H,L
      case 0x66: regs.H = readMem(getHL()); break; // MOV H,M
      case 0x67: regs.H = regs.A; break; // MOV H,A
      case 0x68: regs.L = regs.B; break; // MOV L,B
      case 0x69: regs.L = regs.C; break; // MOV L,C
      case 0x6A: regs.L = regs.D; break; // MOV L,D
      case 0x6B: regs.L = regs.E; break; // MOV L,E
      case 0x6C: regs.L = regs.H; break; // MOV L,H
      case 0x6D: regs.L = regs.L; break; // MOV L,L
      case 0x6E: regs.L = readMem(getHL()); break; // MOV L,M
      case 0x6F: regs.L = regs.A; break; // MOV L,A
      case 0x70: writeMem(getHL(), regs.B); break; // MOV M,B
      case 0x71: writeMem(getHL(), regs.C); break; // MOV M,C
      case 0x72: writeMem(getHL(), regs.D); break; // MOV M,D
      case 0x73: writeMem(getHL(), regs.E); break; // MOV M,E
      case 0x74: writeMem(getHL(), regs.H); break; // MOV M,H
      case 0x75: writeMem(getHL(), regs.L); break; // MOV M,L
      case 0x77: writeMem(getHL(), regs.A); break; // MOV M,A
      case 0x78: regs.A = regs.B; break; // MOV A,B
      case 0x79: regs.A = regs.C; break; // MOV A,C
      case 0x7A: regs.A = regs.D; break; // MOV A,D
      case 0x7B: regs.A = regs.E; break; // MOV A,E
      case 0x7C: regs.A = regs.H; break; // MOV A,H
      case 0x7D: regs.A = regs.L; break; // MOV A,L
      case 0x7E: regs.A = readMem(getHL()); break; // MOV A,M
      case 0x7F: regs.A = regs.A; break; // MOV A,A

      // ── LDA / STA / Direct Mem ───────────────
      case 0x3A: regs.A = readMem(readWord(regs.PC)); regs.PC += 2; break; // LDA
      case 0x32: writeMem(readWord(regs.PC), regs.A); regs.PC += 2; break; // STA
      case 0x2A: setHL(readWord(readWord(regs.PC))); regs.PC += 2; break; // LHLD
      case 0x22: writeWord(readWord(regs.PC), getHL()); regs.PC += 2; break; // SHLD
      case 0x0A: regs.A = readMem(getBC()); break; // LDAX B
      case 0x1A: regs.A = readMem(getDE()); break; // LDAX D
      case 0x02: writeMem(getBC(), regs.A); break; // STAX B
      case 0x12: writeMem(getDE(), regs.A); break; // STAX D
      case 0xEB: { const temp = getHL(); setHL(getDE()); setDE(temp); } break; // XCHG

      // ── Arithmetic (ADD / ADC) ───────────────
      case 0x80: { const val = regs.B; const r = regs.A + val; flags.AC = ((regs.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD B
      case 0x81: { const val = regs.C; const r = regs.A + val; flags.AC = ((regs.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD C
      case 0x82: { const val = regs.D; const r = regs.A + val; flags.AC = ((regs.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD D
      case 0x83: { const val = regs.E; const r = regs.A + val; flags.AC = ((regs.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD E
      case 0x84: { const val = regs.H; const r = regs.A + val; flags.AC = ((regs.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD H
      case 0x85: { const val = regs.L; const r = regs.A + val; flags.AC = ((regs.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD L
      case 0x86: { const val = readMem(getHL()); const r = regs.A + val; flags.AC = ((regs.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD M
      case 0x87: { const val = regs.A; const r = regs.A + val; flags.AC = ((regs.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD A
      case 0x88: { const val = regs.B; const r = regs.A + val + flags.CY; flags.AC = ((regs.A & 0x0F) + (val & 0x0F) + flags.CY) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADC B
      case 0x89: { const val = regs.C; const r = regs.A + val + flags.CY; flags.AC = ((regs.A & 0x0F) + (val & 0x0F) + flags.CY) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADC C
      case 0x8A: { const val = regs.D; const r = regs.A + val + flags.CY; flags.AC = ((regs.A & 0x0F) + (val & 0x0F) + flags.CY) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADC D
      case 0x8B: { const val = regs.E; const r = regs.A + val + flags.CY; flags.AC = ((regs.A & 0x0F) + (val & 0x0F) + flags.CY) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADC E
      case 0x8C: { const val = regs.H; const r = regs.A + val + flags.CY; flags.AC = ((regs.A & 0x0F) + (val & 0x0F) + flags.CY) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADC H
      case 0x8D: { const val = regs.L; const r = regs.A + val + flags.CY; flags.AC = ((regs.A & 0x0F) + (val & 0x0F) + flags.CY) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADC L
      case 0x8E: { const val = readMem(getHL()); const r = regs.A + val + flags.CY; flags.AC = ((regs.A & 0x0F) + (val & 0x0F) + flags.CY) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADC M
      case 0x8F: { const val = regs.A; const r = regs.A + val + flags.CY; flags.AC = ((regs.A & 0x0F) + (val & 0x0F) + flags.CY) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADC A
      case 0xC6: { const val = readMem(regs.PC++); const r = regs.A + val; flags.AC = ((regs.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADI
      case 0xCE: { const val = readMem(regs.PC++); const r = regs.A + val + flags.CY; flags.AC = ((regs.A & 0x0F) + (val & 0x0F) + flags.CY) > 0x0F ? 1 : 0; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ACI

      // ── Arithmetic (SUB / SBB) ───────────────
      case 0x90: { const val = regs.B; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB B
      case 0x91: { const val = regs.C; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB C
      case 0x92: { const val = regs.D; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB D
      case 0x93: { const val = regs.E; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB E
      case 0x94: { const val = regs.H; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB H
      case 0x95: { const val = regs.L; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB L
      case 0x96: { const val = readMem(getHL()); const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB M
      case 0x97: { const val = regs.A; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB A
      case 0x98: { const val = regs.B; const r = regs.A - val - flags.CY; flags.AC = ((regs.A & 0x0F) - (val & 0x0F) - flags.CY) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SBB B
      case 0x99: { const val = regs.C; const r = regs.A - val - flags.CY; flags.AC = ((regs.A & 0x0F) - (val & 0x0F) - flags.CY) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SBB C
      case 0x9A: { const val = regs.D; const r = regs.A - val - flags.CY; flags.AC = ((regs.A & 0x0F) - (val & 0x0F) - flags.CY) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SBB D
      case 0x9B: { const val = regs.E; const r = regs.A - val - flags.CY; flags.AC = ((regs.A & 0x0F) - (val & 0x0F) - flags.CY) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SBB E
      case 0x9C: { const val = regs.H; const r = regs.A - val - flags.CY; flags.AC = ((regs.A & 0x0F) - (val & 0x0F) - flags.CY) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SBB H
      case 0x9D: { const val = regs.L; const r = regs.A - val - flags.CY; flags.AC = ((regs.A & 0x0F) - (val & 0x0F) - flags.CY) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SBB L
      case 0x9E: { const val = readMem(getHL()); const r = regs.A - val - flags.CY; flags.AC = ((regs.A & 0x0F) - (val & 0x0F) - flags.CY) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SBB M
      case 0x9F: { const val = regs.A; const r = regs.A - val - flags.CY; flags.AC = ((regs.A & 0x0F) - (val & 0x0F) - flags.CY) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SBB A
      case 0xD6: { const val = readMem(regs.PC++); const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUI
      case 0xDE: { const val = readMem(regs.PC++); const r = regs.A - val - flags.CY; flags.AC = ((regs.A & 0x0F) - (val & 0x0F) - flags.CY) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SBI

      // ── Increment / Decrement (8-bit) ────────
      case 0x04: { const val = regs.B; const r = (val + 1); flags.AC = ((val & 0x0F) + 1) > 0x0F ? 1 : 0; regs.B = r & 0xFF; updateZSP(r); } break; // INR B
      case 0x0C: { const val = regs.C; const r = (val + 1); flags.AC = ((val & 0x0F) + 1) > 0x0F ? 1 : 0; regs.C = r & 0xFF; updateZSP(r); } break; // INR C
      case 0x14: { const val = regs.D; const r = (val + 1); flags.AC = ((val & 0x0F) + 1) > 0x0F ? 1 : 0; regs.D = r & 0xFF; updateZSP(r); } break; // INR D
      case 0x1C: { const val = regs.E; const r = (val + 1); flags.AC = ((val & 0x0F) + 1) > 0x0F ? 1 : 0; regs.E = r & 0xFF; updateZSP(r); } break; // INR E
      case 0x24: { const val = regs.H; const r = (val + 1); flags.AC = ((val & 0x0F) + 1) > 0x0F ? 1 : 0; regs.H = r & 0xFF; updateZSP(r); } break; // INR H
      case 0x2C: { const val = regs.L; const r = (val + 1); flags.AC = ((val & 0x0F) + 1) > 0x0F ? 1 : 0; regs.L = r & 0xFF; updateZSP(r); } break; // INR L
      case 0x34: { const val = readMem(getHL()); const r = (val + 1); flags.AC = ((val & 0x0F) + 1) > 0x0F ? 1 : 0; writeMem(getHL(), r & 0xFF); updateZSP(r); } break; // INR M
      case 0x3C: { const val = regs.A; const r = (val + 1); flags.AC = ((val & 0x0F) + 1) > 0x0F ? 1 : 0; regs.A = r & 0xFF; updateZSP(r); } break; // INR A
      case 0x05: { const val = regs.B; const r = (val - 1); flags.AC = ((val & 0x0F) - 1) < 0 ? 0 : 1; regs.B = r & 0xFF; updateZSP(r); } break; // DCR B
      case 0x0D: { const val = regs.C; const r = (val - 1); flags.AC = ((val & 0x0F) - 1) < 0 ? 0 : 1; regs.C = r & 0xFF; updateZSP(r); } break; // DCR C
      case 0x15: { const val = regs.D; const r = (val - 1); flags.AC = ((val & 0x0F) - 1) < 0 ? 0 : 1; regs.D = r & 0xFF; updateZSP(r); } break; // DCR D
      case 0x1D: { const val = regs.E; const r = (val - 1); flags.AC = ((val & 0x0F) - 1) < 0 ? 0 : 1; regs.E = r & 0xFF; updateZSP(r); } break; // DCR E
      case 0x25: { const val = regs.H; const r = (val - 1); flags.AC = ((val & 0x0F) - 1) < 0 ? 0 : 1; regs.H = r & 0xFF; updateZSP(r); } break; // DCR H
      case 0x2D: { const val = regs.L; const r = (val - 1); flags.AC = ((val & 0x0F) - 1) < 0 ? 0 : 1; regs.L = r & 0xFF; updateZSP(r); } break; // DCR L
      case 0x35: { const val = readMem(getHL()); const r = (val - 1); flags.AC = ((val & 0x0F) - 1) < 0 ? 0 : 1; writeMem(getHL(), r & 0xFF); updateZSP(r); } break; // DCR M
      case 0x3D: { const val = regs.A; const r = (val - 1); flags.AC = ((val & 0x0F) - 1) < 0 ? 0 : 1; regs.A = r & 0xFF; updateZSP(r); } break; // DCR A

      // ── INX / DCX / DAD (16-bit) ─────────────
      case 0x03: { const val = (getBC() + 1) & 0xFFFF; setBC(val); } break; // INX B
      case 0x0B: { const val = (getBC() - 1) & 0xFFFF; setBC(val); } break; // DCX B
      case 0x09: { const val = getHL() + getBC(); flags.CY = val > 0xFFFF ? 1 : 0; setHL(val & 0xFFFF); } break; // DAD B
      case 0x13: { const val = (getDE() + 1) & 0xFFFF; setDE(val); } break; // INX D
      case 0x1B: { const val = (getDE() - 1) & 0xFFFF; setDE(val); } break; // DCX D
      case 0x19: { const val = getHL() + getDE(); flags.CY = val > 0xFFFF ? 1 : 0; setHL(val & 0xFFFF); } break; // DAD D
      case 0x23: { const val = (getHL() + 1) & 0xFFFF; setHL(val); } break; // INX H
      case 0x2B: { const val = (getHL() - 1) & 0xFFFF; setHL(val); } break; // DCX H
      case 0x29: { const val = getHL() + getHL(); flags.CY = val > 0xFFFF ? 1 : 0; setHL(val & 0xFFFF); } break; // DAD H
      case 0x33: { const val = (regs.SP + 1) & 0xFFFF; regs.SP = (val); } break; // INX SP
      case 0x3B: { const val = (regs.SP - 1) & 0xFFFF; regs.SP = (val); } break; // DCX SP
      case 0x39: { const val = getHL() + regs.SP; flags.CY = val > 0xFFFF ? 1 : 0; setHL(val & 0xFFFF); } break; // DAD SP

      // ── Logical ──────────────────────────────
      case 0xA0: { regs.A &= regs.B; updateZSP(regs.A); flags.CY = 0; flags.AC = 1; } break; // ANA B
      case 0xA1: { regs.A &= regs.C; updateZSP(regs.A); flags.CY = 0; flags.AC = 1; } break; // ANA C
      case 0xA2: { regs.A &= regs.D; updateZSP(regs.A); flags.CY = 0; flags.AC = 1; } break; // ANA D
      case 0xA3: { regs.A &= regs.E; updateZSP(regs.A); flags.CY = 0; flags.AC = 1; } break; // ANA E
      case 0xA4: { regs.A &= regs.H; updateZSP(regs.A); flags.CY = 0; flags.AC = 1; } break; // ANA H
      case 0xA5: { regs.A &= regs.L; updateZSP(regs.A); flags.CY = 0; flags.AC = 1; } break; // ANA L
      case 0xA6: { regs.A &= readMem(getHL()); updateZSP(regs.A); flags.CY = 0; flags.AC = 1; } break; // ANA M
      case 0xA7: { regs.A &= regs.A; updateZSP(regs.A); flags.CY = 0; flags.AC = 1; } break; // ANA A
      case 0xE6: { regs.A &= readMem(regs.PC++); updateZSP(regs.A); flags.CY = 0; flags.AC = 1; } break; // ANI
      case 0xA8: { regs.A ^= regs.B; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // XRA B
      case 0xA9: { regs.A ^= regs.C; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // XRA C
      case 0xAA: { regs.A ^= regs.D; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // XRA D
      case 0xAB: { regs.A ^= regs.E; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // XRA E
      case 0xAC: { regs.A ^= regs.H; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // XRA H
      case 0xAD: { regs.A ^= regs.L; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // XRA L
      case 0xAE: { regs.A ^= readMem(getHL()); updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // XRA M
      case 0xAF: { regs.A ^= regs.A; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // XRA A
      case 0xEE: { regs.A ^= readMem(regs.PC++); updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // XRI
      case 0xB0: { regs.A |= regs.B; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // ORA B
      case 0xB1: { regs.A |= regs.C; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // ORA C
      case 0xB2: { regs.A |= regs.D; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // ORA D
      case 0xB3: { regs.A |= regs.E; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // ORA E
      case 0xB4: { regs.A |= regs.H; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // ORA H
      case 0xB5: { regs.A |= regs.L; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // ORA L
      case 0xB6: { regs.A |= readMem(getHL()); updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // ORA M
      case 0xB7: { regs.A |= regs.A; updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // ORA A
      case 0xF6: { regs.A |= readMem(regs.PC++); updateZSP(regs.A); flags.CY = 0; flags.AC = 0; } break; // ORI
      case 0xB8: { const val = regs.B; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP B
      case 0xB9: { const val = regs.C; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP C
      case 0xBA: { const val = regs.D; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP D
      case 0xBB: { const val = regs.E; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP E
      case 0xBC: { const val = regs.H; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP H
      case 0xBD: { const val = regs.L; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP L
      case 0xBE: { const val = readMem(getHL()); const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP M
      case 0xBF: { const val = regs.A; const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP A
      case 0xFE: { const val = readMem(regs.PC++); const r = regs.A - val; flags.AC = ((regs.A & 0x0F) - (val & 0x0F)) < 0 ? 0 : 1; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CPI

      // ── Rotates ──────────────────────────────
      case 0x07: { const c = regs.A >> 7; flags.CY = c; regs.A = ((regs.A << 1) | c) & 0xFF; } break; // RLC
      case 0x0F: { const c = regs.A & 1; flags.CY = c; regs.A = (regs.A >> 1) | (c << 7); } break; // RRC
      case 0x17: { const c = regs.A >> 7; regs.A = ((regs.A << 1) | flags.CY) & 0xFF; flags.CY = c; } break; // RAL
      case 0x1F: { const c = regs.A & 1; regs.A = (regs.A >> 1) | (flags.CY << 7); flags.CY = c; } break; // RAR

      // ── Jumps ────────────────────────────────
      case 0xC3: regs.PC = readWord(regs.PC); break; // JMP
      case 0xE9: regs.PC = getHL(); break; // PCHL
      case 0xC2: { const addr = readWord(regs.PC); regs.PC += 2; if (!flags.Z) regs.PC = addr; } break; // JNZ
      case 0xCA: { const addr = readWord(regs.PC); regs.PC += 2; if (flags.Z) regs.PC = addr; } break; // JZ
      case 0xD2: { const addr = readWord(regs.PC); regs.PC += 2; if (!flags.CY) regs.PC = addr; } break; // JNC
      case 0xDA: { const addr = readWord(regs.PC); regs.PC += 2; if (flags.CY) regs.PC = addr; } break; // JC
      case 0xE2: { const addr = readWord(regs.PC); regs.PC += 2; if (!flags.P) regs.PC = addr; } break; // JPO
      case 0xEA: { const addr = readWord(regs.PC); regs.PC += 2; if (flags.P) regs.PC = addr; } break; // JPE
      case 0xF2: { const addr = readWord(regs.PC); regs.PC += 2; if (!flags.S) regs.PC = addr; } break; // JP
      case 0xFA: { const addr = readWord(regs.PC); regs.PC += 2; if (flags.S) regs.PC = addr; } break; // JM

      // ── Calls ────────────────────────────────
      case 0xCD: { const addr = readWord(regs.PC); regs.PC += 2; regs.SP -= 2; writeWord(regs.SP, regs.PC); regs.PC = addr; } break; // CALL
      case 0xC4: { const addr = readWord(regs.PC); regs.PC += 2; if (!flags.Z) { regs.SP -= 2; writeWord(regs.SP, regs.PC); regs.PC = addr; } } break; // CNZ
      case 0xCC: { const addr = readWord(regs.PC); regs.PC += 2; if (flags.Z) { regs.SP -= 2; writeWord(regs.SP, regs.PC); regs.PC = addr; } } break; // CZ
      case 0xD4: { const addr = readWord(regs.PC); regs.PC += 2; if (!flags.CY) { regs.SP -= 2; writeWord(regs.SP, regs.PC); regs.PC = addr; } } break; // CNC
      case 0xDC: { const addr = readWord(regs.PC); regs.PC += 2; if (flags.CY) { regs.SP -= 2; writeWord(regs.SP, regs.PC); regs.PC = addr; } } break; // CC
      case 0xE4: { const addr = readWord(regs.PC); regs.PC += 2; if (!flags.P) { regs.SP -= 2; writeWord(regs.SP, regs.PC); regs.PC = addr; } } break; // CPO
      case 0xEC: { const addr = readWord(regs.PC); regs.PC += 2; if (flags.P) { regs.SP -= 2; writeWord(regs.SP, regs.PC); regs.PC = addr; } } break; // CPE
      case 0xF4: { const addr = readWord(regs.PC); regs.PC += 2; if (!flags.S) { regs.SP -= 2; writeWord(regs.SP, regs.PC); regs.PC = addr; } } break; // CP
      case 0xFC: { const addr = readWord(regs.PC); regs.PC += 2; if (flags.S) { regs.SP -= 2; writeWord(regs.SP, regs.PC); regs.PC = addr; } } break; // CM

      // ── Returns ──────────────────────────────
      case 0xC9: regs.PC = readWord(regs.SP); regs.SP += 2; break; // RET
      case 0xC0: if (!flags.Z) { regs.PC = readWord(regs.SP); regs.SP += 2; } break; // RNZ
      case 0xC8: if (flags.Z) { regs.PC = readWord(regs.SP); regs.SP += 2; } break; // RZ
      case 0xD0: if (!flags.CY) { regs.PC = readWord(regs.SP); regs.SP += 2; } break; // RNC
      case 0xD8: if (flags.CY) { regs.PC = readWord(regs.SP); regs.SP += 2; } break; // RC
      case 0xE0: if (!flags.P) { regs.PC = readWord(regs.SP); regs.SP += 2; } break; // RPO
      case 0xE8: if (flags.P) { regs.PC = readWord(regs.SP); regs.SP += 2; } break; // RPE
      case 0xF0: if (!flags.S) { regs.PC = readWord(regs.SP); regs.SP += 2; } break; // RP
      case 0xF8: if (flags.S) { regs.PC = readWord(regs.SP); regs.SP += 2; } break; // RM

      // ── Stack ────────────────────────────────
      case 0xC5: regs.SP -= 2; writeWord(regs.SP, getBC()); break; // PUSH B
      case 0xD5: regs.SP -= 2; writeWord(regs.SP, getDE()); break; // PUSH D
      case 0xE5: regs.SP -= 2; writeWord(regs.SP, getHL()); break; // PUSH H
      case 0xF5: { regs.SP -= 2; const psw = (flags.S << 7) | (flags.Z << 6) | (flags.AC << 4) | (flags.P << 2) | 2 | flags.CY; writeWord(regs.SP, (regs.A << 8) | psw); } break; // PUSH PSW
      case 0xC1: setBC(readWord(regs.SP)); regs.SP += 2; break; // POP B
      case 0xD1: setDE(readWord(regs.SP)); regs.SP += 2; break; // POP D
      case 0xE1: setHL(readWord(regs.SP)); regs.SP += 2; break; // POP H
      case 0xF1: { // POP PSW
        const val = readWord(regs.SP);
        regs.SP += 2;
        regs.A = (val >> 8) & 0xFF;
        const psw = val & 0xFF;
        flags.S = (psw >> 7) & 1;
        flags.Z = (psw >> 6) & 1;
        flags.AC = (psw >> 4) & 1;
        flags.P = (psw >> 2) & 1;
        flags.CY = psw & 1;
      } break;
      case 0xE3: { const temp = getHL(); setHL(readWord(regs.SP)); writeWord(regs.SP, temp); } break; // XTHL
      case 0xF9: regs.SP = getHL(); break; // SPHL

      // ── I/O ──────────────────────────────────
      case 0xDB: { regs.PC++; regs.A = 0x00; } break; // IN (Mock: read 0)
      case 0xD3: { regs.PC++; } break; // OUT (Mock: do nothing)

      // ── RST ──────────────────────────────────
      case 0xC7: // RST 0
      case 0xCF: // RST 1
      case 0xD7: // RST 2
      case 0xDF: // RST 3
      case 0xE7: // RST 4
      case 0xEF: // RST 5
      case 0xF7: // RST 6
      case 0xFF: // RST 7
        // On trainer kits, RST 5 or RST 1 is often used to return to the monitor program.
        halted = true;
        break;


      default:
        // Unimplemented opcode, halt to prevent infinite loops of garbage
        halted = true;
        break;
    }
  }

  return { finalRegisters: regs, finalFlags: flags, halted, steps };
}
