// Les contenus (JSON, éditables depuis l'admin) référencent les photos par leur chemin
// "/src/assets/...". On les résout ici pour qu'Astro les optimise (WebP, tailles multiples).
const files = import.meta.glob('/src/assets/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}', { eager: true });

/** Renvoie l'objet image importé, ou null si le chemin est vide ou introuvable. */
export function img(path) {
  if (!path) return null;
  const found = files[path];
  if (!found) {
    console.warn(`[images] Photo introuvable : ${path}`);
    return null;
  }
  return found.default;
}

/** Vrai si un texte contient encore un placeholder à compléter. */
export const isPlaceholder = (s) => typeof s === 'string' && s.includes('[À COMPLÉTER');
