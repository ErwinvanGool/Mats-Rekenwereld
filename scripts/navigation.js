/**
 * navigation.js
 * Screen routing for the single-page application.
 *
 * Screen IDs (matching HTML section IDs):
 *   screen-home          – landing / main menu
 *   screen-operation     – choose operation (addition, subtraction, …)
 *   screen-exercise      – active math question
 *   screen-result        – end-of-session summary & stars
 *   screen-builds        – workshop / drag-and-drop construction
 *   screen-progress      – progress overview for the child
 *   screen-parent        – PIN entry gate
 *   screen-parent-panel  – parent settings panel (behind PIN)
 */

import { state } from './state.js';

/** All registered screen element IDs */
const SCREENS = [
  'screen-home',
  'screen-worldmap',
  'screen-build-select',
  'screen-operation',
  'screen-exercise',
  'screen-result',
  'screen-builds',
  'screen-progress',
  'screen-parent',
  'screen-parent-panel',
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Navigate to the given screen, hiding all others.
 * Dispatches a custom `screenchange` event on the document so other modules
 * can react (e.g. progress.js refreshes its charts when its screen opens).
 *
 * @param {string} screenId  – one of the SCREENS values above
 */
export function navigateTo(screenId) {
  if (!SCREENS.includes(screenId)) {
    console.error(`[navigation] Unknown screen: "${screenId}"`);
    return;
  }

  SCREENS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.toggle('screen--active', id === screenId);
      el.setAttribute('aria-hidden', id !== screenId ? 'true' : 'false');
    }
  });

  state.currentScreen = screenId;

  document.dispatchEvent(
    new CustomEvent('screenchange', { detail: { screenId } })
  );
}

/**
 * Return the currently active screen ID.
 * @returns {string}
 */
export function currentScreen() {
  return state.currentScreen;
}

/**
 * Attach click handlers to elements that carry a `data-nav` attribute.
 * Example: <button data-nav="screen-builds">Bouwen</button>
 * Call once during app init.
 */
export function initNavigation() {
  document.addEventListener('click', (event) => {
    const target = /** @type {HTMLElement} */ (event.target).closest('[data-nav]');
    if (!target) return;

    const screenId = target.dataset.nav;
    navigateTo(screenId);
  });
}
