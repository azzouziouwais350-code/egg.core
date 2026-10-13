// Chargement des ressources par nom : remplacer un SVG (même nom) suffit.
const spriteCtx = require.context('./assets/sprites', true, /\.svg$/);
const sceneryCtx = require.context('./assets/scenery', false, /\.svg$/);

export const spriteUrl = (egg, state) => spriteCtx(`./${egg}/${state}.svg`);
export const sceneryUrl = name => sceneryCtx(`./${name}.svg`);
