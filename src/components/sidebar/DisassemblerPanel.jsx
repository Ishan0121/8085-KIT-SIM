import React, { useState, useEffect } from 'react';
import { disassembleMemory } from '../../utils/disassembler';
import { toHex } from '../../data/cpu8085';
import { Copy } from 'lucide-react';

export default function DisassemblerPanel({ memory, memVersion, baseAddr, setMemBaseAddr, refreshMemDisplay }) {
  const [startAddrInput, setStartAddrInput] = useState('');
  const [lines, setLines] = useState([]);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    setLines(disassembleMemory(memory, baseAddr, 100));
  }, [memory, memVersion, baseAddr]);

  const handleUpdate = (e) => {
    e.preventDefault();
    if (startAddrInput.trim() !== '') {
      const addr = parseInt(startAddrInput, 16) & 0xFFFF;
      setMemBaseAddr(addr);
      if(refreshMemDisplay) refreshMemDisplay(addr);
      setStartAddrInput('');
    }
  };

  const handleCopy = () => {
    if (lines.length === 0) return;
    const textToCopy = lines.map(line => `${toHex(line.address, 4)}\t${line.hex}\t${line.mnemonic}`).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }; 

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <span className="font-orbitron text-[11px] font-bold uppercase tracking-wider text-slate-400">Disassembler</span>
        <button 
          onClick={handleCopy} 
          title="Copy Assembly"
          className="flex items-center justify-center bg-cyan-700 hover:bg-cyan-600 text-white rounded-md px-3 py-1 font-inter text-[11px] font-bold transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          {copyStatus ? <span className="text-[10px]">{copyStatus}</span> : <Copy size={14} />}
        </button>
      </div>
      
      <form className="flex gap-2 mb-3" onSubmit={handleUpdate}>
        <input
          className="w-24 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-cyan-400 font-mono text-[13px] outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all uppercase placeholder-slate-600"
          placeholder={toHex(baseAddr, 4)}
          value={startAddrInput}
          onChange={e => setStartAddrInput(e.target.value.toUpperCase())}
          maxLength={4}
        />
        <button className="flex items-center justify-center bg-cyan-700 hover:bg-cyan-600 text-white rounded-md px-3 py-1.5 font-inter text-[12px] font-bold shadow-sm transition-colors cursor-pointer shrink-0" type="submit">Scan</button>
      </form>

      <div className="flex-1 overflow-y-auto mt-2 bg-slate-900/50 border border-slate-700/50 rounded-lg flex flex-col">
        <div className="flex items-center px-3 py-2 border-b border-slate-700/50 bg-slate-800/50 text-[10px] font-bold font-inter text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
          <span className="w-10 shrink-0">Addr</span>
          <span className="w-[70px] shrink-0">Hex</span>
          <span className="flex-1">Mnemonic</span>
        </div>
        {lines.length === 0 ? (
          <div className="p-4 text-center text-[11px] text-slate-500 font-inter">No code found</div>
        ) : (
          lines.map((line, idx) => (
            <div key={idx} className="flex items-center px-3 py-1.5 border-b border-slate-800 hover:bg-slate-800/50 transition-colors group">
              <span className="w-10 shrink-0 font-mono text-[13px] text-cyan-400">{toHex(line.address, 4)}</span>
              <span className="w-[70px] shrink-0 font-mono text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">{line.hex}</span>
              <span className="flex-1 font-mono text-[13px] text-slate-200">{line.mnemonic}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
