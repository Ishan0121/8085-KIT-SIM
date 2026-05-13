import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import SevenSegDisplay from './components/SevenSegDisplay';
import Keypad from './components/Keypad';
import { ICInfoModal } from './components/SidePanel';
import use8085 from './hooks/use8085';
import { IC_INFO, toHex } from './data/cpu8085';
import { Hexagon } from 'lucide-react';
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

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [icInfoKey, setIcInfoKey] = useState(null);
  const prevRegisters = useRef(null);

  const {
    registers, flags,
    memory, memDisplay, memBaseAddr, setMemBaseAddr, refreshMemDisplay,
    addressDisplay, dataDisplay,
    shifted, log,
    handleKey,
  } = use8085();

  // ---- Theme ----
  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light');
  }, [theme]);

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
        memDisplay={memDisplay}
        memBaseAddr={memBaseAddr}
        setMemBaseAddr={setMemBaseAddr}
        refreshMemDisplay={refreshMemDisplay}
        log={log}
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
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
            </div>

            {/* 7-Segment Display */}
            <div className="display-zone">
              <SevenSegDisplay addressValue={addressDisplay} dataValue={dataDisplay} />
            </div>

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

      {/* IC Info Modal */}
      {icInfoData && (
        <ICInfoModal info={icInfoData} onClose={() => setIcInfoKey(null)} />
      )}
    </div>
  );
}
