/**
 * Intel HEX checksum calculation
 */
function calculateChecksum(dataBytes) {
  let sum = 0;
  for (let i = 0; i < dataBytes.length; i++) {
    sum = (sum + dataBytes[i]) & 0xFF;
  }
  return ((~sum) + 1) & 0xFF;
}

/**
 * Get non-zero memory segments to minimize output size.
 * Returns an array of blocks: { startAddr: number, data: Uint8Array }
 */
function getMemoryBlocks(memory) {
  const blocks = [];
  let currentBlock = null;

  for (let i = 0; i < memory.length; i++) {
    if (memory[i] !== 0) {
      if (!currentBlock) {
        currentBlock = { startAddr: i, data: [] };
      }
      currentBlock.data.push(memory[i]);
    } else {
      // Check if we have a gap of 0s. Let's say a gap of > 16 bytes ends a block.
      if (currentBlock) {
        let gapLength = 1;
        while (i + gapLength < memory.length && memory[i + gapLength] === 0 && gapLength <= 16) {
          gapLength++;
        }
        if (gapLength > 16 || i + gapLength === memory.length) {
          blocks.push({ ...currentBlock, data: new Uint8Array(currentBlock.data) });
          currentBlock = null;
        } else {
          currentBlock.data.push(0); // keep the 0 as part of the block
        }
      }
    }
  }
  if (currentBlock) {
    blocks.push({ ...currentBlock, data: new Uint8Array(currentBlock.data) });
  }
  return blocks;
}

/**
 * Export Memory
 * format: 'json', 'hex', 'bin'
 */
export function exportMemory(memory, format = 'json', projectName = '8085_memory') {
  const blocks = getMemoryBlocks(memory);

  if (format === 'json') {
    // Simply map address -> byte value for non-zero addresses
    const obj = {};
    for (let i = 0; i < memory.length; i++) {
      if (memory[i] !== 0) {
        obj[i.toString(16).padStart(4, '0').toUpperCase()] = memory[i].toString(16).padStart(2, '0').toUpperCase();
      }
    }
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${projectName}.json`);
  } 
  else if (format === 'hex') {
    // Intel HEX format
    let hexString = '';
    for (const block of blocks) {
      let offset = 0;
      while (offset < block.data.length) {
        const chunkSize = Math.min(16, block.data.length - offset);
        const addr = block.startAddr + offset;
        const recordType = 0; // Data record
        
        const dataBytes = [chunkSize, (addr >> 8) & 0xFF, addr & 0xFF, recordType];
        for (let i = 0; i < chunkSize; i++) {
          dataBytes.push(block.data[offset + i]);
        }
        
        const checksum = calculateChecksum(dataBytes);
        dataBytes.push(checksum);
        
        hexString += ':' + dataBytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('') + '\n';
        offset += chunkSize;
      }
    }
    hexString += ':00000001FF\n'; // End of File record
    
    const blob = new Blob([hexString], { type: 'text/plain' });
    downloadBlob(blob, `${projectName}.hex`);
  }
  else if (format === 'bin') {
    // For BIN, we just dump the whole 64KB memory array as binary.
    // Or we could try to determine the highest used address. Let's dump all 64KB to be safe.
    const blob = new Blob([memory.buffer], { type: 'application/octet-stream' });
    downloadBlob(blob, `${projectName}.bin`);
  }
}

/**
 * Import Memory
 * Parses the file and populates the provided memory array (Uint8Array).
 * Returns true on success, false on failure.
 */
export async function importMemoryFile(file, memory) {
  const name = file.name.toLowerCase();
  
  if (name.endsWith('.json')) {
    const text = await file.text();
    try {
      const obj = JSON.parse(text);
      for (const [addrHex, valHex] of Object.entries(obj)) {
        const addr = parseInt(addrHex, 16);
        const val = parseInt(valHex, 16);
        if (!isNaN(addr) && !isNaN(val) && addr >= 0 && addr < 65536) {
          memory[addr] = val & 0xFF;
        }
      }
      return true;
    } catch (e) {
      console.error('Invalid JSON memory file', e);
      return false;
    }
  } 
  else if (name.endsWith('.hex')) {
    const text = await file.text();
    const lines = text.split('\n');
    for (const line of lines) {
      const trimLine = line.trim();
      if (!trimLine || trimLine[0] !== ':') continue;
      
      const byteCount = parseInt(trimLine.substring(1, 3), 16);
      const address = parseInt(trimLine.substring(3, 7), 16);
      const recordType = parseInt(trimLine.substring(7, 9), 16);
      
      if (recordType === 0) { // Data record
        for (let i = 0; i < byteCount; i++) {
          const val = parseInt(trimLine.substring(9 + (i * 2), 11 + (i * 2)), 16);
          if (address + i < 65536) {
            memory[address + i] = val & 0xFF;
          }
        }
      }
    }
    return true;
  }
  else if (name.endsWith('.bin')) {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    for (let i = 0; i < Math.min(memory.length, data.length); i++) {
      memory[i] = data[i];
    }
    return true;
  }
  
  return false; // Unknown format
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
