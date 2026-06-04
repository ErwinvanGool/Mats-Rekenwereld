/**
 * rewards.js
 * Star accounting and badge (achievement) logic.
 */

import { BADGES, STARS_PER_CORRECT, BONUS_STARS_PERFECT_SESSION } from './data.js';
import { state } from './state.js';
import { saveState } from './storage.js';

// ---------------------------------------------------------------------------
// Stars
// ---------------------------------------------------------------------------

/**
 * Award stars at the end of a session and persist the change.
 *
 * @param {number} correctCount  – number of correct answers in the session
 * @param {number} totalCount    – total questions in the session
 * @returns {number} stars awarded this session
 */
export function awardSessionStars(correctCount, totalCount) {
  const base = correctCount * STARS_PER_CORRECT;
  const bonus = correctCount === totalCount ? BONUS_STARS_PERFECT_SESSION : 0;
  const total = base + bonus;

  state.progress.earnedStars += total;
  state.session.starsEarned = total;

  saveState();
  return total;
}

/**
 * Spend stars (e.g. to unlock a build part).
 * Returns false if the child doesn't have enough stars.
 *
 * @param {number} amount
 * @returns {boolean}
 */
export function spendStars(amount) {
  if (state.progress.earnedStars < amount) return false;
  state.progress.earnedStars -= amount;
  saveState();
  return true;
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

/**
 * Evaluate all badge conditions and award any not yet earned.
 * Call this after every session and after every build placement.
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
 * Check a single badge's condition against the current state.
 * @param {Badge} badge
 * @param {ProgressState} progress
 * @param {BuildsState} builds
 * @returns {boolean}
 */
function isBadgeUnlocked(badge, progress, builds) {
  const c = badge.condition;

  if (c.totalCorrect !== undefined && progress.totalCorrect < c.totalCorrect) {
    return false;
  }
  if (c.streak !== undefined && progress.bestStreak < c.streak) {
    return false;
  }
  if (c.allOperations && progress.triedOperations.length < 4) {
    return false;
  }
  if (c.completedBuilds !== undefined && builds.completedBuilds.length < c.completedBuilds) {
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/**
 * Render a star display string (e.g. "⭐ 42").
 * @returns {string}
 */
export function starDisplayText() {
  return `⭐ ${state.progress.earnedStars}`;
}

/**
 * Render the list of earned badges as HTML list items.
 * @returns {string} HTML string
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
