import React, { useState, useEffect } from 'react';
import './RightPane.css';
import { 
  Database, Cpu, Search, ClipboardList, Keyboard, 
  Microchip, Settings, X, Code, Terminal, Menu
} from 'lucide-react';

import RegisterViewer from './RegisterViewer';
import MemoryViewer from './MemoryViewer';
import DisassemblerPanel from './DisassemblerPanel';
import AssemblerPanel from './AssemblerPanel';
import OpcodeFinder from './OpcodeFinder';
import ExecutionLog from './ExecutionLog';
import KeyReference from './KeyReference';
import ChipInfo from './ChipInfo';
import SettingsPanel from './SettingsPanel';

const NAV_ITEMS = [
  { id: 'settings',  icon: <Settings size={18} />, label: 'Settings' },
  { id: 'registers', icon: <Database size={18} />, label: 'Registers' },
  { id: 'memory',    icon: <Cpu size={18} />, label: 'Memory' },
  { id: 'assembler', icon: <Terminal size={18} />, label: 'Asmblr' },
  { id: 'disasm',    icon: <Code size={18} />, label: 'Disasmblr' },
  { id: 'opcodes',   icon: <Search size={18} />, label: 'Opcodes' },
  { id: 'log',       icon: <ClipboardList size={18} />, label: 'Log' },
  { id: 'keyref',    icon: <Keyboard size={18} />,  label: 'Key Ref' },
  { id: 'chips',     icon: <Microchip size={18} />, label: 'Chip Info' },
];

export default function RightPane(props) {
  const {
    isOpen, onClose,
    registers, prevRegisters, flags,
    memory, memVersion, memBaseAddr, setMemBaseAddr, refreshMemDisplay,
    log, theme, onThemeToggle, setIcInfoKey,
    glowIntensity, setGlowIntensity,
    keypadSound, setKeypadSound, soundProfile, setSoundProfile, volume, setVolume,
    autoScrollLog, setAutoScrollLog, clearLogOnReset, setClearLogOnReset,
    showDecimal, setShowDecimal,
    showRealtimeTranslator, setShowRealtimeTranslator,
    strictMode, setStrictMode, colorTheme, setColorTheme
  } = props;

  const [activePanel, setActivePanel] = useState('settings');
  const [paneWidth, setPaneWidth] = useState(() => {
    try { const saved = localStorage.getItem('sim_rightPaneWidth'); return saved ? JSON.parse(saved) : 320; } catch { return 320; }
  });

  useEffect(() => localStorage.setItem('sim_rightPaneWidth', JSON.stringify(paneWidth)), [paneWidth]);

  const isResizing = React.useRef(false);

  const startResize = (e) => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const startX = e.clientX || e.touches?.[0].clientX;
    const startWidth = paneWidth;

    const onMove = (eMove) => {
      if (!isResizing.current) return;
      const clientX = eMove.clientX || eMove.touches?.[0].clientX;
      // Resizing from the left edge of the right pane
      let newWidth = startWidth - (clientX - startX);
      newWidth = Math.max(250, Math.min(newWidth, 1000, window.innerWidth - 100));
      setPaneWidth(newWidth);
    };

    const onEnd = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  const renderPanels = () => {
    return (
      <>
        <div style={{ display: activePanel === 'registers' ? 'block' : 'none', height: '100%' }}>
          <RegisterViewer registers={registers} prevRegisters={prevRegisters} flags={flags} showDecimal={showDecimal} />
        </div>
        <div style={{ display: activePanel === 'memory' ? 'block' : 'none', height: '100%' }}>
          <MemoryViewer memory={memory} memVersion={memVersion} baseAddr={memBaseAddr} setMemBaseAddr={setMemBaseAddr} refreshMemDisplay={refreshMemDisplay} />
        </div>
        <div style={{ display: activePanel === 'assembler' ? 'flex' : 'none', flex: 1, flexDirection: 'column', height: '100%' }}>
          <AssemblerPanel memory={memory} memBaseAddr={memBaseAddr} setMemBaseAddr={setMemBaseAddr} refreshMemDisplay={refreshMemDisplay} />
        </div>
        <div style={{ display: activePanel === 'disasm' ? 'block' : 'none', height: '100%' }}>
          <DisassemblerPanel memory={memory} memVersion={memVersion} baseAddr={memBaseAddr} setMemBaseAddr={setMemBaseAddr} refreshMemDisplay={refreshMemDisplay} />
        </div>
        <div style={{ display: activePanel === 'opcodes' ? 'block' : 'none', height: '100%' }}>
          <OpcodeFinder />
        </div>
        <div style={{ display: activePanel === 'log' ? 'block' : 'none', height: '100%' }}>
          <ExecutionLog log={log} autoScrollLog={autoScrollLog} />
        </div>
        <div style={{ display: activePanel === 'keyref' ? 'block' : 'none', height: '100%' }}>
          <KeyReference />
        </div>
        <div style={{ display: activePanel === 'chips' ? 'block' : 'none', height: '100%' }}>
          <ChipInfo setIcInfoKey={setIcInfoKey} />
        </div>
        <div style={{ display: activePanel === 'settings' ? 'block' : 'none', height: '100%' }}>
          <SettingsPanel 
            theme={theme} onThemeToggle={onThemeToggle} 
            glowIntensity={glowIntensity} setGlowIntensity={setGlowIntensity}
            keypadSound={keypadSound} setKeypadSound={setKeypadSound} 
            soundProfile={soundProfile} setSoundProfile={setSoundProfile}
            volume={volume} setVolume={setVolume}
            autoScrollLog={autoScrollLog} setAutoScrollLog={setAutoScrollLog} 
            clearLogOnReset={clearLogOnReset} setClearLogOnReset={setClearLogOnReset}
            showDecimal={showDecimal} setShowDecimal={setShowDecimal}
            showRealtimeTranslator={showRealtimeTranslator} setShowRealtimeTranslator={setShowRealtimeTranslator}
            strictMode={strictMode} setStrictMode={setStrictMode}
            colorTheme={colorTheme} setColorTheme={setColorTheme}
          />
        </div>
      </>
    );
  };

  return (
    <aside 
      className={`right-pane ${isOpen ? 'open' : ''}`}
      style={{ '--pane-width': `${paneWidth}px` }}
    >
      <div className="resizer-left" onMouseDown={startResize} onTouchStart={startResize} />
      <div className="right-pane-header">
        <select 
          className="right-pane-select"
          value={activePanel} 
          onChange={e => setActivePanel(e.target.value)}
        >
          {NAV_ITEMS.map(item => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        <button className="right-pane-close" onClick={onClose} aria-label="Close pane"><X size={16} /></button>
      </div>
      <div className="right-pane-content">
        {renderPanels()}
      </div>
    </aside>
  );
}
