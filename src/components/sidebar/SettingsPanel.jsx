import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function SettingsPanel({
  theme, onThemeToggle,
  glowIntensity, setGlowIntensity,
  keypadSound, setKeypadSound,
  soundProfile, setSoundProfile,
  volume, setVolume,
  autoScrollLog, setAutoScrollLog,
  clearLogOnReset, setClearLogOnReset,
  showDecimal, setShowDecimal
}) {
  return (
    <div className="sb-section">
      <div className="sb-section-title">Settings</div>
      
      <div className="settings-group">
        <div className="settings-label">Appearance</div>
        <button className="settings-btn" onClick={onThemeToggle} style={{ width: '100%', marginBottom: '8px' }}>
          {theme === 'dark' ? <><Sun size={14}/> Switch to Light Mode</> : <><Moon size={14}/> Switch to Dark Mode</>}
        </button>

        <div className="settings-label" style={{ marginTop: '12px' }}>Glow Intensity</div>
        <div className="settings-btn-group scale-controls">
          <button className={`settings-btn ${glowIntensity === 'low' ? 'active' : ''}`} onClick={() => setGlowIntensity('low')}>Low</button>
          <button className={`settings-btn ${glowIntensity === 'medium' ? 'active' : ''}`} onClick={() => setGlowIntensity('medium')}>Med</button>
          <button className={`settings-btn ${glowIntensity === 'high' ? 'active' : ''}`} onClick={() => setGlowIntensity('high')}>High</button>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-label">Audio</div>
        <button className="settings-btn" style={{marginBottom: '8px', width: '100%'}} onClick={() => setKeypadSound(!keypadSound)}>
          {keypadSound ? 'Disable Keypad Sound' : 'Enable Keypad Sound'}
        </button>
        
        {keypadSound && (
          <>
            <div className="settings-btn-group scale-controls" style={{ marginBottom: '8px' }}>
              <button className={`settings-btn ${soundProfile === 'mechanical' ? 'active' : ''}`} onClick={() => setSoundProfile('mechanical')}>Mechanical</button>
              <button className={`settings-btn ${soundProfile === 'beep' ? 'active' : ''}`} onClick={() => setSoundProfile('beep')}>Beep</button>
            </div>
            
            <div className="volume-control" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="settings-label" style={{ margin: 0 }}>Volume</span>
              <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(e.target.value)} style={{ flex: 1 }} />
            </div>
          </>
        )}
      </div>

      <div className="settings-group">
        <div className="settings-label">Behavior & Layout</div>
        <button className="settings-btn" style={{width: '100%', marginBottom: '8px'}} onClick={() => setAutoScrollLog(!autoScrollLog)}>
          {autoScrollLog ? 'Disable Auto-scroll Log' : 'Enable Auto-scroll Log'}
        </button>
        <button className="settings-btn" style={{width: '100%', marginBottom: '8px'}} onClick={() => setClearLogOnReset(!clearLogOnReset)}>
          {clearLogOnReset ? 'Disable Clear Log on Reset' : 'Enable Clear Log on Reset'}
        </button>
        <button className="settings-btn" style={{width: '100%'}} onClick={() => setShowDecimal(!showDecimal)}>
          {showDecimal ? 'Hide Decimal Registers' : 'Show Decimal Registers'}
        </button>
      </div>
    </div>
  );
}
