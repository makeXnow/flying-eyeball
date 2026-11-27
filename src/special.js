import { FACE_MODES } from './core/modeCatalog.js?v=14';
import { Hero } from './entities/Hero.js?v=14';
import { SpriteCache } from './rendering/SpriteCache.js?v=14';

const picker = document.getElementById('mode-picker');
for (const [index, mode] of FACE_MODES.entries()) {
    const link = document.createElement('a');
    link.className = 'mode';
    link.href = mode.path;
    link.setAttribute('aria-label', `Play ${mode.name}`);
    link.dataset.mode = mode.id;
    link.style.setProperty('--phase', `${-index * 0.37}s`);
    link.innerHTML = `<div class="portrait"><div class="portrait-halo"></div><span class="portrait-fruit fruit-one" aria-hidden="true">🫐</span><span class="portrait-fruit fruit-two" aria-hidden="true">🍋</span><div class="portrait-flight"><span class="portrait-wing wing-left" aria-hidden="true">🪽</span><span class="portrait-wing wing-right" aria-hidden="true">🪽</span><img class="face-smile" src="${mode.sprite}" alt="${mode.name}" width="124" height="148"><img class="face-surprise" src="${mode.surpriseSprite}" alt="" aria-hidden="true" width="124" height="148"></div></div><strong>${mode.name}</strong><span class="play">Play →</span>`;
    // Show the smile until both frames have decoded, preventing an empty half-cycle.
    Promise.all([...link.querySelectorAll('img')].map(img => img.decode()))
        .then(() => link.classList.add('expressions-ready')).catch(() => {});
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
