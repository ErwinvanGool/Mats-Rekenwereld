/**
 * storage.js
 * Thin wrapper around localStorage.
 *
 * localStorage structure
 * ──────────────────────
 * Key: "mats_rekenwereld"
 * Value: JSON string with the shape:
 * {
 *   "version": 1,
 *   "progress": { ...ProgressState },
 *   "builds":   { ...BuildsState   },
 *   "settings": { ...SettingsState }
 * }
 *
 * Versioning allows future migrations without breaking existing saves.
 */

import { getPersistedState, hydrateState } from './state.js';

const STORAGE_KEY = 'mats_rekenwereld';
const CURRENT_VERSION = 1;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load persisted data from localStorage and hydrate the state singleton.
 * Safe to call even when no data has been saved yet.
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const migrated = migrate(parsed);
    hydrateState(migrated);
  } catch (err) {
    console.warn('[storage] Could not load saved state:', err);
  }
}

/**
 * Persist the current state to localStorage.
 * Call this after every meaningful state mutation.
 */
export function saveState() {
  try {
    const payload = {
      version: CURRENT_VERSION,
      ...getPersistedState(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('[storage] Could not save state:', err);
  }
}

/**
 * Erase all saved data (used by the parent reset feature).
 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[storage] Could not clear state:', err);
  }
}

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

/**
 * Upgrade older saved payloads to the current schema.
 * Add new `case` blocks here when CURRENT_VERSION increases.
 * @param {object} saved
 * @returns {object}
 */
function migrate(saved) {
  let data = { ...saved };

  // v0 → v1: first release, no migration needed
  if (!data.version || data.version < 1) {
    data.version = 1;
  }

  return data;
}
