import React, { useEffect, useRef } from 'react';

/**
 * Determines a CSS class for log line colorization based on keyword prefix.
 */
function getLogClass(line) {
  const upper = line.toUpperCase();
  if (upper.includes('WRITE:') || upper.includes('MEM:'))  return 'log-write';
  if (upper.includes('STEP:'))                              return 'log-step';
  if (upper.includes('GO:') || upper.includes('EXECUTION') || upper.includes('BREAKPOINT')) return 'log-go';
  if (upper.includes('ILLEGAL') || upper.includes('ERROR')) return 'log-error';
  if (upper.includes('RESET') || upper.includes('FILL:') || upper.includes('NEXT:')) return 'log-reset';
  return '';
}

export default function ExecutionLog({ log, autoScrollLog }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (autoScrollLog && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log, autoScrollLog]);

  return (
    <div className="sb-section" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="sb-section-title">
        Execution Log
        {log.length > 0 && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '10px',
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-muted)',
            fontWeight: 400,
            letterSpacing: '0px',
          }}>
            {log.length} entries
          </span>
        )}
      </div>
      <div className="log-output">
        {log.length === 0
          ? <span className="log-empty">— No activity yet —</span>
          : log.map((line, i) => (
            <div key={i} className={`log-line mono ${getLogClass(line)}`}>
              {line}
            </div>
          ))
        }
        <div ref={endRef} />
      </div>
    </div>
  );
}
