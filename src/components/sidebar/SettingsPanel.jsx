import React from 'react';
import {
  Sun, Moon, Shield, ShieldOff, Volume2, VolumeX,
  ScrollText, Trash2, Hash, Cpu, Layers
} from 'lucide-react';

// Phosphor themes removed per user request

// ── Reusable toggle-switch row ────────────────────────────────────────────────
function ToggleRow({ icon, label, value, onChange }) {
  return (
    <div className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-800/50 rounded-md cursor-pointer transition-colors group mb-0.5" role="button" tabIndex={0}
      onClick={() => onChange(!value)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(!value)}
    >
      <span className="flex items-center gap-2 font-inter text-[11px] font-medium text-slate-300 group-hover:text-slate-200 transition-colors">
        {React.cloneElement(icon, { className: 'text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0' })}
        {label}
      </span>
      <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${value ? 'bg-cyan-500' : 'bg-slate-700'}`} aria-checked={value} role="switch">
        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${value ? 'translate-x-3.5' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}

export default function SettingsPanel({
  keypadSound, setKeypadSound,
  soundProfile, setSoundProfile,
  volume, setVolume,
  autoScrollLog, setAutoScrollLog,
  clearLogOnReset, setClearLogOnReset,
  showDecimal, setShowDecimal,
  showRealtimeTranslator, setShowRealtimeTranslator,
  strictMode, setStrictMode,
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="font-orbitron text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 sticky top-0 bg-slate-900 z-10 py-1">Settings</div>

      {/* ── Emulation ── */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-2.5 mb-3">
        <div className="font-inter text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide px-1">Emulation</div>
        <ToggleRow
          icon={strictMode ? <Shield size={14}/> : <ShieldOff size={14}/>}
          label="Strict Hardware Mode"
          value={strictMode}
          onChange={setStrictMode}
        />
        <p className="text-[9.5px] text-slate-500 leading-snug m-0 px-2 mt-1 italic">
          {strictMode
            ? 'Accurately simulates undocumented flags (V, X5). Reports illegal opcodes.'
            : 'Permissive: illegal opcodes silently halt execution.'}
        </p>
      </div>

      {/* ── Audio ── */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-2.5 mb-3">
        <div className="font-inter text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide px-1">Audio</div>
        <ToggleRow
          icon={keypadSound ? <Volume2 size={14}/> : <VolumeX size={14}/>}
          label="Keypad Sound"
          value={keypadSound}
          onChange={setKeypadSound}
        />

        {keypadSound && (
          <div className="mt-2 px-1">
            <div className="flex gap-1.5 mb-2.5">
              {['mechanical', 'beep'].map(prof => (
                <button key={prof} className={`flex-1 px-2 py-1 rounded-md font-inter text-[11px] font-semibold transition-colors capitalize border ${soundProfile === prof ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500/50' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`} onClick={() => setSoundProfile(prof)}>{prof}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-inter text-[10px] font-bold text-slate-400 uppercase tracking-wide shrink-0">Vol</span>
              <input
                type="range" min="0" max="100"
                value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-[10px] text-slate-400 font-mono w-7 text-right">
                {volume}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Behavior & Layout ── */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-2.5 mb-3">
        <div className="font-inter text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide px-1">Behavior &amp; Layout</div>
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
