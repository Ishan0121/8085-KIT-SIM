import React, { useState, useCallback } from 'react';
import './Keypad.css';

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

  const handleMouseDown = useCallback(() => {
    setPressed(true);
    setRipple(false);
    setTimeout(() => setRipple(true), 10);
  }, []);

  const handleMouseUp = useCallback(() => {
    setPressed(false);
    onPress(keyData.id);
  }, [keyData.id, onPress]);

  const handleMouseLeave = useCallback(() => {
    setPressed(false);
  }, []);

  const lines = keyData.label.split('\n');
  const isShiftKey = keyData.id === 'SHIFT';

  return (
    <div
      className={`trainer-key ${keyData.color === 'blue' ? 'key-blue' : 'key-black'} ${pressed ? 'key-pressed' : ''} ${isShiftKey && shifted ? 'key-shifted' : ''}`}
      onPointerDown={handleMouseDown}
      onPointerUp={handleMouseUp}
      onPointerLeave={handleMouseLeave}
      onPointerCancel={handleMouseLeave}
      role="button"
      tabIndex={0}
      title={TOOLTIPS[keyData.id] || keyData.label}
      aria-label={keyData.label.replace(/\n/g, ' ')}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleMouseDown(); } }}
      onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleMouseUp(); } }}
    >
      <div className="key-face">
        {/* Primary label */}
        <div className="key-label-primary">
          {lines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>
        {/* Sub-label (register name) */}
        {keyData.sub && (
          <div className="key-label-sub">{keyData.sub}</div>
        )}
      </div>
      {ripple && <span className="key-ripple" onAnimationEnd={() => setRipple(false)} />}
    </div>
  );
}

export default function Keypad({ onKey, shifted }) {
  return (
    <div className="keypad-assembly">
      {KEYPAD_LAYOUT.map((row, ri) => (
        <div key={ri} className="keypad-row">
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
