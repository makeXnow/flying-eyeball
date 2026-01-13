import { Game } from './core/Game.js?v=10';

let gameStarted = false;
let gameInstance = null;

function hideSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.remove();
        }, 300);
    }
}

function startGame() {
    const splash = document.getElementById('splash-screen');
    const startBtn = document.getElementById('start-btn');
    
    // Create game instance (AudioManager will preload sounds)
    gameInstance = new Game();
    
    const launchGame = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (gameStarted) return; 

        gameStarted = true;
        
        try {
            hideSplashScreen();
            
            // CRITICAL: Start audio IMMEDIATELY inside the gesture to ensure browser allows it
            if (gameInstance && gameInstance.audioManager) {
                gameInstance.audioManager.start();
            }

            // Small delay for splash fade, then init game (which starts physics)
            setTimeout(() => {
                gameInstance.init();
            }, 50);
        } catch (err) {
            console.error("Game Startup Error:", err);
            hideSplashScreen();
        }
    };

    if (startBtn) {
        startBtn.onclick = launchGame;
        startBtn.ontouchstart = launchGame;
        startBtn.addEventListener('click', launchGame);
    }
    
    // Also allow clicking splash frame to start
    if (splash) {
        splash.onclick = (e) => {
            if (e.target.closest('.splash-frame') || e.target === splash) {
                launchGame();
            }
        };
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    startGame();
}
