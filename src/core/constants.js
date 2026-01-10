// API endpoint for leaderboard
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4ysJ9aIVSl1EhRGIAPhbdoZ267jL0cfcsfVAumCCpBkl-jeh1voKdiEVylWmDjPJl/exec';

// Sprite rendering resolution
export const SPRITE_RESOLUTION = 256;

// Helper to get globals from gameConfig.js
const getGlobal = (key, fallback) => window[key] || fallback;

// Maximum number of enemies allowed on screen at once
export const MAX_ENEMIES = getGlobal('MAX_ENEMIES', 10);

// Maximum number of queued enemies to visually show at the edges
export const MAX_VISIBLE_QUEUE = getGlobal('MAX_VISIBLE_QUEUE', 10);

// Global Spawn Settings
export const SPAWN_SETTINGS = getGlobal('SPAWN_SETTINGS', {
    startDelay: 3,
    endDelay: 1,
    rampDuration: 90
});

// Test Enemy
export const TEST_ENEMY = getGlobal('TEST_ENEMY', null);

// Reward configuration
export const REWARD_DATA = getGlobal('REWARD_DATA', {
    '🫐': { pts: 1, min: 1, max: 3, size: 3.6, color: '#3b82f6' },
    '🍐': { pts: 3, min: 5, max: 8, size: 6, color: '#84cc16' },
    '🍋': { pts: 7, min: 10, max: 20, size: 8.4, color: '#eab308' },
    '🍊': { pts: 12, min: 20, max: 30, size: 4.8, color: '#f97316' },
    '🍒': { pts: 25, min: 30, max: 40, size: 4.8, color: '#ef4444' }
});

// Enemy configuration
export const ENEMY_CONFIG = getGlobal('ENEMY_CONFIG', [
    { emoji: '🪰', firstPts: 0,   weight: 20, size: 3,   speed: 0.3 },
    { emoji: '🐝', firstPts: 12,  weight: 20, size: 3.6, speed: 0.2 },
    { emoji: '🪲', firstPts: 25,  weight: 20, size: 3.6, speed: 0.0025 },
    { emoji: '🐜', firstPts: 50,  weight: 20, size: 1.8, speed: 0.166, groupMin: 3, groupMax: 7, groupGap: 20 },
    { emoji: '🕷️', firstPts: 100, weight: 20, size: 4.8, speed: 0 },
    { emoji: '🪳', firstPts: 150, weight: 20, size: 3,   speed: 0.5 }
]);

// Hero constants
export const HERO_RADIUS = 8; // in units
export const HERO_COLLISION_RADIUS = 6.4; // in units
export const HERO_BASE_SPEED = 5;

// Joystick constants
export const JOYSTICK_RADIUS = 8; // in units
