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
        this.growProgress = 0;
    }

    update() {
        // Grow-in animation
        this.growProgress = Math.min(1, this.growProgress + 0.02);
    }

    draw(ctx, sprites) {
        const sprite = sprites[this.emoji];
        if (sprite) {
            const displaySize = this.size * this.growProgress * 2;
            ctx.save();
            ctx.globalAlpha *= this.growProgress;
            ctx.drawImage(
                sprite, 
                this.x - displaySize / 2, 
                this.y - displaySize / 2, 
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
