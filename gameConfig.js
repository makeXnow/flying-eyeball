// --- GAME CONFIGURATION ---
// You can edit these values to tweak the game balance.

// Set to an emoji (like '🐜') to only spawn that enemy for testing. Set to null for Normal Mode.
window.TEST_ENEMY = null; 

// Global Spawn Rules:
window.global_speed = 1.0;     // Multiplier for all motion (hero and enemies)
window.start_spawn = 1.5;      // Initial seconds between spawns
window.max_spawn = .3;        // Final seconds between spawns
window.max_spawn_time = 120;  // Seconds it takes to reach max_spawn

window.max_total_start = 10;  // Initial max enemies on screen
window.max_total = 15;        // Final max enemies on screen
window.max_total_time = 120;  // Seconds it takes to reach max_total

// Enemy Rules:
// firstPts: Score needed to start spawning
// weight: Relative probability of spawning (default 20)
// size: Multiplier for visual size
// speed: Base movement speed (0.3 is average)
// max: Max on screen at once
window.ENEMY_CONFIG = [
    { emoji: '🪰', firstPts: 15,   weight: 35, size: 3,   speed: 0.3, max: 6 },
    { emoji: '🐝', firstPts: 0,  weight: 20, size: 3.6, speed: 0.1, max: 6 },
    { emoji: '🪲', firstPts: 40,  weight: 20, size: 5, speed: 0.0025, max: 4 },
    { emoji: '🐜', firstPts: 75,  weight: 20, size: 1.8, speed: 0.166, groupMin: 3, groupMax: 7, groupGap: 20, max: 4 },
    { emoji: '🕷️', firstPts: 150, weight: 20, size: 4.8, speed: 0, max: 3 },
    { emoji: '🪳', firstPts: 200, weight: 20, size: 6,   speed: 0.5, max: 4 }
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

// Hero Visuals:
window.HERO_FLAP_UP_MAX = 2;    // Multiplier at max upward speed
window.HERO_FLAP_DOWN_MIN = 0.5; // Multiplier at max downward speed
