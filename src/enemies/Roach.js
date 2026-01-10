import { BaseEnemy } from './BaseEnemy.js';

export class Roach extends BaseEnemy {
    constructor(x, y, angle, unit) {
        super({
            emoji: '🪳',
            x, y, angle,
            size: 6,
            speed: 1.0 * unit, // Half of original 2.0
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
