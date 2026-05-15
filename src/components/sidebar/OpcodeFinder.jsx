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
    <div className="sb-section">
      <div className="sb-section-title">Opcode / Hex Finder</div>
      <input
        className="sb-search"
        placeholder="Search MOV, ADD, 3E …"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {results.length > 0 && (
        <div className="opcode-results" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          <div className="opcode-header" style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-elevated)', zIndex: 1 }}>
            <span>Op</span><span>Mnemonic</span><span>B</span><span>T</span>
          </div>
          {results.map(([opcode, info]) => (
            <div key={opcode} className="opcode-row" title={info.desc}>
              <span className="mono opcode-hex">{toHex(parseInt(opcode))}</span>
              <span className="mono opcode-mnem">{info.mnemonic}</span>
              <span className="opcode-bytes">{info.bytes}</span>
              <span className="opcode-cycles">{info.cycles}</span>
            </div>
          ))}
        </div>
      )}
      {results.length === 0 && search.trim() !== '' && (
        <div className="opcode-results" style={{ padding: '10px', textAlign: 'center', opacity: 0.6 }}>
          No opcodes found for "{search}"
        </div>
      )}
    </div>
  );
}
