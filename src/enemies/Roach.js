import { BaseEnemy } from './BaseEnemy.js';
import { ENEMY_CONFIG } from '../core/constants.js';

export class Roach extends BaseEnemy {
    constructor(x, y, angle, unit) {
        const activeConfig = window.ENEMY_CONFIG || ENEMY_CONFIG;
        const config = activeConfig.find(c => c.emoji === '🪳');
        super({
            emoji: '🪳',
            x: x,
            y: y,
            angle: angle,
            size: config.size,
            speed: config.speed * unit,
            orient: 'up'
        });
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.distTraveled = 0;
        this.nextTurnAt = (Math.random() * 15 + 5) * unit;
    }

    update(now, width, height, unit) {
        super.update(now, width, height, unit);
        this.distTraveled += this.speed;
        
        if (this.distTraveled >= this.nextTurnAt) {
            this.angle += (Math.random() * 160 - 80) * Math.PI / 180;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.distTraveled = 0;
            this.nextTurnAt = (Math.random() * 15 + 5) * unit;
        }
    }
}
