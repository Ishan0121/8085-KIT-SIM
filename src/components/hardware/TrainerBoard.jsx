import React from 'react';
import {
  DIPChip, CPUChip, Crystal, Cap, LED,
  DB9Connector, HeaderStrip, BatteryHolder, LogicIC, ResistorPack
} from './Chips';
import SevenSegDisplay from './SevenSegDisplay';
import Keypad from './Keypad';
import './TrainerBoard.css';

/**
 * PCB Silkscreen label
 */
function SilkLabel({ text, className = '', style = {} }) {
  return (
    <span className={`silk-label ${className}`} style={style}>{text}</span>
  );
}

/**
 * Main 8085 Trainer Kit PCB Board
 */
export default function TrainerBoard({ addressDisplay, dataDisplay, onKey, shifted, onChipInfo }) {
  return (
    <div className="trainer-enclosure">
      <div className="pcb-board flex-layout">
        <div className="mount-hole mount-tl" />
        <div className="mount-hole mount-tr" />
        <div className="mount-hole mount-bl" />
        <div className="mount-hole mount-br" />

        <SilkLabel text="8085 MICROPROCESSOR KIT" className="board-title-label" />

        <div className="board-content">
          {/* Left Column: CPU & Memory */}
          <div className="board-col left-col">
            <div className="chip-group">
               <CPUChip label="8085A" subLabel="CPU" onInfo={onChipInfo} />
            </div>
            
            <div className="chip-row">
              <div className="chip-group">
                <DIPChip label="8155" subLabel="RAM+I/O" pins={40} onInfo={onChipInfo} orient="h" />
                <SilkLabel text="U1" className="silk-small" />
              </div>
              <div className="chip-group">
                <DIPChip label="8255" subLabel="PPI" pins={40} onInfo={onChipInfo} orient="h" />
                <SilkLabel text="U2" className="silk-small" />
              </div>
            </div>

            <div className="chip-row">
               <div className="chip-group">
                 <DIPChip label="6264" subLabel="RAM" pins={28} onInfo={onChipInfo} large />
                 <SilkLabel text="MEM0" className="silk-small" />
               </div>
               <div className="chip-group">
                 <DIPChip label="6264" subLabel="RAM" pins={28} onInfo={onChipInfo} large />
                 <SilkLabel text="MEM1" className="silk-small" />
               </div>
            </div>

            <div className="misc-group">
               <LogicIC label="74373" />
               <Crystal />
               <Cap blue />
               <BatteryHolder />
            </div>
          </div>

          {/* Right Column: Display & Keypad & Peripherals */}
          <div className="board-col right-col">
            
            <div className="top-peripherals">
              <div className="chip-group">
                <DIPChip label="8253" subLabel="TIMER" pins={24} onInfo={onChipInfo} />
                <SilkLabel text="U5 Timer" className="silk-small" />
              </div>
              <div className="chip-group">
                 <DIPChip label="2764" subLabel="EPROM" pins={28} onInfo={onChipInfo} large />
                 <SilkLabel text="Monitor ROM" className="silk-small" />
              </div>
              <div className="conn-group">
                <DB9Connector />
                <SilkLabel text="RS-232" className="silk-small" />
              </div>
            </div>

            <div className="display-area-wrapper">
              <div className="indicator-leds">
                <div className="led-group">
                  <LED color="red" on />
                  <SilkLabel text="PWR" className="silk-small" />
                </div>
                <div className="led-group">
                  <LED color="yellow" />
                  <SilkLabel text="RUN" className="silk-small" />
                </div>
              </div>
              <div className="display-area">
                <SevenSegDisplay addressValue={addressDisplay} dataValue={dataDisplay} />
              </div>
            </div>

            <div className="keypad-area">
              <Keypad onKey={onKey} shifted={shifted} />
            </div>

          </div>
        </div>

        <svg className="pcb-traces" aria-hidden="true">
          <line x1="10%" y1="18%" x2="62%" y2="18%" strokeWidth="1.5" />
          <line x1="10%" y1="20%" x2="62%" y2="20%" strokeWidth="1" />
          <line x1="10%" y1="22%" x2="62%" y2="22%" strokeWidth="0.8" />
        </svg>

      </div>
    </div>
  );
}
