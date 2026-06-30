import React, { useState, useEffect } from 'react';
import { assemble } from '../../utils/assembler';
import {
  Play, AlertTriangle, CheckCircle, Terminal,
  BookOpen, ChevronDown, ChevronUp, Download
} from 'lucide-react';
import { toHex } from '../../data/cpu8085';

// ── Sample Program Library ───────────────────────────────────────────────────
const SAMPLE_PROGRAMS = [
  {
    name: '8-bit Addition',
    category: 'Arithmetic',
    desc: 'Add two numbers from memory, store sum at 3052H',
    baseAddr: '3000',
    code:
`; 8-bit Addition
; Adds [3050H] + [3051H] → [3052H]
LDA 3050H     ; A = first operand
MOV B, A      ; B = first operand
LDA 3051H     ; A = second operand
ADD B         ; A = A + B
STA 3052H     ; store sum
HLT
`,
  },
  {
    name: '8-bit Subtraction',
    category: 'Arithmetic',
    desc: 'Subtract [3051H] from [3050H], store at 3052H',
    baseAddr: '3000',
    code:
`; 8-bit Subtraction
; [3050H] - [3051H] → [3052H]
LDA 3050H     ; A = minuend
MOV B, A      ; B = minuend
LDA 3051H     ; A = subtrahend
MOV C, A      ; C = subtrahend
MOV A, B      ; A = minuend
SUB C         ; A = A - C
STA 3052H     ; store difference
HLT
`,
  },
  {
    name: '8-bit Multiplication',
    category: 'Arithmetic',
    desc: 'Multiply two bytes by repeated addition. Result in [3052H]',
    baseAddr: '3000',
    code:
`; 8-bit Multiplication (repeated addition)
; [3050H] × [3051H] → [3052H]
LDA 3050H     ; A = multiplicand
MOV B, A      ; B = multiplicand (addend)
LDA 3051H     ; A = multiplier (loop count)
MOV C, A      ; C = counter
MVI A, 00H    ; A = 0 (accumulator for result)
LOOP:
ADD B         ; A += B
DCR C         ; C--
JNZ LOOP      ; repeat until C = 0
STA 3052H     ; store product
HLT
`,
  },
  {
    name: 'Largest in Array',
    category: 'Array',
    desc: 'Find the largest byte in a 5-element array starting at 3050H',
    baseAddr: '3000',
    code:
`; Find Largest in Array
; Array at 3050H, length 05H
; Result → [3060H]
LXI H, 3050H  ; HL → first element
MOV A, M      ; A = first element (assume max)
MVI C, 04H    ; compare remaining 4 elements
LOOP:
INX H         ; next element
CMP M         ; compare A with [HL]
JNC SKIP      ; if A >= [HL], skip
MOV A, M      ; else A = new max
SKIP:
DCR C
JNZ LOOP
STA 3060H     ; store maximum
HLT
`,
  },
  {
    name: 'Smallest in Array',
    category: 'Array',
    desc: 'Find the smallest byte in a 5-element array starting at 3050H',
    baseAddr: '3000',
    code:
`; Find Smallest in Array
; Array at 3050H, length 05H
; Result → [3060H]
LXI H, 3050H  ; HL → first element
MOV A, M      ; A = first element (assume min)
MVI C, 04H    ; compare remaining 4 elements
LOOP:
INX H         ; next element
CMP M         ; compare A with [HL]
JC  SKIP      ; if A < [HL], already smaller, skip
MOV A, M      ; else A = new min
SKIP:
DCR C
JNZ LOOP
STA 3060H     ; store minimum
HLT
`,
  },
  {
    name: 'Block Copy',
    category: 'Memory',
    desc: 'Copy 05H bytes from source (3050H) to destination (3060H)',
    baseAddr: '3000',
    code:
`; Block Copy
; Copies 05H bytes: [3050H..3054H] → [3060H..3064H]
MVI C, 05H    ; byte count
LXI H, 3050H  ; HL = source start
LXI D, 3060H  ; DE = destination start
LOOP:
MOV A, M      ; A = [source]
STAX D        ; [dest] = A
INX H         ; advance source
INX D         ; advance dest
DCR C
JNZ LOOP
HLT
`,
  },
  {
    name: 'Reverse an Array',
    category: 'Memory',
    desc: 'Reverse 05H bytes in-place at 3050H using two pointers',
    baseAddr: '3000',
    code:
`; Reverse Array In-Place
; 5 bytes at 3050H–3054H
LXI H, 3050H  ; HL = low pointer (start)
LXI D, 3054H  ; DE = high pointer (end)
MVI C, 02H    ; swap count = N/2 = 2
SWAP:
MOV A, M      ; A = [low]
LDAX D        ; temp in A... use B
MOV B, A      ; B = [high]
MOV A, M      ; A = [low]
STAX D        ; [high] = old [low]
MOV M, B      ; [low]  = old [high]
INX H         ; low++
DCX D         ; high--
DCR C
JNZ SWAP
HLT
`,
  },
  {
    name: 'Count 1-Bits',
    category: 'Logic',
    desc: 'Count the number of set bits in the byte at 3050H, result at 3051H',
    baseAddr: '3000',
    code:
`; Count 1-Bits (Population Count)
; Input: [3050H]  Result: [3051H]
LDA 3050H     ; A = input byte
MVI C, 08H    ; 8 bits to test
MVI B, 00H    ; B = bit counter
LOOP:
RLC           ; rotate left, bit7 → CY
JNC SKIP      ; skip if bit was 0
INR B         ; B++ (count a 1-bit)
SKIP:
DCR C
JNZ LOOP
MOV A, B
STA 3051H     ; store count
HLT
`,
  },
  {
    name: '2\'s Complement',
    category: 'Logic',
    desc: 'Compute the 2\'s complement of the byte at 3050H, store at 3051H',
    baseAddr: '3000',
    code:
`; 2's Complement
; Input: [3050H]  Output: [3051H]
LDA 3050H     ; A = byte
CMA           ; A = 1's complement (flip all bits)
ADI 01H       ; A = A + 1  (2's complement)
STA 3051H     ; store result
HLT
`,
  },
  {
    name: 'Fibonacci Series',
    category: 'Math',
    desc: 'Generate first 08H Fibonacci numbers, stored starting at 3050H',
    baseAddr: '3000',
    code:
`; Fibonacci Series
; Stores 08H terms starting at 3050H
; F: 0, 1, 1, 2, 3, 5, 8, 13, ...
LXI H, 3050H  ; HL → output start
MVI C, 08H    ; generate 8 terms
MVI A, 00H    ; A = F(0) = 0
MVI B, 01H    ; B = F(1) = 1
LOOP:
MOV M, A      ; store F(n) at [HL]
MOV D, A      ; D = F(n)  (temp)
ADD B         ; A = F(n) + F(n+1)
MOV B, D      ; B = old F(n) — now F(n+1) for next
; A now holds new F(n+1), which becomes next F(n)
INX H         ; advance pointer
DCR C
JNZ LOOP
HLT
`,
  },
];

const CATEGORIES = [...new Set(SAMPLE_PROGRAMS.map(p => p.category))];

// ── Component ────────────────────────────────────────────────────────────────
export default function AssemblerPanel({
  memory,
  memBaseAddr,
  setMemBaseAddr,
  refreshMemDisplay
}) {
  const DEFAULT_CODE =
`; 8085 Assembly
MVI A, 05H    ; Load 05H into accumulator
MVI B, 03H    ; Load 03H into register B
ADD B         ; A = A + B
STA 3200H     ; Store result at 3200H
HLT           ; Stop execution
`;

  const [code, setCode]               = useState(DEFAULT_CODE);
  const [baseAddrInput, setBaseAddrInput] = useState(() => toHex(memBaseAddr, 4));
  const [status, setStatus]           = useState(null);
  const [showSamples, setShowSamples] = useState(false);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  // Initial sync only, do not update when memBaseAddr changes globally


  const handleAssemble = () => {
    setStatus(null);
    const startAddr = parseInt(baseAddrInput, 16);
    if (isNaN(startAddr) || startAddr < 0 || startAddr > 0xFFFF) {
      setStatus({ type: 'error', messages: ['Invalid base address. Enter a 4-digit hex value (e.g. 2000).'] });
      return;
    }

    const result = assemble(code, startAddr);
    if (!result.success) {
      setStatus({ type: 'error', messages: result.errors });
      return;
    }

    let addr = startAddr;
    for (const byte of result.bytes) {
      if (addr > 0xFFFF) break;
      memory[addr++] = byte;
    }

    setMemBaseAddr(startAddr);
    refreshMemDisplay();
    setStatus({
      type: 'success',
      messages: [`Assembled ${result.bytes.length} byte${result.bytes.length !== 1 ? 's' : ''} loaded at ${toHex(startAddr, 4)}H.`]
    });
  };

  const loadSample = (prog) => {
    setCode(prog.code);
    setBaseAddrInput(prog.baseAddr);
    setStatus(null);
    setShowSamples(false);
  };

  const visibleSamples = SAMPLE_PROGRAMS.filter(p => p.category === activeCategory);

  return (
    <div className="sb-section" style={{ display: 'flex', flexDirection: 'column', height: '100%', marginBottom: 0 }}>

      {/* ── Description ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Terminal size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Write 8085 assembly — supports labels, comments (<code>;</code>), and hex immediates.
        </span>
      </div>

      {/* ── Sample Library Toggle ── */}
      <button
        onClick={() => setShowSamples(s => !s)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: showSamples ? 'var(--accent-subtle)' : 'var(--bg-raised)',
          border: `1px solid ${showSamples ? 'var(--accent-border)' : 'var(--border-base)'}`,
          borderRadius: 'var(--r-sm)',
          padding: '8px 12px',
          cursor: 'pointer',
          marginBottom: '10px',
          color: showSamples ? 'var(--accent)' : 'var(--text-secondary)',
          transition: 'all var(--t-fast)',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <BookOpen size={14} />
          Sample Programs
        </span>
        {showSamples ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* ── Sample Library Panel ── */}
      {showSamples && (
        <div style={{
          background: 'var(--bg-overlay)',
          border: '1px solid var(--border-dim)',
          borderRadius: 'var(--r-md)',
          marginBottom: '10px',
          overflow: 'hidden',
        }}>
          {/* Category tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-dim)',
            overflowX: 'auto',
          }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0,
                  padding: '7px 14px',
                  background: activeCategory === cat ? 'var(--accent-subtle)' : 'transparent',
                  color: activeCategory === cat ? 'var(--accent)' : 'var(--text-muted)',
                  borderRight: '1px solid var(--border-dim)',
                  borderLeft: 'none',
                  borderTop: 'none',
                  borderBottom: activeCategory === cat ? '2px solid var(--accent)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  transition: 'all var(--t-fast)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Program cards */}
          <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {visibleSamples.map((prog, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border-base)',
                  borderRadius: 'var(--r-sm)',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  transition: 'border-color var(--t-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-border)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-base)'}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    marginBottom: '3px',
                  }}>
                    {prog.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {prog.desc}
                  </div>
                </div>
                <button
                  onClick={() => loadSample(prog)}
                  title={`Load "${prog.name}"`}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'var(--accent-dim)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--r-sm)',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    transition: 'background var(--t-fast)',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                >
                  <Download size={11} />
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Base Addr + Assemble ── */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '9px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Base Addr
          </label>
          <input
            type="text"
            className="mem-jump-input"
            value={baseAddrInput}
            onChange={(e) => setBaseAddrInput(
              e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 4)
            )}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAssemble(); }}
            placeholder="2000"
            style={{ width: '80px' }}
          />
        </div>
        <button
          className="mem-jump-btn"
          onClick={handleAssemble}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
        >
          <Play size={12} />
          Assemble &amp; Load
        </button>
      </div>

      {/* ── Code Textarea ── */}
      <textarea
        className="assembler-textarea"
        style={{ flex: 1, minHeight: '180px' }}
        value={code}
        onChange={(e) => { setCode(e.target.value); setStatus(null); }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder={'MVI A, 05H\nADD B\nHLT'}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '4px',
        marginBottom: '8px',
        fontSize: '10px',
        color: 'var(--text-muted)',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <span>{code.split('\n').length} lines</span>
        <span>{code.replace(/\s/g, '').length} chars</span>
      </div>

      {/* ── Status ── */}
      {status && (
        <div className={`assembler-status ${status.type === 'error' ? 'status-error' : 'status-success'}`}>
          <div className="status-header">
            {status.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
            {status.type === 'error' ? 'Assembly errors' : 'Success'}
          </div>
          <ul className="status-list">
            {status.messages.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
