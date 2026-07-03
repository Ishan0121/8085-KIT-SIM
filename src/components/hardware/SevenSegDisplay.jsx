import React, { useState, useEffect, useRef } from 'react';
import './SevenSegDisplay.css';

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
    <svg className="seg-digit" viewBox="0 0 26 46" xmlns="http://www.w3.org/2000/svg">
      {Object.entries(SEG_PATHS).map(([seg, path]) => (
        <path
          key={seg}
          d={path}
          className={`seg-path ${segs.includes(seg) ? 'seg-on' : 'seg-off'} ${glowing ? 'seg-glow' : ''}`}
        />
      ))}
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
      The <b>ADDRESS</b> display (4 digits) shows the current memory
      address being examined or the Program Counter. The <b>DATA</b> display
      (2 digits) shows the byte value at that address or the value being entered.
    </>
  );

  if (dataValue.trim() === 'E') {
    statusText = <><b>Execution complete.</b> The program has hit a HLT instruction or breakpoint.</>;
  } else if (addressValue === '----' && dataValue === '--') {
    statusText = <><b>System Reset.</b> Ready for input.</>;
  } else if (addressValue.trim() === '') {
    statusText = <><b>Waiting for execution address.</b> Enter the starting address and press FILL.</>;
  } else if (['A', 'B', 'C', 'D', 'E', 'H', 'L', 'PC', 'SP'].some(r => addressValue.trim() === r)) {
    statusText = <><b>Examine Register.</b> Showing the current value of register <b>{addressValue.trim()}</b> in the DATA display.</>;
  }

  return (
    <div className="display-info-wrap" ref={ref}>
      <button
        className="display-info-btn"
        onClick={() => setOpen(o => !o)}
        title="What does the display show?"
        aria-label="Display info"
      >
        ?
      </button>
      {open && (
        <div className="display-info-popup">
          <div className="dip-title">Display State</div>
          <div className="dip-row">
            <span className="dip-label">ADDRESS</span>
            <span className="dip-hex">{addressValue}</span>
            <span className="dip-dec">{isNaN(addrDec) ? '—' : addrDec}</span>
          </div>
          <div className="dip-row">
            <span className="dip-label">DATA</span>
            <span className="dip-hex">{dataValue}</span>
            <span className="dip-dec">{isNaN(dataDec) ? '—' : dataDec}</span>
          </div>
          <div className="dip-desc">
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
    <div className="display-assembly">
      <div className="display-bezel">
        {/* Address section */}
        <div className="display-group">
          <div className="display-label-top">ADDRESS</div>
          <div className="display-digits">
            {addrChars.map((ch, i) => (
              <div key={i} className="digit-wrapper">
                <SingleDigit char={ch} glowing={ch !== '-' && ch !== ' '} />
              </div>
            ))}
          </div>
        </div>

        <div className="display-separator" />

        {/* Data section */}
        <div className="display-group">
          <div className="display-label-top">DATA</div>
          <div className="display-digits">
            {dataChars.map((ch, i) => (
              <div key={i} className="digit-wrapper">
                <SingleDigit char={ch} glowing={ch !== '-' && ch !== ' '} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
