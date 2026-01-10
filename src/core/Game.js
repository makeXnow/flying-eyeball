import { HERO_COLLISION_RADIUS } from './constants.js';
import { Hero } from '../entities/Hero.js';
import { EnemyManager } from '../managers/EnemyManager.js';
import { RewardManager } from '../managers/RewardManager.js';
import { InputManager } from '../managers/InputManager.js';
import { Renderer } from '../rendering/Renderer.js';
import { UIManager } from '../ui/UIManager.js';

export class Game {
    constructor() {
        // Get DOM elements
        this.canvas = document.getElementById('gameCanvas');
        this.joystickEl = document.getElementById('joystick');
        this.knobEl = document.getElementById('joystick-knob');

        // Initialize managers
        this.renderer = new Renderer(this.canvas);
        this.inputManager = new InputManager(this.canvas, this.joystickEl, this.knobEl);
        this.enemyManager = new EnemyManager();
        this.rewardManager = new RewardManager();
        this.uiManager = new UIManager();

        // Create hero
        this.hero = null;

        // Game state
        this.gameActive = true;
        this.score = 0;
        this.gameStartTime = 0;
        this.totalPauseTime = 0;
        this.lastPauseStarted = 0;
        this.isWindowVisible = true;

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    init() {
        // Initialize renderer (pre-renders sprites)
        this.renderer.init();

        // Initial resize to set dimensions
        this.handleResize();

        // Create hero at initial position
        const { width, height } = this.renderer.getDimensions();
        this.hero = new Hero(width / 2, height * 0.15);

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

        // Start game loop
        this.gameLoop();
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
        this.inputManager.setUnit(dims.unit);

        // Reset hero position on resize
        if (this.hero) {
            this.hero.x = dims.width / 2;
            this.hero.y = dims.height * 0.15;
        }
    }

    update(now) {
        const { width, height, unit } = this.renderer.getDimensions();

        if (!this.isWindowVisible) return;

        if (!this.gameActive) {
            // Just do idle bob animation when game is not active
            this.hero.idleBob(now, height * 0.15, unit);
            return;
        }

        // Update hero based on input
        this.hero.update(this.inputManager.getState(), width, height, unit);

        // Update rewards and handle collection
        this.rewardManager.update(now, width, height, unit, this.hero, (pts) => {
            this.score += pts;
            this.uiManager.updateScore(this.score);
        });

        // Update enemies (skip first second for grace period)
        if (now - this.gameStartTime >= 1000) {
            this.enemyManager.update(
                now, 
                width, 
                height, 
                unit, 
                this.gameStartTime,
                this.rewardManager.getRewards(),
                this.hero,
                () => this.gameOver(),
                this.score
            );
        }
    }

    draw(now) {
        this.renderer.render(now, this.hero, this.rewardManager, this.enemyManager);
    }

    gameLoop() {
        const now = this.getGameTime();
        this.update(now);
        this.draw(now);
        requestAnimationFrame(this.gameLoop);
    }

    gameOver() {
        if (!this.gameActive) return; // Prevent multiple calls
        this.gameActive = false;
        this.inputManager.setGameActive(false);
        this.uiManager.showGameOver(this.score);
    }

    resetGame() {
        // Fetch fresh leaderboard
        this.uiManager.fetchLeaderboard();

        // Reset score
        this.score = 0;

        // Reset hero
        const { width, height } = this.renderer.getDimensions();
        this.hero.reset(width / 2, height * 0.15);

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
