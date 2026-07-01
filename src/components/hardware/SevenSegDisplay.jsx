import React, { useState, useEffect, useRef } from 'react';

// Segment paths for a single 7-segment digit
const SEG_PATHS = {
  a: 'M 3 2 L 5 0 L 19 0 L 21 2 L 19 4 L 5 4 Z',
  b: 'M 22 3 L 24 5 L 24 19 L 22 21 L 20 19 L 20 5 Z',
  c: 'M 22 23 L 24 25 L 24 39 L 22 41 L 20 39 L 20 25 Z',
  d: 'M 3 42 L 5 40 L 19 40 L 21 42 L 19 44 L 5 44 Z',
  e: 'M 2 23 L 4 25 L 4 39 L 2 41 L 0 39 L 0 25 Z',
  f: 'M 2 3 L 4 5 L 4 19 L 2 21 L 0 19 L 0 5 Z',
  g: 'M 3 22 L 5 20 L 19 20 L 21 22 L 19 24 L 5 24 Z',
};

const DIGIT_MAP = {
  '0': ['a','b','c','d','e','f'],
  '1': ['b','c'],
  '2': ['a','b','d','e','g'],
  '3': ['a','b','c','d','g'],
  '4': ['b','c','f','g'],
  '5': ['a','c','d','f','g'],
  '6': ['a','c','d','e','f','g'],
  '7': ['a','b','c'],
  '8': ['a','b','c','d','e','f','g'],
  '9': ['a','b','c','d','f','g'],
  'A': ['a','b','c','e','f','g'],
  'B': ['c','d','e','f','g'],
  'C': ['a','d','e','f'],
  'D': ['b','c','d','e','g'],
  'E': ['a','d','e','f','g'],
  'F': ['a','e','f','g'],
  '-': ['g'],
  ' ': [],
};

function SingleDigit({ char, glowing = true }) {
  const segs = DIGIT_MAP[char?.toUpperCase()] || [];
  return (
    <svg className="w-8 h-14 block" viewBox="0 0 26 46" xmlns="http://www.w3.org/2000/svg">
      {Object.entries(SEG_PATHS).map(([seg, path]) => {
        const isOn = segs.includes(seg);
        return (
          <path
            key={seg}
            d={path}
            className={`${isOn ? 'fill-red-600' : 'fill-red-950/40'} ${isOn && glowing ? 'fill-red-500 filter drop-shadow-[0_0_4px_rgba(239,68,68,0.8)] drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}`}
          />
        );
      })}
    </svg>
  );
}

// Info tooltip button beside the display
export function DisplayInfoBtn({ addressValue, dataValue }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const addr = addressValue.replace(/-/g, '0');
  const data = dataValue.replace(/-/g, '0');
  const addrDec = parseInt(addr, 16);
  const dataDec = parseInt(data, 16);

  let statusText = (
    <>
      The <b className="text-cyan-400 font-bold">ADDRESS</b> display (4 digits) shows the current memory
      address being examined or the Program Counter. The <b className="text-cyan-400 font-bold">DATA</b> display
      (2 digits) shows the byte value at that address or the value being entered.
    </>
  );

  if (dataValue.trim() === 'E') {
    statusText = <><b className="text-cyan-400 font-bold">Execution complete.</b> The program has hit a HLT instruction or breakpoint.</>;
  } else if (addressValue === '----' && dataValue === '--') {
    statusText = <><b className="text-cyan-400 font-bold">System Reset.</b> Ready for input.</>;
  } else if (addressValue.trim() === '') {
    statusText = <><b className="text-cyan-400 font-bold">Waiting for execution address.</b> Enter the starting address and press GO.</>;
  } else if (['A', 'B', 'C', 'D', 'E', 'H', 'L', 'PC', 'SP'].some(r => addressValue.trim() === r)) {
    statusText = <><b className="text-cyan-400 font-bold">Examine Register.</b> Showing the current value of register <b className="text-cyan-400 font-bold">{addressValue.trim()}</b> in the DATA display.</>;
  }

  return (
    <div className="relative flex items-center shrink-0 ml-auto" ref={ref}>
      <button
        className="w-5 h-5 rounded-full bg-[#00e5ff]/[0.08] border border-[#00e5ff]/[0.3] text-cyan-400 font-inter text-[11px] font-extrabold cursor-pointer flex items-center justify-center leading-none transition-all duration-150 shrink-0 z-10 hover:bg-[#00e5ff]/[0.18] hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,229,255,0.22)]"
        onClick={() => setOpen(o => !o)}
        title="What does the display show?"
        aria-label="Display info"
      >
        ?
      </button>
      {open && (
        <div className="absolute top-[calc(100%+8px)] -right-[5px] w-[230px] bg-slate-900 border border-slate-700 rounded-md py-3.5 px-4 shadow-xl z-[200] animate-[popup-appear_150ms_ease-out]">
          <div className="absolute -top-[6px] right-[10px] rotate-45 w-[10px] h-[10px] bg-slate-900 border-t border-l border-slate-700" />
          <div className="font-orbitron text-[10px] font-bold text-cyan-400 tracking-[1.5px] uppercase mb-2.5 pb-2 border-b border-slate-800 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">Display State</div>
          <div className="flex items-center gap-2 py-1 border-b border-slate-800/50">
            <span className="font-orbitron text-[9px] font-bold text-slate-500 tracking-[0.5px] min-w-[54px] uppercase">ADDRESS</span>
            <span className="font-mono text-[14px] font-bold text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] tracking-[2px] flex-1">{addressValue}</span>
            <span className="font-mono text-[11px] text-slate-500">{isNaN(addrDec) ? '—' : addrDec}</span>
          </div>
          <div className="flex items-center gap-2 py-1 border-b border-transparent">
            <span className="font-orbitron text-[9px] font-bold text-slate-500 tracking-[0.5px] min-w-[54px] uppercase">DATA</span>
            <span className="font-mono text-[14px] font-bold text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] tracking-[2px] flex-1">{dataValue}</span>
            <span className="font-mono text-[11px] text-slate-500">{isNaN(dataDec) ? '—' : dataDec}</span>
          </div>
          <div className="font-inter text-[12px] text-slate-400 leading-relaxed mt-2.5 pt-2.5 border-t border-slate-800">
            {statusText}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SevenSegDisplay({ addressValue = '----', dataValue = '--' }) {
  const [blink, setBlink] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(intervalRef.current);
  }, []);

  const addrChars = addressValue.padStart(4, '-').split('');
  const dataChars = dataValue.padStart(2, '-').split('');

  return (
    <div className="flex flex-col items-stretch gap-1 relative">
      <div className="bg-black/95 border-[3px] border-zinc-950 rounded-md p-2.5 px-4 flex items-center justify-center gap-4 sm:gap-6 relative overflow-visible shadow-[inset_0_3px_14px_rgba(0,0,0,0.95),0_0_0_1px_#111,0_4px_16px_rgba(0,0,0,0.7)] min-w-[280px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_65%,rgba(239,68,68,0.15)_0%,transparent_70%)] rounded-[inherit] pointer-events-none" />
        
        {/* Address section */}
        <div className="flex flex-col items-center gap-1 z-10">
          <div className="font-mono text-[9px] font-bold text-[#aa3300] tracking-[2px] uppercase opacity-90">ADDRESS</div>
          <div className="flex gap-1 items-center">
            {addrChars.map((ch, i) => (
              <div key={i} className="flex items-center justify-center">
                <SingleDigit char={ch} glowing={ch !== '-' && ch !== ' '} />
              </div>
            ))}
          </div>
        </div>

        <div className="w-[2px] h-12 bg-gradient-to-b from-transparent via-red-950/50 to-transparent opacity-45 shrink-0 z-10" />

        {/* Data section */}
        <div className="flex flex-col items-center gap-1 z-10">
          <div className="font-mono text-[9px] font-bold text-[#aa3300] tracking-[2px] uppercase opacity-90">DATA</div>
          <div className="flex gap-1 items-center">
            {dataChars.map((ch, i) => (
              <div key={i} className="flex items-center justify-center">
                <SingleDigit char={ch} glowing={ch !== '-' && ch !== ' '} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
