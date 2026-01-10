import { 
    HERO_RADIUS, 
    HERO_BASE_SPEED, 
    JOYSTICK_RADIUS,
    HERO_FLAP_UP_MAX,
    HERO_FLAP_DOWN_MIN
} from '../core/constants.js';

export class Hero {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.colorBursts = [];
        this.eyeLookX = 0;
        this.eyeLookY = 0;
        this.baseSpeed = HERO_BASE_SPEED;
        this.flapPhase = 0;
        this.lastFlapUpdate = 0;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.colorBursts = [];
        this.eyeLookX = 0;
        this.eyeLookY = 0;
        this.flapPhase = 0;
        this.lastFlapUpdate = 0;
    }

    update(input, width, height, unit) {
        const inputDx = input.currX - input.startX;
        const inputDy = input.currY - input.startY;

        if (input.active) {
            const dist = Math.sqrt(inputDx * inputDx + inputDy * inputDy);
            const maxDist = JOYSTICK_RADIUS * unit;
            const power = Math.min(dist, maxDist) / maxDist;
            const angle = Math.atan2(inputDy, inputDx);
            
            this.vx = Math.cos(angle) * power * this.baseSpeed;
            this.vy = Math.sin(angle) * power * this.baseSpeed;
        } else {
            // Decelerate when not touching
            this.vx *= 0.9;
            this.vy *= 0.9;
        }

        // Apply velocity with bounds checking
        const margin = HERO_RADIUS * unit;
        this.x = Math.max(margin, Math.min(width - margin, this.x + this.vx));
        this.y = Math.max(margin, Math.min(height - margin, this.y + this.vy));

        // Update eye look direction
        const lookAngle = Math.atan2(inputDy, inputDx);
        const lookDist = input.active 
            ? Math.min(Math.sqrt(inputDx * inputDx + inputDy * inputDy) / (JOYSTICK_RADIUS * unit), 1) * (2.4 * unit) 
            : 0;
        
        // Smooth interpolation for eye movement
        this.eyeLookX += (Math.cos(lookAngle) * lookDist - this.eyeLookX) * 0.1;
        this.eyeLookY += (Math.sin(lookAngle) * lookDist - this.eyeLookY) * 0.1;
    }

    addColorBurst(time, color) {
        this.colorBursts.push({ time, color });
    }

    // Idle bob animation for when game is not active
    idleBob(now, baseX, baseY, unit) {
        const bobSpeed = 0.003;
        const bobPhase = now * bobSpeed;
        const bobAmt = unit * 6;
        
        this.x = baseX;
        const oldY = this.y;
        this.y = (baseY + unit * 2) + Math.sin(bobPhase) * bobAmt;
        this.vy = this.y - oldY;
        
        // Use the vertical movement to drive the eye direction
        const dy = this.vy;
        const lookDist = Math.min(Math.abs(dy * 10) / unit, 1) * (2.4 * unit);
        const lookAngle = dy >= 0 ? Math.PI / 2 : -Math.PI / 2;

        // Smooth interpolation for eye movement
        this.eyeLookX += (0 - this.eyeLookX) * 0.1; // Centered horizontally
        this.eyeLookY += (Math.sin(lookAngle) * lookDist - this.eyeLookY) * 0.1;
    }

    draw(ctx, sprites, unit, now) {
        // Update flap phase based on vertical velocity
        if (this.lastFlapUpdate === 0) {
            this.lastFlapUpdate = now;
        }
        const dt = now - this.lastFlapUpdate;
        this.lastFlapUpdate = now;

        const maxSpeed = this.baseSpeed;
        let multiplier;
        if (this.vy < -0.01) {
            // Scale from 1.0 baseline up to HERO_FLAP_UP_MAX at max speed
            multiplier = 1.0 + (Math.abs(this.vy) / maxSpeed) * (HERO_FLAP_UP_MAX - 1.0);
        } else if (this.vy > 0.01) {
            // Scale from 1.0 baseline down to HERO_FLAP_DOWN_MIN at max speed
            multiplier = 1.0 - (this.vy / maxSpeed) * (1.0 - HERO_FLAP_DOWN_MIN);
        } else {
            multiplier = 1.0;
        }
        
        // Clamp multiplier to requested bounds
        multiplier = Math.max(HERO_FLAP_DOWN_MIN, Math.min(HERO_FLAP_UP_MAX, multiplier));
        
        this.flapPhase = (this.flapPhase + dt * multiplier) % 600;

        ctx.save();
        ctx.translate(this.x, this.y);

        const s10 = HERO_RADIUS * unit;
        const s5 = 4 * unit;
        const s2 = 1.6 * unit;
        const s6 = 4.8 * unit;

        // Wing flap animation using accumulated phase
        const flapAngle = (this.flapPhase < 400) 
            ? (this.flapPhase / 400) * (-30 * Math.PI / 180) 
            : (1 - (this.flapPhase - 400) / 200) * (-30 * Math.PI / 180);

        // Draw wings
        const wingSprite = sprites['🪽'];
        if (wingSprite) {
            [1, -1].forEach(side => {
                ctx.save();
                ctx.scale(side, 1);
                ctx.rotate(flapAngle);
                ctx.drawImage(
                    wingSprite, 
                    (s10 + 4 * unit) - (s6 * 3.75) / 2, 
                    -(s6 * 3.75) / 2, 
                    s6 * 3.75, 
                    s6 * 3.75
                );
                ctx.restore();
            });
        }

        // Draw eyeball body
        ctx.beginPath();
        ctx.arc(0, 0, s10, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.shadowBlur = unit * 4.5;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.fill();

        // Add a very subtle outline to help visibility on white backgrounds
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = unit * 0.5;
        ctx.stroke();

        // Draw iris
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(this.eyeLookX, this.eyeLookY, s5, 0, Math.PI * 2);
        ctx.fillStyle = '#888';
        ctx.fill();

        // Draw color bursts on iris
        this.drawColorBursts(ctx, s5, now);

        // Draw pupil
        ctx.beginPath();
        ctx.arc(this.eyeLookX * 1.5, this.eyeLookY * 1.5, s2, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();

        ctx.restore();
    }

    drawColorBursts(ctx, irisRadius, now) {
        this.colorBursts.forEach(burst => {
            const elapsed = now - burst.time;
            if (elapsed < 2250) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.eyeLookX, this.eyeLookY, irisRadius, 0, Math.PI * 2);

                if (elapsed < 750) {
                    // Expanding color burst
                    const progress = elapsed / 750;
                    const gradient = ctx.createRadialGradient(
                        this.eyeLookX, this.eyeLookY, 0, 
                        this.eyeLookX, this.eyeLookY, irisRadius
                    );
                    gradient.addColorStop(0, burst.color);
                    gradient.addColorStop(Math.max(0, progress - 0.3), burst.color);
                    gradient.addColorStop(Math.min(1, progress + 0.3), 'rgba(0,0,0,0)');
                    ctx.fillStyle = gradient;
                } else {
                    // Fading out solid color
                    ctx.globalAlpha = elapsed < 1750 ? 1 : 1 - (elapsed - 1750) / 500;
                    ctx.fillStyle = burst.color;
                }
                ctx.fill();
                ctx.restore();
            }
        });

        // Clean up old bursts
        this.colorBursts = this.colorBursts.filter(b => now - b.time < 2250);
    }
}
