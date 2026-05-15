import React, { useState } from 'react';
import { toHex } from '../../data/cpu8085';

export default function MemoryViewer({ memory, memVersion, baseAddr, setMemBaseAddr, refreshMemDisplay }) {
  const [jumpInput, setJumpInput] = useState('');
  const [rowCount, setRowCount] = useState(4);

  const handleJump = (e) => {
    e.preventDefault();
    const addr = parseInt(jumpInput, 16) & 0xFFFF;
    setMemBaseAddr(addr);
    refreshMemDisplay(addr);
    setJumpInput('');
    setRowCount(4); // Reset to 4 rows on new jump
  };

  const rows = [];
  for (let r = 0; r < rowCount; r++) {
    const rowAddr = baseAddr + r * 4;
    // Don't render past 0xFFFF
    if (rowAddr > 0xFFFF) break;
    
    rows.push(
      <div key={r} className="mem-row">
        <span className="mem-addr mono">{toHex(rowAddr, 4)}</span>
        {Array.from({ length: 4 }, (_, c) => {
          const val = memory[rowAddr + c] ?? 0;
          return <span key={c} className="mem-cell mono">{toHex(val)}</span>;
        })}
      </div>
    );
  }

  return (
    <div className="sb-section">
      <div className="sb-section-title">Memory Viewer</div>
      <form className="mem-jump-form" onSubmit={handleJump}>
        <input
          className="mem-jump-input mono"
          placeholder="Address (hex)"
          value={jumpInput}
          onChange={e => setJumpInput(e.target.value.toUpperCase())}
          maxLength={4}
        />
        <button className="mem-jump-btn" type="submit">Go</button>
      </form>
      <div className="mem-grid" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
        <div className="mem-header" style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-elevated)', zIndex: 1 }}>
          <span className="mem-addr">Addr</span>
          <span className="mem-cell">+0</span>
          <span className="mem-cell">+1</span>
          <span className="mem-cell">+2</span>
          <span className="mem-cell">+3</span>
        </div>
        {rows}
      </div>
      {(baseAddr + rowCount * 4) <= 0xFFFF && (
        <button 
          onClick={() => setRowCount(prev => prev + 4)}
          className="settings-btn" 
          style={{ width: '100%', marginTop: '8px', padding: '4px' }}
        >
          Load More
        </button>
      )}
    </div>
  );
}
