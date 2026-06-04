/**
 * progress.js
 * Progress tracking mutations and screen rendering.
 */

import { state } from './state.js';
import { saveState } from './storage.js';
import { OPERATIONS, BUILDS } from './data.js';
import { stickerCollectionHtml } from './stickers.js';
import { badgeListHtml } from './rewards.js';

// ---------------------------------------------------------------------------
// Mutations (called from main.js after each answered question / session)
// ---------------------------------------------------------------------------

/**
 * Record the result of a single answered question.
 *
 * @param {{ question: MathQuestion, given: string|number, correct: boolean }} result
 */
export function recordAnswer(result) {
  const { progress } = state;

  progress.totalAttempts += 1;

  if (result.correct) {
    progress.totalCorrect  += 1;
    progress.currentStreak += 1;
    if (progress.currentStreak > progress.bestStreak) {
      progress.bestStreak = progress.currentStreak;
    }
  } else {
    progress.currentStreak = 0;
  }

  // Track which operations have been tried
  const opId = result.question.operationId;
  if (!progress.triedOperations.includes(opId)) {
    progress.triedOperations.push(opId);
  }

  saveState();
}

/**
 * Append a session summary to the history array.
 *
 * @param {SessionRecord} record
 */
export function recordSession(record) {
  state.progress.history.unshift(record);   // newest first
  // Keep the last 50 sessions to cap storage size
  if (state.progress.history.length > 50) {
    state.progress.history.length = 50;
  }
  saveState();
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/**
 * Render the progress screen content into the given container element.
 * @param {HTMLElement} container
 */
export function renderProgressScreen(container) {
  const { progress, builds } = state;
  const accuracy =
    progress.totalAttempts > 0
      ? Math.round((progress.totalCorrect / progress.totalAttempts) * 100)
      : 0;

  container.innerHTML = `
    <h2 class="progress__title">Mijn voortgang</h2>

    <div class="progress__stats">
      <div class="progress__stat">
        <span class="progress__stat-value">${progress.earnedBlocks}</span>
        <span class="progress__stat-label">🧱 Blokken</span>
      </div>
      <div class="progress__stat">
        <span class="progress__stat-value">${progress.earnedStickers}</span>
        <span class="progress__stat-label">🌟 Stickers</span>
      </div>
      <div class="progress__stat">
        <span class="progress__stat-value">${progress.totalCorrect}</span>
        <span class="progress__stat-label">✅ Goed</span>
      </div>
      <div class="progress__stat">
        <span class="progress__stat-value">${accuracy}%</span>
        <span class="progress__stat-label">🎯 Nauwkeurig</span>
      </div>
      <div class="progress__stat">
        <span class="progress__stat-value">${progress.bestStreak}</span>
        <span class="progress__stat-label">🔥 Beste reeks</span>
      </div>
      <div class="progress__stat">
        <span class="progress__stat-value">${builds.completedBuilds.length}</span>
        <span class="progress__stat-label">🏗️ Bouwwerken</span>
      </div>
    </div>

    <h3 class="progress__section-title">🌟 Mijn stickers</h3>
    ${stickerCollectionHtml()}

    <h3 class="progress__section-title">🏗️ Voltooide bouwwerken</h3>
    ${renderCompletedBuilds(builds.completedBuilds)}

    <h3 class="progress__section-title">🏅 Badges</h3>
    <ul class="badge-list">${badgeListHtml()}</ul>

    <h3 class="progress__section-title">Laatste sessies</h3>
    ${renderHistoryTable(progress.history)}

    <h3 class="progress__section-title">Niveaus per oefening</h3>
    ${renderLevelList()}
  `;
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * @param {string[]} completedIds
 * @returns {string} HTML
 */
function renderCompletedBuilds(completedIds) {
  if (completedIds.length === 0) {
    return '<p class="progress__empty">Nog geen bouwwerken voltooid. Ga bouwen! 🏗️</p>';
  }
  const items = completedIds.map((id) => {
    const build = BUILDS.find((b) => b.id === id);
    if (!build) return '';
    return `
      <div class="completed-build-card">
        <div class="completed-build-card__svg" aria-label="${build.label}">${build.referenceSvg}</div>
        <span class="completed-build-card__emoji" aria-hidden="true">${build.emoji}</span>
        <span class="completed-build-card__label">${build.label}</span>
        <span class="completed-build-card__badge">✅ Voltooid</span>
      </div>`;
  }).join('');
  return `<div class="completed-builds-grid">${items}</div>`;
}

/**
 * @param {SessionRecord[]} history
 * @returns {string} HTML
 */
function renderHistoryTable(history) {
  if (history.length === 0) {
    return '<p class="progress__empty">Nog geen sessies gespeeld.</p>';
  }

  const rows = history
    .slice(0, 10)
    .map(
      (s) => `
      <tr>
        <td>${formatDate(s.date)}</td>
        <td>${OPERATIONS[s.operationId]?.label ?? s.operationId}</td>
        <td>${s.correct}/${s.total}</td>
        <td>${s.blocksEarned ?? 0} 🧱</td>
      </tr>`
    )
    .join('');

  return `
    <table class="progress__table">
      <thead>
        <tr>
          <th>Datum</th><th>Oefening</th><th>Score</th><th>Blokken</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/**
 * @returns {string} HTML
 */
function renderLevelList() {
  return Object.values(OPERATIONS)
    .map((op) => {
      const levelId   = state.settings.operationLevels[op.id] ?? 1;
      const levelConf = op.levels.find((l) => l.id === levelId);
      return `<div class="progress__level">
        <span class="progress__level-op">${op.label}</span>
        <span class="progress__level-badge">Niveau ${levelId}: ${levelConf?.description ?? ''}</span>
      </div>`;
    })
    .join('');
}

/**
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'short',
  });
}
