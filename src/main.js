import { Game } from './core/Game.js?v=6';

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
    const splash = document.getElementById('splash-screen');
    const startBtn = document.getElementById('start-btn');
    
    const launchGame = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (gameStarted) return; 
        gameStarted = true;
        
        try {
            const game = new Game();
            hideSplashScreen();
            
            // Tiny delay to allow splash fade to begin before heavy initialization
            setTimeout(() => {
                game.init();
            }, 50);
        } catch (err) {
            console.error("Game Startup Error:", err);
            // Fallback: at least hide the splash
            hideSplashScreen();
        }
    };

    if (startBtn) {
        startBtn.onclick = launchGame;
        startBtn.ontouchstart = launchGame;
    }
    
    // Full screen fallback for safety
    if (splash) {
        splash.onclick = (e) => {
            if (e.target === splash || e.target.classList.contains('splash-frame')) {
                launchGame();
            }
        };
    }
}

// ES modules are deferred, so DOM may already be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    startGame();
}
