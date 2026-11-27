// Shared by the game, picker, and scores API. Order matches the character picker.
export const FACE_MODES = ['Milana', 'Giavana', 'Lorenzo', 'Melanie', 'Natalia'].map((name, index) => ({
    id: name.toLowerCase(), name, path: name, sprite: `art/${name.toLowerCase()}-face-smile.webp`,
    surpriseSprite: `art/${name.toLowerCase()}-face-surprise.webp`,
    noseY: [0.63, 0.63, 0.69, 0.66, 0.69][index],
}));
export const FACE_MODE_IDS = FACE_MODES.map(mode => mode.id);
export const modeFromPath = path => {
    let decoded;
    try { decoded = decodeURIComponent(path); } catch { return null; }
    const name = decoded.replace(/\/$/, '').split('/').pop().toLowerCase();
    return FACE_MODES.find(mode => mode.id === name) || null;
};
