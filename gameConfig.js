// --- GAME CONFIGURATION ---
// You can edit these values to tweak the game balance.

// Set to an emoji (like '🐜') to only spawn that enemy for testing. Set to null for Normal Mode.
const TEST_ENEMY = null; 

// Enemy Rules:
// firstPts: Score needed to start spawning
// min/max: Random seconds between spawns
// size: Multiplier for visual size
// speed: Base movement speed (0.3 is average)
const ENEMY_CONFIG = [
    { emoji: '🪰', firstPts: 0,   min: 3, max: 6,  size: 3,   speed: 0.3 },
    { emoji: '🐝', firstPts: 12,   min: 5, max: 7,  size: 3.6, speed: 0.2 },
    { emoji: '🪲', firstPts: 25,  min: 3, max: 12, size: 3.6, speed: 0.0025 },
    { emoji: '🐜', firstPts: 50,  min: 7, max: 10, size: 1.8, speed: 0.166, groupMin: 3, groupMax: 7, groupGap: 20 },
    { emoji: '🕷️', firstPts: 100, min: 2, max: 7,  size: 4.8, speed: 0 },
    { emoji: '🪳', firstPts: 150, min: 2, max: 4,  size: 3,   speed: 0.5 }
];

// Reward Rules:
// pts: Points awarded on collection
// min/max: Random seconds between spawns
// size: Multiplier for visual size
// color: Color of the burst effect when collected
const REWARD_DATA = { 
    '🫐': { pts: 1, min: 1, max: 3, size: 3.6, color: '#3b82f6' }, 
    '🍐': { pts: 3, min: 5, max: 8, size: 6, color: '#84cc16' }, 
    '🍋': { pts: 7, min: 10, max: 20, size: 8.4, color: '#eab308' }, 
    '🍊': { pts: 12, min: 20, max: 30, size: 4.8, color: '#f97316' }, 
    '🍒': { pts: 25, min: 30, max: 40, size: 4.8, color: '#ef4444' } 
};
