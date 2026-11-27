import { FACE_MODES } from './core/modeCatalog.js?v=14';
import { Hero } from './entities/Hero.js?v=14';
import { SpriteCache } from './rendering/SpriteCache.js?v=14';
import { REWARD_DATA } from './core/constants.js';

const shuffled = items => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
};

const picker = document.getElementById('mode-picker');
const expressionHoldSeconds = 1;
// Give each face a random, unique slot across one expression's holding time.
const phaseSlots = shuffled(FACE_MODES.map((_, index) => index));
const readyFaces = [];
for (const [index, mode] of FACE_MODES.entries()) {
    const link = document.createElement('a');
    link.className = 'mode';
    link.href = mode.path;
    link.setAttribute('aria-label', `Play ${mode.name}`);
    link.dataset.mode = mode.id;
    link.style.setProperty('--phase', `${phaseSlots[index] * expressionHoldSeconds / FACE_MODES.length}s`);
    const fruitCount = 1 + Math.floor(Math.random() * 4);
    const fruitSlots = shuffled([0, 1, 2, 3]);
    const fruitMarkup = shuffled(Object.keys(REWARD_DATA)).slice(0, fruitCount)
        .map((fruit, index) => `<span class="portrait-fruit fruit-slot-${fruitSlots[index]}" aria-hidden="true">${fruit}</span>`).join('');
    link.innerHTML = `<div class="portrait"><div class="portrait-halo"></div>${fruitMarkup}<div class="portrait-flight"><span class="portrait-wing wing-left" aria-hidden="true">🪽</span><span class="portrait-wing wing-right" aria-hidden="true">🪽</span><img class="face-smile" src="${mode.sprite}" alt="${mode.name}" width="124" height="148"><img class="face-surprise" src="${mode.surpriseSprite}" alt="" aria-hidden="true" width="124" height="148"></div></div><strong>${mode.name}</strong><span class="play">Play →</span>`;
    // Show the smile until both frames have decoded, preventing an empty half-cycle.
    readyFaces.push(Promise.all([...link.querySelectorAll('img')].map(img => img.decode()))
        .then(() => link).catch(() => null));
    picker.appendChild(link);
}
// Use one start frame so image-loading time cannot cancel out the assigned stagger.
Promise.all(readyFaces).then(links => requestAnimationFrame(() => {
    links.forEach(link => link?.classList.add('expressions-ready'));
}));

// Render the actual classic character so the picker uses the same eyeball and wings.
const canvas = document.getElementById('eyeball-preview');
const sprites = new SpriteCache();
sprites.preRender();
const blur = sprites.getSprite('Eye_Blur');
if (!blur.complete) await new Promise(resolve => { blur.onload = resolve; blur.onerror = resolve; });
const hero = new Hero(canvas.width / 2, canvas.height / 2);
hero.draw(canvas.getContext('2d'), sprites.getAllSprites(), 10, performance.now());
