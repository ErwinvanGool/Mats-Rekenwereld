/**
 * parent-settings.js
 * PIN-protected parent panel: PIN entry, settings mutations, progress reset.
 */

import { state } from './state.js';
import { saveState, clearState } from './storage.js';
import { navigateTo } from './navigation.js';
import { OPERATIONS, BUILDS } from './data.js';

// ---------------------------------------------------------------------------
// PIN handling
// ---------------------------------------------------------------------------

/**
 * Verify whether the entered PIN matches the stored parent PIN.
 * @param {string} enteredPin
 * @returns {boolean}
 */
export function verifyPin(enteredPin) {
  return enteredPin === state.settings.parentPin;
}

/**
 * Update the parent PIN.
 * @param {string} newPin  – must be exactly 4 digits
 * @returns {{ ok: boolean, error?: string }}
 */
export function changePin(newPin) {
  if (!/^\d{4}$/.test(newPin)) {
    return { ok: false, error: 'De pincode moet uit 4 cijfers bestaan.' };
  }
  state.settings.parentPin = newPin;
  saveState();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Settings mutations (called from the parent panel UI)
// ---------------------------------------------------------------------------

/**
 * Toggle a specific math operation on or off.
 * At least one operation must always remain enabled.
 *
 * @param {string} operationId
 * @param {boolean} enabled
 * @returns {{ ok: boolean, error?: string }}
 */
export function setOperationEnabled(operationId, enabled) {
  const ops = state.settings.enabledOperations;

  if (!enabled && ops.length <= 1) {
    return { ok: false, error: 'Er moet minstens één oefening ingeschakeld zijn.' };
  }

  if (enabled && !ops.includes(operationId)) {
    ops.push(operationId);
  } else if (!enabled) {
    const idx = ops.indexOf(operationId);
    if (idx !== -1) ops.splice(idx, 1);
  }

  saveState();
  return { ok: true };
}

/**
 * Set the difficulty level for a specific operation.
 * @param {string} operationId
 * @param {number} levelId
 */
export function setOperationLevel(operationId, levelId) {
  const op = OPERATIONS[operationId];
  if (!op) {
    console.error(`[parent-settings] Unknown operation: "${operationId}"`);
    return;
  }
  const validIds = op.levels.map((l) => l.id);
  if (!validIds.includes(levelId)) {
    console.error(`[parent-settings] Invalid level ${levelId} for "${operationId}"`);
    return;
  }
  state.settings.operationLevels[operationId] = levelId;
  saveState();
}

/**
 * Toggle the global sound setting.
 * @param {boolean} enabled
 */
export function setSoundEnabled(enabled) {
  state.settings.soundEnabled = enabled;
  saveState();
}

/**
 * Reset ALL child progress (stars, badges, history, builds).
 * Preserves settings (difficulty, PIN, etc.).
 */
export function resetProgress() {
  state.progress = {
    totalCorrect: 0,
    totalAttempts: 0,
    currentStreak: 0,
    bestStreak: 0,
    earnedStars: 0,
    history: [],
    earnedBadges: [],
    triedOperations: [],
  };
  state.builds = {
    placedParts: [],
    completedBuilds: [],
    activeBuildId: BUILDS[0].id,
  };
  saveState();
}

// ---------------------------------------------------------------------------
// PIN screen UI helpers
// ---------------------------------------------------------------------------

/**
 * Initialise the PIN entry screen.
 * Attaches keypad button handlers and wires up the submit flow.
 *
 * @param {HTMLElement} pinScreen        – the #screen-parent element
 * @param {HTMLElement} parentPanel      – the #screen-parent-panel element
 */
export function initPinScreen(pinScreen, parentPanel) {
  const display   = pinScreen.querySelector('[data-pin-display]');
  const keypad    = pinScreen.querySelector('[data-pin-keypad]');
  const errorMsg  = pinScreen.querySelector('[data-pin-error]');
  let   entered   = '';

  if (!keypad) return;

  keypad.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-key]');
    if (!btn) return;

    const key = btn.dataset.key;

    if (key === 'del') {
      entered = entered.slice(0, -1);
    } else if (key === 'ok') {
      if (verifyPin(entered)) {
        entered = '';
        updateDisplay(display, entered);
        if (errorMsg) errorMsg.textContent = '';
        navigateTo('screen-parent-panel');
      } else {
        if (errorMsg) errorMsg.textContent = 'Onjuiste pincode. Probeer opnieuw.';
        entered = '';
        updateDisplay(display, entered);
      }
      return;
    } else if (/^\d$/.test(key) && entered.length < 4) {
      entered += key;
    }

    updateDisplay(display, entered);
  });
}

/**
 * Initialise the parent settings panel with live controls.
 * @param {HTMLElement} panel  – the #screen-parent-panel element
 */
export function initParentPanel(panel) {
  // Operation toggles
  panel.addEventListener('change', (event) => {
    const toggle = event.target.closest('[data-operation-toggle]');
    if (toggle) {
      setOperationEnabled(toggle.dataset.operationToggle, toggle.checked);
    }

    const levelSelect = event.target.closest('[data-level-select]');
    if (levelSelect) {
      setOperationLevel(levelSelect.dataset.levelSelect, Number(levelSelect.value));
    }

    const soundToggle = event.target.closest('[data-sound-toggle]');
    if (soundToggle) {
      setSoundEnabled(soundToggle.checked);
    }
  });

  // Reset progress button
  panel.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="reset-progress"]')) {
      if (window.confirm('Weet je zeker dat je alle voortgang wilt wissen?')) {
        resetProgress();
        alert('Voortgang gewist.');
      }
    }

    if (event.target.closest('[data-action="change-pin"]')) {
      const newPin = window.prompt('Voer een nieuwe 4-cijferige pincode in:');
      if (newPin !== null) {
        const result = changePin(newPin);
        if (result.ok) {
          alert('Pincode gewijzigd.');
        } else {
          alert(result.error);
        }
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Update the PIN display (shows dots for entered digits).
 * @param {HTMLElement|null} el
 * @param {string}           entered
 */
function updateDisplay(el, entered) {
  if (!el) return;
  el.textContent = '●'.repeat(entered.length).padEnd(4, '○');
}
