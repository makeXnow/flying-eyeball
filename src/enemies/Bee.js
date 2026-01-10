import { BaseEnemy } from './BaseEnemy.js';

export class Bee extends BaseEnemy {
    constructor(width, height, unit) {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const startX = side === 'left' ? -20 * unit : width + 20 * unit;
        const startY = Math.random() * height;
        
        super({
            emoji: '🐝',
            x: startX,
            y: startY,
            size: 4.8,
            speed: 0.5 * unit,
            orient: 'left'
        });
        
        this.horizontalDir = side === 'left' ? 1 : -1;
        this.vx = this.horizontalDir * this.speed;
        this.verticalDir = Math.random() < 0.5 ? 1 : -1;
        this.nextVerticalChange = Date.now() + Math.random() * 1000 + 500;
    }

    update(now, width, height, unit) {
        if (now > this.nextVerticalChange) {
            this.verticalDir *= -1;
            this.nextVerticalChange = now + Math.random() * 1000 + 500;
        }

        const verticalSpeed = this.verticalDir > 0 ? 3 * unit : -5 * unit; // up is negative y
        // wait, user said "up at speed 5 and down at speed 3"
        // in canvas y increases downwards. So "up" is negative y.
        const vy = this.verticalDir < 0 ? -5 * (unit/60) : 3 * (unit/60); // normalizing to frame rate roughly
        
        // Let's use the provided speed values directly if they are per frame or scale them.
        // The original game used speed 0.5 * unit. 
        // I'll assume speed 5 and 3 are relative to the unit.
        
        this.x += this.vx;
        this.y += (this.verticalDir < 0 ? -5 : 3) * (unit * 0.05); // Adjusting scale for smoothness
    }
}
