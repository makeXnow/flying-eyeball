import { HERO_COLLISION_RADIUS } from './constants.js';
import { Hero } from '../entities/Hero.js';
import { EnemyManager } from '../managers/EnemyManager.js';
import { RewardManager } from '../managers/RewardManager.js?v=6';
import { InputManager } from '../managers/InputManager.js';
import { Renderer } from '../rendering/Renderer.js?v=3';
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
        this.gameActive = false;
        this.isGameOverAnimating = false;
        this.gameOverStartTime = 0;
        this.isStartingAnimating = false;
        this.startingStartTime = 0;
        this.deathHeroX = 0;
        this.deathHeroY = 0;
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

        // Create hero at initial position (at the top)
        const { width, height } = this.renderer.getDimensions();
        this.hero = new Hero(width / 2, height * 0.18);

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
        this.inputManager.setGameActive(true);

        // Reset UI (hides game over)
        this.uiManager.resetUI();

        // Trigger start animation
        this.isStartingAnimating = true;
        this.startingStartTime = now;

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
            if (this.isStartingAnimating || this.gameActive) {
                if (this.score === 0) {
                    this.hero.x = dims.width / 2;
                    this.hero.y = dims.height / 2;
                }
            } else {
                // Bobbing at top
                this.hero.x = dims.width / 2;
                this.hero.y = dims.height * 0.18;
            }
        }
    }

    update(now) {
        const { width, height, unit } = this.renderer.getDimensions();
        if (width === 0 || height === 0) return;

        if (!this.isWindowVisible) return;

        if (this.isGameOverAnimating) {
            const progress = Math.min(1, (now - this.gameOverStartTime) / 800);
            const topY = height * 0.18;
            
            // Interpolate to top
            const currentBaseX = width / 2;
            const currentBaseY = this.deathHeroY + (topY - this.deathHeroY) * progress;
            
            this.hero.idleBob(now, currentBaseX, currentBaseY, unit);

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

        if (this.isStartingAnimating) {
            const progress = Math.min(1, (now - this.startingStartTime) / 800);
            const topY = height * 0.18;
            const centerY = height / 2;
            
            const currentBaseX = width / 2;
            const currentBaseY = topY + (centerY - topY) * progress;
            
            this.hero.idleBob(now, currentBaseX, currentBaseY, unit);
            
            if (progress >= 1) {
                this.isStartingAnimating = false;
                this.gameActive = true;
                this.gameStartTime = now;
                // Initialize timers for fresh start
                this.rewardManager.reset(now);
                this.enemyManager.reset(now, this.gameStartTime);
            }
            return;
        }

        if (!this.gameActive) {
            // Just do idle bob animation at the top when game is not active
            this.hero.idleBob(now, width / 2, height * 0.18, unit);
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
        // Update timer display - decoupled from physics for robustness
        const elapsed = (this.gameActive && this.gameStartTime > 0) ? (now - this.gameStartTime) : 0;
        if (this.uiManager && typeof this.uiManager.updateTimer === 'function') {
            this.uiManager.updateTimer(elapsed);
        }

        let entityOpacity = 1;
        if (this.isGameOverAnimating) {
            // Fade out over 500ms (0.5 seconds)
            const fadeElapsed = now - this.gameOverStartTime;
            entityOpacity = Math.max(0, 1 - (fadeElapsed / 500));
        } else if (this.isStartingAnimating || !this.gameActive) {
            entityOpacity = 0;
        }
        
        this.renderer.render(now, this.hero, this.rewardManager, this.enemyManager, entityOpacity);
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
        this.deathHeroX = this.hero.x;
        this.deathHeroY = this.hero.y;
        this.inputManager.setGameActive(false);
    }

    resetGame() {
        // Fetch fresh leaderboard
        this.uiManager.fetchLeaderboard();

        // Reset score
        this.score = 0;
        this.isGameOverAnimating = false;

        // Reset hero state but keep position for the start transition
        this.hero.reset(this.hero.x, this.hero.y);

        // Reset timers
        this.totalPauseTime = 0;
        const now = this.getGameTime();
        this.enemyManager.reset(now, now);
        this.rewardManager.reset(now);

        // Reset UI
        this.uiManager.resetUI();

        // Start starting animation
        this.isStartingAnimating = true;
        this.startingStartTime = now;

        // Reset input
        this.inputManager.reset();
        this.inputManager.setGameActive(true);

        // Deactivate game until animation completes
        this.gameActive = false;
    }
}
