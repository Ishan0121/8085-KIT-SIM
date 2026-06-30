# 8085 Trainer Kit Simulator

A modern, web-based digital twin of the classic Intel 8085 Microprocessor Trainer Kit. Built with React and Vite, this simulator provides a hands-on learning experience for writing, debugging, and executing 8085 assembly language programs directly in your browser.

## 🚀 Features

- **High-Fidelity Interface:** Authentic 7-segment display, hex keypad layout, Opcode Translator LCD, and LED Flag Indicators, mirroring physical trainer kits.
- **Cycle-Accurate Simulation Engine:** Generator-based CPU core with T-state yielding and full support for both standard and undocumented status flags (V, X5).
- **Integrated Assembler & Disassembler:** Write code with label support, compile directly to memory, and disassemble memory contents in real-time.
- **Advanced Execution Control:** Step-level debugging and execution control panel for analyzing instruction flow and hardware-level behavior.
- **Modern Sidebar Tools:**
  - **Live State Viewer:** Real-time monitoring of CPU registers and Flags with change highlighting.
  - **Memory Viewer:** Expandable, interactive hex grid to examine the 64KB memory space.
  - **Opcode Finder:** Quick lookup tool for 8085 mnemonics, hex codes, byte sizes, and machine cycles.
  - **Interactive IC Docs:** Clickable chips revealing pinout diagrams and external reference links.
  - **Import & Export:** Save your assembly programs and memory states as JSON files, and easily import them back.
- **Customizable Experience:** Resizable UI panels, dynamic phosphor-inspired color themes, and persistent configuration settings.

## 🛠️ Technology Stack

- **Core:** HTML5, CSS3, JavaScript (ES6+)
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Vanilla CSS with custom CSS variables and responsive design

## 💻 Installation & Running Locally

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/Ishan0121/8085-KIT-SIM.git
   cd 8085-KIT-SIM
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to the URL provided in your terminal (usually `http://localhost:5173` or `http://localhost:5174`).

## 📖 Usage Guide & Documentation

For detailed instructions on how to use the simulator, key combinations, and programming guides, please see the [Simulator Guide](Guide.md).

## 🗂️ Project Structure

```text
src/
├── components/          # React components (Keypad, Display, Sidebar, etc.)
├── data/                # Core 8085 data (Opcodes, Initial State, IC Info)
├── hooks/               # Custom React hooks (use8085 - core logic engine)
├── App.jsx              # Main application layout and wiring
├── App.css              # Global layout styles
└── index.css            # Design tokens and base styles
```

## 📜 License

This project is open-source. Feel free to use, modify, and distribute it for educational purposes.
