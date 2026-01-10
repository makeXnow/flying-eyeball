import { BaseEnemy } from './BaseEnemy.js';

export class Ant extends BaseEnemy {
    constructor(x, y, unit, leader = null, offset = 0) {
        super({
            emoji: '🐜',
            x, y,
            size: 1.8,
            speed: 0.25 * unit,
            orient: 'up'
        });
        this.canEatRewards = true;
        this.leader = leader;
        this.offset = offset;
        this.history = [];
        
        // Leaders pick a diagonal direction
        if (!leader) {
            const diagonals = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
            this.angle = diagonals[Math.floor(Math.random() * diagonals.length)];
        }
        
        this.phase = Math.random() * Math.PI * 2;
    }

    update(now, width, height, unit, rewards) {
        if (!this.leader) {
            // Leader movement with sine wave
            this.phase += 0.08;
            const perpAngle = this.angle + Math.PI / 2;
            const wave = Math.cos(this.phase) * (unit * 0.1);
            
            this.vx = Math.cos(this.angle) * this.speed + Math.cos(perpAngle) * wave;
            this.vy = Math.sin(this.angle) * this.speed + Math.sin(perpAngle) * wave;
            
            this.x += this.vx;
            this.y += this.vy;
            
            // Store history for followers
            this.history.push({ x: this.x, y: this.y, vx: this.vx, vy: this.vy });
            if (this.history.length > 100) this.history.shift();
        } else {
            // Follower movement - follow leader's path
            const targetIdx = this.leader.history.length - 1 - this.offset;
            const target = this.leader.history[Math.max(0, targetIdx)];
            if (target) {
                this.x = target.x;
                this.y = target.y;
                this.vx = target.vx;
                this.vy = target.vy;
            }
        }

        // Update angle for drawing
        this.angle = Math.atan2(this.vy, this.vx);

        // Ants can eat rewards
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

    draw(ctx, sprites, unit) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 2);
        
        const sprite = sprites[this.emoji];
        if (sprite) {
            const d = this.size * unit * 2;
            ctx.drawImage(sprite, -d / 2, -d / 2, d, d);
        }
        ctx.restore();
    }
}
