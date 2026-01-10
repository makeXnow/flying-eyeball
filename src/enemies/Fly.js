import { BaseEnemy } from './BaseEnemy.js';

export class Fly extends BaseEnemy {
    constructor(x, y, angle, unit) {
        super({
            emoji: '🪰',
            x, y, angle,
            size: 6,
            speed: 0.3 * unit,
            orient: 'up'
        });
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.distTraveled = 0;
        this.nextTurnAt = (Math.random() * 30 + 20) * unit; // 20-50 units
        this.targetAngle = angle;
        this.isRotating = false;
        this.rotationSpeed = 0.05; // rad per frame
    }

    update(now, width, height, unit) {
        if (this.isRotating) {
            const diff = this.targetAngle - this.angle;
            if (Math.abs(diff) < this.rotationSpeed) {
                this.angle = this.targetAngle;
                this.isRotating = false;
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
                this.distTraveled = 0;
                this.nextTurnAt = (Math.random() * 30 + 20) * unit;
            } else {
                this.angle += Math.sign(diff) * this.rotationSpeed;
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
            }
        } else {
            super.update(now, width, height, unit);
            this.distTraveled += this.speed;
            if (this.distTraveled >= this.nextTurnAt) {
                this.isRotating = true;
                const turnDeg = Math.random() * 85 - 45; // -45 to 40
                this.targetAngle = this.angle + (turnDeg * Math.PI / 180);
            }
        }
    }
}
