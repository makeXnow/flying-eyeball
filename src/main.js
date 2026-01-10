import { Game } from './core/Game.js';

// Calculate unit immediately so CSS values are ready before first paint
function updateUnit() {
    const container = document.getElementById('game-container');
    if (container) {
        const rect = container.getBoundingClientRect();
        if (rect.height > 0) {
            const unit = Math.max(0.1, rect.height / 200);
            document.documentElement.style.setProperty('--u', `${unit}px`);
        }
    }
}

// Run once as soon as script loads (since it's deferred/module, DOM is mostly ready)
updateUnit();

let gameStarted = false;

function hideSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.classList.add('fade-out');
        // Remove from DOM after fade animation completes
        setTimeout(() => {
            splash.remove();
        }, 300);
    }
}

function startGame() {
    // Ensure unit is set correctly before anything else
    updateUnit();
    window.addEventListener('resize', updateUnit);

    const splash = document.getElementById('splash-screen');
    const startBtn = document.getElementById('start-btn');
    
    const game = new Game();
    
    const launchGame = () => {
        if (gameStarted) return; // Prevent double init
        gameStarted = true;
        hideSplashScreen();
        game.init();
    };

    if (startBtn) {
        startBtn.onclick = launchGame;
        startBtn.ontouchstart = (e) => {
            e.preventDefault();
            launchGame();
        };
    } else if (splash) {
        // Fallback for full splash click if button is missing
        splash.onclick = launchGame;
    } else {
        launchGame();
    }
}

// ES modules are deferred, so DOM may already be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    startGame();
}
