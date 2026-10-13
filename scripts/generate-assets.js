// Régénère tous les sprites et éléments de décor en SVG pixel :
//   npm run assets
// Les fichiers sont écrits dans src/assets/sprites/<oeuf>/<etat>.svg et
// src/assets/scenery/<nom>.svg. Ils peuvent aussi être remplacés à la main
// (même nom de fichier) sans toucher au code de l'application.

const path = require('path');
const fs = require('fs');
const { BUILDERS, STATES } = require('./sprites');
const { assets } = require('./scenery');

const root = path.join(__dirname, '..', 'src', 'assets');
let n = 0;

for (const [egg, build] of Object.entries(BUILDERS)) {
  for (const state of STATES) {
    build(state).save(path.join(root, 'sprites', egg, `${state}.svg`));
    n++;
  }
}
for (const [name, raster] of Object.entries(assets())) {
  raster.save(path.join(root, 'scenery', `${name}.svg`));
  n++;
}
console.log(`${n} fichiers SVG générés dans ${path.relative(process.cwd(), root)}`);
fs.writeFileSync(path.join(root, 'README.md'), `# Ressources graphiques

- \`sprites/<oeuf>/<etat>.svg\` : 7 œufs × 5 états (idle, selected, cooking, almost, done), grille 32×32.
- \`scenery/*.svg\` : éléments du paysage (nuages, lunes, château, îles, porte, escalier, portail…).
- \`eggCursor.png\`, \`eggShellCursor.png\` : curseurs d'origine du projet.

Générés par \`npm run assets\` (scripts/generate-assets.js). Chaque fichier peut être remplacé
individuellement (même nom) par une illustration faite à la main : l'application charge
les ressources par nom, sans dépendre de leur contenu.
`);
