import { ENEMY_CONFIG, HERO_COLLISION_RADIUS } from '../core/constants.js';
import { Fly } from '../enemies/Fly.js';
import { Beetle } from '../enemies/Beetle.js';
import { Bee } from '../enemies/Bee.js';
import { Ant } from '../enemies/Ant.js';
import { Spider } from '../enemies/Spider.js';
import { Roach } from '../enemies/Roach.js';

// Enable for testing a specific enemy type (set to emoji like '🪰')
const TEST_ENEMY = '🐜';

export class EnemyManager {
    constructor() {
        this.enemies = [];
        this.spawnTimers = {};
        this.testerMode = '🐜'; // Forced ant mode
        console.log('EnemyManager initialized. Forced Tester mode:', this.testerMode);
    }

    reset(now, gameStartTime) {
        this.enemies = [];
        this.spawnTimers = {};
        ENEMY_CONFIG.forEach((config, index) => {
            this.scheduleEnemy(index, now, gameStartTime);
        });
    }

    scheduleEnemy(index, now, gameStartTime) {
        const config = ENEMY_CONFIG[index];
        const isTest = this.testerMode !== null;
        const randomWait = isTest 
            ? 3000 
            : (Math.random() * (config.max - config.min) + config.min) * 1000;
        this.spawnTimers[index] = now + randomWait;
    }

    spawn(index, width, height, unit) {
        const config = ENEMY_CONFIG[index];
        
        // If testerMode is on, only spawn if it matches
        if (this.testerMode && config.emoji !== this.testerMode) {
            return;
        }

        // Calculate spawn position from edge
        let x, y, angle;
        const margin = 10 * unit;
        const side = Math.floor(Math.random() * 4);
        
        if (side === 0) { // Top
            x = Math.random() * width;
            y = -margin;
        } else if (side === 1) { // Right
            x = width + margin;
            y = Math.random() * height;
        } else if (side === 2) { // Bottom
            x = Math.random() * width;
            y = height + margin;
        } else { // Left
            x = -margin;
            y = Math.random() * height;
        }
        
        // Angle toward center with slight randomness
        angle = Math.atan2((height / 2) - y, (width / 2) - x) + (Math.random() * 0.5 - 0.25);

        // Create enemy based on type
        switch (config.emoji) {
            case '🪰':
                this.enemies.push(new Fly(x, y, angle, unit));
                break;
            case '🪲':
                this.enemies.push(new Beetle(width, height, unit));
                break;
            case '🐝':
                this.enemies.push(new Bee(width, height, unit));
                break;
            case '🐜':
                // Spawn a group of ants
                const leader = new Ant(x, y, unit);
                this.enemies.push(leader);
                const count = Math.floor(Math.random() * 3) + 3; // 3-5 ants
                for (let i = 1; i < count; i++) {
                    this.enemies.push(new Ant(x, y, unit, leader, i * 12));
                }
                break;
            case '🕷️':
                this.enemies.push(new Spider(width, height, unit));
                break;
            case '🪳':
                this.enemies.push(new Roach(x, y, angle, unit));
                break;
        }
    }

    update(now, width, height, unit, gameStartTime, rewards, hero, onGameOver, currentScore) {
        const isTest = this.testerMode !== null;

        // Check spawn timers
        ENEMY_CONFIG.forEach((config, index) => {
            const scoreMet = isTest ? true : (currentScore >= config.firstPts);
            if (scoreMet && now >= this.spawnTimers[index]) {
                this.spawn(index, width, height, unit);
                this.scheduleEnemy(index, now, gameStartTime);
            }
        });

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(now, width, height, unit, rewards);

            // Check collision with hero
            if (enemy.checkCollision(hero.x, hero.y, HERO_COLLISION_RADIUS * unit, unit)) {
                onGameOver();
                break;
            }

            // Remove dead or off-screen enemies
            if (enemy.isDead || enemy.isOffScreen(width, height, unit)) {
                this.enemies.splice(i, 1);
            }
        }
    }

    updateGameOver(unit) {
        this.enemies.forEach(enemy => {
            enemy.y += 2 * unit; // Fall down speed during game over
        });
    }

    draw(ctx, sprites, unit, opacity = 1) {
        ctx.save();
        ctx.globalAlpha = opacity;
        this.enemies.forEach(enemy => enemy.draw(ctx, sprites, unit));
        ctx.restore();
    }
}
