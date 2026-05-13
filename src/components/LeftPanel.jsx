import React, { useState, useMemo } from 'react';
import { OPCODES, toHex } from '../data/cpu8085';
import './LeftPanel.css';

// ============================================================
// Memory Viewer
// ============================================================
function MemoryViewer({ memory, baseAddr, setMemBaseAddr, refreshMemDisplay, memDisplay }) {
  const [jumpInput, setJumpInput] = useState('');

  const handleJump = (e) => {
    e.preventDefault();
    const addr = parseInt(jumpInput, 16) & 0xFFFF;
    setMemBaseAddr(addr);
    refreshMemDisplay(addr);
    setJumpInput('');
  };

  const rows = [];
  for (let r = 0; r < 4; r++) {
    const rowAddr = baseAddr + r * 4;
    rows.push(
      <div key={r} className="mem-row">
        <span className="mem-addr mono">{toHex(rowAddr, 4)}</span>
        {Array.from({ length: 4 }, (_, c) => {
          const idx = r * 4 + c;
          const val = memDisplay[idx] ?? 0;
          return (
            <span key={c} className="mem-cell mono">{toHex(val)}</span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="panel-section">
      <div className="section-title">Memory Viewer</div>
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
      <div className="mem-grid">
        <div className="mem-header">
          <span className="mem-addr">Addr</span>
          <span className="mem-cell">+0</span>
          <span className="mem-cell">+1</span>
          <span className="mem-cell">+2</span>
          <span className="mem-cell">+3</span>
        </div>
        {rows}
      </div>
    </div>
  );
}

// ============================================================
// Opcode Finder
// ============================================================
function OpcodeFinder() {
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toUpperCase();
    const isHex = /^[0-9A-F]{1,2}$/.test(q);

    return Object.entries(OPCODES)
      .filter(([opcode, info]) => {
        if (isHex) {
          return parseInt(opcode).toString(16).toUpperCase().padStart(2, '0').includes(q);
        }
        return info.mnemonic.includes(q) || info.desc.toUpperCase().includes(q);
      })
      .slice(0, 8);
  }, [search]);

  return (
    <div className="panel-section">
      <div className="section-title">Opcode / Hex Finder</div>
      <input
        className="opcode-search"
        placeholder="Search mnemonic or hex (e.g. MOV, 3E)"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {results.length > 0 && (
        <div className="opcode-results">
          <div className="opcode-header">
            <span>Op</span><span>Mnemonic</span><span>Bytes</span><span>T</span>
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
    </div>
  );
}

// ============================================================
// Execution Log
// ============================================================
function ExecutionLog({ log }) {
  return (
    <div className="panel-section log-section">
      <div className="section-title">Execution Log</div>
      <div className="log-output">
        {log.length === 0
          ? <span className="log-empty">— No activity yet —</span>
          : log.map((line, i) => (
            <div key={i} className="log-line mono">{line}</div>
          ))
        }
      </div>
    </div>
  );
}

export default function LeftPanel({
  memory, memDisplay, memBaseAddr, setMemBaseAddr, refreshMemDisplay,
  log, theme, onThemeToggle
}) {
  return (
    <aside className="left-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-icon">🛠</span>
          Tools
        </div>
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
        >
          {theme === 'dark' ? '☀' : '🌙'}
        </button>
      </div>

      <div className="panel-content">
        <MemoryViewer
          memory={memory}
          baseAddr={memBaseAddr}
          setMemBaseAddr={setMemBaseAddr}
          refreshMemDisplay={refreshMemDisplay}
          memDisplay={memDisplay}
        />
        <OpcodeFinder />
        <ExecutionLog log={log} />
      </div>
    </aside>
  );
}
