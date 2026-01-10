import { BaseEnemy } from './BaseEnemy.js';
import { ENEMY_CONFIG } from '../core/constants.js';

export class Bee extends BaseEnemy {
    constructor(width, height, unit) {
        const activeConfig = window.ENEMY_CONFIG || ENEMY_CONFIG;
        const config = activeConfig.find(c => c.emoji === '🐝');
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const startX = side === 'left' ? -10 * unit : width + 10 * unit;
        const startY = Math.random() * height;
        const startAngle = side === 'left' ? 0 : Math.PI;
        
        super({
            emoji: '🐝',
            x: startX,
            y: startY,
            size: config.size,
            speed: config.speed * unit,
            orient: 'left'
        });

        this.angle = startAngle;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.distTraveled = 0;
        this.nextTurnAt = (Math.random() * 40 + 60) * unit;
        this.targetAngle = this.angle;
        this.isRotating = false;
        this.rotationSpeed = 0.02;
        this.lastTurnDir = Math.random() < 0.5 ? 1 : -1;
    }

    update(now, width, height, unit) {
        if (this.isRotating) {
            let diff = this.targetAngle - this.angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            
            if (Math.abs(diff) < this.rotationSpeed) {
                this.angle = this.targetAngle;
                this.isRotating = false;
                this.distTraveled = 0;
                this.nextTurnAt = (Math.random() * 40 + 60) * unit;
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
                this.lastTurnDir *= -1;
                const turnAmount = (Math.random() * 10 + 10) * Math.PI / 180;
                this.targetAngle = this.angle + (turnAmount * this.lastTurnDir);
            }
        }
    }
}
