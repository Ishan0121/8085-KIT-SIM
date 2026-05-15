import React from 'react';
import { X } from 'lucide-react';
import './ICInfoModal.css';

export default function ICInfoModal({ info, onClose }) {
  if (!info) return null;
  
  const half = Math.ceil(info.pins / 2);
  const leftPins  = info.pinout ? info.pinout.slice(0, half) : [];
  const rightPins = info.pinout ? info.pinout.slice(half).reverse() : [];

  return (
    <div className="ic-modal-overlay" onClick={onClose}>
      <div className="ic-modal" onClick={e => e.stopPropagation()}>
        <button className="ic-modal-close" onClick={onClose}><X size={16} /></button>
        
        <div className="ic-modal-layout">
          {/* ── Info column ── */}
          <div className="ic-modal-info">
            <div className="ic-modal-chip">{info.label}</div>
            <div className="ic-modal-role">{info.role}</div>
            <div className="ic-modal-desc">{info.desc}</div>
            {info.link && (
              <a href={info.link} target="_blank" rel="noreferrer" className="ic-modal-link">
                Learn more on Wikipedia →
              </a>
            )}
          </div>

          {/* ── Pinout Diagram ── */}
          {info.pinout && (
            <div className="ic-pinout-diagram">
              {/* Left pins: name — metal — num (num closest to body) */}
              <div className="ic-dip-pins-left">
                {leftPins.map((pin, i) => (
                  <div key={`l-${i}`} className="ic-pin-row">
                    <span className="ic-pin-name">{pin}</span>
                    <span className="ic-pin-metal" />
                    <span className="ic-pin-num">{i + 1}</span>
                  </div>
                ))}
              </div>

              {/* IC body */}
              <div className="ic-dip-body">
                <div className="ic-dip-notch" />
                <div className="ic-dip-label">{info.label}</div>
              </div>

              {/* Right pins: num — metal — name (num closest to body) */}
              <div className="ic-dip-pins-right">
                {rightPins.map((pin, i) => (
                  <div key={`r-${i}`} className="ic-pin-row">
                    <span className="ic-pin-num">{info.pins - i}</span>
                    <span className="ic-pin-metal" />
                    <span className="ic-pin-name">{pin}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
