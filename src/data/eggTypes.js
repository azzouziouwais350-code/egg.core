// Source de vérité unique pour les sept types d'œufs.
// Les durées sont des préréglages indicatifs (en secondes) : elles sont modifiables
// dans l'interface car la cuisson dépend de la taille, de la température initiale
// et de la méthode utilisée.

export const SPRITE_STATES = ['idle', 'selected', 'cooking', 'almost', 'done'];

export const EGG_TYPES = [
  {
    id: 'coque',
    name: 'Œuf à la coque',
    short: 'À la coque',
    defaultSeconds: 3 * 60,
    description: 'Blanc pris, jaune brillant et coulant.',
    doneMessage: 'Le jaune est lumineux : mouillettes prêtes !',
    scene: 'moon-clouds', // lune lavande, nuages roses, plateforme flottante
    particles: 'gold-sparkle',
    accent: '#FF6EC7',
  },
  {
    id: 'mollet',
    name: 'Œuf mollet',
    short: 'Mollet',
    defaultSeconds: 5 * 60,
    description: 'Blanc ferme, jaune crémeux au cœur.',
    doneMessage: 'Le portail s’ouvre : ton œuf mollet est prêt.',
    scene: 'portal-arches', // portail magique, arches anciennes
    particles: 'orbit',
    accent: '#B9A0FF',
  },
  {
    id: 'poche',
    name: 'Œuf poché',
    short: 'Poché',
    defaultSeconds: 6 * 60,
    description: 'Blanc soyeux, jaune tendre, sans coquille.',
    doneMessage: 'Poché à point, servi sur un halo céleste.',
    scene: 'cyan-platform', // nuages bleu pastel, reflets cyan
    particles: 'bubbles',
    accent: '#00E5FF',
  },
  {
    id: 'brouille',
    name: 'Œuf brouillé',
    short: 'Brouillé',
    defaultSeconds: 4 * 60,
    description: 'Onctueux, doré, tout en douceur.',
    doneMessage: 'Les œufs brouillés sont dorés : à table !',
    scene: 'golden-kitchen', // cuisine onirique, lumière dorée
    particles: 'steam-gold',
    accent: '#FFBE62',
  },
  {
    id: 'vapeur',
    name: 'Œuf à la vapeur',
    short: 'Vapeur',
    defaultSeconds: 7 * 60,
    description: 'Cuisson douce dans un nuage de vapeur.',
    doneMessage: 'La vapeur se dissipe : l’œuf est prêt.',
    scene: 'mist-liminal', // lune bleue, architecture liminale
    particles: 'steam',
    accent: '#8FD3FF',
  },
  {
    id: 'dur',
    name: 'Œuf dur',
    short: 'Dur',
    defaultSeconds: 9 * 60,
    description: 'Blanc et jaune fermes, parfait à emporter.',
    doneMessage: 'Le halo s’illumine : l’œuf dur est cuit.',
    scene: 'gothic-castle', // château gothique, lune rose
    particles: 'dark-motes',
    accent: '#C77DFF',
  },
  {
    id: 'parfait',
    name: 'Œuf parfait',
    short: 'Parfait',
    defaultSeconds: 10 * 60,
    description: 'Présentation soignée, texture crémeuse.',
    doneMessage: 'Le temple s’illumine : ton œuf parfait est prêt.',
    scene: 'celestial-temple', // temple céleste, anneaux irisés
    particles: 'halo-gold',
    accent: '#FFE08A',
  },
];

export const EGG_BY_ID = Object.fromEntries(EGG_TYPES.map(e => [e.id, e]));
export const DEFAULT_EGG_ID = 'coque';
export const MIN_SECONDS = 5;
export const MAX_SECONDS = 99 * 60 + 59;
