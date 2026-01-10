import { BaseEnemy } from './BaseEnemy.js';
import { ENEMY_CONFIG } from '../core/constants.js';

export class Fly extends BaseEnemy {
    constructor(x, y, angle, unit) {
        const activeConfig = window.ENEMY_CONFIG || ENEMY_CONFIG;
        const config = activeConfig.find(c => c.emoji === '🪰');
        super({
            emoji: '🪰',
            x, y, angle,
            size: config.size,
            speed: config.speed * unit,
            orient: 'up'
        });
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.distTraveled = 0;
        this.nextTurnAt = (Math.random() * 30 + 20) * unit;
        this.targetAngle = angle;
        this.isRotating = false;
        this.rotationSpeed = 0.03;
    }

    update(now, width, height, unit) {
        if (this.isRotating) {
            let diff = this.targetAngle - this.angle;
            // Normalize angle difference
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            
            if (Math.abs(diff) < this.rotationSpeed) {
                this.angle = this.targetAngle;
                this.isRotating = false;
                this.distTraveled = 0;
                this.nextTurnAt = (Math.random() * 30 + 20) * unit;
            } else {
                this.angle += Math.sign(diff) * this.rotationSpeed;
            }
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.x += this.vx;
            this.y += this.vy;
        } else {
            super.update(now, width, height, unit);
            this.distTraveled += this.speed;
            if (this.distTraveled >= this.nextTurnAt) {
                this.isRotating = true;
                this.targetAngle = this.angle + ((Math.random() * 85 - 45) * Math.PI / 180);
            }
        }
    }
}
