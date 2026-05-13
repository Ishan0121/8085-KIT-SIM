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
      case 0x00: // NOP
        break;
      case 0x76: // HLT
        halted = true;
        break;
      
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
      // MOV B,x
      case 0x40: regs.B = regs.B; break;
      case 0x41: regs.B = regs.C; break;
      case 0x42: regs.B = regs.D; break;
      case 0x43: regs.B = regs.E; break;
      case 0x44: regs.B = regs.H; break;
      case 0x45: regs.B = regs.L; break;
      case 0x46: regs.B = readMem(getHL()); break;
      case 0x47: regs.B = regs.A; break;
      // MOV C,x
      case 0x48: regs.C = regs.B; break;
      case 0x49: regs.C = regs.C; break;
      case 0x4A: regs.C = regs.D; break;
      case 0x4B: regs.C = regs.E; break;
      case 0x4C: regs.C = regs.H; break;
      case 0x4D: regs.C = regs.L; break;
      case 0x4E: regs.C = readMem(getHL()); break;
      case 0x4F: regs.C = regs.A; break;
      // MOV D,x
      case 0x50: regs.D = regs.B; break;
      case 0x51: regs.D = regs.C; break;
      case 0x52: regs.D = regs.D; break;
      case 0x53: regs.D = regs.E; break;
      case 0x54: regs.D = regs.H; break;
      case 0x55: regs.D = regs.L; break;
      case 0x56: regs.D = readMem(getHL()); break;
      case 0x57: regs.D = regs.A; break;
      // MOV E,x
      case 0x58: regs.E = regs.B; break;
      case 0x59: regs.E = regs.C; break;
      case 0x5A: regs.E = regs.D; break;
      case 0x5B: regs.E = regs.E; break;
      case 0x5C: regs.E = regs.H; break;
      case 0x5D: regs.E = regs.L; break;
      case 0x5E: regs.E = readMem(getHL()); break;
      case 0x5F: regs.E = regs.A; break;
      // MOV H,x
      case 0x60: regs.H = regs.B; break;
      case 0x61: regs.H = regs.C; break;
      case 0x62: regs.H = regs.D; break;
      case 0x63: regs.H = regs.E; break;
      case 0x64: regs.H = regs.H; break;
      case 0x65: regs.H = regs.L; break;
      case 0x66: regs.H = readMem(getHL()); break;
      case 0x67: regs.H = regs.A; break;
      // MOV L,x
      case 0x68: regs.L = regs.B; break;
      case 0x69: regs.L = regs.C; break;
      case 0x6A: regs.L = regs.D; break;
      case 0x6B: regs.L = regs.E; break;
      case 0x6C: regs.L = regs.H; break;
      case 0x6D: regs.L = regs.L; break;
      case 0x6E: regs.L = readMem(getHL()); break;
      case 0x6F: regs.L = regs.A; break;
      // MOV M,x
      case 0x70: writeMem(getHL(), regs.B); break;
      case 0x71: writeMem(getHL(), regs.C); break;
      case 0x72: writeMem(getHL(), regs.D); break;
      case 0x73: writeMem(getHL(), regs.E); break;
      case 0x74: writeMem(getHL(), regs.H); break;
      case 0x75: writeMem(getHL(), regs.L); break;
      // 76 is HLT
      case 0x77: writeMem(getHL(), regs.A); break;
      // MOV A,x
      case 0x78: regs.A = regs.B; break;
      case 0x79: regs.A = regs.C; break;
      case 0x7A: regs.A = regs.D; break;
      case 0x7B: regs.A = regs.E; break;
      case 0x7C: regs.A = regs.H; break;
      case 0x7D: regs.A = regs.L; break;
      case 0x7E: regs.A = readMem(getHL()); break;
      case 0x7F: regs.A = regs.A; break;

      // ── LDA / STA / Direct Mem ───────────────
      case 0x3A: regs.A = readMem(readWord(regs.PC)); regs.PC += 2; break; // LDA
      case 0x32: writeMem(readWord(regs.PC), regs.A); regs.PC += 2; break; // STA
      case 0x2A: setHL(readWord(readWord(regs.PC))); regs.PC += 2; break; // LHLD
      case 0x22: writeWord(readWord(regs.PC), getHL()); regs.PC += 2; break; // SHLD

      // ── LDAX / STAX ──────────────────────────
      case 0x0A: regs.A = readMem(getBC()); break; // LDAX B
      case 0x1A: regs.A = readMem(getDE()); break; // LDAX D
      case 0x02: writeMem(getBC(), regs.A); break; // STAX B
      case 0x12: writeMem(getDE(), regs.A); break; // STAX D
      case 0xEB: { const temp = getHL(); setHL(getDE()); setDE(temp); } break; // XCHG

      // ── Arithmetic (ADD) ─────────────────────
      case 0x80: { const r = regs.A + regs.B; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD B
      case 0x81: { const r = regs.A + regs.C; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD C
      case 0x82: { const r = regs.A + regs.D; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD D
      case 0x83: { const r = regs.A + regs.E; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD E
      case 0x84: { const r = regs.A + regs.H; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD H
      case 0x85: { const r = regs.A + regs.L; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD L
      case 0x86: { const r = regs.A + readMem(getHL()); updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD M
      case 0x87: { const r = regs.A + regs.A; updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADD A
      case 0xC6: { const r = regs.A + readMem(regs.PC++); updateZSP(r); flags.CY = r > 0xFF ? 1 : 0; regs.A = r & 0xFF; } break; // ADI

      // ── Arithmetic (SUB) ─────────────────────
      case 0x90: { const r = regs.A - regs.B; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB B
      case 0x91: { const r = regs.A - regs.C; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB C
      case 0x92: { const r = regs.A - regs.D; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB D
      case 0x93: { const r = regs.A - regs.E; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB E
      case 0x94: { const r = regs.A - regs.H; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB H
      case 0x95: { const r = regs.A - regs.L; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB L
      case 0x96: { const r = regs.A - readMem(getHL()); updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB M
      case 0x97: { const r = regs.A - regs.A; updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUB A
      case 0xD6: { const r = regs.A - readMem(regs.PC++); updateZSP(r); flags.CY = r < 0 ? 1 : 0; regs.A = r & 0xFF; } break; // SUI

      // ── Increment / Decrement (8-bit) ────────
      case 0x04: regs.B = (regs.B + 1) & 0xFF; updateZSP(regs.B); break; // INR B
      case 0x0C: regs.C = (regs.C + 1) & 0xFF; updateZSP(regs.C); break; // INR C
      case 0x14: regs.D = (regs.D + 1) & 0xFF; updateZSP(regs.D); break; // INR D
      case 0x1C: regs.E = (regs.E + 1) & 0xFF; updateZSP(regs.E); break; // INR E
      case 0x24: regs.H = (regs.H + 1) & 0xFF; updateZSP(regs.H); break; // INR H
      case 0x2C: regs.L = (regs.L + 1) & 0xFF; updateZSP(regs.L); break; // INR L
      case 0x34: { const val = (readMem(getHL()) + 1) & 0xFF; writeMem(getHL(), val); updateZSP(val); } break; // INR M
      case 0x3C: regs.A = (regs.A + 1) & 0xFF; updateZSP(regs.A); break; // INR A

      case 0x05: regs.B = (regs.B - 1) & 0xFF; updateZSP(regs.B); break; // DCR B
      case 0x0D: regs.C = (regs.C - 1) & 0xFF; updateZSP(regs.C); break; // DCR C
      case 0x15: regs.D = (regs.D - 1) & 0xFF; updateZSP(regs.D); break; // DCR D
      case 0x1D: regs.E = (regs.E - 1) & 0xFF; updateZSP(regs.E); break; // DCR E
      case 0x25: regs.H = (regs.H - 1) & 0xFF; updateZSP(regs.H); break; // DCR H
      case 0x2D: regs.L = (regs.L - 1) & 0xFF; updateZSP(regs.L); break; // DCR L
      case 0x35: { const val = (readMem(getHL()) - 1) & 0xFF; writeMem(getHL(), val); updateZSP(val); } break; // DCR M
      case 0x3D: regs.A = (regs.A - 1) & 0xFF; updateZSP(regs.A); break; // DCR A

      // ── INX / DCX (16-bit) ───────────────────
      case 0x03: setBC((getBC() + 1) & 0xFFFF); break; // INX B
      case 0x13: setDE((getDE() + 1) & 0xFFFF); break; // INX D
      case 0x23: setHL((getHL() + 1) & 0xFFFF); break; // INX H
      case 0x33: regs.SP = (regs.SP + 1) & 0xFFFF; break; // INX SP

      case 0x0B: setBC((getBC() - 1) & 0xFFFF); break; // DCX B
      case 0x1B: setDE((getDE() - 1) & 0xFFFF); break; // DCX D
      case 0x2B: setHL((getHL() - 1) & 0xFFFF); break; // DCX H
      case 0x3B: regs.SP = (regs.SP - 1) & 0xFFFF; break; // DCX SP

      // ── Logical ──────────────────────────────
      case 0xA0: regs.A &= regs.B; updateZSP(regs.A); flags.CY = 0; break; // ANA B
      case 0xA1: regs.A &= regs.C; updateZSP(regs.A); flags.CY = 0; break; // ANA C
      case 0xA2: regs.A &= regs.D; updateZSP(regs.A); flags.CY = 0; break; // ANA D
      case 0xA3: regs.A &= regs.E; updateZSP(regs.A); flags.CY = 0; break; // ANA E
      case 0xA4: regs.A &= regs.H; updateZSP(regs.A); flags.CY = 0; break; // ANA H
      case 0xA5: regs.A &= regs.L; updateZSP(regs.A); flags.CY = 0; break; // ANA L
      case 0xA6: regs.A &= readMem(getHL()); updateZSP(regs.A); flags.CY = 0; break; // ANA M
      case 0xA7: regs.A &= regs.A; updateZSP(regs.A); flags.CY = 0; break; // ANA A
      case 0xE6: regs.A &= readMem(regs.PC++); updateZSP(regs.A); flags.CY = 0; break; // ANI

      case 0xA8: regs.A ^= regs.B; updateZSP(regs.A); flags.CY = 0; break; // XRA B
      case 0xA9: regs.A ^= regs.C; updateZSP(regs.A); flags.CY = 0; break; // XRA C
      case 0xAA: regs.A ^= regs.D; updateZSP(regs.A); flags.CY = 0; break; // XRA D
      case 0xAB: regs.A ^= regs.E; updateZSP(regs.A); flags.CY = 0; break; // XRA E
      case 0xAC: regs.A ^= regs.H; updateZSP(regs.A); flags.CY = 0; break; // XRA H
      case 0xAD: regs.A ^= regs.L; updateZSP(regs.A); flags.CY = 0; break; // XRA L
      case 0xAE: regs.A ^= readMem(getHL()); updateZSP(regs.A); flags.CY = 0; break; // XRA M
      case 0xAF: regs.A ^= regs.A; updateZSP(regs.A); flags.CY = 0; break; // XRA A
      case 0xEE: regs.A ^= readMem(regs.PC++); updateZSP(regs.A); flags.CY = 0; break; // XRI

      case 0xB0: regs.A |= regs.B; updateZSP(regs.A); flags.CY = 0; break; // ORA B
      case 0xB1: regs.A |= regs.C; updateZSP(regs.A); flags.CY = 0; break; // ORA C
      case 0xB2: regs.A |= regs.D; updateZSP(regs.A); flags.CY = 0; break; // ORA D
      case 0xB3: regs.A |= regs.E; updateZSP(regs.A); flags.CY = 0; break; // ORA E
      case 0xB4: regs.A |= regs.H; updateZSP(regs.A); flags.CY = 0; break; // ORA H
      case 0xB5: regs.A |= regs.L; updateZSP(regs.A); flags.CY = 0; break; // ORA L
      case 0xB6: regs.A |= readMem(getHL()); updateZSP(regs.A); flags.CY = 0; break; // ORA M
      case 0xB7: regs.A |= regs.A; updateZSP(regs.A); flags.CY = 0; break; // ORA A
      case 0xF6: regs.A |= readMem(regs.PC++); updateZSP(regs.A); flags.CY = 0; break; // ORI

      // ── Compare ──────────────────────────────
      case 0xB8: { const r = regs.A - regs.B; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP B
      case 0xB9: { const r = regs.A - regs.C; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP C
      case 0xBA: { const r = regs.A - regs.D; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP D
      case 0xBB: { const r = regs.A - regs.E; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP E
      case 0xBC: { const r = regs.A - regs.H; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP H
      case 0xBD: { const r = regs.A - regs.L; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP L
      case 0xBE: { const r = regs.A - readMem(getHL()); updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP M
      case 0xBF: { const r = regs.A - regs.A; updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CMP A
      case 0xFE: { const r = regs.A - readMem(regs.PC++); updateZSP(r); flags.CY = r < 0 ? 1 : 0; } break; // CPI

      // ── Branching (Jump/Call/Ret) ────────────
      case 0xC3: regs.PC = readWord(regs.PC); break; // JMP
      case 0xC2: { const addr = readWord(regs.PC); regs.PC += 2; if (!flags.Z) regs.PC = addr; } break; // JNZ
      case 0xCA: { const addr = readWord(regs.PC); regs.PC += 2; if (flags.Z) regs.PC = addr; } break; // JZ
      case 0xD2: { const addr = readWord(regs.PC); regs.PC += 2; if (!flags.CY) regs.PC = addr; } break; // JNC
      case 0xDA: { const addr = readWord(regs.PC); regs.PC += 2; if (flags.CY) regs.PC = addr; } break; // JC

      case 0xCD: { // CALL
        const addr = readWord(regs.PC); 
        regs.PC += 2;
        regs.SP -= 2;
        writeWord(regs.SP, regs.PC);
        regs.PC = addr;
      } break;
      case 0xC4: { // CNZ
        const addr = readWord(regs.PC);
        regs.PC += 2;
        if (!flags.Z) { regs.SP -= 2; writeWord(regs.SP, regs.PC); regs.PC = addr; }
      } break;

      case 0xC9: regs.PC = readWord(regs.SP); regs.SP += 2; break; // RET
      case 0xC0: if (!flags.Z) { regs.PC = readWord(regs.SP); regs.SP += 2; } break; // RNZ
      case 0xC8: if (flags.Z) { regs.PC = readWord(regs.SP); regs.SP += 2; } break; // RZ

      // ── Stack (Push/Pop) ─────────────────────
      case 0xC5: regs.SP -= 2; writeWord(regs.SP, getBC()); break; // PUSH B
      case 0xD5: regs.SP -= 2; writeWord(regs.SP, getDE()); break; // PUSH D
      case 0xE5: regs.SP -= 2; writeWord(regs.SP, getHL()); break; // PUSH H
      case 0xF5: { // PUSH PSW
        regs.SP -= 2;
        const psw = (flags.S << 7) | (flags.Z << 6) | (flags.AC << 4) | (flags.P << 2) | 2 | flags.CY;
        writeWord(regs.SP, (regs.A << 8) | psw);
      } break;

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

      // ── RST instructions (Trainer Kit Exit) ──
      case 0xC7: // RST 0
      case 0xCF: // RST 1
      case 0xD7: // RST 2
      case 0xDF: // RST 3
      case 0xE7: // RST 4
      case 0xEF: // RST 5
      case 0xF7: // RST 6
      case 0xFF: // RST 7
        // On trainer kits, RST 5 or RST 1 is often used to return to the monitor program (halt execution).
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
