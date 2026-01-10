import { BaseEnemy } from './BaseEnemy.js';

export class Ant extends BaseEnemy {
    constructor(x, y, unit, leader = null, offset = 0) {
        super({
            emoji: '🐜',
            x, y,
            size: 3.6,
            speed: 0.3 * unit,
            orient: 'left'
        });
        this.canEatRewards = true;
        this.leader = leader;
        this.offset = offset; // frames behind leader
        this.history = [];
        this.angle = Math.PI / 4 * (Math.random() < 0.5 ? 1 : -1);
        this.phase = Math.random() * Math.PI * 2;
    }

    update(now, width, height, unit, rewards) {
        if (!this.leader) {
            // Leader movement: Diagonal sine wave
            this.phase += 0.05;
            const sineOffset = Math.sin(this.phase) * (unit * 2);
            
            const baseVx = Math.cos(this.angle) * this.speed;
            const baseVy = Math.sin(this.angle) * this.speed;
            
            // Add sine perpendicular to direction
            const perpAngle = this.angle + Math.PI / 2;
            this.vx = baseVx + Math.cos(perpAngle) * (Math.cos(this.phase) * 0.1 * unit);
            this.vy = baseVy + Math.sin(perpAngle) * (Math.cos(this.phase) * 0.1 * unit);
            
            this.x += this.vx;
            this.y += this.vy;
            
            // Store history for followers
            this.history.push({ x: this.x, y: this.y, vx: this.vx, vy: this.vy });
            if (this.history.length > 50) this.history.shift();
        } else {
            // Follower movement
            const targetIdx = Math.max(0, this.leader.history.length - 1 - this.offset);
            const target = this.leader.history[targetIdx];
            if (target) {
                this.x = target.x;
                this.y = target.y;
                this.vx = target.vx;
                this.vy = target.vy;
            }
        }

        // Eat rewards
        if (rewards) {
            for (let i = rewards.length - 1; i >= 0; i--) {
                const r = rewards[i];
                const dist = Math.sqrt((this.x - r.x) ** 2 + (this.y - r.y) ** 2);
                if (dist < (this.size * unit + r.size)) {
                    rewards.splice(i, 1);
                }
            }
        }
    }
}
