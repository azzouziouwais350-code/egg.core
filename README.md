# EggTimer — Dreamcore Pixel Fusion

Minuteur de cuisson d'œufs (inspiré de @NashAllery) : sept types d'œufs, un compte à rebours précis,
et une identité visuelle unique qui fusionne Dreamcore, gothique pixel, Y2K, ordinateur rétro, pastel,
néon d'arcade, espaces liminaux et pixel minimal.

Stack d'origine conservée : React 19 + webpack + Babel, avec l'enveloppe Electron.

## Lancer dans GitHub Codespaces

```bash
npm install          # (le devcontainer le fait déjà ; Electron n'est pas téléchargé en Codespaces)
npm run dev          # serveur de développement sur le port 3000
```

Ouvre l'onglet **Ports** de Codespaces → port **3000** → « Ouvrir dans le navigateur ».

Autres commandes :

| Commande | Effet |
|---|---|
| `npm run build` | build de production dans `public/` (`index.html` + bundle + ressources) |
| `npm test` | tests unitaires de la logique du minuteur |
| `npm run assets` | régénère tous les sprites et éléments de décor SVG |
| `npm start` | application Electron (après `npm run build`, sur une machine avec écran) |

## Organisation

```
src/
  data/eggTypes.js        les 7 œufs (durée, texte, scène, particules) — source unique
  lib/timerCore.js        logique pure du compte à rebours (Date.now + instant de fin)
  lib/audio.js            carillon synthétisé (Web Audio)
  hooks/useCountdown.js   hook React : un seul intervalle, resynchronisation au retour d'onglet
  hooks/usePrefs.js       préférences (son, animations, CRT, durées personnalisées) en localStorage
  scenes/scenes.js        composition du paysage de chaque œuf
  components/             interface (minuteur, grille, réglages, fin de cuisson…)
  styles/                 variables, base, paysage, composants
  assets/sprites/<œuf>/<état>.svg   7 œufs × 5 états
  assets/scenery/*.svg    décor (lunes, nuages, château, îles, portail, temple…)
scripts/                  générateur des SVG pixel
tests/                    tests de timerCore
```

## Précision du minuteur

Le temps restant n'est jamais décrémenté : il est recalculé à chaque mise à jour comme
`instant de fin − Date.now()`. Les animations n'influencent pas le compte à rebours, et un onglet
en arrière-plan retrouve le bon temps dès son retour (événements `visibilitychange`, `focus`, `pageshow`).

Les durées sont des préréglages indicatifs : la cuisson dépend de la taille de l'œuf, de sa température
initiale et de la méthode. Elles sont modifiables et mémorisées.
