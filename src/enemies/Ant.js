import { BaseEnemy } from './BaseEnemy.js';
import { ENEMY_CONFIG } from '../core/constants.js';

export class Ant extends BaseEnemy {
    constructor(x, y, unit, leader = null, offset = 0) {
        const config = ENEMY_CONFIG.find(c => c.emoji === '🐜');
        const antSpeed = config.speed * unit;
        super({ emoji: '🐜', x, y, size: config.size, speed: antSpeed, orient: 'left' });
        this.leader = leader;
        this.offset = offset;
        this.history = [];
        
        if (!leader) {
            this.angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.distTraveled = 0;
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
        
        if (rewards) {
            for (let i = rewards.length - 1; i >= 0; i--) {
                const r = rewards[i];
                const dist = Math.sqrt((this.x - r.x) ** 2 + (this.y - r.y) ** 2);
                if (dist < (this.size * unit + r.size)) rewards.splice(i, 1);
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

    update(now, width, height, unit, rewards) {
        this.ants.forEach(ant => ant.update(now, width, height, unit, rewards));
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
