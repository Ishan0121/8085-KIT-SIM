import React from 'react';
import { IC_INFO } from '../../data/cpu8085';

export default function ChipInfo({ setIcInfoKey }) {
  const chips = Object.entries(IC_INFO);
  return (
    <div className="flex flex-col h-full mb-4">
      <div className="font-orbitron text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">IC Chip Reference</div>
      <div className="flex flex-col gap-2 overflow-y-auto pr-1 pb-4">
        {chips.map(([id, info]) => (
          <div
            key={id}
            className="bg-slate-900 border border-slate-700 rounded-md p-2.5 cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800 transition-all group shadow-sm"
            onClick={() => setIcInfoKey(id)}
          >
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">{info.label}</span>
              <span className="flex-1 font-inter text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors">{info.role}</span>
              <span className="px-1.5 py-0.5 bg-slate-800 group-hover:bg-slate-700 transition-colors rounded font-mono text-[9px] text-slate-400 border border-slate-700">{info.pins}p</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
