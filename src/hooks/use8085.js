import { useState, useCallback, useRef } from 'react';
import {
  INITIAL_REGISTERS,
  INITIAL_FLAGS,
  createInitialMemory,
  toHex
} from '../data/cpu8085';
import { executeProgram } from '../data/emulator';

// Input modes for the keypad
export const INPUT_MODE = {
  ADDRESS: 'ADDRESS', // entering an address
  DATA: 'DATA',       // entering a data byte
  IDLE: 'IDLE',
};

// Trainer function modes
export const TRAINER_MODE = {
  MONITOR: 'MONITOR',
  EXAMINE_MEM: 'EXAMINE_MEM',
  EXAMINE_REG: 'EXAMINE_REG',
  EXECUTE: 'EXECUTE',
};

export default function use8085({ strictMode = false } = {}) {
  const [registers, setRegisters] = useState(INITIAL_REGISTERS);
  const [flags, setFlags] = useState(INITIAL_FLAGS);
  const memRef = useRef(createInitialMemory());
  const [memVersion, setMemVersion] = useState(0);
  const [memBaseAddr, setMemBaseAddr] = useState(0x2000);

  // Breakpoints and Ports
  const [breakpoints, setBreakpoints] = useState(new Set());
  const portsRef = useRef(new Uint8Array(256));
  const [portsVersion, setPortsVersion] = useState(0);

  // Display state
  // addressDisplay: 4 hex chars  (e.g. "2000")
  // dataDisplay:    2 hex chars  (e.g. "FF")
  const [addressDisplay, setAddressDisplay] = useState('----');
  const [dataDisplay, setDataDisplay] = useState('--');
  const [displayBlink, setDisplayBlink] = useState(false);

  // Input buffer
  const [inputBuffer, setInputBuffer] = useState('');
  const [inputMode, setInputMode] = useState(INPUT_MODE.IDLE);
  const [trainerMode, setTrainerMode] = useState(TRAINER_MODE.MONITOR);

  // Current address pointer
  const [currentAddr, setCurrentAddr] = useState(0x2000);

  // Shifted state (for SHIFT key)
  const [shifted, setShifted] = useState(false);

  // Log
  const [log, setLog] = useState([]);

  const addLog = useCallback((msg) => {
    setLog(prev => [...prev.slice(-99), `> ${msg}`]);
  }, []);

  const refreshMemDisplay = useCallback(() => {
    setMemVersion(v => v + 1);
  }, []);

  // ---- RESET ----
  const handleReset = useCallback(() => {
    setRegisters(INITIAL_REGISTERS);
    setFlags(INITIAL_FLAGS);
    setAddressDisplay('----');
    setDataDisplay('--');
    setInputBuffer('');
    setInputMode(INPUT_MODE.IDLE);
    setTrainerMode(TRAINER_MODE.MONITOR);
    setShifted(false);
    addLog('System RESET');
  }, [addLog]);

  // ---- MEM (Examine Memory) ----
  const handleMem = useCallback(() => {
    setTrainerMode(TRAINER_MODE.EXAMINE_MEM);
    setInputMode(INPUT_MODE.ADDRESS);
    setInputBuffer('');
    setAddressDisplay('    ');
    setDataDisplay('--');
    addLog('MEM: Enter address');
  }, [addLog]);

  // ---- EXREG (Examine Register) ----
  const handleExReg = useCallback(() => {
    setTrainerMode(TRAINER_MODE.EXAMINE_REG);
    setInputMode(INPUT_MODE.DATA);
    setInputBuffer('');
    setAddressDisplay('A   ');
    setDataDisplay(toHex(registers.A));
    addLog('EXREG: Showing A=' + toHex(registers.A));
  }, [addLog, registers.A]);

  // ---- Hex digit input ----
  const handleHexKey = useCallback((digit) => {
    if (inputMode === INPUT_MODE.IDLE) return;

    const currentReg = addressDisplay.trim();
    const is16BitReg = trainerMode === TRAINER_MODE.EXAMINE_REG && (currentReg === 'SP' || currentReg === 'PC');
    const maxLen = (inputMode === INPUT_MODE.ADDRESS || is16BitReg) ? 4 : 2;
    
    const newBuf = (inputBuffer + digit).slice(-maxLen);
    setInputBuffer(newBuf);

    if (inputMode === INPUT_MODE.ADDRESS) {
      setAddressDisplay(newBuf.padStart(4, '-'));
    } else {
      if (is16BitReg) {
        setDataDisplay(newBuf.padStart(4, '-').slice(0, 2)); // simple UI choice for 4 digit data display: we don't have 4 digits in data!
        // Actually, we can show it in dataDisplay, but dataDisplay is usually 2 chars.
        // We'll just display it as best as we can (e.g. truncated) or we can expand dataDisplay if CSS allows.
        setDataDisplay(newBuf.padStart(maxLen, '-'));
      } else {
        setDataDisplay(newBuf.padStart(2, '-'));
      }
    }
  }, [inputMode, inputBuffer, trainerMode, addressDisplay]);

  // ---- Enter/confirm address ----
  const confirmAddress = useCallback(() => {
    if (inputBuffer.length === 0) return;
    const addr = parseInt(inputBuffer, 16) & 0xFFFF;
    setCurrentAddr(addr);
    setMemBaseAddr(addr);
    setAddressDisplay(toHex(addr, 4));
    setDataDisplay(toHex(memRef.current[addr]));
    setInputBuffer('');
    setInputMode(INPUT_MODE.DATA);
    refreshMemDisplay();
    addLog(`MEM: ${toHex(addr, 4)} = ${toHex(memRef.current[addr])}`);
  }, [inputBuffer, refreshMemDisplay, addLog]);

  // ---- Write data byte ----
  const confirmData = useCallback(() => {
    if (inputBuffer.length === 0) return;
    const value = parseInt(inputBuffer, 16) & 0xFF;
    memRef.current[currentAddr] = value;
    setDataDisplay(toHex(value));
    setInputBuffer('');
    refreshMemDisplay();
    addLog(`WRITE: [${toHex(currentAddr, 4)}] = ${toHex(value)}`);
  }, [inputBuffer, currentAddr, memBaseAddr, refreshMemDisplay, addLog]);

  // ---- FILL ----
  const handleFill = useCallback((fromAddr, toAddr, fillByte) => {
    const f = fromAddr & 0xFFFF;
    const t = toAddr & 0xFFFF;
    const b = fillByte & 0xFF;
    for (let a = f; a <= t; a++) {
      memRef.current[a] = b;
    }
    refreshMemDisplay();
    addLog(`FILL: ${toHex(f, 4)}–${toHex(t, 4)} with ${toHex(b)}`);
  }, [memBaseAddr, refreshMemDisplay, addLog]);

  // ---- GO (Execute) ----
  const handleGo = useCallback(() => {
    if (trainerMode !== TRAINER_MODE.EXECUTE) {
      setTrainerMode(TRAINER_MODE.EXECUTE);
      setInputMode(INPUT_MODE.ADDRESS);
      setInputBuffer('');
      setAddressDisplay('    ');
      setDataDisplay('--');
      addLog('GO: Enter starting address');
    } else {
      const startAddr = inputBuffer.length > 0 ? (parseInt(inputBuffer, 16) & 0xFFFF) : registers.PC;
      addLog(`GO: Executing from ${toHex(startAddr, 4)}`);
      
      // Run the emulator
      const { finalRegisters, finalFlags, halted, steps, illegalOpcode } = executeProgram(
        memRef.current, startAddr, registers, flags, 100000, breakpoints, portsRef.current, strictMode
      );
      
      setRegisters(finalRegisters);
      setFlags(finalFlags);
      refreshMemDisplay();
      setPortsVersion(v => v + 1);

      if (illegalOpcode !== undefined) {
        addLog(`ILLEGAL OPCODE: 0x${illegalOpcode.toString(16).toUpperCase().padStart(2,'0')} at PC=${toHex(finalRegisters.PC - 1, 4)} — halted (strict mode)`);
      } else if (breakpoints.has(finalRegisters.PC)) {
        addLog(`Breakpoint hit at ${toHex(finalRegisters.PC, 4)} after ${steps} steps`);
      } else {
        addLog(`Execution finished: ${steps} steps, Halted: ${halted}`);
      }

      setAddressDisplay(toHex(finalRegisters.PC, 4));
      setDataDisplay('E ');
      setInputMode(INPUT_MODE.IDLE);
      setTrainerMode(TRAINER_MODE.MONITOR);
      setInputBuffer('');
    }
  }, [trainerMode, inputBuffer, registers, flags, addLog, refreshMemDisplay, memBaseAddr, breakpoints, strictMode]);

  // ---- STEP ----
  const handleStep = useCallback(() => {
    const startAddr = registers.PC;
    const { finalRegisters, finalFlags, illegalOpcode } = executeProgram(
      memRef.current, startAddr, registers, flags, 1, new Set(), portsRef.current, strictMode
    );
    setRegisters(finalRegisters);
    setFlags(finalFlags);
    refreshMemDisplay();
    setPortsVersion(v => v + 1);
    if (illegalOpcode !== undefined) {
      addLog(`STEP: ILLEGAL OPCODE 0x${illegalOpcode.toString(16).toUpperCase().padStart(2,'0')} (strict mode)`);
    } else {
      addLog(`STEP: PC=${toHex(finalRegisters.PC, 4)}`);
    }
    setAddressDisplay(toHex(finalRegisters.PC, 4));
    setDataDisplay(toHex(memRef.current[finalRegisters.PC]));
  }, [registers, flags, addLog, refreshMemDisplay, strictMode]);

  // ---- BREAKPOINTS & PORTS ----
  const toggleBreakpoint = useCallback((addr) => {
    setBreakpoints(prev => {
      const next = new Set(prev);
      if (next.has(addr)) next.delete(addr); else next.add(addr);
      return next;
    });
  }, []);

  const writePort = useCallback((port, value) => {
    portsRef.current[port] = value & 0xFF;
    setPortsVersion(v => v + 1);
  }, []);

  // ---- NEXT ----
  const handleNext = useCallback(() => {
    if (trainerMode === TRAINER_MODE.EXAMINE_MEM) {
      if (inputMode === INPUT_MODE.ADDRESS) {
        confirmAddress();
      } else {
        if (inputBuffer.length > 0) confirmData();
        const nextAddr = (currentAddr + 1) & 0xFFFF;
        setCurrentAddr(nextAddr);
        setAddressDisplay(toHex(nextAddr, 4));
        setDataDisplay(toHex(memRef.current[nextAddr]));
        setInputBuffer('');
        setInputMode(INPUT_MODE.DATA);
        addLog(`NEXT: ${toHex(nextAddr, 4)} = ${toHex(memRef.current[nextAddr])}`);
      }
    } else if (trainerMode === TRAINER_MODE.EXAMINE_REG) {
      const REG_ORDER = ['A', 'B', 'C', 'D', 'E', 'H', 'L', 'SP', 'PC'];
      const currentReg = addressDisplay.trim();
      const idx = REG_ORDER.indexOf(currentReg);
      
      if (idx !== -1) {
        if (inputBuffer.length > 0) {
          const val = parseInt(inputBuffer, 16);
          setRegisters(prev => ({ ...prev, [currentReg]: val }));
          addLog(`WRITE REG: ${currentReg} = ${toHex(val, currentReg === 'SP' || currentReg === 'PC' ? 4 : 2)}`);
        }
        
        const nextReg = REG_ORDER[(idx + 1) % REG_ORDER.length];
        setAddressDisplay(nextReg.padEnd(4, ' '));
        const val = registers[nextReg];
        setDataDisplay(toHex(val, nextReg === 'SP' || nextReg === 'PC' ? 4 : 2));
        setInputBuffer('');
        setInputMode(INPUT_MODE.DATA);
      }
    }
  }, [trainerMode, inputMode, inputBuffer, currentAddr, confirmAddress, confirmData, addLog, addressDisplay, registers, setRegisters]);

  // Master key handler
  const handleKey = useCallback((keyId) => {
    switch (keyId) {
      case 'RESET':      handleReset(); break;
      case 'MEMC_NEXT':  handleNext(); break;
      case 'EXREG_SI':   handleExReg(); break;
      case 'GO':         handleGo(); break;
      case 'SHIFT':      setShifted(s => !s); break;
      case 'BM':         addLog('BM: Block Move (enter src, dst, len)'); break;
      case 'INS_DATA':   addLog('INS DATA: Insert byte at current address'); break;
      case 'DEL_DATA':   addLog('DEL DATA: Delete byte at current address'); break;
      case 'FILL':       addLog('FILL: Enter start addr, end addr, byte'); break;
      case 'VCT_INT':    addLog('VCT INT: Vectored interrupt triggered'); break;
      case 'REL_EXMEM':  handleMem(); break;
      case 'STRING_PRE': addLog('STRING PRE: String operation preset'); break;

      case '0': case '1': case '2': case '3':
      case '4': case '5': case '6': case '7':
      case '8': case '9': case 'A': case 'B':
      case 'C': case 'D': case 'E': case 'F':
        if (inputMode !== INPUT_MODE.IDLE) {
          handleHexKey(keyId);
        }
        break;

      default: break;
    }
  }, [handleReset, handleNext, handleMem, handleExReg, handleGo, handleHexKey, inputMode, addLog]);

  // Confirm current input (called by pressing NEXT after address entry)
  const confirmInput = useCallback(() => {
    if (inputMode === INPUT_MODE.ADDRESS) confirmAddress();
    else if (inputMode === INPUT_MODE.DATA) confirmData();
  }, [inputMode, confirmAddress, confirmData]);

  return {
    registers, setRegisters,
    flags, setFlags,
    memory: memRef.current,
    memVersion, memBaseAddr, setMemBaseAddr, refreshMemDisplay,
    addressDisplay, dataDisplay, displayBlink,
    inputMode, trainerMode, shifted,
    currentAddr,
    log, setLog,
    handleKey,
    confirmInput,
    handleFill,
    handleStep,
    breakpoints, toggleBreakpoint,
    ports: portsRef.current, portsVersion, writePort,
  };
}
