import { HERO_COLLISION_RADIUS } from './constants.js';
import { Hero } from '../entities/Hero.js';
import { EnemyManager } from '../managers/EnemyManager.js';
import { RewardManager } from '../managers/RewardManager.js';
import { InputManager } from '../managers/InputManager.js';
import { Renderer } from '../rendering/Renderer.js';
import { UIManager } from '../ui/UIManager.js';

export class Game {
    constructor() {
        // Managers (initialized in init once DOM is ready)
        this.renderer = null;
        this.inputManager = null;
        this.enemyManager = new EnemyManager();
        this.rewardManager = new RewardManager();
        this.uiManager = new UIManager();

        this.hero = null;
        this.gameActive = true;
        this.isGameOverAnimating = false;
        this.gameOverStartTime = 0;
        this.score = 0;
        this.gameStartTime = 0;
        this.totalPauseTime = 0;
        this.lastPauseStarted = 0;
        this.isWindowVisible = true;

        this.gameLoop = this.gameLoop.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    init() {
        // Get DOM elements
        const canvas = document.getElementById('gameCanvas');
        const joystickEl = document.getElementById('joystick');
        const knobEl = document.getElementById('joystick-knob');

        // Initialize managers that need DOM
        this.renderer = new Renderer(canvas);
        this.inputManager = new InputManager(canvas, joystickEl, knobEl);

        // Initialize renderer (pre-renders sprites)
        this.renderer.init();

        // Initial resize to set dimensions
        this.handleResize();

        // Create hero at initial position
        const { width, height } = this.renderer.getDimensions();
        this.hero = new Hero(width / 2, height / 2);

        // Initialize UI
        this.uiManager.init(() => this.resetGame());
        this.uiManager.fetchLeaderboard();

        // Set up event listeners
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // Initialize game time
        this.gameStartTime = this.getGameTime();

        // Initialize timers
        const now = this.getGameTime();
        this.rewardManager.reset(now);
        this.enemyManager.reset(now, this.gameStartTime);

        // Set input manager state
        this.inputManager.setUnit(this.renderer.getDimensions().unit);
        this.inputManager.setGameActive(this.gameActive);

        // Reset UI (hides game over)
        this.uiManager.resetUI();

        // Start game loop
        this.gameLoop();

        // Draw first frame immediately
        this.draw(this.getGameTime());
    }

    getGameTime() {
        return this.isWindowVisible 
            ? Date.now() - this.totalPauseTime 
            : this.lastPauseStarted - this.totalPauseTime;
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.isWindowVisible = false;
            this.lastPauseStarted = Date.now();
        } else {
            if (this.lastPauseStarted > 0) {
                this.totalPauseTime += (Date.now() - this.lastPauseStarted);
            }
            this.isWindowVisible = true;
        }
    }

    handleResize() {
        const dims = this.renderer.resize();
        if (dims.width === 0 || dims.height === 0) return;
        
        this.inputManager.setUnit(dims.unit);

        // Reset hero position on resize if not in game or if just started
        if (this.hero) {
            if (!this.gameActive || this.score === 0) {
                this.hero.x = dims.width / 2;
                this.hero.y = dims.height / 2;
            }
        }
    }

    update(now) {
        const { width, height, unit } = this.renderer.getDimensions();
        if (width === 0 || height === 0) return;

        if (!this.isWindowVisible) return;

        if (this.isGameOverAnimating) {
            const progress = (now - this.gameOverStartTime) / 500;
            
            // Hero stays bobbing in the center horizontally
            this.hero.idleBob(now, width / 2, height / 2, unit);

            if (progress >= 1) {
                this.isGameOverAnimating = false;
                this.uiManager.showGameOver(this.score);
            } else {
                // Update entities to fall during animation
                this.enemyManager.updateGameOver(unit);
                this.rewardManager.updateGameOver(unit);
            }
            return;
        }

        if (!this.gameActive) {
            // Just do idle bob animation when game is not active
            this.hero.idleBob(now, width / 2, height / 2, unit);
            return;
        }

        // Update hero based on input
        this.hero.update(this.inputManager.getState(), width, height, unit);

        // Update rewards and handle collection
        this.rewardManager.update(now, width, height, unit, this.hero, (pts) => {
            this.score += pts;
            this.uiManager.updateScore(this.score);
        });

        // Update enemies
        this.enemyManager.update(
            now, 
            width, 
            height, 
            unit, 
            this.gameStartTime,
            this.rewardManager.getRewards(),
            this.hero,
            () => this.gameOver(now),
            this.score
        );
    }

    draw(now) {
        let opacity = 1;
        if (this.isGameOverAnimating) {
            opacity = 1 - Math.min(1, (now - this.gameOverStartTime) / 500);
        } else if (!this.gameActive) {
            opacity = 0;
        }
        this.renderer.render(now, this.hero, this.rewardManager, this.enemyManager, opacity);
    }

    gameLoop() {
        const now = this.getGameTime();
        this.update(now);
        this.draw(now);
        requestAnimationFrame(this.gameLoop);
    }

    gameOver(now) {
        if (!this.gameActive || now - this.gameStartTime < 2000) return; // Prevent multiple calls and initial collisions
        this.gameActive = false;
        this.isGameOverAnimating = true;
        this.gameOverStartTime = now;
        this.inputManager.setGameActive(false);
    }

    resetGame() {
        // Fetch fresh leaderboard
        this.uiManager.fetchLeaderboard();

        // Reset score
        this.score = 0;
        this.isGameOverAnimating = false;

        // Reset hero
        const { width, height } = this.renderer.getDimensions();
        this.hero.reset(width / 2, height / 2);

        // Reset managers
        this.totalPauseTime = 0;
        this.gameStartTime = this.getGameTime();
        const now = this.getGameTime();
        this.rewardManager.reset(now);
        this.enemyManager.reset(now, this.gameStartTime);

        // Reset UI
        this.uiManager.resetUI();

        // Reset input
        this.inputManager.reset();
        this.inputManager.setGameActive(true);

        // Activate game
        this.gameActive = true;
    }
}
