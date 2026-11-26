export const isNataliaPath = (path) => /\/natalia\/?$/i.test(path);
export const NATALIA_MODE = isNataliaPath(window.location.pathname);
