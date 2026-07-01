import React from 'react';
import {
  DIPChip, CPUChip, Crystal, Cap, LED,
  DB9Connector, HeaderStrip, BatteryHolder, LogicIC, ResistorPack
} from './Chips';
import SevenSegDisplay from './SevenSegDisplay';
import Keypad from './Keypad';

/**
 * PCB Silkscreen label
 */
function SilkLabel({ text, className = '', style = {} }) {
  return (
    <span className={`font-mono text-pcb-silkscreen font-bold tracking-[1px] [text-shadow:0_1px_0_rgba(0,0,0,0.3)] pointer-events-none ${className}`} style={style}>{text}</span>
  );
}

/**
 * Main 8085 Trainer Kit PCB Board
 */
export default function TrainerBoard({ addressDisplay, dataDisplay, onKey, shifted, onChipInfo }) {
  return (
    <div className="bg-enclosure-bg rounded-lg p-[18px] relative flex [box-shadow:0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05),inset_0_-2px_10px_rgba(0,0,0,0.6)]">
      <div className="relative bg-pcb-green rounded-sm border border-[rgba(0,0,0,0.6)] [box-shadow:inset_0_2px_5px_rgba(255,255,255,0.18),inset_0_-2px_10px_rgba(0,0,0,0.4)] bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:10px_10px] p-6 flex flex-col w-full h-full">
        <div className="absolute w-3 h-3 bg-[#0a0a0a] rounded-full border-2 border-[#9aaa9a] [box-shadow:inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_1px_rgba(255,255,255,0.28)] top-3 left-3" />
        <div className="absolute w-3 h-3 bg-[#0a0a0a] rounded-full border-2 border-[#9aaa9a] [box-shadow:inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_1px_rgba(255,255,255,0.28)] top-3 right-3" />
        <div className="absolute w-3 h-3 bg-[#0a0a0a] rounded-full border-2 border-[#9aaa9a] [box-shadow:inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_1px_rgba(255,255,255,0.28)] bottom-3 left-3" />
        <div className="absolute w-3 h-3 bg-[#0a0a0a] rounded-full border-2 border-[#9aaa9a] [box-shadow:inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_1px_rgba(255,255,255,0.28)] bottom-3 right-3" />

        <SilkLabel text="8085 MICROPROCESSOR KIT" className="absolute bottom-3 right-10 text-[14px] tracking-[2px] opacity-90" />

        <div className="flex gap-[30px] mt-5 relative z-10">
          {/* Left Column: CPU & Memory */}
          <div className="flex flex-col gap-5 flex-none items-center">
            <div className="flex flex-col items-center gap-1">
               <CPUChip label="8085A" subLabel="CPU" onInfo={onChipInfo} />
            </div>
            
            <div className="flex gap-5 items-end">
              <div className="flex flex-col items-center gap-1">
                <DIPChip label="8155" subLabel="RAM+I/O" pins={40} onInfo={onChipInfo} orient="h" />
                <SilkLabel text="U1" className="text-[9px] opacity-80 tracking-[0.5px]" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <DIPChip label="8255" subLabel="PPI" pins={40} onInfo={onChipInfo} orient="h" />
                <SilkLabel text="U2" className="text-[9px] opacity-80 tracking-[0.5px]" />
              </div>
            </div>

            <div className="flex gap-5 items-end">
               <div className="flex flex-col items-center gap-1">
                 <DIPChip label="6264" subLabel="RAM" pins={28} onInfo={onChipInfo} large />
                 <SilkLabel text="MEM0" className="text-[9px] opacity-80 tracking-[0.5px]" />
               </div>
               <div className="flex flex-col items-center gap-1">
                 <DIPChip label="6264" subLabel="RAM" pins={28} onInfo={onChipInfo} large />
                 <SilkLabel text="MEM1" className="text-[9px] opacity-80 tracking-[0.5px]" />
               </div>
            </div>

            <div className="flex gap-3 items-center mt-2.5">
               <LogicIC label="74373" />
               <Crystal />
               <Cap blue />
               <BatteryHolder />
            </div>
          </div>

          {/* Right Column: Display & Keypad & Peripherals */}
          <div className="flex flex-col gap-5 flex-1 items-center">
            
            <div className="flex gap-5 items-end mb-5 w-full justify-around">
              <div className="flex flex-col items-center gap-1">
                <DIPChip label="8253" subLabel="TIMER" pins={24} onInfo={onChipInfo} />
                <SilkLabel text="U5 Timer" className="text-[9px] opacity-80 tracking-[0.5px]" />
              </div>
              <div className="flex flex-col items-center gap-1">
                 <DIPChip label="2764" subLabel="EPROM" pins={28} onInfo={onChipInfo} large />
                 <SilkLabel text="Monitor ROM" className="text-[9px] opacity-80 tracking-[0.5px]" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <DB9Connector />
                <SilkLabel text="RS-232" className="text-[9px] opacity-80 tracking-[0.5px]" />
              </div>
            </div>

            <div className="flex gap-5 items-center bg-[rgba(0,0,0,0.18)] px-5 py-2.5 rounded-md border border-[rgba(0,0,0,0.3)] mb-5">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5">
                  <LED color="red" on />
                  <SilkLabel text="PWR" className="text-[9px] opacity-80 tracking-[0.5px]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <LED color="yellow" />
                  <SilkLabel text="RUN" className="text-[9px] opacity-80 tracking-[0.5px]" />
                </div>
              </div>
              <div className="relative">
                <SevenSegDisplay addressValue={addressDisplay} dataValue={dataDisplay} />
              </div>
            </div>

            <div className="relative">
              <Keypad onKey={onKey} shifted={shifted} />
            </div>

          </div>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]" aria-hidden="true">
          <line x1="10%" y1="18%" x2="62%" y2="18%" strokeWidth="1.5" />
          <line x1="10%" y1="20%" x2="62%" y2="20%" strokeWidth="1" />
          <line x1="10%" y1="22%" x2="62%" y2="22%" strokeWidth="0.8" />
        </svg>

      </div>
    </div>
  );
}
