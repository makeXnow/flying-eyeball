import { REWARD_DATA, HERO_RADIUS } from '../core/constants.js';
import { Reward } from '../entities/Reward.js';

export class RewardManager {
    constructor() {
        this.rewards = [];
        this.spawnTimers = {};
        this.floatingTexts = [];
        this.lastNow = 0;
    }

    reset(now) {
        this.rewards = [];
        this.floatingTexts = [];
        this.spawnTimers = {};
        this.lastNow = now;
        
        // Schedule initial spawns for all reward types
        Object.keys(REWARD_DATA).forEach((emoji, index) => {
            if (index === 0) {
                // First reward type (🫐) spawns immediately
                this.spawnTimers[emoji] = now;
            } else {
                this.scheduleReward(emoji, now);
            }
        });
    }

    scheduleReward(emoji, now) {
        const data = REWARD_DATA[emoji];
        const delay = (Math.random() * (data.max - data.min) + data.min) * 1000;
        this.spawnTimers[emoji] = now + delay;
    }

    spawnReward(emoji, width, height, unit) {
        const margin = 20 * unit;
        const x = Math.random() * (width - 2 * margin) + margin;
        const y = Math.random() * (height - 2 * margin) + margin;
        this.rewards.push(new Reward(emoji, x, y, unit));
    }

    update(now, width, height, unit, hero, onScoreChange) {
        const deltaTime = now - this.lastNow;
        this.lastNow = now;

        // Check spawn timers
        if (this.rewards.length >= 10) {
            // Pause spawn clock: move all timers forward by the time that passed
            Object.keys(this.spawnTimers).forEach(emoji => {
                this.spawnTimers[emoji] += deltaTime;
            });
        } else {
            Object.keys(REWARD_DATA).forEach(emoji => {
                if (this.rewards.length < 10 && now >= this.spawnTimers[emoji]) {
                    this.spawnReward(emoji, width, height, unit);
                    this.scheduleReward(emoji, now);
                }
            });
        }

        // Update rewards and check hero collision
        const heroCollisionRadius = HERO_RADIUS * unit;
        
        for (let i = this.rewards.length - 1; i >= 0; i--) {
            const reward = this.rewards[i];
            reward.update();

            if (reward.checkCollision(hero.x, hero.y, heroCollisionRadius)) {
                // Reward collected
                onScoreChange(reward.pts);
                hero.addColorBurst(now, reward.color);
                
                // Create floating text
                this.floatingTexts.push({
                    x: reward.x,
                    y: reward.y,
                    txt: `+${reward.pts}`,
                    time: now,
                    color: reward.color
                });
                
                this.rewards.splice(i, 1);
            }
        }

        // Clean up old floating texts
        this.floatingTexts = this.floatingTexts.filter(t => now - t.time <= 1000);
    }

    // Allow enemies to eat rewards (used by Ants)
    getRewards() {
        return this.rewards;
    }

    removeReward(index) {
        if (index >= 0 && index < this.rewards.length) {
            this.rewards.splice(index, 1);
        }
    }

    updateGameOver(unit) {
        this.rewards.forEach(reward => {
            reward.y += 2 * unit; // Fall down speed during game over
        });
        this.floatingTexts.forEach(t => {
            t.y += 2 * unit; // Make floating texts fall too
        });
    }

    draw(ctx, sprites, unit, now, opacity = 1) {
        // Draw rewards
        ctx.save();
        ctx.globalAlpha = opacity;
        this.rewards.forEach(reward => reward.draw(ctx, sprites));
        ctx.restore();

        // Draw floating texts
        this.floatingTexts.forEach(t => {
            const progress = (now - t.time) / 1000;
            ctx.save();
            ctx.globalAlpha = (1 - progress) * opacity;
            ctx.fillStyle = t.color;
            ctx.font = `bold ${unit * (4 + progress * 4)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(t.txt, t.x, t.y - progress * unit * 10);
            ctx.restore();
        });
    }
}
