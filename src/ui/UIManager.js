import { Leaderboard } from './Leaderboard.js';
import { ENDGAME_MESSAGES } from '../core/endgameMessages.js';

export class UIManager {
    constructor() {
        // Get DOM elements
        this.scoreVal = document.getElementById('score-val');
        this.timerVal = document.getElementById('timer-val');
        this.dashboardScore = document.getElementById('dashboard-score');
        this.dashboardTimer = document.getElementById('dashboard-timer');
        this.finalScoreVal = document.getElementById('final-score');
        this.gameOverScreen = document.getElementById('game-over');
        this.gameOverTitle = document.getElementById('game-over-title');
        this.restartBtn = document.getElementById('restart-btn');
        this.leaderboardList = document.getElementById('leaderboard-list');
        
        // Create leaderboard manager
        this.leaderboard = new Leaderboard(this.leaderboardList);
        
        // Restart callback
        this.onRestart = null;
    }

    init(onRestart) {
        this.onRestart = onRestart;
        this.restartBtn.addEventListener('click', () => this.handleRestart());
    }

    async fetchLeaderboard() {
        await this.leaderboard.fetch();
    }

    updateScore(score) {
        this.scoreVal.innerText = score;
    }

    updateTimer(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        if (totalSeconds < 60) {
            this.timerVal.innerText = totalSeconds;
        } else {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            this.timerVal.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    showGameOver(score) {
        // Set random death message
        const message = ENDGAME_MESSAGES[Math.floor(Math.random() * ENDGAME_MESSAGES.length)];
        this.gameOverTitle.innerText = message;
        
        // Update final score
        this.finalScoreVal.innerText = score;
        
        // Hide dashboard score and timer
        this.dashboardScore.style.visibility = 'hidden';
        this.dashboardTimer.style.visibility = 'hidden';
        
        // Show game over screen
        this.gameOverScreen.style.display = 'flex';
        
        // Render leaderboard with input option
        this.leaderboard.render(false, score, (hasName) => {
            this.restartBtn.innerText = hasName ? "Save & Play Again" : "Play Again";
        });
    }

    hideGameOver() {
        this.gameOverScreen.style.display = 'none';
        this.dashboardScore.style.visibility = 'visible';
        this.dashboardTimer.style.visibility = 'visible';
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
