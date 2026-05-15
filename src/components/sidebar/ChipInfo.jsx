import React from 'react';
import { IC_INFO } from '../../data/cpu8085';

export default function ChipInfo({ setIcInfoKey }) {
  const chips = Object.entries(IC_INFO);
  return (
    <div className="sb-section">
      <div className="sb-section-title">IC Chip Reference</div>
      <div className="chip-list">
        {chips.map(([id, info]) => (
          <div
            key={id}
            className="chip-card"
            onClick={() => setIcInfoKey(id)}
          >
            <div className="chip-card-header">
              <span className="chip-card-label">{info.label}</span>
              <span className="chip-card-role">{info.role}</span>
              <span className="chip-card-pins">{info.pins}p</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
