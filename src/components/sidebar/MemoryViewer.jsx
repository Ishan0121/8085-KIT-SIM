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

  const rowsData = [];
  for (let r = 0; r < rowCount; r++) {
    const rowAddr = baseAddr + r * 4;
    if (rowAddr > 0xFFFF) break;
    const cells = Array.from({ length: 4 }, (_, c) => memory[rowAddr + c] ?? 0);
    rowsData.push({ rowAddr, cells });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="font-orbitron text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Memory Viewer</div>

      <form className="flex gap-2 mb-3" onSubmit={handleJump}>
        <input
          className="w-24 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-cyan-400 font-mono text-[13px] outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all uppercase placeholder-slate-600"
          placeholder="Addr"
          value={jumpInput}
          onChange={e => setJumpInput(e.target.value.toUpperCase())}
          maxLength={4}
        />
        <button className="flex items-center justify-center bg-cyan-700 hover:bg-cyan-600 text-white rounded-md px-3 py-1.5 font-inter text-[12px] font-bold shadow-sm transition-colors cursor-pointer shrink-0" type="submit">Go</button>
      </form>

      {/* ── Import / Export ── */}
      <div className="mb-3">
        {/* Export section */}
        <div className="flex gap-1.5 mb-1.5 items-stretch">
          <select
            className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-slate-300 font-inter text-xs outline-none focus:border-cyan-500 transition-colors"
            value={exportFormat}
            onChange={e => setExportFormat(e.target.value)}
          >
            <option value="json">JSON</option>
            <option value="hex">.HEX</option>
            <option value="bin">.BIN</option>
          </select>
          <button
            className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-300 font-inter text-xs font-semibold transition-colors px-2 py-1.5"
            onClick={() => setShowExport(v => !v)}
          >
            <Download size={12} />
            Export
            <ChevronDown size={11} className={`transition-transform duration-150 ${showExport ? 'rotate-180' : ''}`} />
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-300 font-inter text-xs font-semibold transition-colors px-2 py-1.5"
            onClick={() => fileInputRef.current.click()}
          >
            <Upload size={12} />
            Import
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json,.hex,.bin" />
        </div>

        {/* Inline export name input */}
        {showExport && (
          <div className="bg-slate-900/80 border border-cyan-500/30 rounded-md p-2 flex gap-2 items-center animate-in fade-in duration-150">
            <input
              type="text"
              className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-cyan-400 font-mono text-[13px] outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600"
              value={exportName}
              onChange={e => setExportName(e.target.value)}
              placeholder="Project name…"
              onKeyDown={e => e.key === 'Enter' && handleExport()}
              autoFocus
            />
            <button
              className="flex items-center justify-center gap-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded-md px-3 py-1.5 font-inter text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
              onClick={handleExport}
            >
              <Download size={12} />
              Save
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto mt-2 bg-slate-900/50 border border-slate-700/50 rounded-lg flex flex-col min-h-[200px]">
        <div className="flex items-center px-3 py-2 border-b border-slate-700/50 bg-slate-800/50 text-[10px] font-bold font-inter text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
          <span className="w-10 shrink-0 text-left">Addr</span>
          <span className="flex-1 text-center">+0</span>
          <span className="flex-1 text-center">+1</span>
          <span className="flex-1 text-center">+2</span>
          <span className="flex-1 text-center">+3</span>
        </div>
        {rowsData.map(({ rowAddr, cells }, i) => (
          <div key={i} className="flex items-center px-3 py-1.5 border-b border-slate-800 hover:bg-slate-800/50 transition-colors group">
            <span className="w-10 shrink-0 font-mono text-[13px] text-cyan-400">{toHex(rowAddr, 4)}</span>
            {cells.map((val, idx) => (
              <span key={idx} className="flex-1 text-center font-mono text-[13px] text-slate-200">{toHex(val)}</span>
            ))}
          </div>
        ))}
      </div>

      {(baseAddr + rowCount * 4) <= 0xFFFF && (
        <button
          onClick={() => setRowCount(prev => prev + 4)}
          className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-300 font-inter text-xs font-semibold transition-colors"
        >
          Load More
        </button>
      )}
    </div>
  );
}
