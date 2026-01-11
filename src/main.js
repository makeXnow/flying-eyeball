import { Game } from './core/Game.js?v=6';

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
    
    // Instantiate game immediately - AudioManager will auto-play intro when loaded
    gameInstance = new Game();
    
    // If autoplay was blocked, any interaction will start the music
    const handleGesture = () => {
        if (gameInstance && gameInstance.audioManager) {
            gameInstance.audioManager.onUserGesture();
        }
    };
    
    const launchGame = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Trigger gesture handler in case autoplay was blocked
        handleGesture();
        
        if (gameStarted) return; 
        gameStarted = true;
        
        try {
            hideSplashScreen();
            
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
    }
    
    // Listen for ANY interaction on splash screen to unlock audio
    if (splash) {
        splash.addEventListener('mousedown', handleGesture, true);
        splash.addEventListener('touchstart', handleGesture, true);
        
        splash.onclick = (e) => {
            if (e.target === splash || e.target.classList.contains('splash-frame')) {
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
