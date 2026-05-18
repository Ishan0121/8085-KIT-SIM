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
    <div className="translator-lcd" style={{
      margin: '2px',
      padding: '6px 12px',
      backgroundColor: '#0a0f0d',
      border: '2px solid #1c2621',
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: "'JetBrains Mono', monospace",
      color: '#33ffaa',
      boxShadow: 'inset 0 0 10px rgba(51, 255, 170, 0.1)',
      borderBottom: '2px solid #2a3a32'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '10px', color: '#1f8a5c', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>Opcode Translator</span>
        <span style={{ fontSize: '16px', fontWeight: 'bold', textShadow: '0 0 5px rgba(51, 255, 170, 0.4)' }}>
          {text}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: '#1f8a5c', textAlign: 'right' }}>
        {subtext}
      </div>
    </div>
  );
}
