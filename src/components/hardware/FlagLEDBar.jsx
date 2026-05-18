import React from 'react';
import './FlagLEDBar.css';

/**
 * 8085 flags in hardware register order.
 * Grouped: [arithmetic/logic] | [carry, interrupt]
 */
const FLAG_GROUPS = [
  [
    { key: 'S',   label: 'S',   color: 'amber',  title: 'Sign — result is negative (MSB=1)' },
    { key: 'Z',   label: 'Z',   color: 'green',  title: 'Zero — result is zero' },
    { key: 'X5',  label: 'X5',  color: 'blue',   title: 'Undocumented bit 5 (K flag)' },
    { key: 'AC',  label: 'AC',  color: 'cyan',   title: 'Auxiliary Carry — carry from bit 3→4' },
    { key: 'P',   label: 'P',   color: 'violet', title: 'Parity — even number of 1-bits in result' },
    { key: 'V',   label: 'V',   color: 'pink',   title: 'Overflow — undocumented signed overflow (bit 1)' },
  ],
  [
    { key: 'CY',  label: 'CY',  color: 'red',    title: 'Carry — arithmetic carry or borrow' },
    { key: 'IE',  label: 'IE',  color: 'teal',   title: 'Interrupt Enable — set after EI instruction' },
  ],
];

export default function FlagLEDBar({ flags }) {
  return (
    <div className="flag-led-bar" role="status" aria-label="CPU Flag Status">
      <span className="flag-led-bar__heading">FLAGS</span>

      <div className="flag-led-bar__leds">
        {FLAG_GROUPS.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <div className="flag-led-bar__sep" />}
            {group.map(({ key, label, color, title }) => {
              const isOn = Boolean(flags?.[key]);
              return (
                <div
                  key={key}
                  className={`flag-led-unit${isOn ? ' is-on' : ''}`}
                  title={`${label}: ${isOn ? 'SET' : 'CLEAR'}\n${title}`}
                  aria-label={`${label}: ${isOn ? 'SET' : 'CLEAR'}`}
                >
                  <div className={`flag-led flag-led--${color}${isOn ? ' is-on' : ''}`} />
                  <span className="flag-led-unit__label">{label}</span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
