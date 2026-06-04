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
 * Return all builds that are available (starsRequired met).
 * @returns {Build[]}
 */
export function getAvailableBuilds() {
  return BUILDS.filter((b) => state.progress.earnedStars >= b.starsRequired);
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
 * Return true if the given part is unlocked (enough stars earned).
 * @param {BuildPart} part
 * @returns {boolean}
 */
export function isPartUnlocked(part) {
  return state.progress.earnedStars >= part.starsToUnlock;
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
      const placed = isPartPlaced(part.id);
      const unlocked = isPartUnlocked(part);
      const classes = [
        'build-part',
        placed   ? 'build-part--placed'   : '',
        !unlocked ? 'build-part--locked'  : '',
        unlocked && !placed ? 'build-part--available' : '',
      ]
        .filter(Boolean)
        .join(' ');

      const draggable = unlocked && !placed ? 'draggable="true"' : '';
      const lockIcon  = !unlocked
        ? `<span class="build-part__lock" aria-label="Vergrendeld (${part.starsToUnlock}⭐ nodig)">🔒</span>`
        : '';

      return `<div class="${classes}" data-part-id="${part.id}" ${draggable}
                   aria-label="${part.label}${placed ? ' (geplaatst)' : ''}">
                ${lockIcon}
                <span class="build-part__label">${part.label}</span>
              </div>`;
    })
    .join('\n');
}
