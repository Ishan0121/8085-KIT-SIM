import React, { useState, useRef } from 'react';
import { toHex } from '../../data/cpu8085';
import { exportMemory, importMemoryFile } from '../../utils/memoryStorage';

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

  const fileInputRef = useRef(null);
  const [exportFormat, setExportFormat] = useState('json');

  const handleExport = () => {
    const defaultName = '8085_project';
    const projectName = window.prompt("Enter project name:", defaultName);
    if (projectName !== null) {
      exportMemory(memory, exportFormat, projectName.trim() || defaultName);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const success = await importMemoryFile(file, memory);
    if (success) {
      refreshMemDisplay();
    } else {
      alert("Failed to load memory file. Ensure the format is correct.");
    }
    e.target.value = ''; // Reset input
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

      {/* Memory Save/Load UI */}
      <div className="mem-storage-controls" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <select 
          className="settings-btn" 
          value={exportFormat} 
          onChange={e => setExportFormat(e.target.value)}
          style={{ flex: 1, padding: '4px', textAlign: 'center' }}
        >
          <option value="json">JSON</option>
          <option value="hex">.HEX</option>
          <option value="bin">.BIN</option>
        </select>
        <button className="settings-btn" onClick={handleExport} style={{ flex: 1, padding: '4px' }}>Export</button>
        <button className="settings-btn" onClick={() => fileInputRef.current.click()} style={{ flex: 1, padding: '4px' }}>Import</button>
        <input type="file" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} accept=".json,.hex,.bin" />
      </div>

      <div className="mem-grid" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
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
