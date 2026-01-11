import { BaseEnemy } from './BaseEnemy.js';
import { ENEMY_CONFIG } from '../core/constants.js';

const MAX_HISTORY = 500;

export class Ant extends BaseEnemy {
    constructor(x, y, unit, leader = null, offset = 0) {
        const activeConfig = window.ENEMY_CONFIG || ENEMY_CONFIG;
        const config = activeConfig.find(c => c.emoji === '🐜');
        const antSpeed = config.speed * unit;
        super({ emoji: '🐜', x, y, size: config.size, speed: antSpeed, orient: 'left' });
        this.leader = leader;
        this.offset = offset;
        
        if (!leader) {
            // Circular buffer for position history (avoids O(n) shift operations)
            this.history = new Array(MAX_HISTORY);
            this.historyHead = 0;
            this.historyCount = 0;
            
            this.angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.distTraveled = 0;
            this.nextTurnAt = (Math.random() * 30 + 10) * unit;
        }
    }

    // Get history entry from N positions ago (0 = most recent)
    getHistoryAt(stepsBack) {
        if (this.historyCount === 0) return null;
        const clampedSteps = Math.min(stepsBack, this.historyCount - 1);
        const idx = (this.historyHead - 1 - clampedSteps + MAX_HISTORY) % MAX_HISTORY;
        return this.history[idx];
    }

    update(now, width, height, unit, rewards, dt = 1) {
        if (!this.leader) {
            super.update(now, width, height, unit, dt);
            this.distTraveled += this.speed * dt;
            if (this.distTraveled >= this.nextTurnAt) {
                this.angle += (Math.random() * 160 - 80) * Math.PI / 180;
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
                this.distTraveled = 0;
                this.nextTurnAt = (Math.random() * 30 + 10) * unit;
            }
            // Write to circular buffer (O(1) instead of O(n) shift)
            this.history[this.historyHead] = { x: this.x, y: this.y, vx: this.vx, vy: this.vy };
            this.historyHead = (this.historyHead + 1) % MAX_HISTORY;
            this.historyCount = Math.min(this.historyCount + 1, MAX_HISTORY);
        } else {
            const target = this.leader.getHistoryAt(Math.floor(this.offset));
            if (target) { 
                this.x = target.x; 
                this.y = target.y; 
                this.vx = target.vx; 
                this.vy = target.vy; 
            }
        }
        
        if (rewards) {
            for (let i = rewards.length - 1; i >= 0; i--) {
                const r = rewards[i];
                const dx = this.x - r.x;
                const dy = this.y - r.y;
                const distSq = dx * dx + dy * dy;
                const radiusSum = this.size * unit + r.size;
                if (distSq < radiusSum * radiusSum) rewards.splice(i, 1);
            }
        }
    }
}

export class AntGroup {
    constructor(x, y, unit) {
        const config = ENEMY_CONFIG.find(c => c.emoji === '🐜');
        this.leader = new Ant(x, y, unit);
        this.ants = [this.leader];
        this.emoji = '🐜';
        this.isDead = false;
        
        const count = Math.floor(Math.random() * (config.groupMax - config.groupMin + 1)) + config.groupMin;
        for (let i = 1; i < count; i++) {
            this.ants.push(new Ant(x, y, unit, this.leader, i * (config.groupGap || 20)));
        }
    }

    update(now, width, height, unit, rewards, dt = 1) {
        this.ants.forEach(ant => ant.update(now, width, height, unit, rewards, dt));
    }

    draw(ctx, sprites, unit) {
        this.ants.forEach(ant => ant.draw(ctx, sprites, unit));
    }

    checkCollision(hx, hy, hr, unit) {
        return this.ants.some(ant => ant.checkCollision(hx, hy, hr, unit));
    }

    isOffScreen(width, height, unit) {
        // The group is off-screen only if the LAST ant (the one furthest back) is off-screen
        const lastAnt = this.ants[this.ants.length - 1];
        return lastAnt.isOffScreen(width, height, unit);
    }

    // Needed for Game Over animation
    set y(val) {
        const diff = val - this.leader.y;
        this.ants.forEach(ant => ant.y += diff);
    }
    get y() {
        return this.leader.y;
    }
}
