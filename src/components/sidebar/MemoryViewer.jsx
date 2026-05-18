import React, { useState, useRef } from 'react';
import { toHex } from '../../data/cpu8085';
import { exportMemory, importMemoryFile } from '../../utils/memoryStorage';
import { Download, Upload, ChevronDown } from 'lucide-react';

export default function MemoryViewer({ memory, memVersion, baseAddr, setMemBaseAddr, refreshMemDisplay }) {
  const [jumpInput, setJumpInput]       = useState('');
  const [rowCount, setRowCount]         = useState(4);
  const [exportFormat, setExportFormat] = useState('json');
  const [exportName, setExportName]     = useState('8085_project');
  const [showExport, setShowExport]     = useState(false);
  const fileInputRef = useRef(null);

  const handleJump = (e) => {
    e.preventDefault();
    const addr = parseInt(jumpInput, 16) & 0xFFFF;
    setMemBaseAddr(addr);
    refreshMemDisplay(addr);
    setJumpInput('');
    setRowCount(4);
  };

  const handleExport = () => {
    const name = exportName.trim() || '8085_project';
    exportMemory(memory, exportFormat, name);
    setShowExport(false);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const success = await importMemoryFile(file, memory);
    if (success) {
      refreshMemDisplay();
    } else {
      // Use a non-blocking notification approach
      console.error('Failed to load memory file');
    }
    e.target.value = '';
  };

  const rows = [];
  for (let r = 0; r < rowCount; r++) {
    const rowAddr = baseAddr + r * 4;
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

      {/* ── Import / Export ── */}
      <div style={{ marginBottom: '10px' }}>
        {/* Export section */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'stretch' }}>
          <select
            className="settings-btn"
            value={exportFormat}
            onChange={e => setExportFormat(e.target.value)}
            style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
          >
            <option value="json">JSON</option>
            <option value="hex">.HEX</option>
            <option value="bin">.BIN</option>
          </select>
          <button
            className="settings-btn"
            onClick={() => setShowExport(v => !v)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '12px' }}
          >
            <Download size={12} />
            Export
            <ChevronDown size={11} style={{ transform: showExport ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          <button
            className="settings-btn"
            onClick={() => fileInputRef.current.click()}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '12px' }}
          >
            <Upload size={12} />
            Import
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} accept=".json,.hex,.bin" />
        </div>

        {/* Inline export name input */}
        {showExport && (
          <div style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--r-sm)',
            padding: '10px 12px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            animation: 'fadeIn 0.15s ease',
          }}>
            <input
              type="text"
              className="mem-jump-input"
              value={exportName}
              onChange={e => setExportName(e.target.value)}
              placeholder="Project name…"
              style={{ flex: 1, fontSize: '12px' }}
              onKeyDown={e => e.key === 'Enter' && handleExport()}
              autoFocus
            />
            <button
              className="mem-jump-btn"
              onClick={handleExport}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '8px 12px' }}
            >
              <Download size={12} />
              Save
            </button>
          </div>
        )}
      </div>

      <div className="mem-grid" style={{ maxHeight: 'calc(100vh - 360px)', overflowY: 'auto' }}>
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
          style={{ width: '100%', marginTop: '8px', padding: '6px', fontSize: '12px' }}
        >
          Load More
        </button>
      )}
    </div>
  );
}
