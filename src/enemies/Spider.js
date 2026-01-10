import { BaseEnemy } from './BaseEnemy.js';

export class Spider extends BaseEnemy {
    constructor(width, height, unit) {
        const targetX = Math.random() * (width - 40 * unit) + 20 * unit;
        const targetY = Math.random() * (height - 40 * unit) + 20 * unit;
        const startY = -10 * unit;
        
        super({
            emoji: '🕷️',
            x: targetX,
            y: startY,
            size: 4.8,
            speed: 0,
            orient: 'up'
        });
        
        this.targetX = targetX;
        this.targetY = targetY;
        this.startY = startY;
        this.state = 'descending';
        this.progress = 0;
        
        // Slower movement durations
        this.mainDescendDuration = 300;
        this.mainAscendDuration = 120;
        this.waitTimer = 0;
        this.currentRotation = 0;
        this.turnDir = Math.random() < 0.5 ? 1 : -1;
    }

    update(now, width, height, unit) {
        if (this.state === 'descending') {
            this.progress += 1 / this.mainDescendDuration;
            const p = Math.min(1, this.progress);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - p, 3);
            this.y = this.startY + (this.targetY - this.startY) * ease;
            
            if (this.progress >= 1) {
                this.state = 'waiting';
                this.waitTimer = now + (Math.random() * 1000 + 1500);
                this.progress = 0;
            }
        } else if (this.state === 'waiting') {
            // Rotate while waiting
            const waitTotal = 1500;
            const waitProgress = Math.max(0, 1 - (this.waitTimer - now) / waitTotal);
            this.currentRotation = Math.PI + (waitProgress * Math.PI * this.turnDir);
            
            if (now >= this.waitTimer) {
                this.state = 'ascending';
                this.progress = 0;
                this.currentRotation = 0;
            }
        } else if (this.state === 'ascending') {
            this.progress += 1 / this.mainAscendDuration;
            const p = Math.min(1, this.progress);
            // Ease in cubic
            const ease = Math.pow(p, 3);
            this.y = this.targetY - (this.targetY - this.startY) * ease;
            
            if (this.progress >= 1) {
                this.isDead = true;
            }
        }
    }

    draw(ctx, sprites, unit) {
        // Draw the web line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        
        // Draw spider with rotation
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.currentRotation);
        
        const sprite = sprites[this.emoji];
        if (sprite) {
            const d = this.size * unit * 2;
            ctx.drawImage(sprite, -d / 2, -d / 2, d, d);
        }
        ctx.restore();
    }
}
