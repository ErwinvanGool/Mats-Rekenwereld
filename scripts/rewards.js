/**
 * rewards.js
 * Block earning, streak tracking, sticker awards, and badge logic.
 *
 * Economy:
 *   - Correct answers earn blocks (1 / 2 / 3 depending on difficulty).
 *   - Every STREAK_BONUS_THRESHOLD correct answers in a row adds bonus blocks.
 *   - Every STICKER_STREAK_THRESHOLD correct answers in a row earns a sticker.
 *   - Blocks are the currency used to unlock build parts.
 *   - Stickers are collectible rewards shown in the progress screen.
 */

import {
  BADGES,
  BLOCKS_PER_DIFFICULTY,
  STREAK_BONUS_THRESHOLD,
  STREAK_BONUS_BLOCKS,
  STICKER_STREAK_THRESHOLD,
} from './data.js';
import { state } from './state.js';
import { saveState } from './storage.js';

// ---------------------------------------------------------------------------
// Block earning — called once per correct answer
// ---------------------------------------------------------------------------

/**
 * Award blocks for a single correct answer.
 * Applies streak bonuses and sticker milestones automatically.
 *
 * @param {string} difficulty  – 'easy' | 'medium' | 'hard' (from the question)
 * @returns {{
 *   baseBlocks:   number,   blocks earned from the answer itself
 *   bonusBlocks:  number,   extra blocks from streak milestone
 *   stickerEarned: boolean, true if a streak sticker was just awarded
 *   totalBlocks:  number    sum of base + bonus
 * }}
 */
export function earnBlocksForAnswer(difficulty) {
  const { progress } = state;
  const baseBlocks  = BLOCKS_PER_DIFFICULTY[difficulty] ?? 1;
  const streak      = progress.currentStreak; // already updated by progress.recordAnswer

  // Streak bonus: extra block every STREAK_BONUS_THRESHOLD correct in a row.
  const bonusBlocks =
    streak > 0 && streak % STREAK_BONUS_THRESHOLD === 0
      ? STREAK_BONUS_BLOCKS
      : 0;

  // Sticker award: one sticker every STICKER_STREAK_THRESHOLD correct in a row.
  const stickerEarned =
    streak > 0 && streak % STICKER_STREAK_THRESHOLD === 0;

  const totalBlocks = baseBlocks + bonusBlocks;

  progress.earnedBlocks += totalBlocks;
  if (stickerEarned) progress.earnedStickers += 1;

  saveState();

  return { baseBlocks, bonusBlocks, stickerEarned, totalBlocks };
}

/**
 * Return the total blocks earned so far (convenience getter).
 * @returns {number}
 */
export function getEarnedBlocks() {
  return state.progress.earnedBlocks;
}

// ---------------------------------------------------------------------------
// Session summary — called at the end of a session
// ---------------------------------------------------------------------------

/**
 * Tally blocks earned across an entire session's answers.
 * This is used on the result screen to show a "blocks this session" count.
 * Individual block credits already happened inside earnBlocksForAnswer,
 * so this is read-only tallying.
 *
 * @param {{ question: MathQuestion, correct: boolean }[]} answers
 * @returns {number} total blocks earned in this session
 */
export function sessionBlockTotal(answers) {
  return answers.reduce((sum, { question, correct }) => {
    if (!correct) return sum;
    return sum + (BLOCKS_PER_DIFFICULTY[question.difficulty] ?? 1);
  }, 0);
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

/**
 * Evaluate all badge conditions and award any newly met ones.
 * Call after every answered question and after every build completion.
 *
 * @returns {Badge[]} newly earned badges (empty array if none)
 */
export function evaluateBadges() {
  const { progress, builds } = state;
  const newBadges = [];

  for (const badge of BADGES) {
    if (progress.earnedBadges.includes(badge.id)) continue;
    if (isBadgeUnlocked(badge, progress, builds)) {
      progress.earnedBadges.push(badge.id);
      newBadges.push(badge);
    }
  }

  if (newBadges.length > 0) saveState();
  return newBadges;
}

/**
 * @param {object} badge
 * @param {object} progress
 * @param {object} builds
 * @returns {boolean}
 */
function isBadgeUnlocked(badge, progress, builds) {
  const c = badge.condition;
  if (c.totalCorrect    !== undefined && progress.totalCorrect              < c.totalCorrect)    return false;
  if (c.streak          !== undefined && progress.bestStreak                < c.streak)          return false;
  if (c.earnedStickers  !== undefined && progress.earnedStickers            < c.earnedStickers)  return false;
  if (c.completedBuilds !== undefined && builds.completedBuilds.length      < c.completedBuilds) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/**
 * Returns a display string for the block count, e.g. "🧱 42".
 * @returns {string}
 */
export function blockDisplayText() {
  return `\ud83e\uddf1 ${state.progress.earnedBlocks}`;
}

/**
 * Returns a display string for the sticker count, e.g. "🌟 3".
 * @returns {string}
 */
export function stickerDisplayText() {
  return `\ud83c\udf1f ${state.progress.earnedStickers}`;
}

/**
 * Renders the list of earned badges as an HTML string of <li> elements.
 * @returns {string}
 */
export function badgeListHtml() {
  const earned = state.progress.earnedBadges;
  if (earned.length === 0) {
    return '<li class="badge-list__empty">Nog geen badges verdiend.</li>';
  }
  return BADGES
    .filter((b) => earned.includes(b.id))
    .map(
      (b) =>
        `<li class="badge-list__item" title="${b.label}">
           <span class="badge-list__icon">${b.icon}</span>
           <span class="badge-list__label">${b.label}</span>
         </li>`
    )
    .join('\n');
}
