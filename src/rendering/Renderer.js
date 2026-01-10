import { SpriteCache } from './SpriteCache.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.spriteCache = new SpriteCache();
        
        this.width = 0;
        this.height = 0;
        this.unit = 1;
    }

    init() {
        this.spriteCache.preRender();
    }

    resize() {
        const container = document.getElementById('game-container');
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.width = rect.width;
        this.height = rect.height;
        
        // Set canvas size with device pixel ratio for sharp rendering
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        // Calculate unit based on height (1 unit = height / 200)
        // Ensure unit is at least a sane minimum
        this.unit = Math.max(0.1, this.height / 200);
        
        // Update CSS variable for UI scaling
        document.documentElement.style.setProperty('--u', `${this.unit}px`);
        
        return {
            width: this.width,
            height: this.height,
            unit: this.unit
        };
    }

    getSprites() {
        return this.spriteCache.getAllSprites();
    }

    getDimensions() {
        return {
            width: this.width,
            height: this.height,
            unit: this.unit
        };
    }

    clear() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    render(now, hero, rewardManager, enemyManager, opacity = 1) {
        this.clear();
        
        const sprites = this.spriteCache.getAllSprites();
        
        this.ctx.globalAlpha = opacity;

        // Draw rewards and floating texts
        rewardManager.draw(this.ctx, sprites, this.unit, now, opacity);
        
        // Draw enemies
        enemyManager.draw(this.ctx, sprites, this.unit, opacity);
        
        // Draw hero
        hero.draw(this.ctx, sprites, this.unit, now);

        this.ctx.globalAlpha = 1.0;
    }
}
