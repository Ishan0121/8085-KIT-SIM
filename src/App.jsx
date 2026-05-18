import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/sidebar/Sidebar';
import SevenSegDisplay, { DisplayInfoBtn } from './components/hardware/SevenSegDisplay';
import RealtimeTranslator from './components/hardware/RealtimeTranslator';
import Keypad from './components/hardware/Keypad';
import ICInfoModal from './components/modals/ICInfoModal';
import GuideModal from './components/modals/GuideModal';
import use8085 from './hooks/use8085';
import { IC_INFO, toHex } from './data/cpu8085';
import { Hexagon, BookOpen } from 'lucide-react';
import './App.css';

// Keyboard shortcut mapping
const KEYBOARD_MAP = {
  'Escape': 'RESET',
  '0': '0', '1': '1', '2': '2', '3': '3',
  '4': '4', '5': '5', '6': '6', '7': '7',
  '8': '8', '9': '9',
  'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F',
  'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F',
  'g': 'GO', 'G': 'GO',
  'n': 'MEMC_NEXT', 'N': 'MEMC_NEXT',
  'm': 'BM', 'M': 'BM',
  'x': 'EXREG_SI', 'X': 'EXREG_SI',
  'i': 'INS_DATA', 'I': 'INS_DATA',
  'r': 'REL_EXMEM', 'R': 'REL_EXMEM',
  's': 'STRING_PRE', 'S': 'STRING_PRE',
  '+': 'FILL',
  'v': 'VCT_INT', 'V': 'VCT_INT',
  'Delete': 'DEL_DATA',
};

// Helper for localStorage persistence
const getSavedSetting = (key, defaultVal) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) return JSON.parse(saved);
  } catch (e) { }
  return defaultVal;
};

export default function App() {
  const [theme, setTheme] = useState(() => getSavedSetting('sim_theme', 'dark'));
  const [glowIntensity, setGlowIntensity] = useState(() => getSavedSetting('sim_glowIntensity', 'high'));
  const [keypadSound, setKeypadSound] = useState(() => getSavedSetting('sim_keypadSound', true));
  const [soundProfile, setSoundProfile] = useState(() => getSavedSetting('sim_soundProfile', 'mechanical'));
  const [volume, setVolume] = useState(() => getSavedSetting('sim_volume', 50));
  const [autoScrollLog, setAutoScrollLog] = useState(() => getSavedSetting('sim_autoScrollLog', true));
  const [clearLogOnReset, setClearLogOnReset] = useState(() => getSavedSetting('sim_clearLogOnReset', false));
  const [showDecimal, setShowDecimal] = useState(() => getSavedSetting('sim_showDecimal', true));
  const [showRealtimeTranslator, setShowRealtimeTranslator] = useState(() => getSavedSetting('sim_showRealtimeTranslator', true));
  const [strictMode, setStrictMode] = useState(() => getSavedSetting('sim_strictMode', false));
  const [colorTheme, setColorTheme] = useState(() => getSavedSetting('sim_colorTheme', 'default'));

  const [icInfoKey, setIcInfoKey] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const prevRegisters = useRef(null);

  // ---- Persist Settings ----
  useEffect(() => localStorage.setItem('sim_theme', JSON.stringify(theme)), [theme]);
  useEffect(() => localStorage.setItem('sim_glowIntensity', JSON.stringify(glowIntensity)), [glowIntensity]);
  useEffect(() => localStorage.setItem('sim_keypadSound', JSON.stringify(keypadSound)), [keypadSound]);
  useEffect(() => localStorage.setItem('sim_soundProfile', JSON.stringify(soundProfile)), [soundProfile]);
  useEffect(() => localStorage.setItem('sim_volume', JSON.stringify(volume)), [volume]);
  useEffect(() => localStorage.setItem('sim_autoScrollLog', JSON.stringify(autoScrollLog)), [autoScrollLog]);
  useEffect(() => localStorage.setItem('sim_clearLogOnReset', JSON.stringify(clearLogOnReset)), [clearLogOnReset]);
  useEffect(() => localStorage.setItem('sim_showDecimal', JSON.stringify(showDecimal)), [showDecimal]);
  useEffect(() => localStorage.setItem('sim_showRealtimeTranslator', JSON.stringify(showRealtimeTranslator)), [showRealtimeTranslator]);
  useEffect(() => localStorage.setItem('sim_strictMode', JSON.stringify(strictMode)), [strictMode]);
  useEffect(() => localStorage.setItem('sim_colorTheme', JSON.stringify(colorTheme)), [colorTheme]);

  const {
    registers, flags,
    memory, memVersion, memBaseAddr, setMemBaseAddr, refreshMemDisplay,
    addressDisplay, dataDisplay,
    shifted, log, setLog,
    handleKey: rawHandleKey,
    currentAddr,
    handleStep, breakpoints, toggleBreakpoint,
    ports, portsVersion, writePort
  } = use8085({ strictMode });

  // ---- Appearance ----
  useEffect(() => {
    document.body.className = '';
    if (theme === 'light') document.body.classList.add('light-theme');
    if (colorTheme !== 'default') document.body.classList.add(`theme-${colorTheme}`);
    document.body.classList.add(`glow-${glowIntensity}`);
  }, [theme, glowIntensity, colorTheme]);

  // ---- Audio ----
  const playClickSound = useCallback(() => {
    if (!keypadSound) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const v = volume / 100;

      if (soundProfile === 'mechanical') {
        // -- Mechanical click sound synthesis --
        // 1. Low frequency thud
        const thudOsc = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thudOsc.type = 'triangle';
        thudOsc.frequency.setValueAtTime(300, ctx.currentTime);
        thudOsc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.04);
        thudGain.gain.setValueAtTime(0.3 * v, ctx.currentTime);
        thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        thudOsc.connect(thudGain);
        thudGain.connect(ctx.destination);
        thudOsc.start();
        thudOsc.stop(ctx.currentTime + 0.04);

        // 2. High frequency sharp click
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(2000, ctx.currentTime);
        clickOsc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.02);
        clickGain.gain.setValueAtTime(0.05 * v, ctx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start();
        clickOsc.stop(ctx.currentTime + 0.02);
      } else {
        // Classic Beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1 * v, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // ignore audio errors
    }
  }, [keypadSound, soundProfile, volume]);

  const handleKey = useCallback((k) => {
    playClickSound();
    if (k === 'RESET' && clearLogOnReset) {
      setLog([]);
    }
    rawHandleKey(k);
  }, [playClickSound, rawHandleKey, clearLogOnReset, setLog]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const mapped = KEYBOARD_MAP[e.key];
      if (mapped) { e.preventDefault(); handleKey(mapped); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);

  // Store previous registers for change highlighting
  useEffect(() => {
    prevRegisters.current = { ...registers };
  });

  const icInfoData = icInfoKey ? IC_INFO[icInfoKey] : null;

  return (
    <div className="app-shell">
      {/* ── Left sidebar ── */}
      <Sidebar
        registers={registers}
        prevRegisters={prevRegisters.current}
        flags={flags}
        memory={memory}
        memVersion={memVersion}
        memBaseAddr={memBaseAddr}
        setMemBaseAddr={setMemBaseAddr}
        refreshMemDisplay={refreshMemDisplay}
        log={log}
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        glowIntensity={glowIntensity} setGlowIntensity={setGlowIntensity}
        keypadSound={keypadSound} setKeypadSound={setKeypadSound}
        soundProfile={soundProfile} setSoundProfile={setSoundProfile}
        volume={volume} setVolume={setVolume}
        autoScrollLog={autoScrollLog} setAutoScrollLog={setAutoScrollLog}
        clearLogOnReset={clearLogOnReset} setClearLogOnReset={setClearLogOnReset}
        showDecimal={showDecimal} setShowDecimal={setShowDecimal}
        showRealtimeTranslator={showRealtimeTranslator} setShowRealtimeTranslator={setShowRealtimeTranslator}
        setIcInfoKey={setIcInfoKey}
        strictMode={strictMode} setStrictMode={setStrictMode}
        colorTheme={colorTheme} setColorTheme={setColorTheme}
        handleStep={handleStep}
        breakpoints={breakpoints} toggleBreakpoint={toggleBreakpoint}
        ports={ports} portsVersion={portsVersion} writePort={writePort}
      />

      {/* ── Main content ── */}
      <main className="main-content">
        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-logo">
            <Hexagon size={20} className="topbar-chip-icon" />
            <span className="topbar-title">8085 Trainer Kit Simulator</span>
          </div>
          <div className="topbar-badges">
            <button className="badge-btn" onClick={() => setShowGuide(true)} title="View Guide">
              <BookOpen size={14} style={{ marginRight: '4px' }} />
              Guide
            </button>
            <span className="badge badge-green">Phase 1</span>
            <span className="badge badge-blue">Digital Twin</span>
          </div>
        </div>

        {/* Trainer area — display + keypad only */}
        <div className="trainer-area">
          <div className="trainer-enclosure-slim">
            {/* Board label */}
            <div className="board-name-label">8085 MICROPROCESSOR KIT</div>

            {/* LED indicators */}
            <div className="indicator-row">
              <div className="ind-led-wrap">
                <div className="ind-led ind-led-red on" />
                <span className="ind-led-label">PWR</span>
              </div>
              <div className="ind-led-wrap">
                <div className="ind-led ind-led-yellow" />
                <span className="ind-led-label">RUN</span>
              </div>
              <DisplayInfoBtn addressValue={addressDisplay} dataValue={dataDisplay} />
            </div>

            {/* 7-Segment Display */}
            <div className="display-zone">
              <SevenSegDisplay addressValue={addressDisplay} dataValue={dataDisplay} />
            </div>

            {/* Opcode Translator LCD */}
            {showRealtimeTranslator && (
              <RealtimeTranslator 
                dataValue={dataDisplay} 
                memory={memory} 
                currentAddr={currentAddr} 
                memBaseAddr={memBaseAddr} 
              />
            )}

            {/* Keypad */}
            <div className="keypad-zone">
              <Keypad onKey={handleKey} shifted={shifted} />
            </div>
          </div>
        </div>

        {/* Keyboard hint bar */}
        <div className="hint-bar">
          <span className="hint-item"><kbd>0–9 A–F</kbd> Hex input</span>
          <span className="hint-item"><kbd>G</kbd> GO</span>
          <span className="hint-item"><kbd>Esc</kbd> RESET</span>
          <span className="hint-item"><kbd>X</kbd> EXREG</span>
          <span className="hint-item"><kbd>N</kbd> NEXT</span>
          <span className="hint-item"><kbd>I</kbd> INS DATA</span>
          <span className="hint-item"><kbd>Del</kbd> DEL DATA</span>
          <span className="hint-item"><kbd>M</kbd> Block Move</span>
          <span className="hint-item"><kbd>+</kbd> FILL</span>
        </div>
      </main>

      {/* Guide Modal */}
      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} />
      )}

      {/* IC Info Modal */}
      {icInfoData && (
        <ICInfoModal info={icInfoData} onClose={() => setIcInfoKey(null)} />
      )}
    </div>
  );
}
