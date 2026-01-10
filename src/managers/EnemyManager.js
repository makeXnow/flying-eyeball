import { ENEMY_CONFIG, HERO_COLLISION_RADIUS, MAX_ENEMIES, MAX_VISIBLE_QUEUE, TEST_ENEMY, START_SPAWN, MAX_SPAWN, MAX_SPAWN_TIME } from '../core/constants.js';
import { Fly } from '../enemies/Fly.js';
import { Beetle } from '../enemies/Beetle.js';
import { Bee } from '../enemies/Bee.js';
import { Ant, AntGroup } from '../enemies/Ant.js';
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
        // First spawn happens after a short delay
        this.nextSpawnTime = now + 500;
    }

    getSpawnInterval(elapsed) {
        // Ramp from START_SPAWN to MAX_SPAWN over MAX_SPAWN_TIME
        const progress = Math.min(elapsed / (MAX_SPAWN_TIME * 1000), 1);
        return START_SPAWN - (START_SPAWN - MAX_SPAWN) * progress;
    }

    selectWeightedEnemy(currentScore) {
        const isTest = this.testerMode !== null;
        
        // Filter available enemies based on score threshold
        const available = ENEMY_CONFIG.filter((config) => {
            if (isTest) return config.emoji === this.testerMode;
            return currentScore >= config.firstPts;
        });

        if (available.length === 0) return null;

        const totalWeight = available.reduce((sum, config) => sum + (config.weight || 20), 0);
        let random = Math.random() * totalWeight;

        for (const config of available) {
            const weight = config.weight || 20;
            random -= weight;
            if (random <= 0) {
                // Return the index in the original ENEMY_CONFIG
                return ENEMY_CONFIG.findIndex(c => c.emoji === config.emoji);
            }
        }
        return 0; // Fallback
    }

    spawn(index, width, height, unit) {
        const config = ENEMY_CONFIG[index];
        if (!config) return;
        
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
                // Spawn a group of ants as a single unit
                this.queue.push(new AntGroup(x, y, unit));
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

        // Check if it's time to spawn (can spawn multiple to catch up)
        let catchUpLimit = 0;
        while (now >= this.nextSpawnTime && catchUpLimit < 5) {
            const enemyIndex = this.selectWeightedEnemy(currentScore);
            if (enemyIndex !== null) {
                this.spawn(enemyIndex, width, height, unit);
                
                const elapsed = now - gameStartTime;
                const interval = this.getSpawnInterval(elapsed);
                this.nextSpawnTime += interval * 1000;
                catchUpLimit++;
            } else {
                // If no enemy is available yet, check again soon
                this.nextSpawnTime = now + 500;
                break;
            }
        }

        // Fill active slots from queue
        while (this.enemies.length < MAX_ENEMIES && this.queue.length > 0) {
            this.enemies.push(this.queue.shift());
        }

        // Update active enemies
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
