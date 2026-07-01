import React from 'react';

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

// Replaces the complex CSS classes with a functional mapping
const getLEDColorStyles = (color, isOn) => {
  const OFF_GRADIENTS = {
    amber:  'radial-gradient(circle at 38% 32%, #2a1800 0%, #110900 100%)',
    green:  'radial-gradient(circle at 38% 32%, #012008 0%, #010d04 100%)',
    blue:   'radial-gradient(circle at 38% 32%, #001228 0%, #00060f 100%)',
    cyan:   'radial-gradient(circle at 38% 32%, #001c22 0%, #000c0f 100%)',
    violet: 'radial-gradient(circle at 38% 32%, #120022 0%, #07000f 100%)',
    pink:   'radial-gradient(circle at 38% 32%, #200010 0%, #0d0008 100%)',
    red:    'radial-gradient(circle at 38% 32%, #220000 0%, #0d0000 100%)',
    teal:   'radial-gradient(circle at 38% 32%, #001e1c 0%, #000c0b 100%)',
  };

  const ON_GRADIENTS = {
    amber:  'radial-gradient(circle at 35% 30%, #ffe08a 0%, #ffb020 45%, #cc7800 100%)',
    green:  'radial-gradient(circle at 35% 30%, #a0ffcc 0%, #22dd66 45%, #0e8840 100%)',
    blue:   'radial-gradient(circle at 35% 30%, #aaccff 0%, #2288ff 45%, #0044cc 100%)',
    cyan:   'radial-gradient(circle at 35% 30%, #aaffff 0%, #00e5ff 45%, #008899 100%)',
    violet: 'radial-gradient(circle at 35% 30%, #ddb0ff 0%, #a855f7 45%, #6600cc 100%)',
    pink:   'radial-gradient(circle at 35% 30%, #ffc8e8 0%, #f472b6 45%, #aa3077 100%)',
    red:    'radial-gradient(circle at 35% 30%, #ff9988 0%, #ff3b1e 45%, #aa1100 100%)',
    teal:   'radial-gradient(circle at 35% 30%, #88ffee 0%, #14e5c8 45%, #009977 100%)',
  };

  const ON_SHADOWS = {
    amber:  '0 0 10px 3px rgba(255,176,32,0.7), 0 0 22px 6px rgba(255,176,32,0.35)',
    green:  '0 0 10px 3px rgba(34,221,102,0.7), 0 0 22px 6px rgba(34,221,102,0.35)',
    blue:   '0 0 10px 3px rgba(34,136,255,0.7), 0 0 22px 6px rgba(34,136,255,0.35)',
    cyan:   '0 0 10px 3px rgba(0,229,255,0.7), 0 0 22px 6px rgba(0,229,255,0.35)',
    violet: '0 0 10px 3px rgba(168,85,247,0.7), 0 0 22px 6px rgba(168,85,247,0.35)',
    pink:   '0 0 10px 3px rgba(244,114,182,0.7), 0 0 22px 6px rgba(244,114,182,0.35)',
    red:    '0 0 10px 3px rgba(255,59,30,0.7), 0 0 22px 6px rgba(255,59,30,0.35)',
    teal:   '0 0 10px 3px rgba(20,229,200,0.7), 0 0 22px 6px rgba(20,229,200,0.35)',
  };

  return {
    background: isOn ? ON_GRADIENTS[color] : OFF_GRADIENTS[color],
    boxShadow: isOn ? ON_SHADOWS[color] : 'none',
  };
};

export default function FlagLEDBar({ flags }) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-[40px] self-center bg-[linear-gradient(160deg,rgba(14,20,38,0.92)_0%,rgba(8,12,24,0.96)_100%)] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.6),0_4px_24px_rgba(0,0,0,0.55),0_1px_4px_rgba(0,0,0,0.8),0_0_0_1px_rgba(0,0,0,0.4)] shrink-0 z-10 max-sm:px-3 max-sm:py-[7px] max-sm:gap-2.5" role="status" aria-label="CPU Flag Status">
      <span className="font-mono text-[8.5px] font-bold tracking-[3px] uppercase text-slate-500 opacity-45 whitespace-nowrap pr-2 border-r border-white/5 max-sm:hidden">FLAGS</span>

      <div className="flex gap-3.5 items-center max-sm:gap-2.5">
        {FLAG_GROUPS.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <div className="w-[1px] h-[18px] bg-white/5 shrink-0" />}
            {group.map(({ key, label, color, title }) => {
              const isOn = Boolean(flags?.[key]);
              
              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-[5px] cursor-default select-none"
                  title={`${label}: ${isOn ? 'SET' : 'CLEAR'}\n${title}`}
                  aria-label={`${label}: ${isOn ? 'SET' : 'CLEAR'}`}
                >
                  {/* Mounting bezel */}
                  <div 
                    className={`relative w-[13px] h-[13px] rounded-full max-sm:w-[11px] max-sm:h-[11px] bg-[radial-gradient(circle_at_40%_35%,#1a1e2e_0%,#0a0c14_60%,#04050a_100%)] transition-all duration-[0.12s] ease-out ${isOn ? 'shadow-[0_2px_5px_rgba(0,0,0,0.8),0_0_0_1.5px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_2px_rgba(0,0,0,0.5)] animate-[led-pop_0.22s_cubic-bezier(0.34,1.56,0.64,1)]' : 'shadow-[0_1px_3px_rgba(0,0,0,0.9),0_0_0_1.5px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_2px_rgba(0,0,0,0.8)]'}`}
                  >
                    {/* Diffuse color lens */}
                    <div 
                      className="absolute inset-[2px] rounded-full transition-all duration-[0.12s] ease-out" 
                      style={getLEDColorStyles(color, isOn)} 
                    />
                    {/* Specular highlight */}
                    <div className={`absolute top-[2.5px] left-[2.5px] w-1 h-[3px] rounded-full bg-white/[0.28] pointer-events-none z-[2] transition-opacity duration-[0.12s] ease-out ${isOn ? 'opacity-100 bg-white/50' : 'opacity-70'}`} />
                  </div>
                  
                  <span className={`font-mono text-[8.5px] font-bold tracking-[0.5px] pr-[0.5px] uppercase whitespace-nowrap transition-all duration-[0.12s] max-sm:text-[7.5px] max-sm:pr-[0.5px] ${isOn ? 'opacity-90 text-slate-300' : 'opacity-50 text-slate-500'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
