import { ENEMY_CONFIG, HERO_COLLISION_RADIUS, MAX_ENEMIES, MAX_VISIBLE_QUEUE, SPAWN_SETTINGS, TEST_ENEMY } from '../core/constants.js';
import { Fly } from '../enemies/Fly.js';
import { Beetle } from '../enemies/Beetle.js';
import { Bee } from '../enemies/Bee.js';
import { Ant } from '../enemies/Ant.js';
import { Spider } from '../enemies/Spider.js';
import { Roach } from '../enemies/Roach.js';

export class EnemyManager {
    constructor() {
        this.enemies = [];
        this.testerMode = TEST_ENEMY;
        this.queue = [];
        this.nextSpawnTime = 0;
    }

    reset(now, gameStartTime) {
        this.enemies = [];
        this.queue = [];
        // First spawn happens after a short delay to ensure everything is ready
        this.nextSpawnTime = now + 500;
    }

    getSpawnInterval(elapsed) {
        const { startDelay, endDelay, rampDuration } = SPAWN_SETTINGS;
        const progress = Math.min(elapsed / (rampDuration * 1000), 1);
        return startDelay - (startDelay - endDelay) * progress;
    }

    selectWeightedEnemy(currentScore) {
        const isTest = this.testerMode !== null;
        
        // Filter available enemies based on score threshold
        const available = ENEMY_CONFIG.filter((config, index) => {
            if (isTest) return config.emoji === this.testerMode;
            return currentScore >= config.firstPts;
        });

        if (available.length === 0) return null;

        const totalWeight = available.reduce((sum, config) => sum + config.weight, 0);
        let random = Math.random() * totalWeight;

        for (const config of available) {
            random -= config.weight;
            if (random <= 0) {
                // Return the index in the original ENEMY_CONFIG
                return ENEMY_CONFIG.findIndex(c => c.emoji === config.emoji);
            }
        }
        return 0; // Fallback
    }

    spawn(index, width, height, unit) {
        const config = ENEMY_CONFIG[index];
        
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

        // Create enemy based on type and add to queue
        switch (config.emoji) {
            case '🪰':
                this.queue.push(new Fly(x, y, angle, unit));
                break;
            case '🪲':
                this.queue.push(new Beetle(width, height, unit));
                break;
            case '🐝':
                this.queue.push(new Bee(width, height, unit));
                break;
            case '🐜':
                // Spawn a group of ants
                const leader = new Ant(x, y, unit);
                this.queue.push(leader);
                const count = Math.floor(Math.random() * (config.groupMax - config.groupMin + 1)) + config.groupMin;
                for (let i = 1; i < count; i++) {
                    this.queue.push(new Ant(x, y, unit, leader, i * config.groupGap));
                }
                break;
            case '🕷️':
                this.queue.push(new Spider(width, height, unit));
                break;
            case '🪳':
                this.queue.push(new Roach(x, y, angle, unit));
                break;
        }
    }

    update(now, width, height, unit, gameStartTime, rewards, hero, onGameOver, currentScore) {
        if (!unit || unit <= 0) return;

        // Check if it's time to spawn
        if (now >= this.nextSpawnTime) {
            const enemyIndex = this.selectWeightedEnemy(currentScore);
            if (enemyIndex !== null) {
                this.spawn(enemyIndex, width, height, unit);
                
                const elapsed = now - gameStartTime;
                const interval = this.getSpawnInterval(elapsed);
                this.nextSpawnTime = now + interval * 1000;
            } else {
                // If no enemy is available yet, check again soon
                this.nextSpawnTime = now + 500;
            }
        }

        // Fill active slots from queue
        while (this.enemies.length < MAX_ENEMIES && this.queue.length > 0) {
            this.enemies.push(this.queue.shift());
        }

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
            enemy.y += 2 * unit;
        });
        this.queue.forEach(enemy => {
            enemy.y += 2 * unit;
        });
    }

    draw(ctx, sprites, unit, opacity = 1) {
        ctx.save();
        ctx.globalAlpha = opacity;
        // Draw active enemies
        this.enemies.forEach(enemy => enemy.draw(ctx, sprites, unit));
        
        // Draw queued enemies (faded) - limit to MAX_VISIBLE_QUEUE
        ctx.globalAlpha = opacity * 0.5;
        for (let i = 0; i < Math.min(this.queue.length, MAX_VISIBLE_QUEUE); i++) {
            this.queue[i].draw(ctx, sprites, unit);
        }
        ctx.restore();
    }
}
