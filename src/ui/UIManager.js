import { Leaderboard } from './Leaderboard.js';
import { ENDGAME_MESSAGES } from '../core/endgameMessages.js';

export class UIManager {
    constructor() {
        // Get DOM elements
        this.scoreVal = document.getElementById('score-val');
        this.dashboardScore = document.getElementById('dashboard-score');
        
        // Game Timer Elements
        this.timerVal = document.getElementById('timer-val');
        this.dashboardTimer = document.getElementById('dashboard-timer');

        this.finalScoreVal = document.getElementById('final-score');
        this.gameOverScreen = document.getElementById('game-over');
        this.gameOverTitle = document.getElementById('game-over-title');
        this.restartBtn = document.getElementById('restart-btn');
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.muteBtn = document.getElementById('mute-btn');
        
        // Create leaderboard manager
        this.leaderboard = new Leaderboard(this.leaderboardList);
        
        // Restart callback
        this.onRestart = null;
        this.onMuteToggle = null;

        this.lastScore = -1;
        this.lastTimerSeconds = -1;
    }

    init(onRestart, onMuteToggle) {
        this.onRestart = onRestart;
        this.onMuteToggle = onMuteToggle;
        this.restartBtn.addEventListener('click', () => this.handleRestart());
        
        if (this.muteBtn) {
            let lastInteractionTime = 0;
            const doToggle = (e) => {
                const now = Date.now();
                if (now - lastInteractionTime < 200) return; // Prevent double firing
                lastInteractionTime = now;

                if (e) {
                    if (e.cancelable) e.preventDefault();
                    e.stopPropagation();
                }
                
                if (this.onMuteToggle) {
                    const isMuted = this.onMuteToggle();
                    this.updateMuteIcon(isMuted);
                }
            };

            this.muteBtn.addEventListener('pointerdown', doToggle);
            this.muteBtn.addEventListener('click', (e) => {
                // If it was a real mouse click (not a touch emulation)
                if (e.pointerType === 'mouse' || e.pointerType === undefined) {
                    doToggle(e);
                }
            });
        }

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        this.lastScore = -1;
        this.lastTimerSeconds = -1;
    }

    updateMuteIcon(isMuted) {
        if (!this.muteBtn) return;
        const iconName = isMuted ? 'volume-x' : 'volume-2';
        this.muteBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    async fetchLeaderboard() {
        await this.leaderboard.fetch();
    }

    updateScore(score) {
        if (this.lastScore === score) return;
        this.lastScore = score;
        if (this.scoreVal) this.scoreVal.innerText = score;
    }

    /**
     * Updates the game timer display
     * @param {number} ms - Elapsed time in milliseconds
     */
    updateTimer(ms) {
        if (!this.timerVal || !this.dashboardTimer) return;
        
        const totalSeconds = Math.floor(ms / 1000);
        
        if (this.lastTimerSeconds === totalSeconds) return;
        this.lastTimerSeconds = totalSeconds;
        
        // Hide timer if it's 0, show it once it hits 1
        if (totalSeconds <= 0) {
            this.dashboardTimer.style.opacity = '0';
            return;
        } else {
            this.dashboardTimer.style.opacity = '1';
        }
        
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        this.timerVal.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    showGameOver(score) {
        // Set random death message
        const message = ENDGAME_MESSAGES[Math.floor(Math.random() * ENDGAME_MESSAGES.length)];
        if (this.gameOverTitle) this.gameOverTitle.innerText = message;
        
        // Update final score
        if (this.finalScoreVal) this.finalScoreVal.innerText = score;
        
        // Hide dashboard UI
        if (this.dashboardScore) this.dashboardScore.style.visibility = 'hidden';
        if (this.dashboardTimer) this.dashboardTimer.style.visibility = 'hidden';
        
        // Show game over screen
        if (this.gameOverScreen) this.gameOverScreen.style.display = 'flex';
        
        // Render leaderboard with input option
        this.leaderboard.render(false, score, (hasName) => {
            if (this.restartBtn) this.restartBtn.innerText = hasName ? "Save & Play Again" : "Play Again";
        });
    }

    hideGameOver() {
        if (this.gameOverScreen) this.gameOverScreen.style.display = 'none';
        if (this.dashboardScore) this.dashboardScore.style.visibility = 'visible';
        if (this.dashboardTimer) this.dashboardTimer.style.visibility = 'visible';
    }

    resetUI() {
        this.updateScore(0);
        this.updateTimer(0);
        this.hideGameOver();
        this.leaderboard.render(true, 0, () => {});
    }

    async handleRestart() {
        const name = this.leaderboard.getEnteredName();
        const score = parseInt(this.finalScoreVal.innerText) || 0;
        
        if (name && score > 0) {
            await this.leaderboard.saveScore(name, score);
        }
        
        if (this.onRestart) {
            this.onRestart();
        }
    }

    renderLeaderboard(gameActive, score) {
        this.leaderboard.render(gameActive, score, (hasName) => {
            this.restartBtn.innerText = hasName ? "Save & Play Again" : "Play Again";
        });
    }
}
