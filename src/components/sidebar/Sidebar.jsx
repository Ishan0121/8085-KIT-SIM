import React, { useState, useEffect } from 'react';
import { 
  Database, Cpu, Search, ClipboardList, Keyboard, 
  Microchip, Hexagon, Settings, X, Code, ListOrdered, Terminal
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
  { id: 'registers', icon: <Database size={18} />, label: 'Registers' },
  { id: 'memory',    icon: <Cpu size={18} />, label: 'Memory' },
  { id: 'assembler', icon: <Terminal size={18} />, label: 'Asmblr' },
  { id: 'disasm',    icon: <Code size={18} />, label: 'Disasmblr' },
  { id: 'opcodes',   icon: <Search size={18} />, label: 'Opcodes' },
  { id: 'log',       icon: <ClipboardList size={18} />, label: 'Log' },
  { id: 'keyref',    icon: <Keyboard size={18} />,  label: 'Key Ref' },
  { id: 'chips',     icon: <Microchip size={18} />, label: 'Chip Info' },
];

export default function Sidebar({
  registers, prevRegisters, flags,
  memory, memVersion, memBaseAddr, setMemBaseAddr, refreshMemDisplay,
  log, setIcInfoKey,
  keypadSound, setKeypadSound, soundProfile, setSoundProfile, volume, setVolume,
  autoScrollLog, setAutoScrollLog, clearLogOnReset, setClearLogOnReset,
  showDecimal, setShowDecimal,
  showRealtimeTranslator, setShowRealtimeTranslator,
  strictMode, setStrictMode,
  handleStep, breakpoints, toggleBreakpoint,
  ports, portsVersion, writePort
}) {
  // On wide screens start expanded, on narrow start collapsed
  const getDefault = () => window.innerWidth >= 900;
  const [expanded, setExpanded] = useState(getDefault);
  const [activePanel, setActivePanel] = useState('registers');

  const [flyoutWidth, setFlyoutWidth] = useState(() => {
    try { const saved = localStorage.getItem('sim_flyoutWidth'); return saved ? JSON.parse(saved) : 300; } catch { return 300; }
  });
  const [flyoutHeight, setFlyoutHeight] = useState(() => {
    try { const saved = localStorage.getItem('sim_flyoutHeight'); return saved ? JSON.parse(saved) : 420; } catch { return 420; }
  });

  useEffect(() => localStorage.setItem('sim_flyoutWidth', JSON.stringify(flyoutWidth)), [flyoutWidth]);
  useEffect(() => localStorage.setItem('sim_flyoutHeight', JSON.stringify(flyoutHeight)), [flyoutHeight]);

  const isResizingX = React.useRef(false);
  const isResizingY = React.useRef(false);

  const startResizeX = (e) => {
    isResizingX.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const startX = e.clientX || e.touches?.[0].clientX;
    const startWidth = flyoutWidth;

    const onMove = (eMove) => {
      if (!isResizingX.current) return;
      const clientX = eMove.clientX || eMove.touches?.[0].clientX;
      let newWidth = startWidth + (clientX - startX);
      newWidth = Math.max(250, Math.min(newWidth, 1000, window.innerWidth - 100));
      setFlyoutWidth(newWidth);
    };

    const onEnd = () => {
      isResizingX.current = false;
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

  const startResizeY = (e) => {
    if (e.target.closest('button')) return; // Ignore if clicking a button
    isResizingY.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    const startY = e.clientY || e.touches?.[0].clientY;
    const startHeight = flyoutHeight;

    const onMove = (eMove) => {
      if (!isResizingY.current) return;
      const clientY = eMove.clientY || eMove.touches?.[0].clientY;
      let newHeight = startHeight - (clientY - startY);
      newHeight = Math.max(200, Math.min(newHeight, window.innerHeight - 100)); 
      setFlyoutHeight(newHeight);
    };

    const onEnd = () => {
      isResizingY.current = false;
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

  useEffect(() => {
    let wasMobile = window.innerWidth < 900;
    const handler = () => {
      const isMobile = window.innerWidth < 900;
      if (isMobile !== wasMobile) {
        setExpanded(!isMobile);
        wasMobile = isMobile;
      }
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const togglePanel = (id) => {
    if (activePanel === id && expanded) {
      setExpanded(false);
    } else {
      setActivePanel(id);
      setExpanded(true);
    }
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
            keypadSound={keypadSound} setKeypadSound={setKeypadSound} 
            soundProfile={soundProfile} setSoundProfile={setSoundProfile}
            volume={volume} setVolume={setVolume}
            autoScrollLog={autoScrollLog} setAutoScrollLog={setAutoScrollLog} 
            clearLogOnReset={clearLogOnReset} setClearLogOnReset={setClearLogOnReset}
            showDecimal={showDecimal} setShowDecimal={setShowDecimal}
            showRealtimeTranslator={showRealtimeTranslator} setShowRealtimeTranslator={setShowRealtimeTranslator}
            strictMode={strictMode} setStrictMode={setStrictMode}
          />
        </div>
      </>
    );
  };

  return (
    <aside className={`flex min-w-0 h-screen sticky top-0 z-[200] shrink-0 transition-all duration-300`}>
      {/* Icon Rail */}
      <div className="w-[68px] min-w-[68px] h-screen bg-slate-900 border-r border-slate-800 flex flex-col items-center py-2.5 gap-0.5 z-[210] relative overflow-y-auto overflow-x-hidden shadow-[inset_-1px_0_0_rgba(255,255,255,0.02)] [scrollbar-width:none]">
        <div className="w-[46px] h-[46px] flex items-center justify-center mb-3" title="8085 Trainer Simulator">
          <Hexagon className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] [animation:pulse-logo_3.5s_ease-in-out_infinite]" size={26} />
        </div>
        <nav className="flex-1 flex flex-col gap-[3px] w-full px-2 items-center">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              id={`sb-nav-${item.id}`}
              className={`w-[52px] min-h-[52px] bg-transparent border border-transparent rounded-md cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-150 relative text-slate-400 hover:bg-slate-800 hover:border-slate-700 hover:text-cyan-400 hover:-translate-y-px ${activePanel === item.id && expanded ? 'bg-cyan-950/30 !border-cyan-800/50 text-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.1)] before:content-[""] before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[26px] before:bg-cyan-400 before:rounded-r-[3px] before:shadow-[0_0_10px_rgba(34,211,238,0.5)]' : ''}`}
              title={item.label}
              onClick={() => togglePanel(item.id)}
              aria-label={item.label}
            >
              <span className="text-[20px] leading-none">{item.icon}</span>
              <span className="font-inter text-[9px] font-semibold text-current tracking-[0.4px] text-center opacity-80">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="w-full px-2 pt-2.5 flex flex-col items-center border-t border-slate-800 mt-2">
          <button
            className={`w-[52px] min-h-[52px] bg-transparent border border-transparent rounded-md cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-150 relative text-slate-400 hover:bg-slate-800 hover:border-slate-700 hover:text-cyan-400 hover:-translate-y-px ${activePanel === 'settings' && expanded ? 'bg-cyan-950/30 !border-cyan-800/50 text-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.1)] before:content-[""] before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[26px] before:bg-cyan-400 before:rounded-r-[3px] before:shadow-[0_0_10px_rgba(34,211,238,0.5)]' : ''}`}
            onClick={() => togglePanel('settings')}
            title="Settings"
            aria-label="Settings"
          >
            <span className="text-[20px] leading-none"><Settings size={18} /></span>
            <span className="font-inter text-[9px] font-semibold text-current tracking-[0.4px] text-center opacity-80">Settings</span>
          </button>
        </div>
      </div>

      {/* Flyout Panel */}
      <div 
        className={`h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-out z-[205] shadow-lg relative overflow-hidden ${expanded ? '' : 'w-0 min-w-0'}`}
        style={{ width: expanded ? `${flyoutWidth}px` : 0, minWidth: expanded ? `${flyoutWidth}px` : 0 }}
      >
        <div className="absolute top-0 -right-[3px] w-[6px] h-full cursor-col-resize z-[210] bg-transparent transition-colors duration-150 hover:bg-cyan-500 hover:opacity-50 active:bg-cyan-500 active:opacity-50" onMouseDown={startResizeX} onTouchStart={startResizeX} />
        <div className="hidden absolute -top-[3px] left-0 w-full h-[6px] cursor-row-resize z-[210] bg-transparent transition-colors duration-150 hover:bg-cyan-500 hover:opacity-50 active:bg-cyan-500 active:opacity-50" onMouseDown={startResizeY} onTouchStart={startResizeY} />
        <div className="flex items-center justify-between px-5 pt-[18px] pb-4 border-b border-slate-800 bg-slate-800/50 shrink-0" onMouseDown={startResizeY} onTouchStart={startResizeY}>
          <span className="font-orbitron text-[13px] font-bold text-cyan-400 tracking-[0.8px] flex items-center gap-2.5 whitespace-nowrap drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            {activePanel === 'settings' ? <Settings size={18} /> : NAV_ITEMS.find(n => n.id === activePanel)?.icon}{' '}
            {activePanel === 'settings' ? 'Settings' : NAV_ITEMS.find(n => n.id === activePanel)?.label}
          </span>
          <button className="bg-transparent border border-slate-700 rounded-sm text-slate-400 w-7 h-7 cursor-pointer text-sm flex items-center justify-center transition-all duration-150 shrink-0 hover:bg-slate-700 hover:text-slate-200" onClick={() => setExpanded(false)} aria-label="Close panel"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 flex flex-col gap-1.5 min-w-0 w-full">
          {renderPanels()}
        </div>
      </div>

      {/* Mobile backdrop */}
      {expanded && <div className="fixed inset-0 bg-black/50 z-[190] lg:hidden" onClick={() => setExpanded(false)} />}
    </aside>
  );
}
