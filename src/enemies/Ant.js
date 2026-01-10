import { BaseEnemy } from './BaseEnemy.js';
import { ENEMY_CONFIG } from '../core/constants.js';

export class Ant extends BaseEnemy {
    constructor(x, y, unit, leader = null, offset = 0) {
        const config = ENEMY_CONFIG.find(c => c.emoji === '🐜');
        // Speed is 3x slower than roach
        const antSpeed = config.speed * unit;
        super({ emoji: '🐜', x, y, size: config.size, speed: antSpeed, orient: 'left' });
        this.canEatRewards = true; this.leader = leader; this.offset = offset; this.history = [];
        
        if (!leader) {
            this.angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.distTraveled = 0;
            // Paths are 2x bigger than roach (original 15+5 * 2 = 30+10)
            this.nextTurnAt = (Math.random() * 30 + 10) * unit;
        }
    }

    update(now, width, height, unit, rewards) {
        if (!this.leader) {
            super.update(now, width, height, unit);
            this.distTraveled += this.speed;
            if (this.distTraveled >= this.nextTurnAt) {
                this.angle += (Math.random() * 160 - 80) * Math.PI / 180;
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
                this.distTraveled = 0;
                this.nextTurnAt = (Math.random() * 30 + 10) * unit;
            }
            this.history.push({ x: this.x, y: this.y, vx: this.vx, vy: this.vy });
            if (this.history.length > 300) this.history.shift();
        } else {
            const targetIdx = this.leader.history.length - 1 - this.offset;
            const target = this.leader.history[Math.max(0, targetIdx)];
            if (target) { 
                this.x = target.x; 
                this.y = target.y; 
                this.vx = target.vx; 
                this.vy = target.vy; 
            }
        }
        
        // Ants can eat rewards
        if (rewards) {
            for (let i = rewards.length - 1; i >= 0; i--) {
                const r = rewards[i];
                const dist = Math.sqrt((this.x - r.x) ** 2 + (this.y - r.y) ** 2);
                if (dist < (this.size * unit + r.size)) rewards.splice(i, 1);
            }
        }
    }
}
