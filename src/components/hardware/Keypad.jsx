import React, { useState, useCallback } from 'react';

/**
 * Keypad layout matching the physical 8085 trainer kit:
 *
 * Row 1: RESET | VCT INT | SHIFT   |  C  |  D  |  E  |  F
 * Row 2: EXREG SI | INS DATA | DEL DATA | 8/H | 9/L | A | B
 * Row 3: GO | B.M | REL EXMEM | 4/PCH | 5/PCL | 6/SPH | 7/SPL
 * Row 4: STRING PRE | MEMC NEXT | FILL + | 0 | 1/TTY | 2/SER | 3
 *
 * Left 3 columns = Blue (function keys)
 * Right 4 columns = Black (hex digit keys)
 */

const KEYPAD_LAYOUT = [
  // Row 1
  [
    { id: 'RESET',    label: 'RESET',      color: 'blue', shortcut: 'Escape' },
    { id: 'VCT_INT',  label: 'VCT\nINT',   color: 'blue', shortcut: 'v' },
    { id: 'SHIFT',    label: 'SHIFT',       color: 'blue', shortcut: 'Shift' },
    { id: 'C',        label: 'C',           color: 'black', shortcut: 'c' },
    { id: 'D',        label: 'D',           color: 'black', shortcut: 'd' },
    { id: 'E',        label: 'E',           color: 'black', shortcut: 'e' },
    { id: 'F',        label: 'F',           color: 'black', shortcut: 'f' },
  ],
  // Row 2
  [
    { id: 'EXREG_SI', label: 'EXREG\nSI',  color: 'blue', shortcut: 'x' },
    { id: 'INS_DATA', label: 'INS\nDATA',  color: 'blue', shortcut: 'i' },
    { id: 'DEL_DATA', label: 'DEL\nDATA',  color: 'blue', shortcut: 'Delete' },
    { id: '8',        label: '8',  sub: 'H', color: 'black', shortcut: '8' },
    { id: '9',        label: '9',  sub: 'L', color: 'black', shortcut: '9' },
    { id: 'A',        label: 'A',           color: 'black', shortcut: 'a' },
    { id: 'B',        label: 'B',           color: 'black', shortcut: 'b' },
  ],
  // Row 3
  [
    { id: 'GO',       label: 'GO',          color: 'blue', shortcut: 'g' },
    { id: 'BM',       label: 'B.M',         color: 'blue', shortcut: 'm' },
    { id: 'REL_EXMEM',label: 'REL\nEXMEM', color: 'blue', shortcut: 'r' },
    { id: '4',        label: '4',  sub: 'PCH', color: 'black', shortcut: '4' },
    { id: '5',        label: '5',  sub: 'PCL', color: 'black', shortcut: '5' },
    { id: '6',        label: '6',  sub: 'SPH', color: 'black', shortcut: '6' },
    { id: '7',        label: '7',  sub: 'SPL', color: 'black', shortcut: '7' },
  ],
  // Row 4
  [
    { id: 'STRING_PRE',label: 'STRING\nPRE', color: 'blue', shortcut: 's' },
    { id: 'MEMC_NEXT', label: 'MEMC\nNEXT', color: 'blue', shortcut: 'n' },
    { id: 'FILL',      label: 'FILL\n+',    color: 'blue', shortcut: '+' },
    { id: '0',        label: '0',           color: 'black', shortcut: '0' },
    { id: '1',        label: '1',  sub: 'TTY', color: 'black', shortcut: '1' },
    { id: '2',        label: '2',  sub: 'SER', color: 'black', shortcut: '2' },
    { id: '3',        label: '3',           color: 'black', shortcut: '3' },
  ],
];

const TOOLTIPS = {
  RESET:      'Reset the CPU to initial state (PC=0000)',
  VCT_INT:    'Vectored Interrupt - trigger RST 7.5/6.5/5.5',
  SHIFT:      'SHIFT key - enables secondary function of keys',
  EXREG_SI:   'Examine/modify CPU registers (A,B,C,D,E,H,L,PC,SP)',
  INS_DATA:   'Insert a byte at current memory address',
  DEL_DATA:   'Delete byte at current memory address',
  GO:         'Execute program from current PC address',
  BM:         'Block Move - copy memory block to another address',
  REL_EXMEM:  'Relocate / Examine extended memory',
  STRING_PRE: 'String operations - preset',
  MEMC_NEXT:  'Memory check / Move to next address',
  FILL:       'Fill memory range with a constant value',
  C:  'Hex digit C (12) / Register C',
  D:  'Hex digit D (13) / Register D',
  E:  'Hex digit E (14) / Register E',
  F:  'Hex digit F (15) / Flags register',
  '8': 'Hex digit 8 / Register H (high byte of HL)',
  '9': 'Hex digit 9 / Register L (low byte of HL)',
  A:  'Hex digit A (10) / Accumulator register',
  B:  'Hex digit B (11) / Register B',
  '4': 'Hex digit 4 / PCH (Program Counter high byte)',
  '5': 'Hex digit 5 / PCL (Program Counter low byte)',
  '6': 'Hex digit 6 / SPH (Stack Pointer high byte)',
  '7': 'Hex digit 7 / SPL (Stack Pointer low byte)',
  '0': 'Hex digit 0',
  '1': 'Hex digit 1 / TTY serial port',
  '2': 'Hex digit 2 / SER serial port',
  '3': 'Hex digit 3',
};

function TrainerKey({ keyData, onPress, shifted }) {
  const [pressed, setPressed] = useState(false);
  const [ripple, setRipple] = useState(false);

  const handlePointerDown = useCallback((e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    setPressed(true);
    setRipple(false);
    setTimeout(() => setRipple(true), 10);
  }, []);

  const handlePointerUp = useCallback((e) => {
    e.preventDefault();
    setPressed(false);
    onPress(keyData.id);
  }, [keyData.id, onPress]);

  const handlePointerLeave = useCallback(() => {
    setPressed(false);
  }, []);

  const lines = keyData.label.split('\n');
  const isShiftKey = keyData.id === 'SHIFT';
  const isBlue = keyData.color === 'blue';

  let keyClasses = "relative w-10 h-9 sm:w-[56px] sm:h-[48px] rounded-lg cursor-pointer flex items-end justify-center pb-1 transition-all duration-[60ms] outline-none overflow-hidden shrink-0 select-none group";

  if (isBlue) {
    if (pressed) {
      keyClasses += " translate-y-[2px] shadow-[0_1px_0_0_theme(colors.blue.950),0_2px_4px_rgba(0,0,0,0.5),inset_0_2px_6px_rgba(0,0,0,0.3)] bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-950";
    } else if (isShiftKey && shifted) {
      keyClasses += " shadow-[0_4px_0_0_theme(colors.blue.950),0_0_12px_rgba(34,211,238,0.5)] bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 border border-blue-950";
    } else {
      keyClasses += " shadow-[0_4px_0_0_theme(colors.blue.950),0_6px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 hover:from-blue-400 hover:via-blue-600 hover:to-blue-800 border border-blue-950";
    }
  } else {
    if (pressed) {
      keyClasses += " translate-y-[2px] shadow-[0_1px_0_0_theme(colors.slate.950),0_2px_4px_rgba(0,0,0,0.5),inset_0_2px_8px_rgba(0,0,0,0.5)] bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-950";
    } else {
      keyClasses += " shadow-[0_4px_0_0_theme(colors.slate.950),0_5px_6px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 hover:from-slate-600 hover:via-slate-700 hover:to-slate-900 border border-slate-950";
    }
  }

  return (
    <div
      className={keyClasses}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      role="button"
      tabIndex={0}
      title={TOOLTIPS[keyData.id] || keyData.label}
      aria-label={keyData.label.replace(/\n/g, ' ')}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handlePointerDown(e); } }}
      onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') { handlePointerUp(e); } }}
    >
      <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none">
        {/* Shortcut indicator on function keys */}
        {isBlue && keyData.shortcut && (
          <div className="absolute top-0.5 right-1 text-[5px] sm:text-[6px] font-mono font-bold text-white/40 drop-shadow-sm tracking-tighter">
            {keyData.shortcut.replace('Escape', 'ESC').toUpperCase()}
          </div>
        )}
        
        {/* Primary label */}
        <div className="flex flex-col items-center leading-[1.1]">
          {lines.map((line, i) => (
            <span key={i} className={`font-inter font-bold tracking-[0.2px] text-center whitespace-nowrap ${isBlue ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)] text-[8px] sm:text-[11px]' : 'text-[#e8ecf2] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-[14px] sm:text-[18px]'}`}>{line}</span>
          ))}
        </div>
        {/* Sub-label (register name) */}
        {keyData.sub && (
          <div className={`font-mono text-[6px] sm:text-[8px] mt-[2px] tracking-[0.5px] ${isBlue ? 'text-white/65' : 'text-[#c8d2e1]/60'}`}>{keyData.sub}</div>
        )}
      </div>
      {ripple && <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 pointer-events-none w-0 h-0 animate-[ripple-expand_0.35s_ease-out_forwards]" onAnimationEnd={() => setRipple(false)} />}
    </div>
  );
}

export default function Keypad({ onKey, shifted }) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 select-none">
      {KEYPAD_LAYOUT.map((row, ri) => (
        <div key={ri} className="flex gap-2 sm:gap-3">
          {row.map((key) => (
            <TrainerKey
              key={key.id}
              keyData={key}
              onPress={onKey}
              shifted={shifted}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
