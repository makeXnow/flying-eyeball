import { BaseEnemy } from './BaseEnemy.js';

export class Beetle extends BaseEnemy {
    constructor(width, height, unit) {
        const diameter = (Math.random() * 50 + 50) * unit; // 50-100 diameter
        const radius = diameter / 2;
        
        // Pick a side of the screen
        const side = Math.floor(Math.random() * 4);
        let centerX, centerY;
        
        // Place center outside so max 50% intersects
        if (side === 0) { // Top
            centerX = Math.random() * width;
            centerY = -radius;
        } else if (side === 1) { // Right
            centerX = width + radius;
            centerY = Math.random() * height;
        } else if (side === 2) { // Bottom
            centerX = Math.random() * width;
            centerY = height + radius;
        } else { // Left
            centerX = -radius;
            centerY = Math.random() * height;
        }

        super({
            emoji: '🪲',
            x: 0, y: 0, // will be set in first update
            size: 7.2,
            speed: 0.02, // angular speed
            orient: 'up'
        });
        
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.angularPos = Math.atan2((height/2) - centerY, (width/2) - centerX);
        this.direction = Math.random() < 0.5 ? 1 : -1;
        
        // Initial position
        this.updatePos();
    }

    updatePos() {
        const prevX = this.x;
        const prevY = this.y;
        this.x = this.centerX + Math.cos(this.angularPos) * this.radius;
        this.y = this.centerY + Math.sin(this.angularPos) * this.radius;
        this.vx = this.x - prevX;
        this.vy = this.y - prevY;
    }

    update(now, width, height, unit) {
        this.angularPos += this.speed * this.direction;
        this.updatePos();
    }
}
