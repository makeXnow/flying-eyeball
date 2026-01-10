export class BaseEnemy {
    constructor(config) {
        this.emoji = config.emoji;
        this.x = config.x;
        this.y = config.y;
        this.size = config.size; // in units
        this.speed = config.speed; // in units
        this.orient = config.orient || 'up';
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        this.angle = config.angle || 0;
        this.isDead = false;
        this.canEatRewards = false;
    }

    update(now, width, height, unit) {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx, sprites, unit) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (this.orient === 'up') {
            ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 2);
        } else if (this.orient === 'left' && this.vx > 0) {
            ctx.scale(-1, 1);
        }
        
        const sprite = sprites[this.emoji];
        if (sprite) {
            const d = this.size * unit * 2;
            ctx.drawImage(sprite, -d/2, -d/2, d, d);
        }
        ctx.restore();
    }

    isOffScreen(width, height, unit) {
        const bound = 40 * unit;
        return (this.x < -bound || this.x > width + bound || this.y < -bound || this.y > height + bound);
    }

    checkCollision(heroX, heroY, heroRadius, unit) {
        const dist = Math.sqrt((heroX - this.x) ** 2 + (heroY - this.y) ** 2);
        return dist < (heroRadius + this.size * unit);
    }
}
