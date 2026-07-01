import React from 'react';
import { OPCODES, toHex } from '../../data/cpu8085';

export default function RealtimeTranslator({ dataValue, memory, currentAddr, memBaseAddr }) {
  const isHex = /^[0-9A-F]{2}$/i.test(dataValue);
  
  // Create a virtual accessor that returns the real-time typed data for the current address
  const getByte = (addr) => {
    if (addr === currentAddr && isHex) {
      return parseInt(dataValue, 16);
    }
    return memory[addr] ?? 0;
  };

  let text = 'DATA / UNKNOWN';
  let subtext = '';

  let addr = memBaseAddr ?? 0x2000;
  if (currentAddr < addr) {
    addr = currentAddr;
  }

  // Scan memory from base address to find the instruction containing currentAddr
  while (addr <= currentAddr && addr < 0xFFFF) {
    const opcodeHex = getByte(addr);
    const opInfo = OPCODES[opcodeHex];
    
    let bytes = 1;
    let mnemonic = 'DATA / UNKNOWN';
    let tempSubtext = '';
    
    if (opInfo) {
      bytes = opInfo.bytes;
      mnemonic = opInfo.mnemonic;
      tempSubtext = `${opInfo.bytes}B / ${opInfo.cycles}C`;
      
      // Append operands for 2 and 3 byte instructions
      if (bytes === 2 && addr + 1 <= 0xFFFF) {
        const d8 = toHex(getByte(addr + 1));
        mnemonic = mnemonic.includes(' ') ? `${mnemonic}, ${d8}H` : `${mnemonic} ${d8}H`;
      } else if (bytes === 3 && addr + 2 <= 0xFFFF) {
        const d16 = toHex((getByte(addr + 2) << 8) | getByte(addr + 1), 4);
        mnemonic = mnemonic.includes(' ') ? `${mnemonic}, ${d16}H` : `${mnemonic} ${d16}H`;
      }
    }

    if (currentAddr >= addr && currentAddr < addr + bytes) {
      // currentAddr is within this instruction block
      text = mnemonic;
      subtext = tempSubtext;
      break;
    }
    addr += bytes;
  }

  return (
    <div className="m-[2px] px-3 py-1.5 bg-emerald-950 border-2 border-emerald-900 border-b-emerald-800 rounded flex justify-between items-center font-mono text-emerald-400 shadow-[inset_0_0_10px_rgba(52,211,153,0.1)]">
      <div className="flex flex-col">
        <span className="text-[10px] text-emerald-600 font-bold tracking-[1px] uppercase">Opcode Translator</span>
        <span className="text-base font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">
          {text}
        </span>
      </div>
      <div className="text-xs text-emerald-600 text-right">
        {subtext}
      </div>
    </div>
  );
}
