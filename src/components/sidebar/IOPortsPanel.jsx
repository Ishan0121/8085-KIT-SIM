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
    <div className="sb-section">
      <div className="sb-section-title">I/O Ports</div>
      <input
        type="text"
        className="sb-search"
        placeholder="Search port (e.g. 0A)..."
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
      />

      <div className="mem-grid" style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', marginTop: '10px' }}>
        <div className="mem-header" style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-elevated)', zIndex: 1 }}>
          <span className="mem-addr" style={{ width: '40px' }}>Port</span>
          <span className="mem-cell" style={{ flex: 1, textAlign: 'left', paddingLeft: '8px' }}>Value (Hex)</span>
        </div>
        {filteredPorts.map(({ idx, val }) => (
          <div key={idx} className="mem-row" style={{ alignItems: 'center' }}>
            <span className="mem-addr mono" style={{ width: '40px', color: 'var(--orange)' }}>{toHex(idx)}</span>
            <input
              className="mem-jump-input mono"
              style={{ flex: 1, margin: 0, padding: '4px 8px', height: '28px', backgroundColor: 'var(--bg-base)' }}
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
