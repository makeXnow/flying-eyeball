import { BaseEnemy } from './BaseEnemy.js';

export class Beetle extends BaseEnemy {
    constructor(width, height, unit) {
        const diameter = (Math.random() * 100 + 100) * unit;
        const radius = diameter / 2;
        const penetration = radius * (Math.random() * 0.45 + 0.05);
        
        const side = Math.floor(Math.random() * 4);
        let centerX, centerY;
        
        if (side === 0) { // Top
            centerX = Math.random() * width;
            centerY = -(radius - penetration);
        } else if (side === 1) { // Right
            centerX = width + (radius - penetration);
            centerY = Math.random() * height;
        } else if (side === 2) { // Bottom
            centerX = Math.random() * width;
            centerY = height + (radius - penetration);
        } else { // Left
            centerX = -(radius - penetration);
            centerY = Math.random() * height;
        }

        super({
            emoji: '🪲',
            x: 0, y: 0,
            size: 3.6,
            speed: 0.0025,
            orient: 'up'
        });
        
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        
        // Calculate arc angles based on penetration
        const angleToCenter = Math.atan2((height / 2) - centerY, (width / 2) - centerX);
        const spread = Math.acos((radius - penetration) / radius);
        const angularBuffer = (this.size * unit * 2) / radius;
        
        this.startAngle = angleToCenter - spread - angularBuffer;
        this.endAngle = angleToCenter + spread + angularBuffer;
        this.reverse = Math.random() < 0.5;
        this.angularPos = this.reverse ? this.endAngle : this.startAngle;
        this.wavePhase = 0;
        
        this.updatePos(unit);
    }

    updatePos(unit) {
        const prevX = this.x;
        const prevY = this.y;
        
        // Add wave motion
        this.wavePhase += 0.0375;
        const waveAmplitude = unit * 1;
        const dynamicRadius = this.radius + Math.sin(this.wavePhase) * waveAmplitude;
        
        this.x = this.centerX + Math.cos(this.angularPos) * dynamicRadius;
        this.y = this.centerY + Math.sin(this.angularPos) * dynamicRadius;
        this.vx = this.x - prevX;
        this.vy = this.y - prevY;
    }

    update(now, width, height, unit) {
        this.angularPos += this.speed * (this.reverse ? -1 : 1);
        this.updatePos(unit);
    }
}
