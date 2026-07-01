import React, { useState, useMemo } from 'react';
import { OPCODES, toHex } from '../../data/cpu8085';

export default function OpcodeFinder() {
  const [search, setSearch] = useState('');
  
  const results = useMemo(() => {
    const entries = Object.entries(OPCODES);
    if (!search.trim()) {
      return entries.sort((a, b) => a[1].mnemonic.localeCompare(b[1].mnemonic));
    }

    const q = search.trim().toUpperCase();
    const isHex = /^[0-9A-F]{1,2}$/.test(q);
    
    // Calculate a score for each entry to rank the results
    const scoredEntries = entries.map(([opcode, info]) => {
      let score = 0;
      
      if (isHex && parseInt(opcode).toString(16).toUpperCase().padStart(2, '0').includes(q)) {
        // High score for exact hex matches if query looks like hex
        score = 5;
      }
      
      const mnemonic = info.mnemonic.toUpperCase();
      const desc = info.desc.toUpperCase();

      if (mnemonic === q) {
        score = Math.max(score, 4); // Rank 1: Exact mnemonic match
      } else if (mnemonic.startsWith(q)) {
        score = Math.max(score, 3); // Rank 2: Mnemonic starts with query
      } else if (mnemonic.includes(q)) {
        score = Math.max(score, 2); // Rank 3: Mnemonic includes query
      } else {
        // Rank 4: Description matches the query as a distinct word
        const regex = new RegExp(`\\b${q}\\b`);
        if (regex.test(desc)) {
          score = Math.max(score, 1);
        }
      }

      return { opcode, info, score };
    });

    // Filter out items with score 0, sort by score descending, then by mnemonic alphabetically
    return scoredEntries
      .filter(item => item.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return a.info.mnemonic.localeCompare(b.info.mnemonic);
      })
      .map(item => [item.opcode, item.info]);
      
  }, [search]);
  
  return (
    <div className="flex flex-col h-full mb-4">
      <div className="font-orbitron text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Opcode / Hex Finder</div>
      <input
        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 font-mono text-xs outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all mb-3 placeholder-slate-600"
        placeholder="Search MOV, ADD, 3E …"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {results.length > 0 && (
        <div className="flex-1 overflow-y-auto bg-slate-900/50 border border-slate-700/50 rounded-lg flex flex-col min-h-[300px]">
          <div className="flex items-center px-3 py-2 border-b border-slate-700/50 bg-slate-800/50 text-[10px] font-bold font-inter text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
            <span className="w-8 shrink-0">Op</span>
            <span className="flex-1">Mnemonic</span>
            <span className="w-4 shrink-0 text-center">B</span>
            <span className="w-4 shrink-0 text-center">T</span>
          </div>
          {results.map(([opcode, info]) => (
            <div key={opcode} className="flex items-center px-3 py-1.5 border-b border-slate-800 hover:bg-slate-800/50 transition-colors group cursor-help" title={info.desc}>
              <span className="w-8 shrink-0 font-mono text-[13px] text-cyan-400">{toHex(parseInt(opcode))}</span>
              <span className="flex-1 font-mono text-[12px] text-slate-200">{info.mnemonic}</span>
              <span className="w-4 shrink-0 text-center font-inter text-[11px] text-slate-400">{info.bytes}</span>
              <span className="w-4 shrink-0 text-center font-inter text-[11px] text-slate-400">{info.cycles}</span>
            </div>
          ))}
        </div>
      )}
      {results.length === 0 && search.trim() !== '' && (
        <div className="p-4 text-center text-[11px] text-slate-500 font-inter">
          No opcodes found for "{search}"
        </div>
      )}
    </div>
  );
}
