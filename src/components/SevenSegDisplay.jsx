import React, { useState, useEffect, useRef } from 'react';
import './SevenSegDisplay.css';

// Segment paths for a single 7-segment digit
// Segments: a(top), b(top-right), c(bottom-right), d(bottom), e(bottom-left), f(top-left), g(middle)
const SEG_PATHS = {
  a: 'M 3 2 L 5 0 L 19 0 L 21 2 L 19 4 L 5 4 Z',
  b: 'M 22 3 L 24 5 L 24 19 L 22 21 L 20 19 L 20 5 Z',
  c: 'M 22 23 L 24 25 L 24 39 L 22 41 L 20 39 L 20 25 Z',
  d: 'M 3 42 L 5 40 L 19 40 L 21 42 L 19 44 L 5 44 Z',
  e: 'M 2 23 L 4 25 L 4 39 L 2 41 L 0 39 L 0 25 Z',
  f: 'M 2 3 L 4 5 L 4 19 L 2 21 L 0 19 L 0 5 Z',
  g: 'M 3 22 L 5 20 L 19 20 L 21 22 L 19 24 L 5 24 Z',
};

// Which segments to light for each hex digit
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
      {/* Bezel */}
      <div className="display-bezel">
        {/* Address section - 4 digits */}
        <div className="display-group">
          <div className="display-label-top">ADDRESS DISPLAY</div>
          <div className="display-digits">
            {addrChars.map((ch, i) => (
              <div key={i} className="digit-wrapper">
                <SingleDigit char={ch} glowing={ch !== '-' && ch !== ' '} />
              </div>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="display-separator" />

        {/* Data section - 2 digits */}
        <div className="display-group">
          <div className="display-label-top">DATA DISPLAY</div>
          <div className="display-digits">
            {dataChars.map((ch, i) => (
              <div key={i} className="digit-wrapper">
                <SingleDigit char={ch} glowing={ch !== '-' && ch !== ' '} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Labels below display */}
      <div className="display-bottom-labels">
        <span>ADDRESS</span>
        <span>DATA</span>
      </div>
    </div>
  );
}
