import { SPRITE_RESOLUTION, REWARD_DATA, ENEMY_CONFIG } from '../core/constants.js';

export class SpriteCache {
    constructor() {
        this.sprites = {};
    }

    /**
     * Pre-renders all emoji sprites to offscreen canvases for better performance.
     * This avoids rendering emoji text on every frame.
     */
    preRender() {
        // Collect all emojis we need
        const emojis = new Set();
        
        // Add reward emojis
        Object.keys(REWARD_DATA).forEach(emoji => emojis.add(emoji));
        
        // Add enemy emojis
        ENEMY_CONFIG.forEach(config => emojis.add(config.emoji));
        
        // Add hero wing emoji
        emojis.add('🪽');

        // Render each emoji to an offscreen canvas
        emojis.forEach(emoji => {
            const offscreen = document.createElement('canvas');
            offscreen.width = SPRITE_RESOLUTION;
            offscreen.height = SPRITE_RESOLUTION;
            
            const ctx = offscreen.getContext('2d');
            ctx.font = `${SPRITE_RESOLUTION * 0.8}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, SPRITE_RESOLUTION / 2, SPRITE_RESOLUTION / 2);
            
            this.sprites[emoji] = offscreen;
        });

        // Load external images
        const externalImages = {
            'Eye_Blur': 'art/Eye_Blur.png'
        };

        Object.entries(externalImages).forEach(([name, path]) => {
            const img = new Image();
            img.src = path;
            this.sprites[name] = img;
        });
    }

    getSprite(emoji) {
        return this.sprites[emoji];
    }

    getAllSprites() {
        return this.sprites;
    }
}
