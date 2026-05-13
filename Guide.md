# 8085 Simulator Guide

Welcome to the 8085 Trainer Kit Simulator! This guide will help you understand the interface, master the keyboard shortcuts, and learn how to write, load, and execute assembly programs.

---

## 🖥️ Interface Overview

The simulator consists of two main areas:
1. **Main Screen:** The Trainer Kit hardware interface.
   - **7-Segment Display:** Shows the current 16-bit memory address (left 4 digits) and the 8-bit data stored at that address (right 2 digits).
   - **Hex Keypad:** Used for entering hex values (0-9, A-F) and executing commands.
2. **Left Sidebar:** Modern developer tools.
   - Expand the sidebar by clicking the icons to access Registers, Memory Viewer, Opcode reference, Execution Log, Keypad Reference, Chip info, and Sample Programs.

---

## ⌨️ Keypad & Keyboard Shortcuts

You can click the buttons on the screen or use your physical keyboard for faster entry.

| Keypad Key | Physical Keyboard | Function Description |
|------------|-------------------|----------------------|
| **RESET** | `Esc` | Resets the CPU to its initial state (PC = 0000H). |
| **GO** | `G` | Execute a program starting from the currently selected address. |
| **MEMC NEXT** | `N` | Advance to the next memory address. Crucial for entering sequential data. |
| **INS DATA** | `I` | Insert a byte at the current memory location. |
| **DEL DATA** | `Delete` | Delete a byte at the current memory location. |
| **EXREG / SI** | `X` | Examine Registers. Cycles through A, B, C, D, E, H, L, PC, SP. |
| **SHIFT** | `Shift` | Activates secondary (shift) functions of the keys. |
| **B.M** | `M` | Block Move memory operation. |
| **FILL +** | `+` | Fill a memory range with a constant byte. |
| **VCT INT** | `V` | Vectored Interrupt (Triggers RST 7.5 / 6.5 / 5.5). |
| **REL EXMEM** | `R` | Relocate or examine extended memory. |
| **STRING PRE** | `S` | String operation preset. |
| **0-9, A-F** | `0-9`, `A-F` | Hexadecimal data/address entry. |

---

## 🛠️ How-To Guides

### 1. How to Input a Program into Memory

1. **Set the Starting Address:**
   - Ensure the system is ready (press **RESET** / `Esc` if necessary).
   - The display should prompt you to enter an address (default is often 2000H or 8000H).
   - Type the 4-digit hexadecimal address using the keypad/keyboard (e.g., `8 0 0 0`).
   - Press **MEMC NEXT** (`N`) to confirm the address. The display will show the address on the left and its current data on the right.
2. **Enter Data (Opcodes and Operands):**
   - Type the 2-digit hex opcode for your instruction (e.g., `3 E` for `MVI A`).
   - Press **MEMC NEXT** (`N`) to save the data and automatically advance to the next address.
   - Repeat this process for all bytes in your program.
3. **End the Program:**
   - Most programs should end with the `RST 5` (`EF` hex) instruction or `HLT` (`76` hex) to return control to the monitor or stop execution cleanly.

### 2. How to Execute a Program

1. Press **RESET** (`Esc`).
2. Press **GO** (`G`).
3. Enter the starting address of your program (e.g., `8 0 0 0`).
4. Press **GO** again (or the appropriate execution key based on your kit's specific monitor routine) to run the code.
5. Check the **Execution Log** in the sidebar to verify execution.

### 3. How to Examine Memory and Registers

- **Examine Memory:** Use the **Memory Viewer** in the sidebar. You can type an address in the jump box to instantly view a 16-byte block of memory starting from that location.
- **Examine Registers:** Open the **Registers** tab in the sidebar. It updates in real-time as programs execute or as you step through code. Modified registers will flash yellow. Alternatively, use the **EXREG** (`X`) key to cycle through registers on the 7-segment display.

---

## 📁 Using Sample Programs

To get started quickly, the simulator includes pre-written sample programs. 

1. Open the **Sidebar**.
2. Click the folder icon (**Programs**).
3. Click **Load →** on any of the available programs (e.g., "Block Move", "Fill Memory", "Sum of Series").
4. The program's opcodes will be instantly loaded into the specified memory addresses (e.g., 8000H).
5. You can then use the **GO** command to execute it from its starting address, or explore the loaded bytes using the Memory Viewer.

---

## 💡 Tips and Tricks

- **Address Entry Mistakes:** If you make a mistake while typing a 4-digit address or 2-digit data byte, simply keep typing. The input buffer shifts left, so the last 4 (or 2) digits entered are what will be used.
- **Opcode Lookup:** Don't memorize hex codes! Use the **Opcode Finder** (magnifying glass icon) in the sidebar. You can search by mnemonic (e.g., `MOV`) or by hex code (e.g., `3E`).
- **Live Feedback:** Keep the Registers or Memory sidebar panel open while loading or running code to instantly verify your results.
