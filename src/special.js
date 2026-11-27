import { FACE_MODES } from './core/modeCatalog.js';
import { Hero } from './entities/Hero.js?v=13';
import { SpriteCache } from './rendering/SpriteCache.js?v=13';

const picker = document.getElementById('mode-picker');
for (const mode of FACE_MODES) {
    const link = document.createElement('a');
    link.className = 'mode';
    link.href = mode.path;
    link.setAttribute('aria-label', `Play ${mode.name}`);
    link.innerHTML = `<div class="portrait"><img src="${mode.sprite}" alt="${mode.name}" width="124" height="148"></div><strong>${mode.name}</strong><span class="play">Play →</span>`;
    picker.appendChild(link);
}

// Render the actual classic character so the picker uses the same eyeball and wings.
const canvas = document.getElementById('eyeball-preview');
const sprites = new SpriteCache();
sprites.preRender();
const blur = sprites.getSprite('Eye_Blur');
if (!blur.complete) await new Promise(resolve => { blur.onload = resolve; blur.onerror = resolve; });
const hero = new Hero(canvas.width / 2, canvas.height / 2);
hero.draw(canvas.getContext('2d'), sprites.getAllSprites(), 10, performance.now());
