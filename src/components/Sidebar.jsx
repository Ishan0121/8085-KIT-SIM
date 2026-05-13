import React, { useState, useMemo, useEffect } from 'react';
import { OPCODES, IC_INFO, toHex } from '../data/cpu8085';
import './Sidebar.css';
import { 
  Database, Cpu, Search, ClipboardList, Keyboard, 
  Microchip, FolderOpen, Hexagon, Sun, Moon, X,
  Circle, CircleDot, Settings
} from 'lucide-react';

// ── Key Reference Data ──────────────────────────────────────
const KEY_REFERENCE = [
  { key: 'RESET',      kbd: 'Esc', primary: 'Reset CPU to initial state (PC=0000)', shift: '—', color: 'func' },
  { key: 'VCT INT',    kbd: 'V',   primary: 'Vectored Interrupt — triggers RST 7.5 / 6.5 / 5.5', shift: '—', color: 'func' },
  { key: 'SHIFT',      kbd: '⇧',   primary: 'Activates secondary (register) functions of digit keys', shift: '—', color: 'func' },
  { key: 'EXREG / SI', kbd: 'X',   primary: 'Examine register (cycles A→B→C→D→E→H→L→PC→SP)', shift: 'Store new value into examined register', color: 'func' },
  { key: 'INS DATA',   kbd: 'I',   primary: 'Insert a byte at current memory address (shift bytes up)', shift: '—', color: 'func' },
  { key: 'DEL DATA',   kbd: 'Del', primary: 'Delete byte at current memory address (shift bytes down)', shift: '—', color: 'func' },
  { key: 'GO',         kbd: 'G',   primary: 'Execute program from current PC address', shift: 'Single-step (if supported)', color: 'func' },
  { key: 'B.M',        kbd: 'M',   primary: 'Block Move — copy a memory block to a new address', shift: '—', color: 'func' },
  { key: 'REL EXMEM',  kbd: 'R',   primary: 'Relocate / Examine extended memory region', shift: '—', color: 'func' },
  { key: 'STRING PRE', kbd: 'S',   primary: 'String operation preset (configure string parameters)', shift: '—', color: 'func' },
  { key: 'MEMC NEXT',  kbd: 'N',   primary: 'Memory Check / Advance to next memory address', shift: '—', color: 'func' },
  { key: 'FILL +',     kbd: '+',   primary: 'Fill a memory range with a constant byte value', shift: '—', color: 'func' },
  { key: '0',          kbd: '0',   primary: 'Hex digit 0', shift: '—', color: 'hex' },
  { key: '1 / TTY',    kbd: '1',   primary: 'Hex digit 1', shift: 'TTY serial port select', color: 'hex' },
  { key: '2 / SER',    kbd: '2',   primary: 'Hex digit 2', shift: 'SER serial port select', color: 'hex' },
  { key: '3',          kbd: '3',   primary: 'Hex digit 3', shift: '—', color: 'hex' },
  { key: '4 / PCH',   kbd: '4',   primary: 'Hex digit 4', shift: 'Examine Program Counter High byte', color: 'hex' },
  { key: '5 / PCL',   kbd: '5',   primary: 'Hex digit 5', shift: 'Examine Program Counter Low byte', color: 'hex' },
  { key: '6 / SPH',   kbd: '6',   primary: 'Hex digit 6', shift: 'Examine Stack Pointer High byte', color: 'hex' },
  { key: '7 / SPL',   kbd: '7',   primary: 'Hex digit 7', shift: 'Examine Stack Pointer Low byte', color: 'hex' },
  { key: '8 / H',     kbd: '8',   primary: 'Hex digit 8', shift: 'Examine register H (HL high)', color: 'hex' },
  { key: '9 / L',     kbd: '9',   primary: 'Hex digit 9', shift: 'Examine register L (HL low)', color: 'hex' },
  { key: 'A',          kbd: 'A',   primary: 'Hex digit A (10)', shift: 'Examine Accumulator (A)', color: 'hex' },
  { key: 'B',          kbd: 'B',   primary: 'Hex digit B (11)', shift: 'Examine register B', color: 'hex' },
  { key: 'C',          kbd: 'C',   primary: 'Hex digit C (12)', shift: 'Examine register C', color: 'hex' },
  { key: 'D',          kbd: 'D',   primary: 'Hex digit D (13)', shift: 'Examine register D', color: 'hex' },
  { key: 'E',          kbd: 'E',   primary: 'Hex digit E (14)', shift: 'Examine register E', color: 'hex' },
  { key: 'F',          kbd: 'F',   primary: 'Hex digit F (15)', shift: 'Examine Flags register', color: 'hex' },
];

// ── Sample Programs ──────────────────────────────────────────
const SAMPLE_PROGRAMS = [
  {
    id: 'block_move',
    name: 'Block Move',
    desc: 'Move 16 bytes from 8050H→8060H to 8070H',
    addr: 0x8000,
    bytes: [
      0x21, 0x50, 0x80, // LXI H, 8050H
      0x11, 0x70, 0x80, // LXI D, 8070H
      0x06, 0x10,       // MVI B, 10H (16)
      0x7E,             // MOV A, M
      0x12,             // STAX D
      0x23,             // INX H
      0x13,             // INX D
      0x05,             // DCR B
      0xC2, 0x08, 0x80, // JNZ 8008H
      0xEF,             // RST 5 (return to monitor)
    ],
  },
  {
    id: 'fill_mem',
    name: 'Fill Memory',
    desc: 'Fill 8100H–810FH with value AAH',
    addr: 0x8020,
    bytes: [
      0x21, 0x00, 0x81, // LXI H, 8100H
      0x06, 0x10,       // MVI B, 10H
      0x3E, 0xAA,       // MVI A, AAH
      0x77,             // MOV M, A
      0x23,             // INX H
      0x05,             // DCR B
      0xC2, 0x27, 0x80, // JNZ loop
      0xEF,             // RST 5
    ],
  },
  {
    id: 'sum_series',
    name: 'Sum of Series',
    desc: 'Add numbers from 8200H, store result at 8210H',
    addr: 0x8040,
    bytes: [
      0x21, 0x00, 0x82, // LXI H, 8200H
      0x06, 0x05,       // MVI B, 05H
      0xAF,             // XRA A (clear A)
      0x86,             // ADD M
      0x23,             // INX H
      0x05,             // DCR B
      0xC2, 0x46, 0x80, // JNZ 8046H (loop to ADD M)
      0x32, 0x10, 0x82, // STA 8210H
      0xEF,             // RST 5
    ],
  },
];

/*

*/

// ── Nav items ────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'registers', icon: <Database size={18} />, label: 'Registers' },
  { id: 'memory',    icon: <Cpu size={18} />, label: 'Memory' },
  { id: 'opcodes',   icon: <Search size={18} />, label: 'Opcodes' },
  { id: 'log',       icon: <ClipboardList size={18} />, label: 'Log' },
  { id: 'keyref',    icon: <Keyboard size={18} />,  label: 'Key Ref' },
  { id: 'chips',     icon: <Microchip size={18} />, label: 'Chip Info' },
  { id: 'programs',  icon: <FolderOpen size={18} />, label: 'Programs' },
];

// ── Register Viewer ──────────────────────────────────────────
function RegisterViewer({ registers, flags, prevRegisters }) {
  const regList = [
    { key: 'A',  label: 'A',  desc: 'Accumulator' },
    { key: 'B',  label: 'B',  desc: 'Register B' },
    { key: 'C',  label: 'C',  desc: 'Register C' },
    { key: 'D',  label: 'D',  desc: 'Register D' },
    { key: 'E',  label: 'E',  desc: 'Register E' },
    { key: 'H',  label: 'H',  desc: 'Register H' },
    { key: 'L',  label: 'L',  desc: 'Register L' },
    { key: 'PC', label: 'PC', desc: 'Program Counter', wide: true },
    { key: 'SP', label: 'SP', desc: 'Stack Pointer',   wide: true },
  ];
  const flagList = [
    { key: 'S',  label: 'S',  title: 'Sign' },
    { key: 'Z',  label: 'Z',  title: 'Zero' },
    { key: 'AC', label: 'AC', title: 'Aux Carry' },
    { key: 'P',  label: 'P',  title: 'Parity' },
    { key: 'CY', label: 'CY', title: 'Carry' },
  ];
  return (
    <div className="sb-section">
      <div className="sb-section-title">Registers</div>
      <div className="reg-grid">
        {regList.map(({ key, label, desc, wide }) => {
          const val = registers[key];
          const prev = prevRegisters?.[key];
          const changed = val !== prev;
          return (
            <div key={key} className={`reg-row ${changed ? 'reg-changed' : ''}`} title={desc}>
              <span className="reg-label">{label}</span>
              <span className="reg-value mono">{toHex(val, wide ? 4 : 2)}</span>
              <span className="reg-decimal">{val}</span>
            </div>
          );
        })}
      </div>
      <div className="sb-section-subtitle">Flags</div>
      <div className="flags-row">
        {flagList.map(({ key, label, title }) => (
          <div key={key} className={`flag-bit ${flags[key] ? 'flag-set' : 'flag-clear'}`} title={title}>
            <span className="flag-name">{label}</span>
            <span className="flag-val">{flags[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Memory Viewer ────────────────────────────────────────────
function MemoryViewer({ memory, baseAddr, setMemBaseAddr, refreshMemDisplay, memDisplay }) {
  const [jumpInput, setJumpInput] = useState('');
  const handleJump = (e) => {
    e.preventDefault();
    const addr = parseInt(jumpInput, 16) & 0xFFFF;
    setMemBaseAddr(addr);
    refreshMemDisplay(addr);
    setJumpInput('');
  };
  const rows = [];
  for (let r = 0; r < 4; r++) {
    const rowAddr = baseAddr + r * 4;
    rows.push(
      <div key={r} className="mem-row">
        <span className="mem-addr mono">{toHex(rowAddr, 4)}</span>
        {Array.from({ length: 4 }, (_, c) => {
          const val = memDisplay[r * 4 + c] ?? 0;
          return <span key={c} className="mem-cell mono">{toHex(val)}</span>;
        })}
      </div>
    );
  }
  return (
    <div className="sb-section">
      <div className="sb-section-title">Memory Viewer</div>
      <form className="mem-jump-form" onSubmit={handleJump}>
        <input
          className="mem-jump-input mono"
          placeholder="Address (hex)"
          value={jumpInput}
          onChange={e => setJumpInput(e.target.value.toUpperCase())}
          maxLength={4}
        />
        <button className="mem-jump-btn" type="submit">Go</button>
      </form>
      <div className="mem-grid">
        <div className="mem-header">
          <span className="mem-addr">Addr</span>
          <span className="mem-cell">+0</span>
          <span className="mem-cell">+1</span>
          <span className="mem-cell">+2</span>
          <span className="mem-cell">+3</span>
        </div>
        {rows}
      </div>
    </div>
  );
}

// ── Settings Panel ─────────────────────────────────────────────
function SettingsPanel({ theme, onThemeToggle }) {
  return (
    <div className="sb-section">
      <div className="sb-section-title">Settings</div>
      
      <div className="settings-group">
        <div className="settings-label">Theme</div>
        <button className="settings-btn" onClick={onThemeToggle}>
          {theme === 'dark' ? <><Sun size={14}/> Switch to Light Mode</> : <><Moon size={14}/> Switch to Dark Mode</>}
        </button>
      </div>
    </div>
  );
}

// ── Opcode Finder ─────────────────────────────────────────────
function OpcodeFinder() {
  const [search, setSearch] = useState('');
  const results = useMemo(() => {
    const entries = Object.entries(OPCODES);
    let filtered = entries;

    if (search.trim()) {
      const q = search.trim().toUpperCase();
      const isHex = /^[0-9A-F]{1,2}$/.test(q);
      filtered = entries.filter(([opcode, info]) => {
        if (isHex) return parseInt(opcode).toString(16).toUpperCase().padStart(2, '0').includes(q);
        return info.mnemonic.includes(q) || info.desc.toUpperCase().includes(q);
      });
    }

    // Sort alphabetically by mnemonic
    return filtered.sort((a, b) => a[1].mnemonic.localeCompare(b[1].mnemonic));
  }, [search]);
  
  return (
    <div className="sb-section">
      <div className="sb-section-title">Opcode / Hex Finder</div>
      <input
        className="sb-search"
        placeholder="Search MOV, ADD, 3E …"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {results.length > 0 && (
        <div className="opcode-results">
          <div className="opcode-header">
            <span>Op</span><span>Mnemonic</span><span>B</span><span>T</span>
          </div>
          {results.map(([opcode, info]) => (
            <div key={opcode} className="opcode-row" title={info.desc}>
              <span className="mono opcode-hex">{toHex(parseInt(opcode))}</span>
              <span className="mono opcode-mnem">{info.mnemonic}</span>
              <span className="opcode-bytes">{info.bytes}</span>
              <span className="opcode-cycles">{info.cycles}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Execution Log ─────────────────────────────────────────────
function ExecutionLog({ log }) {
  return (
    <div className="sb-section">
      <div className="sb-section-title">Execution Log</div>
      <div className="log-output">
        {log.length === 0
          ? <span className="log-empty">— No activity yet —</span>
          : log.map((line, i) => <div key={i} className="log-line mono">{line}</div>)
        }
      </div>
    </div>
  );
}

// ── Key Reference ─────────────────────────────────────────────
function KeyReference() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? KEY_REFERENCE : KEY_REFERENCE.filter(k => k.color === filter);
  return (
    <div className="sb-section">
      <div className="sb-section-title">Key Reference</div>
      <div className="keyref-filter">
        {['all', 'func', 'hex'].map(f => (
          <button
            key={f}
            className={`keyref-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'func' ? <><CircleDot size={12} className="inline-icon" /> Function</> : <><Circle size={12} className="inline-icon" /> Hex</>}
          </button>
        ))}
      </div>
      <div className="keyref-table">
        <div className="keyref-header">
          <span>Key</span><span>Kbd</span><span>Function</span>
        </div>
        {filtered.map(item => (
          <div key={item.key} className={`keyref-row keyref-${item.color}`}>
            <span className="keyref-key">{item.key}</span>
            <span className="keyref-kbd mono">{item.kbd}</span>
            <div className="keyref-desc">
              <div className="keyref-primary">{item.primary}</div>
              {item.shift !== '—' && (
                <div className="keyref-shift">⇧ {item.shift}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Chip Info ─────────────────────────────────────────────────
function ChipInfo() {
  const [selected, setSelected] = useState(null);
  const chips = Object.entries(IC_INFO);
  return (
    <div className="sb-section">
      <div className="sb-section-title">IC Chip Reference</div>
      <div className="chip-list">
        {chips.map(([id, info]) => (
          <div
            key={id}
            className={`chip-card ${selected === id ? 'chip-card-active' : ''}`}
            onClick={() => setSelected(selected === id ? null : id)}
          >
            <div className="chip-card-header">
              <span className="chip-card-label">{info.label}</span>
              <span className="chip-card-role">{info.role}</span>
              <span className="chip-card-pins">{info.pins}p</span>
            </div>
            {selected === id && (
              <div className="chip-card-desc">{info.desc}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sample Programs ───────────────────────────────────────────
function SamplePrograms({ onLoadProgram }) {
  return (
    <div className="sb-section">
      <div className="sb-section-title">Sample Programs</div>
      <div className="prog-list">
        {SAMPLE_PROGRAMS.map(prog => (
          <div key={prog.id} className="prog-card">
            <div className="prog-card-name">{prog.name}</div>
            <div className="prog-card-desc">{prog.desc}</div>
            <div className="prog-card-meta">
              <span className="mono">@ {toHex(prog.addr, 4)}H</span>
              <span>{prog.bytes.length} bytes</span>
            </div>
            <button
              className="prog-load-btn"
              onClick={() => onLoadProgram(prog)}
            >
              Load →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────
export default function Sidebar({
  registers, prevRegisters, flags,
  memory, memDisplay, memBaseAddr, setMemBaseAddr, refreshMemDisplay,
  log, theme, onThemeToggle, onLoadProgram,
}) {
  // On wide screens start expanded, on narrow start collapsed
  const getDefault = () => window.innerWidth >= 900;
  const [expanded, setExpanded] = useState(getDefault);
  const [activePanel, setActivePanel] = useState('registers');

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 900) setExpanded(false);
      else setExpanded(true);
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
      case 'registers': return <RegisterViewer registers={registers} prevRegisters={prevRegisters} flags={flags} />;
      case 'memory':    return <MemoryViewer memory={memory} baseAddr={memBaseAddr} setMemBaseAddr={setMemBaseAddr} refreshMemDisplay={refreshMemDisplay} memDisplay={memDisplay} />;
      case 'opcodes':   return <OpcodeFinder />;
      case 'log':       return <ExecutionLog log={log} />;
      case 'keyref':    return <KeyReference />;
      case 'chips':     return <ChipInfo />;
      case 'programs':  return <SamplePrograms onLoadProgram={onLoadProgram} />;
      case 'settings':  return <SettingsPanel theme={theme} onThemeToggle={onThemeToggle} />;
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
            {NAV_ITEMS.find(n => n.id === activePanel)?.icon}{' '}
            {NAV_ITEMS.find(n => n.id === activePanel)?.label}
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
