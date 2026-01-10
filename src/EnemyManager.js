import { Fly } from './enemies/Fly.js';
import { Beetle } from './enemies/Beetle.js';
import { Bee } from './enemies/Bee.js';
import { Ant } from './enemies/Ant.js';
import { Spider } from './enemies/Spider.js';
import { Roach } from './enemies/Roach.js';

export const ENEMY_TYPES = {
    FLY: '🪰',
    BEETLE: '🪲',
    BEE: '🐝',
    ANT: '🐜',
    SPIDER: '🕷️',
    ROACH: '🪳'
};

export class EnemyManager {
    constructor() {
        this.enemies = [];
        this.spawnTimers = {};
        this.testerMode = null; // Set to an emoji (e.g. '🪰') to only spawn that type
        
        this.ENEMY_CONFIG = [
            { emoji: '🪰', first: 0, min: 3, max: 6 },
            { emoji: '🪲', first: 5, min: 3, max: 12 },
            { emoji: '🐝', first: 10, min: 5, max: 10 },
            { emoji: '🐜', first: 20, min: 7, max: 15 },
            { emoji: '🕷️', first: 0, min: 2, max: 5 },
            { emoji: '🪳', first: 80, min: 2, max: 4 }
        ];
    }

    reset(now, gameStartTime) {
        this.enemies = [];
        this.spawnTimers = {};
        this.ENEMY_CONFIG.forEach((config, index) => {
            this.scheduleEnemy(index, now, gameStartTime);
        });
    }

    scheduleEnemy(index, now, gameStartTime) {
        const config = this.ENEMY_CONFIG[index];
        const unlockTime = gameStartTime + (config.first * 1000);
        const randomWait = (Math.random() * (config.max - config.min) + config.min) * 1000;
        this.spawnTimers[index] = Math.max(unlockTime, now + randomWait);
    }

    spawnEnemy(index, width, height, unit) {
        const config = this.ENEMY_CONFIG[index];
        
        // If testerMode is on, only spawn if it matches
        if (this.testerMode && config.emoji !== this.testerMode) {
            return;
        }

        let x, y, angle;
        const margin = 10 * unit;
        
        // Default spawn logic for most enemies
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { x = Math.random() * width; y = -margin; } 
        else if (side === 1) { x = width + margin; y = Math.random() * height; } 
        else if (side === 2) { x = Math.random() * width; y = height + margin; } 
        else { x = -margin; y = Math.random() * height; }
        angle = Math.atan2((height / 2) - y, (width / 2) - x) + (Math.random() * 0.5 - 0.25);

        let newEnemy;
        switch (config.emoji) {
            case '🪰':
                newEnemy = new Fly(x, y, angle, unit);
                break;
            case '🪲':
                newEnemy = new Beetle(width, height, unit);
                break;
            case '🐝':
                newEnemy = new Bee(width, height, unit);
                break;
            case '🐜':
                // Spawn a group of ants
                const count = Math.floor(Math.random() * 3) + 3; // 3-5
                const leader = new Ant(x, y, unit);
                this.enemies.push(leader);
                for (let i = 1; i < count; i++) {
                    this.enemies.push(new Ant(x, y, unit, leader, i * 10));
                }
                return; // Ant handles its own addition
            case '🕷️':
                newEnemy = new Spider(width, height, unit);
                break;
            case '🪳':
                newEnemy = new Roach(x, y, angle, unit);
                break;
        }

        if (newEnemy) {
            this.enemies.push(newEnemy);
        }
    }

    update(now, width, height, unit, gameStartTime, rewards, hero, onGameOver) {
        // Handle spawning
        this.ENEMY_CONFIG.forEach((config, index) => {
            if (now >= this.spawnTimers[index]) {
                this.spawnEnemy(index, width, height, unit);
                this.scheduleEnemy(index, now, gameStartTime);
            }
        });

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.update(now, width, height, unit, rewards);

            // Collision with hero
            if (e.checkCollision(hero.x, hero.y, 6.4 * unit, unit)) {
                onGameOver();
            }

            // Removal
            if (e.isDead || e.isOffScreen(width, height, unit)) {
                this.enemies.splice(i, 1);
            }
        }
    }

    draw(ctx, sprites, unit) {
        this.enemies.forEach(e => e.draw(ctx, sprites, unit));
    }
}
