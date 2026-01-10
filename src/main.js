import { Game } from './core/Game.js';

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
    
    // If splash screen exists (initial load), show it for 2 seconds
    if (splash) {
        const game = new Game();
        
        const launchGame = () => {
            if (gameStarted) return; // Prevent double init
            gameStarted = true;
            hideSplashScreen();
            game.init();
        };
        
        // Click/tap to skip splash early
        splash.addEventListener('click', launchGame);
        splash.addEventListener('touchstart', launchGame);
        
        // Auto-launch after 2 seconds
        setTimeout(launchGame, 2000);
    } else {
        // No splash (shouldn't happen, but fallback)
        const game = new Game();
        game.init();
    }
}

// ES modules are deferred, so DOM may already be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    startGame();
}
