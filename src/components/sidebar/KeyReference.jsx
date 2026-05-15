import React, { useState } from 'react';
import { Circle, CircleDot } from 'lucide-react';

const KEY_REFERENCE = [
  { key: 'RESET',      kbd: 'Esc', primary: 'Reset CPU to initial state (PC=0000)', shift: '—', color: 'func' },
  { key: 'VCT INT',    kbd: 'V',   primary: 'Vectored Interrupt — triggers RST 7.5 / 6.5 / 5.5', shift: '—', color: 'func' },
  { key: 'SHIFT',      kbd: '⇧',   primary: 'Activates secondary (register) functions of digit keys', shift: '—', color: 'func' },
  { key: 'EXREG / SI', kbd: 'X',   primary: 'Examine register (cycles A→B→C→D→E→H→L→PC→SP)', shift: 'Store new value into examined register', color: 'func' },
  { key: 'INS DATA',   kbd: 'I',   primary: 'Insert a byte at current memory address (shift bytes up)', shift: '—', color: 'func' },
  { key: 'DEL DATA',   kbd: 'Del', primary: 'Delete byte at current memory address (shift bytes down)', shift: '—', color: 'func' },
  { key: 'GO',         kbd: 'G',   primary: 'Execute program from current PC address', shift: 'Single-step (if supported)', color: 'func' },
  { key: 'B.M',        kbd: 'M',   primary: 'Block Move — copy a memory block to a new address', shift: '—', color: 'func' },
  { key: 'REL EXMEM',  kbd: 'R',   primary: 'Relocate / Examine extended memory region', shift: '—', color: 'func' },
  { key: 'STRING PRE', kbd: 'S',   primary: 'String operation preset (configure string parameters)', shift: '—', color: 'func' },
  { key: 'MEMC NEXT',  kbd: 'N',   primary: 'Memory Check / Advance to next memory address', shift: '—', color: 'func' },
  { key: 'FILL +',     kbd: '+',   primary: 'Fill a memory range with a constant byte value', shift: '—', color: 'func' },
  { key: '0',          kbd: '0',   primary: 'Hex digit 0', shift: '—', color: 'hex' },
  { key: '1 / TTY',    kbd: '1',   primary: 'Hex digit 1', shift: 'TTY serial port select', color: 'hex' },
  { key: '2 / SER',    kbd: '2',   primary: 'Hex digit 2', shift: 'SER serial port select', color: 'hex' },
  { key: '3',          kbd: '3',   primary: 'Hex digit 3', shift: '—', color: 'hex' },
  { key: '4 / PCH',   kbd: '4',   primary: 'Hex digit 4', shift: 'Examine Program Counter High byte', color: 'hex' },
  { key: '5 / PCL',   kbd: '5',   primary: 'Hex digit 5', shift: 'Examine Program Counter Low byte', color: 'hex' },
  { key: '6 / SPH',   kbd: '6',   primary: 'Hex digit 6', shift: 'Examine Stack Pointer High byte', color: 'hex' },
  { key: '7 / SPL',   kbd: '7',   primary: 'Hex digit 7', shift: 'Examine Stack Pointer Low byte', color: 'hex' },
  { key: '8 / H',     kbd: '8',   primary: 'Hex digit 8', shift: 'Examine register H (HL high)', color: 'hex' },
  { key: '9 / L',     kbd: '9',   primary: 'Hex digit 9', shift: 'Examine register L (HL low)', color: 'hex' },
  { key: 'A',          kbd: 'A',   primary: 'Hex digit A (10)', shift: 'Examine Accumulator (A)', color: 'hex' },
  { key: 'B',          kbd: 'B',   primary: 'Hex digit B (11)', shift: 'Examine register B', color: 'hex' },
  { key: 'C',          kbd: 'C',   primary: 'Hex digit C (12)', shift: 'Examine register C', color: 'hex' },
  { key: 'D',          kbd: 'D',   primary: 'Hex digit D (13)', shift: 'Examine register D', color: 'hex' },
  { key: 'E',          kbd: 'E',   primary: 'Hex digit E (14)', shift: 'Examine register E', color: 'hex' },
  { key: 'F',          kbd: 'F',   primary: 'Hex digit F (15)', shift: 'Examine Flags register', color: 'hex' },
];

export default function KeyReference() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? KEY_REFERENCE : KEY_REFERENCE.filter(k => k.color === filter);
  return (
    <div className="sb-section">
      <div className="sb-section-title">Key Reference</div>
      <div className="keyref-filter">
        {['all', 'func', 'hex'].map(f => (
          <button
            key={f}
            className={`keyref-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'func' ? <><CircleDot size={12} className="inline-icon" /> Function</> : <><Circle size={12} className="inline-icon" /> Hex</>}
          </button>
        ))}
      </div>
      <div className="keyref-table">
        <div className="keyref-header">
          <span>Key</span><span>Kbd</span><span>Function</span>
        </div>
        {filtered.map(item => (
          <div key={item.key} className={`keyref-row keyref-${item.color}`}>
            <span className="keyref-key">{item.key}</span>
            <span className="keyref-kbd mono">{item.kbd}</span>
            <div className="keyref-desc">
              <div className="keyref-primary">{item.primary}</div>
              {item.shift !== '—' && (
                <div className="keyref-shift">⇧ {item.shift}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
