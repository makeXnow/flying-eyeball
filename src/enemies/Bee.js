import { BaseEnemy } from './BaseEnemy.js';
import { ENEMY_CONFIG } from '../core/constants.js';

export class Bee extends BaseEnemy {
    constructor(width, height, unit) {
        const activeConfig = window.ENEMY_CONFIG || ENEMY_CONFIG;
        const config = activeConfig.find(c => c.emoji === '🐝');
        
        const fromLeft = Math.random() < 0.5;
        const startX = fromLeft ? -20 * unit : width + 20 * unit;
        const targetX = fromLeft ? width + 20 * unit : -20 * unit;
        const startY = Math.random() * height;
        const targetY = Math.random() * height;
        
        super({
            emoji: '🐝',
            x: startX,
            y: startY,
            size: config.size,
            speed: config.speed * unit,
            orient: 'left'
        });

        this.startX = startX;
        this.targetX = targetX;
        this.startY = startY;
        this.targetY = targetY;
        
        this.totalDist = Math.abs(targetX - startX);
        this.traveled = 0;
        
        // Sine wave properties
        this.bobPhase = Math.random() * Math.PI * 2;
        this.bobSpeed = 0.025 + Math.random() * 0.025;
        // Initial amplitude: 0.25x to 0.5x of original 15 units
        this.bobAmplitude = (15 * unit) * (0.25 + Math.random() * 0.25);
    }

    update(now, width, height, unit) {
        // Move horizontally
        const dir = this.targetX > this.startX ? 1 : -1;
        const vx = dir * this.speed;
        this.x += vx;
        this.traveled += this.speed;
        
        // Calculate progress (0 to 1)
        const progress = Math.min(1, this.traveled / this.totalDist);
        
        // Calculate base Y position (diagonal line from start to target)
        const baseY = this.startY + (this.targetY - this.startY) * progress;
        
        // Add vertical sine wave bobbing
        const oldPhase = this.bobPhase;
        this.bobPhase += this.bobSpeed;
        
        // After each peak or valley (when we cross the center line), pick a new random height
        if (Math.floor(oldPhase / Math.PI) !== Math.floor(this.bobPhase / Math.PI)) {
            const maxAmp = 15 * unit; // original base
            this.bobAmplitude = maxAmp * (0.25 + Math.random() * 0.25);
        }
        
        this.y = baseY + Math.sin(this.bobPhase) * this.bobAmplitude;
        
        this.vx = vx;
        this.vy = (this.y - baseY); 

        if (progress >= 1) {
            this.isDead = true;
        }
    }

    draw(ctx, sprites, unit) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Face strictly left or right based on destination
        if (this.targetX > this.startX) {
            // Moving Right: flip horizontally (sprite emoji 🐝 faces left by default)
            ctx.scale(-1, 1);
        }
        // Moving Left: no scale/rotation needed as emoji faces left
        
        const sprite = sprites[this.emoji];
        if (sprite) {
            const d = this.size * unit * 2;
            ctx.drawImage(sprite, -d / 2, -d / 2, d, d);
        }
        ctx.restore();
    }
}
