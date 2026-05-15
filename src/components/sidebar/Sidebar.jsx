import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { 
  Database, Cpu, Search, ClipboardList, Keyboard, 
  Microchip, Hexagon, Settings, X
} from 'lucide-react';

import RegisterViewer from './RegisterViewer';
import MemoryViewer from './MemoryViewer';
import OpcodeFinder from './OpcodeFinder';
import ExecutionLog from './ExecutionLog';
import KeyReference from './KeyReference';
import ChipInfo from './ChipInfo';
import SettingsPanel from './SettingsPanel';

const NAV_ITEMS = [
  { id: 'registers', icon: <Database size={18} />, label: 'Registers' },
  { id: 'memory',    icon: <Cpu size={18} />, label: 'Memory' },
  { id: 'opcodes',   icon: <Search size={18} />, label: 'Opcodes' },
  { id: 'log',       icon: <ClipboardList size={18} />, label: 'Log' },
  { id: 'keyref',    icon: <Keyboard size={18} />,  label: 'Key Ref' },
  { id: 'chips',     icon: <Microchip size={18} />, label: 'Chip Info' },
];

export default function Sidebar({
  registers, prevRegisters, flags,
  memory, memVersion, memBaseAddr, setMemBaseAddr, refreshMemDisplay,
  log, theme, onThemeToggle, setIcInfoKey,
  glowIntensity, setGlowIntensity,
  keypadSound, setKeypadSound, soundProfile, setSoundProfile, volume, setVolume,
  autoScrollLog, setAutoScrollLog, clearLogOnReset, setClearLogOnReset,
  showDecimal, setShowDecimal
}) {
  // On wide screens start expanded, on narrow start collapsed
  const getDefault = () => window.innerWidth >= 900;
  const [expanded, setExpanded] = useState(getDefault);
  const [activePanel, setActivePanel] = useState('registers');

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

  const renderPanel = () => {
    switch (activePanel) {
      case 'registers': return <RegisterViewer registers={registers} prevRegisters={prevRegisters} flags={flags} showDecimal={showDecimal} />;
      case 'memory':    return <MemoryViewer memory={memory} memVersion={memVersion} baseAddr={memBaseAddr} setMemBaseAddr={setMemBaseAddr} refreshMemDisplay={refreshMemDisplay} />;
      case 'opcodes':   return <OpcodeFinder />;
      case 'log':       return <ExecutionLog log={log} autoScrollLog={autoScrollLog} />;
      case 'keyref':    return <KeyReference />;
      case 'chips':     return <ChipInfo setIcInfoKey={setIcInfoKey} />;
      case 'settings':  return <SettingsPanel 
          theme={theme} onThemeToggle={onThemeToggle} 
          glowIntensity={glowIntensity} setGlowIntensity={setGlowIntensity}
          keypadSound={keypadSound} setKeypadSound={setKeypadSound} 
          soundProfile={soundProfile} setSoundProfile={setSoundProfile}
          volume={volume} setVolume={setVolume}
          autoScrollLog={autoScrollLog} setAutoScrollLog={setAutoScrollLog} 
          clearLogOnReset={clearLogOnReset} setClearLogOnReset={setClearLogOnReset}
          showDecimal={showDecimal} setShowDecimal={setShowDecimal}
        />;
      default:          return null;
    }
  };

  return (
    <aside className={`sidebar ${expanded ? 'sidebar-expanded' : ''}`}>
      {/* Icon Rail */}
      <div className="sidebar-rail">
        <div className="sidebar-logo" title="8085 Trainer Simulator">
          <Hexagon className="sidebar-logo-icon" size={26} />
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              id={`sb-nav-${item.id}`}
              className={`sidebar-nav-btn ${activePanel === item.id && expanded ? 'active' : ''}`}
              title={item.label}
              onClick={() => togglePanel(item.id)}
              aria-label={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-rail-bottom">
          <button
            className={`sidebar-nav-btn ${activePanel === 'settings' && expanded ? 'active' : ''}`}
            onClick={() => togglePanel('settings')}
            title="Settings"
            aria-label="Settings"
          >
            <span className="nav-icon"><Settings size={18} /></span>
            <span className="nav-label">Settings</span>
          </button>
        </div>
      </div>

      {/* Flyout Panel */}
      <div className={`sidebar-flyout ${expanded ? 'flyout-open' : ''}`}>
        <div className="flyout-header">
          <span className="flyout-title">
            {activePanel === 'settings' ? <Settings size={18} /> : NAV_ITEMS.find(n => n.id === activePanel)?.icon}{' '}
            {activePanel === 'settings' ? 'Settings' : NAV_ITEMS.find(n => n.id === activePanel)?.label}
          </span>
          <button className="flyout-close" onClick={() => setExpanded(false)} aria-label="Close panel"><X size={16} /></button>
        </div>
        <div className="flyout-content">
          {renderPanel()}
        </div>
      </div>

      {/* Mobile backdrop */}
      {expanded && <div className="sidebar-backdrop" onClick={() => setExpanded(false)} />}
    </aside>
  );
}
