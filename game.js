// ==========================================
// CROSS BOX - MODERN TIC-TAC-TOE ENGINE
// ==========================================

// Sound Synthesizer via Web Audio API (No external assets required)
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    playTone(freq, type = "sine", duration = 0.15, gainVal = 0.12) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn("Audio play error", e);
        }
    }

    playMove(player) {
        if (player === "O") {
            // Bright cheerful chime
            this.playTone(523.25, "sine", 0.16, 0.15); // C5
        } else {
            // Snappy crisp tone
            this.playTone(440.0, "triangle", 0.16, 0.15); // A4
        }
    }

    playWin() {
        if (!this.enabled) return;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, "sine", 0.35, 0.18);
            }, idx * 110);
        });
    }

    playDraw() {
        if (!this.enabled) return;
        const notes = [440, 392, 349.23];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, "sawtooth", 0.22, 0.08);
            }, idx * 120);
        });
    }

    playClick() {
        this.playTone(800, "sine", 0.05, 0.05);
    }
}

// Particle / Confetti Generator
class ConfettiEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
        this.particles = [];
        this.animationId = null;
        this.colors = ["#00f2fe", "#4facfe", "#ff0844", "#ffb199", "#ffd200", "#7928ca", "#00dfd8"];

        this.resize();
        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    blast() {
        if (!this.ctx) return;
        this.resize();
        this.particles = [];
        const count = 90;

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: this.canvas.width / 2 + (Math.random() - 0.5) * 160,
                y: this.canvas.height * 0.45,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 1) * 18 - 4,
                size: Math.random() * 8 + 5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                decay: Math.random() * 0.012 + 0.008,
            });
        }

        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.loop();
    }

    loop() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let activeCount = 0;

        for (let p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.45; // Gravity
            p.rotation += p.rotSpeed;
            p.opacity -= p.decay;

            if (p.opacity > 0) {
                activeCount++;
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.globalAlpha = Math.max(0, p.opacity);
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                this.ctx.restore();
            }
        }

        if (activeCount > 0) {
            this.animationId = requestAnimationFrame(() => this.loop());
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// ==========================================
// GAME STATE & CONTROLLER
// ==========================================

const sounds = new SoundFX();
const confetti = new ConfettiEngine("confetti-canvas");

// Win Patterns (Rows, Columns, Diagonals)
const winPatterns = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Col 1
    [1, 4, 7], // Col 2
    [2, 5, 8], // Col 3
    [0, 4, 8], // Diagonal \
    [2, 4, 6], // Diagonal /
];

// DOM Elements
const boxes = document.querySelectorAll(".box");
const resetBtn = document.querySelector("#reset");
const resetScoreBtn = document.querySelector("#reset-score-btn");
const soundBtn = document.querySelector("#sound-btn");
const soundIcon = document.querySelector("#sound-icon");
const modeTabs = document.querySelectorAll(".mode-tab");

// Indicator Elements
const turnCard = document.querySelector("#turn-card");
const turnAvatar = document.querySelector("#turn-avatar");
const turnPlayerText = document.querySelector("#turn-player-text");
const turnPulseDot = document.querySelector(".turn-pulse-dot");

// Scoreboard Elements
const scoreOElem = document.querySelector("#score-o");
const scoreXElem = document.querySelector("#score-x");
const scoreTiesElem = document.querySelector("#score-ties");
const scoreCardO = document.querySelector("#score-card-o");
const scoreCardX = document.querySelector("#score-card-x");
const playerXLabel = document.querySelector("#player-x-label");

// Modal Elements
const modalOverlay = document.querySelector("#modal-overlay");
const modalIcon = document.querySelector("#modal-icon");
const modalTitle = document.querySelector("#modal-title");
const msgElem = document.querySelector("#msg");
const modalPlayAgainBtn = document.querySelector("#modal-play-again-btn");

// State variables
let turnO = true; // true = 'O', false = 'X'
let gameActive = true;
let gameMode = "pvp"; // 'pvp' or 'ai'
let board = Array(9).fill("");
let isAiThinking = false;

let scores = {
    O: 0,
    X: 0,
    ties: 0,
};

// Load saved scores and settings from LocalStorage
const loadStorage = () => {
    try {
        const savedScores = localStorage.getItem("crossbox_scores");
        if (savedScores) {
            scores = JSON.parse(savedScores);
            updateScoreDisplay();
        }

        const savedMute = localStorage.getItem("crossbox_muted");
        if (savedMute !== null) {
            sounds.enabled = savedMute !== "true";
            updateSoundIcon();
        }
    } catch (e) {
        console.warn("Storage access not available", e);
    }
};

const saveScores = () => {
    try {
        localStorage.setItem("crossbox_scores", JSON.stringify(scores));
    } catch (e) {}
};

const updateSoundIcon = () => {
    if (soundIcon) {
        soundIcon.textContent = sounds.enabled ? "🔊" : "🔇";
    }
};

const updateScoreDisplay = () => {
    if (scoreOElem) scoreOElem.textContent = scores.O;
    if (scoreXElem) scoreXElem.textContent = scores.X;
    if (scoreTiesElem) scoreTiesElem.textContent = scores.ties;
};

// Update Turn Indicator
const updateTurnUI = () => {
    const isPlayerO = turnO;
    const currentSymbol = isPlayerO ? "O" : "X";

    if (turnAvatar) {
        turnAvatar.textContent = currentSymbol;
        turnAvatar.className = isPlayerO ? "turn-avatar" : "turn-avatar turn-x";
    }

    if (turnPulseDot) {
        turnPulseDot.className = isPlayerO ? "turn-pulse-dot" : "turn-pulse-dot pulse-x";
    }

    if (turnPlayerText) {
        if (gameMode === "ai" && !turnO) {
            turnPlayerText.textContent = isAiThinking ? "Computer Thinking..." : "Computer (X)";
        } else {
            turnPlayerText.textContent = isPlayerO ? "Player O" : "Player X";
        }
    }

    // Active Card in Scoreboard
    if (scoreCardO && scoreCardX) {
        if (isPlayerO) {
            scoreCardO.classList.add("active-card");
            scoreCardX.classList.remove("active-card");
        } else {
            scoreCardX.classList.add("active-card");
            scoreCardO.classList.remove("active-card");
        }
    }
};

// Handle Box Click Event
const handleBoxClick = (index) => {
    if (!gameActive || board[index] !== "" || isAiThinking) {
        return;
    }

    makeMove(index, turnO ? "O" : "X");

    // If game mode is vs AI and still active, trigger AI turn
    if (gameActive && gameMode === "ai" && !turnO) {
        triggerAiTurn();
    }
};

// Make a move on the board
const makeMove = (index, symbol) => {
    board[index] = symbol;
    const box = boxes[index];
    box.textContent = symbol;
    box.classList.add(symbol === "O" ? "mark-o" : "mark-x");
    box.disabled = true;

    sounds.playMove(symbol);

    const winnerResult = checkWinner();

    if (winnerResult) {
        handleGameOver(winnerResult);
    } else if (board.every((cell) => cell !== "")) {
        handleGameOver({ winner: "draw" });
    } else {
        // Toggle turn
        turnO = !turnO;
        updateTurnUI();
    }
};

// Check for win conditions
const checkWinner = () => {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        const valA = board[a];
        const valB = board[b];
        const valC = board[c];

        if (valA !== "" && valA === valB && valB === valC) {
            return {
                winner: valA,
                pattern: pattern,
            };
        }
    }
    return null;
};

// Handle Game Over (Win or Draw)
const handleGameOver = (result) => {
    gameActive = false;

    // Disable all remaining boxes
    boxes.forEach((box) => (box.disabled = true));

    if (result.winner === "draw") {
        scores.ties++;
        saveScores();
        updateScoreDisplay();
        sounds.playDraw();

        showModal({
            icon: "🤝",
            title: "Game Drawn!",
            message: "Well fought! It's an evenly matched tie.",
            isWin: false,
        });
    } else {
        // Highlight winning tiles
        if (result.pattern) {
            result.pattern.forEach((idx) => {
                boxes[idx].classList.add("winning-tile");
            });
        }

        const isO = result.winner === "O";
        if (isO) {
            scores.O++;
        } else {
            scores.X++;
        }
        saveScores();
        updateScoreDisplay();

        sounds.playWin();
        confetti.blast();

        let winnerName = "";
        if (isO) {
            winnerName = '<span class="winner-o">Player O</span>';
        } else {
            winnerName = gameMode === "ai" ? '<span class="winner-x">Computer (X)</span>' : '<span class="winner-x">Player X</span>';
        }

        setTimeout(() => {
            showModal({
                icon: "🏆",
                title: "Victory!",
                message: `${winnerName} has won the match!`,
                isWin: true,
            });
        }, 500);
    }
};

// Show modal announcement
const showModal = ({ icon, title, message }) => {
    if (modalIcon) modalIcon.textContent = icon;
    if (modalTitle) modalTitle.textContent = title;
    if (msgElem) msgElem.innerHTML = message;

    if (modalOverlay) {
        modalOverlay.classList.remove("hide");
    }
};

// Hide modal
const hideModal = () => {
    if (modalOverlay) {
        modalOverlay.classList.add("hide");
    }
};

// Reset current round
const resetRound = () => {
    board = Array(9).fill("");
    gameActive = true;
    isAiThinking = false;
    turnO = true;

    boxes.forEach((box) => {
        box.textContent = "";
        box.className = "box";
        box.disabled = false;
    });

    hideModal();
    updateTurnUI();
};

// AI Engine (Minimax with strategic depth for a fun, smart opponent)
const triggerAiTurn = () => {
    isAiThinking = true;
    updateTurnUI();

    // Natural human-like pause before AI makes move
    setTimeout(() => {
        if (!gameActive) {
            isAiThinking = false;
            return;
        }

        const bestMoveIndex = getBestAiMove();
        isAiThinking = false;

        if (bestMoveIndex !== -1) {
            makeMove(bestMoveIndex, "X");
        }
    }, 420);
};

// Smart AI Decision Maker
const getBestAiMove = () => {
    const emptyIndices = [];
    board.forEach((val, idx) => {
        if (val === "") emptyIndices.push(idx);
    });

    if (emptyIndices.length === 0) return -1;

    // 1. Can AI (X) win on this move?
    for (let idx of emptyIndices) {
        board[idx] = "X";
        if (checkWinner()) {
            board[idx] = "";
            return idx;
        }
        board[idx] = "";
    }

    // 2. Can Player (O) win on their next move? Block them!
    for (let idx of emptyIndices) {
        board[idx] = "O";
        if (checkWinner()) {
            board[idx] = "";
            return idx;
        }
        board[idx] = "";
    }

    // 3. Take center if available
    if (board[4] === "") return 4;

    // 4. Take corners if available
    const corners = [0, 2, 6, 8].filter((i) => board[i] === "");
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
    }

    // 5. Take any remaining empty slot
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
};

// Event Listeners
boxes.forEach((box, index) => {
    box.addEventListener("click", () => {
        handleBoxClick(index);
    });
});

if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        sounds.playClick();
        resetRound();
    });
}

if (modalPlayAgainBtn) {
    modalPlayAgainBtn.addEventListener("click", () => {
        sounds.playClick();
        resetRound();
    });
}

if (resetScoreBtn) {
    resetScoreBtn.addEventListener("click", () => {
        sounds.playClick();
        scores = { O: 0, X: 0, ties: 0 };
        saveScores();
        updateScoreDisplay();
        resetRound();
    });
}

if (soundBtn) {
    soundBtn.addEventListener("click", () => {
        sounds.enabled = !sounds.enabled;
        try {
            localStorage.setItem("crossbox_muted", (!sounds.enabled).toString());
        } catch (e) {}
        updateSoundIcon();
        if (sounds.enabled) {
            sounds.playClick();
        }
    });
}

// Mode Selection Switching (2 Players vs AI)
modeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        sounds.playClick();
        const mode = tab.dataset.mode;
        if (mode === gameMode) return;

        modeTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        gameMode = mode;

        if (playerXLabel) {
            playerXLabel.textContent = gameMode === "ai" ? "COMPUTER" : "PLAYER X";
        }

        resetRound();
    });
});

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
    loadStorage();
    updateTurnUI();
});

// Also run immediately in case DOM is already ready
loadStorage();
updateTurnUI();
