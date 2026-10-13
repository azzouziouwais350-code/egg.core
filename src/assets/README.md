# Ressources graphiques

- `sprites/<oeuf>/<etat>.svg` : 7 œufs × 5 états (idle, selected, cooking, almost, done), grille 32×32.
- `scenery/*.svg` : éléments du paysage (nuages, lunes, château, îles, porte, escalier, portail…).
- `eggCursor.png`, `eggShellCursor.png` : curseurs d'origine du projet.

Générés par `npm run assets` (scripts/generate-assets.js). Chaque fichier peut être remplacé
individuellement (même nom) par une illustration faite à la main : l'application charge
les ressources par nom, sans dépendre de leur contenu.
