/**
 * builds.js
 * Construction workshop logic: unlocking parts, tracking completion.
 */

import { BUILDS } from './data.js';
import { state } from './state.js';
import { saveState } from './storage.js';

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Return the Build definition for the currently active build project.
 * @returns {Build}
 */
export function getActiveBuild() {
  return BUILDS.find((b) => b.id === state.builds.activeBuildId) ?? BUILDS[0];
}

/**
 * Return all builds that are available (blocksRequired met).
 * @returns {Build[]}
 */
export function getAvailableBuilds() {
  return BUILDS.filter((b) => state.progress.earnedBlocks >= b.blocksRequired);
}

/**
 * Return true if the given part has already been placed by the child.
 * @param {string} partId
 * @returns {boolean}
 */
export function isPartPlaced(partId) {
  return state.builds.placedParts.includes(partId);
}

/**
 * Return true if the given part is unlocked (enough blocks earned).
 * @param {BuildPart} part
 * @returns {boolean}
 */
export function isPartUnlocked(part) {
  return state.progress.earnedBlocks >= part.blocksToUnlock;
}

/**
 * Return true if the given build is fully assembled.
 * @param {string} buildId
 * @returns {boolean}
 */
export function isBuildComplete(buildId) {
  return state.builds.completedBuilds.includes(buildId);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Mark a part as placed on its build.
 * Checks if this completes the build and updates state accordingly.
 *
 * @param {string} partId
 * @returns {{ placed: boolean, buildCompleted: boolean }}
 */
export function placePart(partId) {
  if (isPartPlaced(partId)) {
    return { placed: false, buildCompleted: false };
  }

  state.builds.placedParts.push(partId);

  // Check if the parent build is now complete
  const build = BUILDS.find((b) => b.parts.some((p) => p.id === partId));
  const buildCompleted =
    build != null &&
    !isBuildComplete(build.id) &&
    build.parts.every((p) => state.builds.placedParts.includes(p.id));

  if (buildCompleted) {
    state.builds.completedBuilds.push(build.id);
  }

  saveState();
  return { placed: true, buildCompleted };
}

/**
 * Switch the active build project shown in the workshop.
 * @param {string} buildId
 */
export function setActiveBuild(buildId) {
  if (!BUILDS.find((b) => b.id === buildId)) {
    console.error(`[builds] Unknown build id: "${buildId}"`);
    return;
  }
  state.builds.activeBuildId = buildId;
  saveState();
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/**
 * Return an HTML string for the parts palette of the active build.
 * Each placed part is shown as placed; locked parts show a lock icon.
 * Draggable parts carry `draggable="true"` and a `data-part-id` attribute.
 *
 * @returns {string} HTML string
 */
export function buildPaletteHtml() {
  const build = getActiveBuild();

  return build.parts
    .map((part) => {
      const placed   = isPartPlaced(part.id);
      const unlocked = isPartUnlocked(part);
      const emoji    = part.emoji || '🧱';
      const color    = part.color || '#94a3b8';

      const classes = [
        'build-part',
        placed    ? 'build-part--placed'    : '',
        !unlocked ? 'build-part--locked'    : '',
        unlocked && !placed ? 'build-part--available' : '',
      ]
        .filter(Boolean)
        .join(' ');

      const draggable = unlocked && !placed ? 'draggable="true"' : '';
      const ariaLabel = `${part.label}${placed ? ' – geplaatst' : !unlocked ? ` – ${part.blocksToUnlock} blokken nodig` : ''}`;

      return `<div class="${classes}"
                   data-part-id="${part.id}"
                   style="--part-color:${color}"
                   ${draggable}
                   aria-label="${ariaLabel}">
                <span class="build-part__emoji" aria-hidden="true">${placed ? '✅' : !unlocked ? '🔒' : emoji}</span>
                <span class="build-part__label">${part.label}</span>
                ${!unlocked ? `<span class="build-part__cost">${part.blocksToUnlock}🧱</span>` : ''}
              </div>`;
    })
    .join('\n');
}

/**
 * Return an HTML string for the visual drop-slot canvas of the active build.
 * Each slot shows the part emoji (dimmed when empty, vivid when filled).
 *
 * @returns {string} HTML string
 */
export function buildCanvasHtml() {
  const build = getActiveBuild();

  return build.parts
    .map((part) => {
      const placed   = isPartPlaced(part.id);
      const unlocked = isPartUnlocked(part);
      const emoji    = part.emoji || '🧱';
      const color    = part.color || '#94a3b8';

      const classes = [
        'build-slot',
        placed ? 'build-slot--filled' : '',
      ]
        .filter(Boolean)
        .join(' ');

      let inner;
      if (placed) {
        inner = `<span class="build-slot__emoji" aria-hidden="true">${emoji}</span>
                 <span class="build-slot__part">${part.label}</span>`;
      } else if (unlocked) {
        inner = `<span class="build-slot__emoji build-slot__emoji--ghost" aria-hidden="true">${emoji}</span>
                 <span class="build-slot__hint-icon" aria-hidden="true">👇</span>`;
      } else {
        inner = `<span class="build-slot__emoji build-slot__emoji--ghost" aria-hidden="true">🔒</span>
                 <span class="build-slot__hint">${part.blocksToUnlock} 🧱</span>`;
      }

      return `<div class="${classes}"
                   data-slot-id="${part.slot}"
                   data-expects-part="${part.id}"
                   style="--slot-color:${color}"
                   aria-label="${part.label}${placed ? ' – geplaatst' : ' – leeg'}">
                ${inner}
              </div>`;
    })
    .join('\n');
}

/**
 * Return an HTML string for the reference preview panel of the active build.
 * Shows the SVG illustration and placed-parts progress.
 *
 * @returns {string} HTML string
 */
export function buildReferenceHtml() {
  const build       = getActiveBuild();
  const placedCount = build.parts.filter((p) => isPartPlaced(p.id)).length;
  const total       = build.parts.length;

  return `<div class="builds__reference">
    <p class="builds__reference-label">🎯 Zo moet het worden:</p>
    <div class="builds__reference-svg" aria-label="Voorbeeld ${build.label}" role="img">
      ${build.referenceSvg}
    </div>
    <p class="builds__reference-progress">${placedCount} / ${total} stukken</p>
  </div>`;
}
