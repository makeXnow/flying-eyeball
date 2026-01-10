import { BaseEnemy } from './BaseEnemy.js';

export class Spider extends BaseEnemy {
    constructor(width, height, unit) {
        const targetX = Math.random() * (width - 40 * unit) + 20 * unit;
        const targetY = Math.random() * (height - 40 * unit) + 20 * unit;
        
        super({
            emoji: '🕷️',
            x: targetX,
            y: -20 * unit,
            size: 4.8,
            speed: 0, // dynamic
            orient: 'up'
        });
        
        this.targetX = targetX;
        this.targetY = targetY;
        this.state = 'descending'; // descending, waiting, ascending
        this.waitTimer = 0;
        this.startY = -20 * unit;
        this.progress = 0;
    }

    update(now, width, height, unit) {
        if (this.state === 'descending') {
            this.progress += 0.02;
            // Ease out cubic
            const ease = 1 - Math.pow(1 - this.progress, 3);
            this.y = this.startY + (this.targetY - this.startY) * ease;
            
            if (this.progress >= 1) {
                this.state = 'waiting';
                this.waitTimer = now + 1000;
            }
        } else if (this.state === 'waiting') {
            if (now > this.waitTimer) {
                this.state = 'ascending';
                this.progress = 0;
            }
        } else if (this.state === 'ascending') {
            this.progress += 0.05;
            // Ease in cubic
            const ease = Math.pow(this.progress, 3);
            this.y = this.targetY - (this.targetY - this.startY) * ease;
            
            if (this.progress >= 1) {
                this.isDead = true; // Mark for removal
            }
        }
    }

    draw(ctx, sprites, unit) {
        // Draw the web line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        super.draw(ctx, sprites, unit);
    }
}
