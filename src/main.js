import { Game } from './core/Game.js';

// Initialize game when DOM is ready
window.onload = () => {
    const game = new Game();
    game.init();
};
