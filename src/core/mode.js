import { modeFromPath } from './modeCatalog.js?v=14';
export { FACE_MODES } from './modeCatalog.js?v=14';
export const CURRENT_MODE = modeFromPath(window.location.pathname);
export const MODE_ID = CURRENT_MODE?.id || 'classic';
export const MODE_NAME = CURRENT_MODE?.name || 'Eyeball';
export const FACE_MODE = Boolean(CURRENT_MODE);
export const FACE_SPRITE = CURRENT_MODE?.sprite;
export const FACE_REACTION_SPRITE = CURRENT_MODE?.surpriseSprite;
// Retained for callers that specifically identify Natalia.
export const isNataliaPath = path => modeFromPath(path)?.id === 'natalia';
export const NATALIA_MODE = MODE_ID === 'natalia';
