import React from 'react';
import { Sun, Moon, Shield, ShieldOff } from 'lucide-react';

const PHOSPHOR_THEMES = [
  { id: 'default', label: 'Cyber Blue',   swatch: '#00e5ff', bg: '#080c18' },
  { id: 'amber',   label: 'Amber CRT',    swatch: '#ffb000', bg: '#100d00' },
  { id: 'green',   label: 'Hacker Green', swatch: '#00ff41', bg: '#001200' },
  { id: 'pink',    label: 'Synthwave',    swatch: '#ff00ff', bg: '#120018' },
];

export default function SettingsPanel({
  theme, onThemeToggle,
  glowIntensity, setGlowIntensity,
  keypadSound, setKeypadSound,
  soundProfile, setSoundProfile,
  volume, setVolume,
  autoScrollLog, setAutoScrollLog,
  clearLogOnReset, setClearLogOnReset,
  showDecimal, setShowDecimal,
  showRealtimeTranslator, setShowRealtimeTranslator,
  strictMode, setStrictMode,
  colorTheme, setColorTheme,
}) {
  return (
    <div className="sb-section">
      <div className="sb-section-title">Settings</div>

      {/* ── Phosphor Color Theme ── */}
      <div className="settings-group">
        <div className="settings-label">Phosphor Color Theme</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '4px' }}>
          {PHOSPHOR_THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setColorTheme(t.id)}
              className={`settings-btn ${colorTheme === t.id ? 'active' : ''}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '6px 8px', textAlign: 'left',
                borderColor: colorTheme === t.id ? t.swatch : undefined,
                boxShadow: colorTheme === t.id ? `0 0 8px ${t.swatch}55` : undefined,
              }}
            >
              <span style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: t.swatch, flexShrink: 0,
                boxShadow: `0 0 6px ${t.swatch}`,
              }} />
              <span style={{ fontSize: '11px' }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Appearance ── */}
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

      {/* ── Emulation ── */}
      <div className="settings-group">
        <div className="settings-label">Emulation</div>
        <button
          className={`settings-btn ${strictMode ? 'active' : ''}`}
          style={{ width: '100%', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setStrictMode(v => !v)}
        >
          {strictMode ? <Shield size={14}/> : <ShieldOff size={14}/>}
          {strictMode ? 'Strict Hardware Mode ON' : 'Strict Hardware Mode OFF'}
        </button>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4, margin: '2px 0 0' }}>
          {strictMode
            ? 'Accurately simulates undocumented flags (V, X5). Reports illegal opcodes.'
            : 'Permissive: illegal opcodes silently halt execution.'}
        </p>
      </div>

      {/* ── Audio ── */}
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

      {/* ── Behavior & Layout ── */}
      <div className="settings-group">
        <div className="settings-label">Behavior &amp; Layout</div>
        <button className="settings-btn" style={{width: '100%', marginBottom: '8px'}} onClick={() => setAutoScrollLog(!autoScrollLog)}>
          {autoScrollLog ? 'Disable Auto-scroll Log' : 'Enable Auto-scroll Log'}
        </button>
        <button className="settings-btn" style={{width: '100%', marginBottom: '8px'}} onClick={() => setClearLogOnReset(!clearLogOnReset)}>
          {clearLogOnReset ? 'Disable Clear Log on Reset' : 'Enable Clear Log on Reset'}
        </button>
        <button className="settings-btn" style={{width: '100%', marginBottom: '8px'}} onClick={() => setShowDecimal(!showDecimal)}>
          {showDecimal ? 'Hide Decimal Registers' : 'Show Decimal Registers'}
        </button>
        <button className="settings-btn" style={{width: '100%'}} onClick={() => setShowRealtimeTranslator(!showRealtimeTranslator)}>
          {showRealtimeTranslator ? 'Disable Opcode Translator LCD' : 'Enable Opcode Translator LCD'}
        </button>
      </div>
    </div>
  );
}
