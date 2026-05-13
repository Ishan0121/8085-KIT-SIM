# 8085 Trainer Kit Simulator

A modern, web-based digital twin of the classic Intel 8085 Microprocessor Trainer Kit. Built with React and Vite, this simulator provides a hands-on learning experience for writing, debugging, and executing 8085 assembly language programs directly in your browser.

## 🚀 Features

- **High-Fidelity Interface:** Authentic 7-segment display and hex keypad layout, mirroring the physical trainer kits used in microprocessor labs.
- **Modern Sidebar Tools:**
  - **Live State Viewer:** Real-time monitoring of CPU registers (A, B, C, D, E, H, L, PC, SP) and Flags (S, Z, AC, P, CY) with change highlighting.
  - **Memory Viewer:** Interactive hex grid to examine and navigate the 64KB memory space.
  - **Opcode Finder:** Quick lookup tool for 8085 mnemonics, hex codes, byte sizes, and machine cycles.
  - **Execution Log:** Scrollable history of your operations and inputs.
  - **Key Reference:** Built-in guide for keypad functions and keyboard shortcuts.
  - **Sample Programs:** One-click loading of pre-written assembly programs (e.g., Block Move, Fill Memory) into memory.
- **Full Keyboard Support:** Map your physical keyboard to the trainer kit's keypad for rapid data entry.
- **Dark/Light Mode:** Responsive themes to suit your environment.

## 🛠️ Technology Stack

- **Core:** HTML5, CSS3, JavaScript (ES6+)
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Vanilla CSS with custom CSS variables and responsive design

## 💻 Installation & Running Locally

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd 8085-SIM
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
