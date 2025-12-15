export const clamp = (v, min, max) => Math.min(Math.max(v, min), max)
export const lerp = (a, b, t) => a + (b - a) * t
export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
