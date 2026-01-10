// --- GAME CONFIGURATION ---
// You can edit these values to tweak the game balance.

// Set to an emoji (like '🐜') to only spawn that enemy for testing. Set to null for Normal Mode.
window.TEST_ENEMY = null; 

// Global Spawn Rules:
window.start_spawn = 1.5;      // Initial seconds between spawns
window.max_spawn = .5;        // Final seconds between spawns
window.max_spawn_time = 120;  // Seconds it takes to reach max_spawn

// Enemy Rules:
// firstPts: Score needed to start spawning
// weight: Relative probability of spawning (default 20)
// size: Multiplier for visual size
// speed: Base movement speed (0.3 is average)
window.ENEMY_CONFIG = [
    { emoji: '🪰', firstPts: 12,   weight: 20, size: 3,   speed: 0.3 },
    { emoji: '🐝', firstPts: 0,  weight: 20, size: 3.6, speed: 0.2 },
    { emoji: '🪲', firstPts: 25,  weight: 20, size: 5, speed: 0.0025 },
    { emoji: '🐜', firstPts: 50,  weight: 20, size: 1.8, speed: 0.166, groupMin: 3, groupMax: 7, groupGap: 20 },
    { emoji: '🕷️', firstPts: 100, weight: 20, size: 4.8, speed: 0 },
    { emoji: '🪳', firstPts: 150, weight: 20, size: 7,   speed: 0.5 }
];

// Reward Rules:
// pts: Points awarded on collection
// min/max: Random seconds between spawns
// size: Multiplier for visual size
// color: Color of the burst effect when collected
window.REWARD_DATA = { 
    '🫐': { pts: 1, min: 1, max: 3, size: 4, color: '#3b82f6' }, 
    '🍐': { pts: 3, min: 5, max: 8, size: 7, color: '#84cc16' }, 
    '🍋': { pts: 7, min: 10, max: 20, size: 6, color: '#eab308' }, 
    '🍊': { pts: 12, min: 20, max: 30, size: 7, color: '#f97316' }, 
    '🍒': { pts: 25, min: 30, max: 40, size: 5, color: '#ef4444' } 
};
