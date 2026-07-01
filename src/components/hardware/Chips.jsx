import React, { useState } from 'react';

/**
 * Realistic DIP IC component
 * @param {string} label - chip label (e.g. "8085", "8255")
 * @param {string} subLabel - secondary label (e.g. "CPU")
 * @param {number} pins - total number of pins (both sides combined)
 * @param {'h'|'v'} orient - horizontal or vertical orientation
 * @param {string} info - info object key for modal
 * @param {function} onInfo - callback when chip is clicked
 * @param {string} className - extra CSS class
 * @param {boolean} large - large chip variant
 */
function DIPChip({ label, subLabel, pins = 16, orient = 'h', onInfo, className = '', large = false }) {
  const [hovered, setHovered] = useState(false);
  const pinsPerSide = pins / 2;

  const pinEls = Array.from({ length: pinsPerSide }, (_, i) => (
    <div key={i} className="dip-pin" />
  ));

  return (
    <div
      className={`dip-chip ${orient === 'v' ? 'dip-v' : 'dip-h'} ${large ? 'dip-large' : ''} ${className} ${hovered ? 'dip-hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onInfo && onInfo(label)}
      title={`${label}${subLabel ? ' - ' + subLabel : ''} — Click to learn more`}
      role="button"
      tabIndex={0}
      aria-label={`${label} IC chip - click for info`}
    >
      <div className="dip-pins dip-pins-top">{pinEls}</div>
      <div className="dip-body">
        <div className="dip-notch" />
        <div className="dip-label">{label}</div>
        {subLabel && <div className="dip-sublabel">{subLabel}</div>}
      </div>
      <div className="dip-pins dip-pins-bottom">{pinEls}</div>
    </div>
  );
}

/**
 * PLCC / wide chip (like the main 8085 CPU)
 */
function CPUChip({ label, subLabel, onInfo }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`cpu-chip ${hovered ? 'cpu-hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onInfo && onInfo('8085')}
      title="Intel 8085 CPU — Click to learn more"
      role="button"
      tabIndex={0}
      aria-label="8085 CPU chip - click for info"
    >
      {/* Pins on left and right */}
      <div className="cpu-pins cpu-pins-left">
        {Array.from({ length: 20 }, (_, i) => <div key={i} className="cpu-pin" />)}
      </div>
      <div className="cpu-body">
        <div className="cpu-notch" />
        <div className="cpu-logo">Intel</div>
        <div className="cpu-label">{label}</div>
        {subLabel && <div className="cpu-sublabel">{subLabel}</div>}
        <div className="cpu-mark">© Intel Corp.</div>
        <div className="cpu-hatch" />
      </div>
      <div className="cpu-pins cpu-pins-right">
        {Array.from({ length: 20 }, (_, i) => <div key={i} className="cpu-pin" />)}
      </div>
    </div>
  );
}

/**
 * Small SIP resistor network
 */
function ResistorPack({ count = 8 }) {
  return (
    <div className="resistor-pack">
      <div className="rpack-body">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="rpack-pin" />
        ))}
        <span className="rpack-label">{count}×R</span>
      </div>
    </div>
  );
}

/**
 * Crystal oscillator component
 */
function Crystal() {
  return (
    <div className="crystal" title="Crystal Oscillator - 6.144 MHz">
      <div className="crystal-body">
        <div className="crystal-leg" />
        <div className="crystal-can" />
        <div className="crystal-leg" />
      </div>
    </div>
  );
}

/**
 * Electrolytic capacitor
 */
function Cap({ blue = false }) {
  return (
    <div className={`cap ${blue ? 'cap-blue' : 'cap-black'}`}>
      <div className="cap-top" />
    </div>
  );
}

/**
 * LED indicator
 */
function LED({ color = 'red', on = false }) {
  return (
    <div className={`led-indicator led-${color} ${on ? 'led-on' : ''}`} />
  );
}

/**
 * DB-9 connector (RS-232 port visible in reference image)
 */
function DB9Connector() {
  return (
    <div className="db9-connector" title="RS-232 Serial Port (DB-9)">
      <div className="db9-shell">
        <div className="db9-row">
          {Array.from({ length: 5 }, (_, i) => <div key={i} className="db9-pin" />)}
        </div>
        <div className="db9-row">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="db9-pin" />)}
        </div>
        <div className="db9-label">RS-232</div>
      </div>
    </div>
  );
}

/**
 * Edge connector / header strip
 */
function HeaderStrip({ pins = 20, label = '', vertical = false }) {
  return (
    <div className={`header-strip ${vertical ? 'header-v' : 'header-h'}`} title={label || `${pins}-pin header`}>
      {Array.from({ length: pins }, (_, i) => (
        <div key={i} className="header-pin" />
      ))}
      {label && <span className="header-label">{label}</span>}
    </div>
  );
}

/**
 * Battery holder
 */
function BatteryHolder() {
  return (
    <div className="battery-holder" title="Battery Backup">
      <div className="battery-body">
        <div className="battery-plus">+</div>
        <div className="battery-minus">−</div>
        <div className="battery-label">BATT</div>
      </div>
    </div>
  );
}

/**
 * Small logic IC (14-16 pin)
 */
function LogicIC({ label }) {
  return (
    <div className="logic-ic" title={label}>
      <div className="logic-pins logic-pins-top">
        {Array.from({ length: 7 }, (_, i) => <div key={i} className="logic-pin" />)}
      </div>
      <div className="logic-body">
        <div className="logic-label">{label}</div>
      </div>
      <div className="logic-pins logic-pins-bottom">
        {Array.from({ length: 7 }, (_, i) => <div key={i} className="logic-pin" />)}
      </div>
    </div>
  );
}

export { DIPChip, CPUChip, Crystal, Cap, LED, DB9Connector, HeaderStrip, BatteryHolder, LogicIC, ResistorPack };
