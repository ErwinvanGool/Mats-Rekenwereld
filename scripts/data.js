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
    completionBadge: 'Autorijder! 🚗',
    referenceSvg: `<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="52" width="170" height="52" rx="10" fill="#FF6B35"/>
      <rect x="55" y="20" width="95" height="38" rx="8" fill="#FF6B35"/>
      <rect x="65" y="26" width="36" height="26" rx="4" fill="#87CEEB" opacity="0.9"/>
      <rect x="112" y="26" width="28" height="26" rx="4" fill="#87CEEB" opacity="0.9"/>
      <circle cx="50" cy="108" r="20" fill="#2d2d2d"/>
      <circle cx="50" cy="108" r="9" fill="#888"/>
      <circle cx="150" cy="108" r="20" fill="#2d2d2d"/>
      <circle cx="150" cy="108" r="9" fill="#888"/>
    </svg>`,
    parts: [
      { id: 'car_body',     label: 'Carrosserie',        blocksToUnlock: 0, slot: 'body',     emoji: '🟧', color: '#FF6B35' },
      { id: 'car_wheel_fl', label: 'Wiel voor-links',    blocksToUnlock: 2, slot: 'wheel_fl', emoji: '⚫', color: '#444444' },
      { id: 'car_wheel_fr', label: 'Wiel voor-rechts',   blocksToUnlock: 2, slot: 'wheel_fr', emoji: '⚫', color: '#444444' },
      { id: 'car_wheel_rl', label: 'Wiel achter-links',  blocksToUnlock: 4, slot: 'wheel_rl', emoji: '⚫', color: '#444444' },
      { id: 'car_wheel_rr', label: 'Wiel achter-rechts', blocksToUnlock: 4, slot: 'wheel_rr', emoji: '⚫', color: '#444444' },
      { id: 'car_window',   label: 'Raam',               blocksToUnlock: 6, slot: 'window',   emoji: '🔵', color: '#87CEEB' },
    ],
  },
  {
    id: 'house',
    label: 'Huis',
    emoji: '🏠',
    thumbnail: 'assets/images/house_thumb.png',
    blocksRequired: 10,
    theme: 'gebouw',
    completionBadge: 'Bouwmeester! 🏠',
    referenceSvg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="82" width="140" height="75" fill="#FBBF24"/>
      <polygon points="18,88 100,12 182,88" fill="#EF4444"/>
      <rect x="82" y="122" width="36" height="35" rx="3" fill="#92400E"/>
      <rect x="42" y="95" width="28" height="22" rx="3" fill="#87CEEB"/>
      <rect x="130" y="95" width="28" height="22" rx="3" fill="#87CEEB"/>
      <rect x="128" y="22" width="18" height="36" rx="3" fill="#9CA3AF"/>
      <rect x="96" y="122" width="8" height="10" rx="2" fill="#D97706"/>
    </svg>`,
    parts: [
      { id: 'house_base',     label: 'Muren',        blocksToUnlock: 10, slot: 'base',     emoji: '🟨', color: '#FBBF24' },
      { id: 'house_roof',     label: 'Dak',          blocksToUnlock: 12, slot: 'roof',     emoji: '🔺', color: '#EF4444' },
      { id: 'house_door',     label: 'Deur',         blocksToUnlock: 14, slot: 'door',     emoji: '🚪', color: '#92400E' },
      { id: 'house_window_l', label: 'Raam links',   blocksToUnlock: 15, slot: 'window_l', emoji: '🪟', color: '#87CEEB' },
      { id: 'house_window_r', label: 'Raam rechts',  blocksToUnlock: 15, slot: 'window_r', emoji: '🪟', color: '#87CEEB' },
      { id: 'house_chimney',  label: 'Schoorsteen',  blocksToUnlock: 17, slot: 'chimney',  emoji: '🟫', color: '#9CA3AF' },
    ],
  },
  {
    id: 'dinosaur',
    label: 'Dinosaurus',
    emoji: '🦕',
    thumbnail: 'assets/images/dinosaur_thumb.png',
    blocksRequired: 25,
    theme: 'dier',
    completionBadge: 'Dinosaurusjager! 🦕',
    referenceSvg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="88" cy="98" rx="62" ry="42" fill="#4ADE80"/>
      <ellipse cx="162" cy="68" rx="32" ry="26" fill="#4ADE80"/>
      <circle cx="174" cy="60" r="5" fill="#1a1a1a"/>
      <path d="M148,78 Q162,88 176,78" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M28,92 Q12,115 8,132 Q22,118 36,108" fill="#4ADE80"/>
      <rect x="58" y="132" width="20" height="28" rx="7" fill="#22C55E"/>
      <rect x="98" y="132" width="20" height="28" rx="7" fill="#22C55E"/>
      <polygon points="72,52 78,66 66,66" fill="#15803D"/>
      <polygon points="88,46 94,60 82,60" fill="#15803D"/>
      <polygon points="104,50 110,64 98,64" fill="#15803D"/>
    </svg>`,
    parts: [
      { id: 'dino_body',   label: 'Lichaam',            blocksToUnlock: 25, slot: 'body',   emoji: '🟢', color: '#4ADE80' },
      { id: 'dino_head',   label: 'Hoofd',              blocksToUnlock: 27, slot: 'head',   emoji: '🦕', color: '#22C55E' },
      { id: 'dino_tail',   label: 'Staart',             blocksToUnlock: 29, slot: 'tail',   emoji: '🐍', color: '#22C55E' },
      { id: 'dino_leg_fl', label: 'Poot voor-links',    blocksToUnlock: 31, slot: 'leg_fl', emoji: '🦵', color: '#16A34A' },
      { id: 'dino_leg_fr', label: 'Poot voor-rechts',   blocksToUnlock: 31, slot: 'leg_fr', emoji: '🦵', color: '#16A34A' },
      { id: 'dino_spikes', label: 'Stekels',            blocksToUnlock: 33, slot: 'spikes', emoji: '⚡', color: '#15803D' },
    ],
  },
  {
    id: 'rocket',
    label: 'Raket',
    emoji: '🚀',
    thumbnail: 'assets/images/rocket_thumb.png',
    blocksRequired: 40,
    theme: 'ruimte',
    completionBadge: 'Ruimtevaarder! 🚀',
    referenceSvg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="76" y="45" width="48" height="88" rx="8" fill="#60A5FA"/>
      <polygon points="76,47 100,6 124,47" fill="#BFDBFE"/>
      <polygon points="76,105 48,148 76,130" fill="#2563EB"/>
      <polygon points="124,105 152,148 124,130" fill="#2563EB"/>
      <rect x="86" y="133" width="28" height="14" rx="4" fill="#FCD34D"/>
      <circle cx="100" cy="82" r="14" fill="#DBEAFE"/>
      <circle cx="100" cy="82" r="9" fill="#7DD3FC"/>
      <ellipse cx="100" cy="152" rx="14" ry="8" fill="#F97316" opacity="0.85"/>
    </svg>`,
    parts: [
      { id: 'rocket_body',   label: 'Raketlichaam', blocksToUnlock: 40, slot: 'body',   emoji: '🔷', color: '#60A5FA' },
      { id: 'rocket_nose',   label: 'Neuskegel',    blocksToUnlock: 43, slot: 'nose',   emoji: '🔼', color: '#BFDBFE' },
      { id: 'rocket_fin_l',  label: 'Linker vin',   blocksToUnlock: 45, slot: 'fin_l',  emoji: '◀️', color: '#2563EB' },
      { id: 'rocket_fin_r',  label: 'Rechter vin',  blocksToUnlock: 45, slot: 'fin_r',  emoji: '▶️', color: '#2563EB' },
      { id: 'rocket_engine', label: 'Motor',        blocksToUnlock: 47, slot: 'engine', emoji: '🔥', color: '#FCD34D' },
      { id: 'rocket_window', label: 'Venster',      blocksToUnlock: 50, slot: 'window', emoji: '🔵', color: '#7DD3FC' },
    ],
  },
  {
    id: 'firetruck',
    label: 'Brandweerauto',
    emoji: '🚒',
    thumbnail: 'assets/images/firetruck_thumb.png',
    blocksRequired: 60,
    theme: 'voertuig',
    completionBadge: 'Brandweerheld! 🚒',
    referenceSvg: `<svg viewBox="0 0 220 140" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="58" width="180" height="58" rx="8" fill="#EF4444"/>
      <rect x="132" y="26" width="64" height="38" rx="6" fill="#EF4444"/>
      <rect x="142" y="32" width="22" height="24" rx="3" fill="#87CEEB"/>
      <rect x="168" y="32" width="18" height="24" rx="3" fill="#87CEEB"/>
      <rect x="38" y="36" width="80" height="7" rx="2" fill="#D1D5DB"/>
      <rect x="43" y="24" width="4" height="30" rx="1" fill="#9CA3AF"/>
      <rect x="63" y="24" width="4" height="30" rx="1" fill="#9CA3AF"/>
      <rect x="83" y="24" width="4" height="30" rx="1" fill="#9CA3AF"/>
      <rect x="103" y="24" width="4" height="30" rx="1" fill="#9CA3AF"/>
      <circle cx="50" cy="66" r="11" fill="#F59E0B"/>
      <circle cx="55" cy="118" r="18" fill="#1F2937"/>
      <circle cx="55" cy="118" r="8" fill="#6B7280"/>
      <circle cx="160" cy="118" r="18" fill="#1F2937"/>
      <circle cx="160" cy="118" r="8" fill="#6B7280"/>
      <rect x="162" y="14" width="18" height="14" rx="4" fill="#EF4444"/>
      <circle cx="171" cy="11" r="5" fill="#FCD34D"/>
    </svg>`,
    parts: [
      { id: 'ft_body',     label: 'Cabine',              blocksToUnlock: 60, slot: 'body',     emoji: '🔴', color: '#EF4444' },
      { id: 'ft_ladder',   label: 'Ladder',              blocksToUnlock: 62, slot: 'ladder',   emoji: '🪜', color: '#D1D5DB' },
      { id: 'ft_hose',     label: 'Slang',               blocksToUnlock: 64, slot: 'hose',     emoji: '🌀', color: '#F59E0B' },
      { id: 'ft_wheel_fl', label: 'Wiel voor-links',     blocksToUnlock: 65, slot: 'wheel_fl', emoji: '⚫', color: '#1F2937' },
      { id: 'ft_wheel_fr', label: 'Wiel voor-rechts',    blocksToUnlock: 65, slot: 'wheel_fr', emoji: '⚫', color: '#1F2937' },
      { id: 'ft_wheel_rl', label: 'Wiel achter-links',   blocksToUnlock: 67, slot: 'wheel_rl', emoji: '⚫', color: '#1F2937' },
      { id: 'ft_wheel_rr', label: 'Wiel achter-rechts',  blocksToUnlock: 67, slot: 'wheel_rr', emoji: '⚫', color: '#1F2937' },
      { id: 'ft_siren',    label: 'Sirene',              blocksToUnlock: 69, slot: 'siren',    emoji: '🚨', color: '#FCD34D' },
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
