import { REWARD_DATA } from '../core/constants.js';

export class Reward {
    constructor(emoji, x, y, unit) {
        const data = REWARD_DATA[emoji];
        this.emoji = emoji;
        this.x = x;
        this.y = y;
        this.size = data.size * unit;
        this.pts = data.pts;
        this.color = data.color;
        this.spawnProgress = 0; // 0 to 1 over spawn animation
    }

    update(now) {
        // Spawn animation progress (0 to 1)
        this.spawnProgress = Math.min(1, this.spawnProgress + 0.025);
    }

    // Overshoot easing: grows to 1.4x then settles to 1.0x
    getSpawnScale() {
        const t = this.spawnProgress;
        if (t >= 1) return 1;
        
        // Overshoot curve: peaks at 1.4 around t=0.6, then settles to 1.0
        // Using a combination of ease-out and bounce-back
        const overshoot = 0.4;
        const peak = 0.6;
        
        if (t < peak) {
            // Growing phase: 0 → 1.2 with ease-out
            const p = t / peak;
            const eased = 1 - Math.pow(1 - p, 2);
            return eased * (1 + overshoot);
        } else {
            // Settling phase: 1.2 → 1.0 with ease-out
            const p = (t - peak) / (1 - peak);
            const eased = 1 - Math.pow(1 - p, 2);
            return (1 + overshoot) - overshoot * eased;
        }
    }

    draw(ctx, sprites, now) {
        const sprite = sprites[this.emoji];
        if (sprite) {
            // Initial spawn scale with overshoot
            const spawnScale = this.getSpawnScale();
            
            // Use a stable phase for animations (0 to 1 range)
            const scalePhase = (now % 1000) / 1000;
            const rotatePhase = (now % 4000) / 4000;

            // Looping scale animation: 1s loop, grow to 1.1x then back to 1.0x
            // Only apply loop scale after spawn animation completes
            const loopScale = this.spawnProgress >= 1 
                ? 1.0 + 0.05 * (1 + Math.sin(scalePhase * 2 * Math.PI - Math.PI / 2))
                : 1.0;
            
            // Looping rotation animation: 4s loop, ±15 degrees
            const rotation = (15 * Math.PI / 180) * Math.sin(rotatePhase * 2 * Math.PI);

            const displaySize = this.size * spawnScale * loopScale * 2;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(rotation);
            ctx.globalAlpha *= Math.min(1, this.spawnProgress * 2); // Fade in during first half of spawn
            
            ctx.drawImage(
                sprite, 
                -displaySize / 2, 
                -displaySize / 2, 
                displaySize, 
                displaySize
            );
            ctx.restore();
        }
    }

    checkCollision(heroX, heroY, heroRadius) {
        const dist = Math.sqrt((heroX - this.x) ** 2 + (heroY - this.y) ** 2);
        return dist < (heroRadius + this.size);
    }
}
