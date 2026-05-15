import React, { useEffect, useRef } from 'react';

export default function ExecutionLog({ log, autoScrollLog }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (autoScrollLog && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log, autoScrollLog]);

  return (
    <div className="sb-section">
      <div className="sb-section-title">Execution Log</div>
      <div className="log-output">
        {log.length === 0
          ? <span className="log-empty">— No activity yet —</span>
          : log.map((line, i) => <div key={i} className="log-line mono">{line}</div>)
        }
        <div ref={endRef} />
      </div>
    </div>
  );
}
