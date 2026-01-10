import { BaseEnemy } from './BaseEnemy.js';
import { ENEMY_CONFIG } from '../core/constants.js';

export class Bee extends BaseEnemy {
    constructor(width, height, unit) {
        const config = ENEMY_CONFIG.find(c => c.emoji === '🐝');
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const startX = side === 'left' ? -10 * unit : width + 10 * unit;
        
        super({
            emoji: '🐝',
            x: startX,
            y: Math.random() * height,
            size: config.size,
            speed: config.speed * unit,
            orient: 'left'
        });
        
        this.horizontalDir = side === 'left' ? 1 : -1;
        this.vx = this.horizontalDir * this.speed;
        this.isGoingUp = Math.random() < 0.5;
        this.verticalSpeed = 0;
    }

    update(now, width, height, unit) {
        // Randomly change vertical direction
        if (Math.random() < 0.02) {
            this.isGoingUp = !this.isGoingUp;
        }
        
        // Target vertical speed (up is faster than down)
        const targetVerticalSpeed = this.isGoingUp ? -5 * (unit * 0.05) : 3 * (unit * 0.05);
        
        // Smooth transition
        this.verticalSpeed += (targetVerticalSpeed - this.verticalSpeed) * 0.1;
        
        this.x += this.vx;
        this.vy = this.verticalSpeed; // Set vy for BaseEnemy.draw to handle rotation
        this.y += this.vy;
    }
}
