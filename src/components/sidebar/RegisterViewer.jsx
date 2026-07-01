import React from 'react';
import { toHex } from '../../data/cpu8085';

export default function RegisterViewer({ registers, flags, prevRegisters, showDecimal }) {
  const regList = [
    { key: 'A',  label: 'A',  desc: 'Accumulator' },
    { key: 'B',  label: 'B',  desc: 'Register B' },
    { key: 'C',  label: 'C',  desc: 'Register C' },
    { key: 'D',  label: 'D',  desc: 'Register D' },
    { key: 'E',  label: 'E',  desc: 'Register E' },
    { key: 'H',  label: 'H',  desc: 'Register H' },
    { key: 'L',  label: 'L',  desc: 'Register L' },
    { key: 'PC', label: 'PC', desc: 'Program Counter', wide: true },
    { key: 'SP', label: 'SP', desc: 'Stack Pointer',   wide: true },
  ];
  const flagList = [
    { key: 'S',  label: 'S',  title: 'Sign' },
    { key: 'Z',  label: 'Z',  title: 'Zero' },
    { key: 'AC', label: 'AC', title: 'Aux Carry' },
    { key: 'P',  label: 'P',  title: 'Parity' },
    { key: 'CY', label: 'CY', title: 'Carry' },
  ];
  return (
    <div className="flex flex-col mb-4">
      <div className="font-orbitron text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Registers</div>
      <div className="grid grid-cols-2 gap-2">
        {regList.map(({ key, label, desc, wide }) => {
          const val = registers[key];
          const prev = prevRegisters?.[key];
          const changed = val !== prev;
          return (
            <div key={key} className={`flex items-center justify-between bg-slate-800 border rounded-md px-2 py-1.5 transition-all ${changed ? 'border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]' : 'border-slate-700'}`} title={desc}>
              <span className="font-orbitron text-[10px] font-bold text-slate-400">{label}</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-[13px] text-cyan-400">{toHex(val, wide ? 4 : 2)}</span>
                {showDecimal && <span className="text-[9px] text-slate-500">{val}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="font-orbitron text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-2">Flags</div>
      <div className="flex gap-1.5 justify-between">
        {flagList.map(({ key, label, title }) => (
          <div key={key} className={`flex flex-col items-center flex-1 border rounded-md py-1 px-0.5 transition-colors ${flags[key] ? 'border-cyan-500 text-cyan-400 bg-cyan-900/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]' : 'border-slate-700 text-slate-500 bg-slate-800'}`} title={title}>
            <span className="font-orbitron text-[9px] font-bold mb-0.5">{label}</span>
            <span className="font-mono text-[11px]">{flags[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
