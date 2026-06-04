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
      { id: 1, maxA: 5,  maxB: 5,  description: 'Tot 10',  difficulty: 'easy'   },
      { id: 2, maxA: 10, maxB: 10, description: 'Tot 20',  difficulty: 'medium' },
      { id: 3, maxA: 20, maxB: 20, description: 'Tot 40',  difficulty: 'hard'   },
    ],
  },
  subtraction: {
    id: 'subtraction',
    label: 'Aftrekken',
    symbol: '−',
    levels: [
      { id: 1, maxA: 10, maxB: 5,  description: 'Tot 10',  difficulty: 'easy'   },
      { id: 2, maxA: 20, maxB: 10, description: 'Tot 20',  difficulty: 'medium' },
      { id: 3, maxA: 40, maxB: 20, description: 'Tot 40',  difficulty: 'hard'   },
    ],
  },
  multiplication: {
    id: 'multiplication',
    label: 'Vermenigvuldigen',
    symbol: '×',
    levels: [
      { id: 1, maxA: 5,  maxB: 2,  description: 'Tafels 1–2',  difficulty: 'easy'   },
      { id: 2, maxA: 5,  maxB: 5,  description: 'Tafels 1–5',  difficulty: 'medium' },
      { id: 3, maxA: 10, maxB: 10, description: 'Tafels 1–10', difficulty: 'hard'   },
    ],
  },
  division: {
    id: 'division',
    label: 'Delen',
    symbol: '÷',
    levels: [
      { id: 1, maxA: 10, maxB: 2,  description: 'Delen ÷2',  difficulty: 'easy'   },
      { id: 2, maxA: 25, maxB: 5,  description: 'Delen ÷5',  difficulty: 'medium' },
      { id: 3, maxA: 100,maxB: 10, description: 'Delen ÷10', difficulty: 'hard'   },
    ],
  },
};

// ---------------------------------------------------------------------------
// Build parts – pieces used in the drag-and-drop construction game
// ---------------------------------------------------------------------------

/**
 * Each build is a themed construction project.
 * Parts are unlocked by earning the required number of blocks.
 * Builds become available once `blocksRequired` blocks have been earned.
 */
export const BUILDS = [
  {
    id: 'car',
    label: 'Auto',
    emoji: '🚗',
    thumbnail: 'assets/images/car_thumb.png',
    blocksRequired: 0,
    theme: 'voertuig',
    completionBadge: 'Autorijder!',
    parts: [
      { id: 'car_body',     label: 'Carrosserie',        blocksToUnlock: 0, slot: 'body'     },
      { id: 'car_wheel_fl', label: 'Wiel voor-links',    blocksToUnlock: 2, slot: 'wheel_fl' },
      { id: 'car_wheel_fr', label: 'Wiel voor-rechts',   blocksToUnlock: 2, slot: 'wheel_fr' },
      { id: 'car_wheel_rl', label: 'Wiel achter-links',  blocksToUnlock: 4, slot: 'wheel_rl' },
      { id: 'car_wheel_rr', label: 'Wiel achter-rechts', blocksToUnlock: 4, slot: 'wheel_rr' },
      { id: 'car_window',   label: 'Raam',               blocksToUnlock: 6, slot: 'window'   },
    ],
  },
  {
    id: 'house',
    label: 'Huis',
    emoji: '🏠',
    thumbnail: 'assets/images/house_thumb.png',
    blocksRequired: 10,
    theme: 'gebouw',
    completionBadge: 'Bouwmeester!',
    parts: [
      { id: 'house_base',     label: 'Muren',        blocksToUnlock: 10, slot: 'base'     },
      { id: 'house_roof',     label: 'Dak',          blocksToUnlock: 12, slot: 'roof'     },
      { id: 'house_door',     label: 'Deur',         blocksToUnlock: 14, slot: 'door'     },
      { id: 'house_window_l', label: 'Raam links',   blocksToUnlock: 15, slot: 'window_l' },
      { id: 'house_window_r', label: 'Raam rechts',  blocksToUnlock: 15, slot: 'window_r' },
      { id: 'house_chimney',  label: 'Schoorsteen',  blocksToUnlock: 17, slot: 'chimney'  },
    ],
  },
  {
    id: 'dinosaur',
    label: 'Dinosaurus',
    emoji: '🦕',
    thumbnail: 'assets/images/dinosaur_thumb.png',
    blocksRequired: 25,
    theme: 'dier',
    completionBadge: 'Dinosaurusjager!',
    parts: [
      { id: 'dino_body',   label: 'Lichaam',            blocksToUnlock: 25, slot: 'body'   },
      { id: 'dino_head',   label: 'Hoofd',              blocksToUnlock: 27, slot: 'head'   },
      { id: 'dino_tail',   label: 'Staart',             blocksToUnlock: 29, slot: 'tail'   },
      { id: 'dino_leg_fl', label: 'Poot voor-links',    blocksToUnlock: 31, slot: 'leg_fl' },
      { id: 'dino_leg_fr', label: 'Poot voor-rechts',   blocksToUnlock: 31, slot: 'leg_fr' },
      { id: 'dino_spikes', label: 'Stekels',            blocksToUnlock: 33, slot: 'spikes' },
    ],
  },
  {
    id: 'rocket',
    label: 'Raket',
    emoji: '🚀',
    thumbnail: 'assets/images/rocket_thumb.png',
    blocksRequired: 40,
    theme: 'ruimte',
    completionBadge: 'Ruimtevaarder!',
    parts: [
      { id: 'rocket_body',   label: 'Raketlichaam', blocksToUnlock: 40, slot: 'body'   },
      { id: 'rocket_nose',   label: 'Neuskegel',    blocksToUnlock: 43, slot: 'nose'   },
      { id: 'rocket_fin_l',  label: 'Linker vin',   blocksToUnlock: 45, slot: 'fin_l'  },
      { id: 'rocket_fin_r',  label: 'Rechter vin',  blocksToUnlock: 45, slot: 'fin_r'  },
      { id: 'rocket_engine', label: 'Motor',        blocksToUnlock: 47, slot: 'engine' },
      { id: 'rocket_window', label: 'Venster',      blocksToUnlock: 50, slot: 'window' },
    ],
  },
  {
    id: 'firetruck',
    label: 'Brandweerauto',
    emoji: '🚒',
    thumbnail: 'assets/images/firetruck_thumb.png',
    blocksRequired: 60,
    theme: 'voertuig',
    completionBadge: 'Brandweerheld!',
    parts: [
      { id: 'ft_body',     label: 'Cabine',              blocksToUnlock: 60, slot: 'body'     },
      { id: 'ft_ladder',   label: 'Ladder',              blocksToUnlock: 62, slot: 'ladder'   },
      { id: 'ft_hose',     label: 'Slang',               blocksToUnlock: 64, slot: 'hose'     },
      { id: 'ft_wheel_fl', label: 'Wiel voor-links',     blocksToUnlock: 65, slot: 'wheel_fl' },
      { id: 'ft_wheel_fr', label: 'Wiel voor-rechts',    blocksToUnlock: 65, slot: 'wheel_fr' },
      { id: 'ft_wheel_rl', label: 'Wiel achter-links',   blocksToUnlock: 67, slot: 'wheel_rl' },
      { id: 'ft_wheel_rr', label: 'Wiel achter-rechts',  blocksToUnlock: 67, slot: 'wheel_rr' },
      { id: 'ft_siren',    label: 'Sirene',              blocksToUnlock: 69, slot: 'siren'    },
    ],
  },
];

// ---------------------------------------------------------------------------
// Reward badges – milestone achievements
// ---------------------------------------------------------------------------

export const BADGES = [
  { id: 'first_correct',   label: 'Eerste goed!',        icon: '⭐', condition: { totalCorrect: 1    } },
  { id: 'ten_correct',     label: '10 keer goed!',       icon: '🏅', condition: { totalCorrect: 10   } },
  { id: 'fifty_correct',   label: '50 keer goed!',       icon: '🥈', condition: { totalCorrect: 50   } },
  { id: 'hundred_correct', label: '100 keer goed!',      icon: '🥇', condition: { totalCorrect: 100  } },
  { id: 'streak_3',        label: '3 op een rij!',       icon: '🔥', condition: { streak: 3          } },
  { id: 'streak_5',        label: '5 op een rij!',       icon: '💥', condition: { streak: 5          } },
  { id: 'streak_10',       label: '10 op een rij!',      icon: '🌟', condition: { streak: 10         } },
  { id: 'first_sticker',   label: 'Eerste sticker!',     icon: '🎖️', condition: { earnedStickers: 1  } },
  { id: 'five_stickers',   label: '5 stickers!',         icon: '🎗️', condition: { earnedStickers: 5  } },
  { id: 'first_build',     label: 'Eerste bouw klaar!',  icon: '🏗️', condition: { completedBuilds: 1 } },
  { id: 'all_builds',      label: 'Alles gebouwd!',      icon: '🏆', condition: { completedBuilds: 5 } },
];

// ---------------------------------------------------------------------------
// Questions per session
// ---------------------------------------------------------------------------

/** Number of math questions shown per exercise session. */
export const QUESTIONS_PER_SESSION = 10;

/**
 * Blocks awarded per correct answer, keyed by difficulty.
 * Difficulty comes from the active level config of the chosen operation.
 */
export const BLOCKS_PER_DIFFICULTY = { easy: 1, medium: 2, hard: 3 };

/** Bonus blocks awarded when the streak is a multiple of this number. */
export const STREAK_BONUS_THRESHOLD = 3;

/** Extra blocks per streak milestone. */
export const STREAK_BONUS_BLOCKS = 1;

/** A sticker is awarded every time the streak reaches this value. */
export const STICKER_STREAK_THRESHOLD = 5;
