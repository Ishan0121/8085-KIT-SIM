import React from 'react';
import { toHex } from '../data/cpu8085';
import './SidePanel.css';
import { X, Pin, Settings } from 'lucide-react';

// ============================================================
// Register Viewer
// ============================================================
function RegisterViewer({ registers, flags, prevRegisters }) {
  const regList = [
    { key: 'A', label: 'A', desc: 'Accumulator' },
    { key: 'B', label: 'B', desc: 'Register B' },
    { key: 'C', label: 'C', desc: 'Register C' },
    { key: 'D', label: 'D', desc: 'Register D' },
    { key: 'E', label: 'E', desc: 'Register E' },
    { key: 'H', label: 'H', desc: 'Register H' },
    { key: 'L', label: 'L', desc: 'Register L' },
    { key: 'PC', label: 'PC', desc: 'Program Counter', wide: true },
    { key: 'SP', label: 'SP', desc: 'Stack Pointer', wide: true },
  ];

  const flagList = [
    { key: 'S',  label: 'S',  title: 'Sign' },
    { key: 'Z',  label: 'Z',  title: 'Zero' },
    { key: 'AC', label: 'AC', title: 'Aux Carry' },
    { key: 'P',  label: 'P',  title: 'Parity' },
    { key: 'CY', label: 'CY', title: 'Carry' },
  ];

  return (
    <div className="panel-section">
      <div className="section-title">Registers</div>
      <div className="reg-grid">
        {regList.map(({ key, label, desc, wide }) => {
          const val = registers[key];
          const prev = prevRegisters?.[key];
          const changed = val !== prev;
          return (
            <div key={key} className={`reg-row ${changed ? 'reg-changed' : ''}`} title={desc}>
              <span className="reg-label">{label}</span>
              <span className="reg-value mono">{toHex(val, wide ? 4 : 2)}</span>
              <span className="reg-decimal">{val}</span>
            </div>
          );
        })}
      </div>

      <div className="section-subtitle">Flags</div>
      <div className="flags-row">
        {flagList.map(({ key, label, title }) => (
          <div key={key} className={`flag-bit ${flags[key] ? 'flag-set' : 'flag-clear'}`} title={title}>
            <span className="flag-name">{label}</span>
            <span className="flag-val">{flags[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main Side Panel (Right Panel)
// ============================================================
export default function SidePanel({
  registers, prevRegisters, flags
}) {
  return (
    <aside className="side-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">
          <Settings size={16} className="panel-title-icon" />
          State View
        </div>
      </div>

      {/* Content */}
      <div className="panel-content">
        <RegisterViewer
          registers={registers}
          prevRegisters={prevRegisters}
          flags={flags}
        />
      </div>
    </aside>
  );
}
