import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/sidebar/Sidebar';
import SevenSegDisplay, { DisplayInfoBtn } from './components/hardware/SevenSegDisplay';
import RealtimeTranslator from './components/hardware/RealtimeTranslator';
import Keypad from './components/hardware/Keypad';
import FlagLEDBar from './components/hardware/FlagLEDBar';
import ICInfoModal from './components/modals/ICInfoModal';
import GuideModal from './components/modals/GuideModal';
import use8085 from './hooks/use8085';
import { IC_INFO, toHex } from './data/cpu8085';
import { Hexagon, BookOpen } from 'lucide-react';
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
  'Shift': 'SHIFT',
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
  const [keypadSound, setKeypadSound] = useState(() => getSavedSetting('sim_keypadSound', true));
  const [soundProfile, setSoundProfile] = useState(() => getSavedSetting('sim_soundProfile', 'mechanical'));
  const [volume, setVolume] = useState(() => getSavedSetting('sim_volume', 50));
  const [autoScrollLog, setAutoScrollLog] = useState(() => getSavedSetting('sim_autoScrollLog', true));
  const [clearLogOnReset, setClearLogOnReset] = useState(() => getSavedSetting('sim_clearLogOnReset', false));
  const [showDecimal, setShowDecimal] = useState(() => getSavedSetting('sim_showDecimal', true));
  const [showRealtimeTranslator, setShowRealtimeTranslator] = useState(() => getSavedSetting('sim_showRealtimeTranslator', true));
  const [strictMode, setStrictMode] = useState(() => getSavedSetting('sim_strictMode', false));

  const [icInfoKey, setIcInfoKey] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const prevRegisters = useRef(null);

  // ---- Persist Settings ----
  useEffect(() => localStorage.setItem('sim_keypadSound', JSON.stringify(keypadSound)), [keypadSound]);
  useEffect(() => localStorage.setItem('sim_soundProfile', JSON.stringify(soundProfile)), [soundProfile]);
  useEffect(() => localStorage.setItem('sim_volume', JSON.stringify(volume)), [volume]);
  useEffect(() => localStorage.setItem('sim_autoScrollLog', JSON.stringify(autoScrollLog)), [autoScrollLog]);
  useEffect(() => localStorage.setItem('sim_clearLogOnReset', JSON.stringify(clearLogOnReset)), [clearLogOnReset]);
  useEffect(() => localStorage.setItem('sim_showDecimal', JSON.stringify(showDecimal)), [showDecimal]);
  useEffect(() => localStorage.setItem('sim_showRealtimeTranslator', JSON.stringify(showRealtimeTranslator)), [showRealtimeTranslator]);
  useEffect(() => localStorage.setItem('sim_strictMode', JSON.stringify(strictMode)), [strictMode]);

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
    document.body.className = 'dark';
  }, []);

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
    <div className="h-full flex bg-slate-950 transition-colors duration-300">
      {/* ── Left sidebar ── */}
      <Sidebar
        registers={registers}
        prevRegisters={prevRegisters.current}
        flags={flags}
        memory={memory} memVersion={memVersion}
        memBaseAddr={memBaseAddr} setMemBaseAddr={setMemBaseAddr}
        refreshMemDisplay={refreshMemDisplay}
        log={log}
        setIcInfoKey={setIcInfoKey}
        keypadSound={keypadSound} setKeypadSound={setKeypadSound}
        soundProfile={soundProfile} setSoundProfile={setSoundProfile}
        volume={volume} setVolume={setVolume}
        autoScrollLog={autoScrollLog} setAutoScrollLog={setAutoScrollLog}
        clearLogOnReset={clearLogOnReset} setClearLogOnReset={setClearLogOnReset}
        showDecimal={showDecimal} setShowDecimal={setShowDecimal}
        showRealtimeTranslator={showRealtimeTranslator} setShowRealtimeTranslator={setShowRealtimeTranslator}
        strictMode={strictMode} setStrictMode={setStrictMode}
        handleStep={handleStep}
        breakpoints={breakpoints} toggleBreakpoint={toggleBreakpoint}
        ports={ports} portsVersion={portsVersion} writePort={writePort}
      />

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 lg:pb-0 lg:ml-0 transition-all duration-300">
        {/* Top bar */}
        <div className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 flex items-center px-4 md:px-7 gap-4 shrink-0 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <Hexagon size={20} className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            <span className="font-orbitron text-sm font-bold text-cyan-600 dark:text-cyan-400 tracking-wide whitespace-nowrap">8085 Trainer Kit Simulator</span>
          </div>
          <div className="flex gap-2 ml-auto">
            <button className="flex items-center text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" onClick={() => setShowGuide(true)} title="View Guide">
              <BookOpen size={14} className="mr-1" />
              Guide
            </button>
            <span className="text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">Phase 1</span>
            <span className="text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">Digital Twin</span>
          </div>
        </div>

        {/* Trainer area — display + keypad only */}
        <div className="flex-1 flex flex-col items-center p-4 md:p-8 xl:p-12 min-h-[600px] max-w-[1200px] mx-auto w-full relative">

          <div className="relative flex flex-col items-center gap-6 min-w-[520px] w-full p-7 pb-9 max-lg:min-w-0 max-lg:p-5 max-sm:p-[14px] max-sm:gap-4 rounded-2xl border border-slate-700 bg-slate-900 shadow-[0_0_40px_rgba(6,182,212,0.05),inset_0_1px_0_rgba(255,255,255,0.05)] before:content-[''] before:absolute before:w-[18px] before:h-[18px] before:border-cyan-500/50 before:border-solid before:opacity-50 before:top-3 before:left-3 before:border-l before:border-t before:rounded-tl-sm after:content-[''] after:absolute after:w-[18px] after:h-[18px] after:border-cyan-500/50 after:border-solid after:opacity-50 after:bottom-3 after:right-3 after:border-r after:border-b after:rounded-br-sm">

            {/* Board label */}
            <div className="font-mono text-[11px] font-bold text-cyan-400 tracking-[4px] uppercase border-b border-cyan-500/30 pb-3 w-full text-center opacity-70">8085 MICROPROCESSOR KIT</div>

            {/* LED indicators */}
            <div className="flex gap-5 self-start pl-1 w-full">
              <div className="flex items-center gap-[7px]">
                <div className="w-[11px] h-[11px] rounded-full bg-red-500 transition-all duration-300 border border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8),0_0_16px_rgba(239,68,68,0.4)]" />
                <span className="font-mono text-[10px] font-semibold text-slate-400 tracking-[1.5px] uppercase">PWR</span>
              </div>
              <div className="flex items-center gap-[7px]">
                <div className="w-[11px] h-[11px] rounded-full bg-red-950 transition-all duration-300 border border-red-900/50" />
                <span className="font-mono text-[10px] font-semibold text-slate-400 tracking-[1.5px] uppercase">RUN</span>
              </div>
              <DisplayInfoBtn addressValue={addressDisplay} dataValue={dataDisplay} />
            </div>

          {/* Flag LED bar — floats centered above the board enclosure */}
          <FlagLEDBar flags={flags} />

            {/* 7-Segment Display */}
            <div className="w-full flex justify-center">
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
            <div className="w-full flex justify-center">
              <Keypad onKey={handleKey} shifted={shifted} />
            </div>
          </div>
        </div>

        {/* Keyboard hint bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 px-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 fixed bottom-0 md:static w-full text-[10px] font-medium text-slate-500 dark:text-slate-400 z-40">
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">0–9 A–F</kbd> Hex input</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">Esc</kbd> RESET</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">V</kbd> VCT INT</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">Shift</kbd> SHIFT</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">X</kbd> EXREG</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">I</kbd> INS DATA</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">Del</kbd> DEL DATA</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">G</kbd> GO</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">M</kbd> B.M</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">R</kbd> REL EXMEM</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">S</kbd> STRING PRE</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">N</kbd> NEXT</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-mono text-[9px] shadow-sm text-gray-700 dark:text-gray-300">+</kbd> FILL</span>
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
