import React from 'react';
import { X } from 'lucide-react';
export default function ICInfoModal({ info, onClose }) {
  if (!info) return null;
  
  const half = Math.ceil(info.pins / 2);
  const leftPins  = info.pinout ? info.pinout.slice(0, half) : [];
  const rightPins = info.pinout ? info.pinout.slice(half).reverse() : [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-5 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-8 w-full max-w-[820px] max-h-[90vh] overflow-y-auto relative shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_80px_rgba(0,229,255,0.08)] animate-in slide-in-from-bottom-6 zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 bg-slate-800 border border-slate-700 rounded-md text-slate-400 w-8 h-8 flex items-center justify-center cursor-pointer transition-all hover:border-cyan-500 hover:text-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] z-10" onClick={onClose}><X size={16} /></button>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-start">
          {/* ── Info column ── */}
          <div className="flex flex-col min-w-0">
            <div className="font-orbitron text-[26px] font-black text-cyan-400 drop-shadow-[0_0_14px_rgba(6,182,212,0.5)] leading-tight mb-2">{info.label}</div>
            <div className="font-inter text-[11px] font-extrabold text-orange-400 tracking-[1.5px] uppercase mb-4">{info.role}</div>
            <div className="font-inter text-[14px] text-slate-300 leading-relaxed mb-6">{info.desc}</div>
            {info.link && (
              <a href={info.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-cyan-400 text-[13px] font-semibold no-underline border border-cyan-500/30 rounded-md px-4 py-2 bg-cyan-900/10 transition-all hover:bg-cyan-900/20 hover:border-cyan-400 hover:shadow-[0_0_16px_rgba(6,182,212,0.3)] w-fit mt-auto">
                Learn more on Wikipedia →
              </a>
            )}
          </div>

          {/* ── Pinout Diagram ── */}
          {info.pinout && (
            <div className="flex flex-row items-stretch shrink-0 self-center justify-center max-sm:w-full">
              {/* Left pins: name — metal — num (num closest to body) */}
              <div className="flex flex-col">
                {leftPins.map((pin, i) => (
                  <div key={`l-${i}`} className="flex items-center h-5 justify-end">
                    <span className="font-mono text-[10px] text-slate-300 whitespace-nowrap px-1.5 leading-none text-right">{pin}</span>
                    <span className="w-2.5 h-[3px] bg-[linear-gradient(90deg,#8a6a28,#c8a84b,#8a6a28)] shrink-0" />
                    <span className="font-mono text-[9px] text-slate-500 w-[18px] text-center shrink-0 leading-none">{i + 1}</span>
                  </div>
                ))}
              </div>

              {/* IC body */}
              <div className="bg-[linear-gradient(170deg,#1c1c1c_0%,#101010_60%,#080808_100%)] border border-[#282828] rounded flex flex-col items-center justify-center w-[72px] min-h-[40px] shadow-[0_6px_20px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.5)] relative">
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-5 h-2.5 bg-[#060606] rounded-b-[10px] border border-t-0 border-[#282828]" />
                <div className="[writing-mode:vertical-rl] rotate-180 font-orbitron text-[8px] font-bold text-[#2c2c2c] tracking-[4px] uppercase select-none py-1.5 whitespace-nowrap">{info.label}</div>
              </div>

              {/* Right pins: num — metal — name (num closest to body) */}
              <div className="flex flex-col">
                {rightPins.map((pin, i) => (
                  <div key={`r-${i}`} className="flex items-center h-5 justify-start">
                    <span className="font-mono text-[9px] text-slate-500 w-[18px] text-center shrink-0 leading-none">{info.pins - i}</span>
                    <span className="w-2.5 h-[3px] bg-[linear-gradient(270deg,#8a6a28,#c8a84b,#8a6a28)] shrink-0" />
                    <span className="font-mono text-[10px] text-slate-300 whitespace-nowrap px-1.5 leading-none text-left">{pin}</span>
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
