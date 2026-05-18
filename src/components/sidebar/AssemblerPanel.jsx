import React, { useState, useEffect } from 'react';
import { assemble } from '../../utils/assembler';
import { Play, AlertTriangle, CheckCircle, Terminal } from 'lucide-react';
import { toHex } from '../../data/cpu8085';

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

  const [code, setCode] = useState(DEFAULT_CODE);
  const [baseAddrInput, setBaseAddrInput] = useState(
    () => toHex(memBaseAddr, 4)
  );
  const [status, setStatus] = useState(null);

  // Sync the base-address input whenever the user changes it elsewhere
  // (e.g. from the Memory Viewer or Disassembler).
  useEffect(() => {
    setBaseAddrInput(toHex(memBaseAddr, 4));
  }, [memBaseAddr]);

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

    // Write assembled bytes into simulator memory
    let addr = startAddr;
    for (const byte of result.bytes) {
      if (addr > 0xFFFF) break;
      memory[addr++] = byte;
    }

    // Jump memory viewer / disassembler to the loaded region
    setMemBaseAddr(startAddr);
    refreshMemDisplay();

    setStatus({
      type: 'success',
      messages: [
        `Assembled ${result.bytes.length} byte${result.bytes.length !== 1 ? 's' : ''} loaded at ${toHex(startAddr, 4)}H.`
      ]
    });
  };

  return (
    <div className="sb-section">
      {/* Header description */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Terminal size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Write 8085 assembly — supports labels, comments (<code>;</code>), and hex immediates.
        </span>
      </div>

      {/* Base address + Assemble button */}
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
            onChange={(e) =>
              setBaseAddrInput(
                e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 4)
              )
            }
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

      {/* Code textarea */}
      <textarea
        className="assembler-textarea"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setStatus(null); // clear stale status on edit
        }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder={'MVI A, 05\nADD B\nHLT'}
      />

      {/* Status output */}
      {status && (
        <div className={`assembler-status ${status.type === 'error' ? 'status-error' : 'status-success'}`}>
          <div className="status-header">
            {status.type === 'error'
              ? <AlertTriangle size={14} />
              : <CheckCircle size={14} />}
            {status.type === 'error' ? 'Assembly errors' : 'Success'}
          </div>
          <ul className="status-list">
            {status.messages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
