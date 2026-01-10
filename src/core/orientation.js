/**
 * Utility to handle enemy orientation and rotation based on movement direction.
 */
export function applyOrientation(ctx, orient, vx, vy) {
    if (orient === 'up') {
        // Up-oriented sprites (face up by default)
        ctx.rotate(Math.atan2(vy, vx) + Math.PI / 2);
    } else if (orient === 'left') {
        // Left-oriented sprites (face left by default, like 🐝 and 🐜)
        const angle = Math.atan2(vy, vx);
        if (Math.abs(angle) > Math.PI / 2) {
            // Moving Left-ish: Rotate to match angle (sprite already faces left)
            ctx.rotate(angle + Math.PI);
        } else {
            // Moving Right-ish: Rotate to angle and flip horizontally to avoid being upside down
            ctx.rotate(angle);
            ctx.scale(-1, 1);
        }
    }
}
