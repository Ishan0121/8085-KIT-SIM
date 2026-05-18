import React from 'react';
import {
  Sun, Moon, Shield, ShieldOff, Volume2, VolumeX,
  ScrollText, Trash2, Hash, Cpu, Layers
} from 'lucide-react';

const PHOSPHOR_THEMES = [
  { id: 'default', label: 'Cyber Blue',   swatch: '#00e5ff', bg: '#080c18' },
  { id: 'amber',   label: 'Amber CRT',    swatch: '#ffb000', bg: '#100d00' },
  { id: 'green',   label: 'Hacker Green', swatch: '#00ff41', bg: '#001200' },
  { id: 'pink',    label: 'Synthwave',    swatch: '#ff00ff', bg: '#120018' },
];

// ── Reusable toggle-switch row ────────────────────────────────────────────────
function ToggleRow({ icon, label, value, onChange }) {
  return (
    <div className="toggle-row" role="button" tabIndex={0}
      onClick={() => onChange(!value)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(!value)}
    >
      <span className="toggle-row-label">
        {icon}
        {label}
      </span>
      <div className="toggle-switch" aria-checked={value} role="switch">
        <div className={`toggle-track ${value ? 'on' : ''}`}>
          <div className="toggle-thumb" />
        </div>
      </div>
    </div>
  );
}

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

        <button className="settings-btn" onClick={onThemeToggle} style={{ width: '100%', marginBottom: '10px' }}>
          {theme === 'dark'
            ? <><Sun size={14}/> Switch to Light Mode</>
            : <><Moon size={14}/> Switch to Dark Mode</>}
        </button>

        <div className="settings-label" style={{ marginTop: '4px' }}>Glow Intensity</div>
        <div className="settings-btn-group scale-controls">
          <button className={`settings-btn ${glowIntensity === 'low'    ? 'active' : ''}`} onClick={() => setGlowIntensity('low')}>Low</button>
          <button className={`settings-btn ${glowIntensity === 'medium' ? 'active' : ''}`} onClick={() => setGlowIntensity('medium')}>Med</button>
          <button className={`settings-btn ${glowIntensity === 'high'   ? 'active' : ''}`} onClick={() => setGlowIntensity('high')}>High</button>
        </div>
      </div>

      {/* ── Emulation ── */}
      <div className="settings-group">
        <div className="settings-label">Emulation</div>
        <ToggleRow
          icon={strictMode ? <Shield size={14}/> : <ShieldOff size={14}/>}
          label="Strict Hardware Mode"
          value={strictMode}
          onChange={setStrictMode}
        />
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4, margin: '0 0 4px', padding: '0 4px' }}>
          {strictMode
            ? 'Accurately simulates undocumented flags (V, X5). Reports illegal opcodes.'
            : 'Permissive: illegal opcodes silently halt execution.'}
        </p>
      </div>

      {/* ── Audio ── */}
      <div className="settings-group">
        <div className="settings-label">Audio</div>
        <ToggleRow
          icon={keypadSound ? <Volume2 size={14}/> : <VolumeX size={14}/>}
          label="Keypad Sound"
          value={keypadSound}
          onChange={setKeypadSound}
        />

        {keypadSound && (
          <>
            <div className="settings-btn-group scale-controls" style={{ marginBottom: '8px' }}>
              <button className={`settings-btn ${soundProfile === 'mechanical' ? 'active' : ''}`} onClick={() => setSoundProfile('mechanical')}>Mechanical</button>
              <button className={`settings-btn ${soundProfile === 'beep'       ? 'active' : ''}`} onClick={() => setSoundProfile('beep')}>Beep</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 2px' }}>
              <span className="settings-label" style={{ margin: 0, minWidth: 'fit-content' }}>Volume</span>
              <input
                type="range" min="0" max="100"
                value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '28px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                {volume}%
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Behavior & Layout ── */}
      <div className="settings-group">
        <div className="settings-label">Behavior &amp; Layout</div>
        <ToggleRow
          icon={<ScrollText size={14}/>}
          label="Auto-scroll Log"
          value={autoScrollLog}
          onChange={setAutoScrollLog}
        />
        <ToggleRow
          icon={<Trash2 size={14}/>}
          label="Clear Log on Reset"
          value={clearLogOnReset}
          onChange={setClearLogOnReset}
        />
        <ToggleRow
          icon={<Hash size={14}/>}
          label="Show Decimal Values"
          value={showDecimal}
          onChange={setShowDecimal}
        />
        <ToggleRow
          icon={<Cpu size={14}/>}
          label="Opcode Translator LCD"
          value={showRealtimeTranslator}
          onChange={setShowRealtimeTranslator}
        />
      </div>
    </div>
  );
}
