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
    <div className="sb-section" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sb-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Disassembler</span>
        <button 
          onClick={handleCopy} 
          title="Copy Assembly"
          className='mem-jump-btn'
        >
          {copyStatus ? <span style={{ fontSize: '10px' }}>{copyStatus}</span> : <Copy size={14} />}
        </button>
      </div>
      
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
