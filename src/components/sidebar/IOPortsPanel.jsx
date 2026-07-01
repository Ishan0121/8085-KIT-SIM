import React, { useState } from 'react';
import { toHex } from '../../data/cpu8085';

export default function IOPortsPanel({ ports, portsVersion, writePort }) {
  const [searchInput, setSearchInput] = useState('');

  const handlePortChange = (portIndex, valStr) => {
    // Only allow valid hex characters
    if (!/^[0-9A-Fa-f]{0,2}$/.test(valStr)) return;
    
    // If empty, set to 0, otherwise parse hex
    const val = valStr.length === 0 ? 0 : parseInt(valStr, 16);
    writePort(portIndex, val);
  };

  // Convert Uint8Array to an array of objects we can easily map over
  const portList = Array.from(ports).map((val, idx) => ({ idx, val }));

  // Filter based on search (either hex index or just matching values)
  const filteredPorts = portList.filter(({ idx }) => {
    if (!searchInput) return true;
    const hexIdx = toHex(idx);
    return hexIdx.includes(searchInput.toUpperCase());
  });

  return (
    <div className="mb-7">
      <div className="font-orbitron text-[11px] font-bold text-cyan-400 tracking-[2px] uppercase mb-3.5 pb-2 border-b border-cyan-500/30 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] flex items-center gap-2 relative before:content-[''] before:inline-block before:w-[3px] before:h-[14px] before:bg-cyan-400 before:rounded-full before:shadow-[0_0_8px_rgba(34,211,238,0.5)] before:shrink-0">I/O Ports</div>
      <input
        type="text"
        className="w-full bg-slate-800 border border-slate-700 rounded-sm py-2 px-3 text-slate-100 text-[13px] font-mono outline-none transition-all placeholder-slate-500 focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.2)] mb-2.5"
        placeholder="Search port (e.g. 0A)..."
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
      />

      <div className="flex flex-col gap-[3px] overflow-y-auto mt-2.5" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        <div className="flex gap-1.5 px-2 py-1 font-mono text-[11px] text-slate-500 tracking-[0.5px] sticky top-0 bg-slate-900 z-10">
          <span className="font-mono text-[13px] font-semibold text-cyan-400 min-w-[48px] w-10">Port</span>
          <span className="font-mono text-[13px] text-slate-300 min-w-[28px] flex-1 text-left pl-2">Value (Hex)</span>
        </div>
        {filteredPorts.map(({ idx, val }) => (
          <div key={idx} className="flex gap-1.5 px-2 py-[5px] rounded-sm bg-slate-800 transition-colors hover:bg-cyan-900/20 items-center">
            <span className="font-mono text-[13px] font-semibold text-orange-400 min-w-[48px] w-10">{toHex(idx)}</span>
            <input
              className="flex-1 bg-slate-950 border border-slate-700 rounded-sm py-1 px-2 text-slate-100 text-[13px] font-mono outline-none transition-all placeholder-slate-500 focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.2)] m-0 h-7"
              value={toHex(val)}
              onChange={e => handlePortChange(idx, e.target.value)}
              maxLength={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
