/**
 * data.js
 * Static definitions: math operations, build parts, reward badges.
 * Nothing here is mutated at runtime — import and read only.
 */

// ---------------------------------------------------------------------------
// Math operations configuration
// ---------------------------------------------------------------------------

/** @type {Record<string, OperationConfig>} */
export const OPERATIONS = {
  addition: {
    id: 'addition',
    label: 'Optellen',
    symbol: '+',
    levels: [
      { id: 1, maxA: 5,  maxB: 5,  description: 'Tot 10'   },
      { id: 2, maxA: 10, maxB: 10, description: 'Tot 20'   },
      { id: 3, maxA: 20, maxB: 20, description: 'Tot 40'   },
      { id: 4, maxA: 50, maxB: 50, description: 'Tot 100'  },
    ],
  },
  subtraction: {
    id: 'subtraction',
    label: 'Aftrekken',
    symbol: '−',
    levels: [
      { id: 1, maxA: 10, maxB: 5,  description: 'Tot 10'   },
      { id: 2, maxA: 20, maxB: 10, description: 'Tot 20'   },
      { id: 3, maxA: 40, maxB: 20, description: 'Tot 40'   },
      { id: 4, maxA: 100,maxB: 50, description: 'Tot 100'  },
    ],
  },
  multiplication: {
    id: 'multiplication',
    label: 'Vermenigvuldigen',
    symbol: '×',
    levels: [
      { id: 1, maxA: 5,  maxB: 2,  description: 'Tafels 1–2' },
      { id: 2, maxA: 5,  maxB: 5,  description: 'Tafels 1–5' },
      { id: 3, maxA: 10, maxB: 5,  description: 'Tafels 1–5×10' },
      { id: 4, maxA: 10, maxB: 10, description: 'Tafels 1–10' },
    ],
  },
  division: {
    id: 'division',
    label: 'Delen',
    symbol: '÷',
    levels: [
      { id: 1, maxA: 10, maxB: 2,  description: 'Delen door 1–2' },
      { id: 2, maxA: 25, maxB: 5,  description: 'Delen door 1–5' },
      { id: 3, maxA: 50, maxB: 5,  description: 'Delen door 1–5' },
      { id: 4, maxA: 100,maxB: 10, description: 'Delen door 1–10' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Build parts – pieces used in the drag-and-drop construction game
// ---------------------------------------------------------------------------

/**
 * Each "build" is a themed construction project.
 * `parts` lists the draggable pieces that compose it.
 * A part is unlocked by earning the required number of stars.
 */
export const BUILDS = [
  {
    id: 'rocket',
    label: 'Raket',
    thumbnail: 'assets/images/rocket_thumb.png',
    starsRequired: 0,
    parts: [
      { id: 'rocket_body',   label: 'Raketlichaam', starsToUnlock: 0,  slot: 'body'   },
      { id: 'rocket_nose',   label: 'Neuskegel',    starsToUnlock: 5,  slot: 'nose'   },
      { id: 'rocket_fin_l',  label: 'Linker vin',   starsToUnlock: 10, slot: 'fin_l'  },
      { id: 'rocket_fin_r',  label: 'Rechter vin',  starsToUnlock: 10, slot: 'fin_r'  },
      { id: 'rocket_engine', label: 'Motor',        starsToUnlock: 15, slot: 'engine' },
      { id: 'rocket_window', label: 'Venster',      starsToUnlock: 20, slot: 'window' },
    ],
  },
  {
    id: 'castle',
    label: 'Kasteel',
    thumbnail: 'assets/images/castle_thumb.png',
    starsRequired: 30,
    parts: [
      { id: 'castle_base',   label: 'Fundament',   starsToUnlock: 30, slot: 'base'    },
      { id: 'castle_wall_l', label: 'Linker muur', starsToUnlock: 35, slot: 'wall_l'  },
      { id: 'castle_wall_r', label: 'Rechter muur',starsToUnlock: 35, slot: 'wall_r'  },
      { id: 'castle_tower',  label: 'Toren',       starsToUnlock: 40, slot: 'tower'   },
      { id: 'castle_gate',   label: 'Poort',       starsToUnlock: 45, slot: 'gate'    },
      { id: 'castle_flag',   label: 'Vlag',        starsToUnlock: 50, slot: 'flag'    },
    ],
  },
  {
    id: 'treehouse',
    label: 'Boomhut',
    thumbnail: 'assets/images/treehouse_thumb.png',
    starsRequired: 60,
    parts: [
      { id: 'tree_trunk',    label: 'Stam',        starsToUnlock: 60, slot: 'trunk'   },
      { id: 'tree_platform', label: 'Vloer',       starsToUnlock: 65, slot: 'platform'},
      { id: 'tree_walls',    label: 'Wanden',      starsToUnlock: 70, slot: 'walls'   },
      { id: 'tree_roof',     label: 'Dak',         starsToUnlock: 75, slot: 'roof'    },
      { id: 'tree_ladder',   label: 'Ladder',      starsToUnlock: 80, slot: 'ladder'  },
      { id: 'tree_window',   label: 'Raam',        starsToUnlock: 85, slot: 'window'  },
    ],
  },
];

// ---------------------------------------------------------------------------
// Reward badges – milestone achievements
// ---------------------------------------------------------------------------

export const BADGES = [
  { id: 'first_correct',   label: 'Eerste goed!',       icon: '⭐',  condition: { totalCorrect: 1    } },
  { id: 'ten_correct',     label: '10 op een rij!',     icon: '🔥',  condition: { streak: 10         } },
  { id: 'fifty_correct',   label: '50 goed beantwoord', icon: '🏅',  condition: { totalCorrect: 50   } },
  { id: 'hundred_correct', label: '100 goed beantwoord',icon: '🥇',  condition: { totalCorrect: 100  } },
  { id: 'all_operations',  label: 'Alles geprobeerd!',  icon: '🌟',  condition: { allOperations: true } },
  { id: 'first_build',     label: 'Eerste bouw klaar!', icon: '🏗️',  condition: { completedBuilds: 1  } },
  { id: 'all_builds',      label: 'Alles gebouwd!',     icon: '🏆',  condition: { completedBuilds: 3  } },
];

// ---------------------------------------------------------------------------
// Questions per session
// ---------------------------------------------------------------------------

/** Number of math questions shown per exercise session. */
export const QUESTIONS_PER_SESSION = 10;

/** Stars awarded per correct answer. */
export const STARS_PER_CORRECT = 1;

/** Extra stars awarded for a perfect (no-mistake) session. */
export const BONUS_STARS_PERFECT_SESSION = 3;
