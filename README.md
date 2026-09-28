# Cross Box 🎮

A modern, responsive, and feature-rich Tic-Tac-Toe web game built with pure vanilla HTML5, CSS3, and JavaScript.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Complete-success.svg)

---

## ✨ Features

- **🎮 Dual Game Modes**:
  - **2 Players (Pass & Play)**: Challenge a friend locally on the same device.
  - **vs Computer (AI)**: Play against a smart AI with strategic decision-making.
- **🎨 Modern Glassmorphic Dark UI**:
  - Cyberpunk-inspired ambient neon glows and floating background effects.
  - Smooth micro-animations for hover, tile clicks, and symbol placement.
  - Glowing winning line tiles with dynamic pulsing animations.
- **🏆 Victory Celebration & Modal**:
  - Interactive celebration overlay announcing the winner or draw.
  - Lightweight 60 FPS HTML5 Canvas confetti explosion on victory.
- **📊 Real-time Scoreboard**:
  - Tracks Player O wins, Player X / Computer wins, and Draws.
  - Persistent scores saved in your browser via `localStorage`.
- **🎵 Synthesized Sound FX (Web Audio API)**:
  - Zero external audio files required!
  - Distinct pleasant chimes for move placements, victory fanfares, and draws.
  - Sound toggle button (🔊 / 🔇) with saved preferences.
- **📱 Fully Responsive**:
  - Plays comfortably on smartphones, tablets, and desktops.

---

## 🚀 How to Run

1. Open `game.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari).
2. Enjoy playing Cross Box!

---

## 🕹️ Controls & Rules

- **Click any box** on the 3x3 grid to place your mark (`O` or `X`).
- Align three of your symbols horizontally, vertically, or diagonally to win.
- Use **Restart Round** to clear the board and start a new round without resetting scores.
- Use **↺ (Reset Scores)** to reset all scoreboard counters.
- Toggle between **2 Players** and **vs Computer** at any time using the mode selector.

---

## 🛠️ Built With

- **HTML5**: Semantic layout and accessible elements.
- **CSS3**: Custom design tokens, CSS Grid & Flexbox, glassmorphic filters, and keyframe animations.
- **JavaScript (ES6+)**: Turn management, Minimax-based AI logic, Canvas particle engine, and Web Audio API synthesizer.