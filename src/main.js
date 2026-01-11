import { Game } from './core/Game.js?v=6';

let gameStarted = false;
let gameInstance = null;

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
    
    // Instantiate game immediately to handle mute button on splash screen
    gameInstance = new Game();
    
    let musicStarted = false;
    
    // Function to start music on first interaction
    const tryStartMusic = () => {
        if (!musicStarted && gameInstance && gameInstance.audioManager) {
            musicStarted = true;
            gameInstance.audioManager.playIntro(false);
        }
    };
    
    // Attempt autoplay immediately (will likely be blocked by browser)
    // If blocked, the capture-phase listeners below will start music on first interaction
    tryStartMusic();
    
    const launchGame = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Ensure music starts if it hasn't already
        tryStartMusic();
        
        if (gameStarted) return; 
        gameStarted = true;
        
        try {
            hideSplashScreen();
            
            // Tiny delay to allow splash fade to begin before heavy initialization
            setTimeout(() => {
                gameInstance.init();
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
    
    // Add listeners to splash screen to start music on ANY interaction
    if (splash) {
        // These fire in the CAPTURE phase, so they run BEFORE any child handlers that might stopPropagation
        splash.addEventListener('mousedown', tryStartMusic, true);
        splash.addEventListener('touchstart', tryStartMusic, true);
        
        // Fallback click handler for starting the game
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
