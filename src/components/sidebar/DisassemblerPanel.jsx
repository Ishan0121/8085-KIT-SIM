import React, { useState, useEffect } from 'react';
import { disassembleMemory } from '../../utils/disassembler';
import { toHex } from '../../data/cpu8085';

export default function DisassemblerPanel({ memory, memVersion, baseAddr, setMemBaseAddr, refreshMemDisplay }) {
  const [startAddrInput, setStartAddrInput] = useState('');
  const [lines, setLines] = useState([]);

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

  return (
    <div className="sb-section" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sb-section-title">Disassembler</div>
      
      <form className="mem-jump-form" onSubmit={handleUpdate}>
        <input
          className="mem-jump-input mono"
          placeholder={toHex(baseAddr, 4)}
          value={startAddrInput}
          onChange={e => setStartAddrInput(e.target.value.toUpperCase())}
          maxLength={4}
        />
        <button className="mem-jump-btn" type="submit">Scan</button>
      </form>

      <div className="opcode-results" style={{ flex: 1, overflowY: 'auto', marginTop: '8px' }}>
        <div className="opcode-header">
          <span style={{ minWidth: '40px' }}>Addr</span>
          <span style={{ minWidth: '70px' }}>Hex</span>
          <span style={{ flex: 1 }}>Mnemonic</span>
        </div>
        {lines.length === 0 ? (
          <div style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>No code found</div>
        ) : (
          lines.map((line, idx) => (
            <div key={idx} className="opcode-row" style={{ padding: '4px 8px' }}>
              <span className="mono opcode-hex" style={{ minWidth: '40px', color: 'var(--accent)' }}>{toHex(line.address, 4)}</span>
              <span className="mono" style={{ minWidth: '70px', fontSize: '11px', color: 'var(--text-muted)' }}>{line.hex}</span>
              <span className="mono opcode-mnem">{line.mnemonic}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
