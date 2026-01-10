export class IrisGradient {
    /**
     * Draws smooth color bursts on the iris.
     * @param {CanvasRenderingContext2D} ctx - The canvas context.
     * @param {number} x - The center X of the iris.
     * @param {number} y - The center Y of the iris.
     * @param {number} radius - The radius of the iris.
     * @param {number} now - Current game time in ms.
     * @param {Array} bursts - Array of color burst objects {time, color}.
     */
    static draw(ctx, x, y, radius, now, bursts) {
        if (!bursts || bursts.length === 0) return;

        bursts.forEach(b => {
            const elapsed = now - b.time;
            if (elapsed < 2250) {
                ctx.save();
                
                // Create a clipping region for the iris
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.clip();

                if (elapsed < 750) {
                    const progress = elapsed / 750;
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                    
                    // Increase steps for smoothness to prevent banding
                    // Using 60 steps for a very smooth transition
                    const steps = 60;
                    const spread = 0.4; // Width of the gradient transition zone

                    for (let i = 0; i <= steps; i++) {
                        const stop = i / steps;
                        
                        // Calculate opacity based on distance from the expansion front
                        // We want a smooth bell-curve-like falloff or a smooth step
                        // The original logic was: g.addColorStop(0, b.color); g.addColorStop(Math.max(0, p - 0.3), b.color); g.addColorStop(Math.min(1, p + 0.3), 'rgba(0,0,0,0)');
                        
                        let alpha = 0;
                        if (stop <= progress - spread/2) {
                            alpha = 1;
                        } else if (stop >= progress + spread/2) {
                            alpha = 0;
                        } else {
                            // Smoothly interpolate between 1 and 0 across the spread
                            const t = (stop - (progress - spread/2)) / spread;
                            // Use a smoothstep-like function for even better transition
                            alpha = 1 - (3 * t * t - 2 * t * t * t);
                        }

                        if (alpha > 0) {
                            gradient.addColorStop(stop, this.hexToRgba(b.color, alpha));
                        } else {
                            gradient.addColorStop(stop, 'rgba(0,0,0,0)');
                        }
                    }
                    ctx.fillStyle = gradient;
                } else {
                    // Fading out the solid color
                    const alpha = elapsed < 1750 ? 1 : 1 - (elapsed - 1750) / 500;
                    ctx.fillStyle = this.hexToRgba(b.color, alpha);
                }
                
                ctx.fill();
                ctx.restore();
            }
        });
    }

    /**
     * Converts a hex color or named color to rgba.
     * @param {string} color - Hex color (e.g., #ffffff) or named color.
     * @param {number} alpha - Alpha value (0 to 1).
     * @returns {string} rgba color string.
     */
    static hexToRgba(color, alpha) {
        if (color.startsWith('#')) {
            let r, g, b;
            if (color.length === 4) {
                r = parseInt(color[1] + color[1], 16);
                g = parseInt(color[2] + color[2], 16);
                b = parseInt(color[3] + color[3], 16);
            } else {
                r = parseInt(color.slice(1, 3), 16);
                g = parseInt(color.slice(3, 5), 16);
                b = parseInt(color.slice(5, 7), 16);
            }
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        
        // If it's already an rgb/rgba string, handle it
        if (color.startsWith('rgb')) {
            const match = color.match(/\d+/g);
            if (match && match.length >= 3) {
                return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
            }
        }

        // Fallback for named colors if any (though REWARD_DATA uses hex)
        // For simplicity, returning the color with alpha if it's not hex
        return color;
    }
}
