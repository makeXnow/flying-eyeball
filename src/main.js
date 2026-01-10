import { Game } from './core/Game.js';

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
    
    // If splash screen exists (initial load), show it for 1 second
    if (splash) {
        const game = new Game();
        
        // Wait 2 seconds, then hide splash and init game
        setTimeout(() => {
            hideSplashScreen();
            game.init();
        }, 2000);
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
