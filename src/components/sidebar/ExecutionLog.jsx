import React, { useEffect, useRef } from 'react';

/**
 * Determines a CSS class for log line colorization based on keyword prefix.
 */
function getLogClass(line) {
  const upper = line.toUpperCase();
  if (upper.includes('WRITE:') || upper.includes('MEM:'))  return 'text-orange-400';
  if (upper.includes('STEP:'))                              return 'text-purple-400';
  if (upper.includes('GO:') || upper.includes('EXECUTION') || upper.includes('BREAKPOINT')) return 'text-green-400';
  if (upper.includes('ILLEGAL') || upper.includes('ERROR')) return 'text-red-400';
  if (upper.includes('RESET') || upper.includes('FILL:') || upper.includes('NEXT:')) return 'text-yellow-400';
  return 'text-slate-300';
}

export default function ExecutionLog({ log, autoScrollLog }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (autoScrollLog && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log, autoScrollLog]);

  return (
    <div className="flex flex-col flex-1 min-h-0 mb-4">
      <div className="flex items-center justify-between font-orbitron text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
        Execution Log
        {log.length > 0 && (
          <span className="text-[10px] font-mono text-slate-500 font-normal normal-case tracking-normal">
            {log.length} entries
          </span>
        )}
      </div>
      <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 overflow-y-auto font-mono text-[11px] leading-relaxed shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]">
        {log.length === 0
          ? <span className="block text-center text-slate-500 italic mt-4">— No activity yet —</span>
          : log.map((line, i) => (
            <div key={i} className={`whitespace-pre-wrap break-all ${getLogClass(line)}`}>
              {line}
            </div>
          ))
        }
        <div ref={endRef} />
      </div>
    </div>
  );
}
