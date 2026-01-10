// API endpoint for leaderboard
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4ysJ9aIVSl1EhRGIAPhbdoZ267jL0cfcsfVAumCCpBkl-jeh1voKdiEVylWmDjPJl/exec';

// Sprite rendering resolution
export const SPRITE_RESOLUTION = 256;

// Game over messages
export const DEATH_MESSAGES = [
    "Vision Lost!",
    "Eye Contact Broken!",
    "You Blinked!",
    "Blinked Too Soon!",
    "Lost Sight!",
    "Eyes Up Next Time!",
    "Visual Feed Lost!",
    "Target Out of Sight!",
    "Retinal Error!",
    "Nice Try, Big Eye!"
];

// Reward configuration
// pts: points earned, min/max: spawn interval in seconds, size: visual size multiplier, color: iris burst color
export const REWARD_DATA = {
    '🫐': { pts: 1, min: 1, max: 3, size: 3.6, color: '#3b82f6' },
    '🍐': { pts: 3, min: 5, max: 8, size: 6, color: '#84cc16' },
    '🍋': { pts: 7, min: 10, max: 20, size: 8.4, color: '#eab308' },
    '🍊': { pts: 12, min: 20, max: 30, size: 4.8, color: '#f97316' },
    '🍒': { pts: 25, min: 30, max: 40, size: 4.8, color: '#ef4444' }
};

// Enemy configuration
// emoji: enemy type, firstPts: score threshold to start spawning, min/max: spawn interval in seconds
export const ENEMY_CONFIG = [
    { emoji: '🪰', firstPts: 1, min: 3, max: 6 },
    { emoji: '🐝', firstPts: 12, min: 5, max: 10 },
    { emoji: '🪲', firstPts: 25, min: 3, max: 12 },
    { emoji: '🐜', firstPts: 50, min: 7, max: 15 },
    { emoji: '🕷️', firstPts: 100, min: 2, max: 5 },
    { emoji: '🪳', firstPts: 150, min: 2, max: 4 }
];

// Hero constants
export const HERO_RADIUS = 8; // in units
export const HERO_COLLISION_RADIUS = 6.4; // in units
export const HERO_BASE_SPEED = 5;

// Joystick constants
export const JOYSTICK_RADIUS = 8; // in units
