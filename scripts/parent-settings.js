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
    earnedBlocks: 0,
    earnedStickers: 0,
    history: [],
    earnedBadges: [],
    triedOperations: [],
  };
  state.builds = {
    placedParts: [],
    completedBuilds: [],
    activeBuildId: 'car',
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
export function initParentPanel(panel, onAfterReset) {
  // Operation toggles and sound toggle
  panel.addEventListener('change', (event) => {
    const toggle = event.target.closest('[data-operation-toggle]');
    if (toggle) {
      const result = setOperationEnabled(toggle.dataset.operationToggle, toggle.checked);
      if (result.ok) {
        showSaveToast(panel);
      } else {
        // Revert the checkbox if the operation cannot be disabled
        toggle.checked = !toggle.checked;
      }
    }

    const levelSelect = event.target.closest('[data-level-select]');
    if (levelSelect) {
      setOperationLevel(levelSelect.dataset.levelSelect, Number(levelSelect.value));
      showSaveToast(panel);
    }

    const soundToggle = event.target.closest('[data-sound-toggle]');
    if (soundToggle) {
      setSoundEnabled(soundToggle.checked);
      showSaveToast(panel);
    }
  });

  // Action buttons (reset, change-pin, and inline confirmation steps)
  panel.addEventListener('click', (event) => {
    // Step 1: Show inline reset confirmation
    if (event.target.closest('[data-action="reset-progress"]')) {
      const actionsEl = panel.querySelector('[data-actions-area]');
      if (actionsEl) {
        actionsEl.innerHTML = `
          <div class="reset-confirm">
            <span class="reset-confirm__label">⚠️ Voortgang wissen?</span>
            <button class="btn btn--danger btn--sm" data-action="confirm-reset">Ja, wissen</button>
            <button class="btn btn--sm" data-action="cancel-reset">Annuleren</button>
          </div>`;
      }
      return;
    }

    // Step 2a: Confirmed reset
    if (event.target.closest('[data-action="confirm-reset"]')) {
      resetProgress();
      showSaveToast(panel);
      if (typeof onAfterReset === 'function') onAfterReset();
      return;
    }

    // Step 2b: Cancelled reset — restore default action buttons
    if (event.target.closest('[data-action="cancel-reset"]')) {
      restoreActionButtons(panel);
      return;
    }

    // Step 1: Show inline PIN change form
    if (event.target.closest('[data-action="change-pin"]')) {
      const actionsEl = panel.querySelector('[data-actions-area]');
      if (actionsEl) {
        actionsEl.innerHTML = `
          <div class="pin-change-form">
            <label class="pin-change-form__label" for="new-pin-input">Nieuwe pincode:</label>
            <input id="new-pin-input"
                   class="pin-change-form__input"
                   type="password"
                   inputmode="numeric"
                   maxlength="4"
                   pattern="[0-9]{4}"
                   placeholder="••••"
                   autocomplete="new-password"
                   data-new-pin>
            <button class="btn btn--sm" data-action="confirm-pin">Opslaan</button>
            <button class="btn btn--sm" data-action="cancel-pin">Annuleren</button>
          </div>
          <p class="pin-error" data-pin-change-error role="alert"></p>`;
        const input = actionsEl.querySelector('[data-new-pin]');
        if (input) input.focus();
      }
      return;
    }

    // Step 2a: Save new PIN
    if (event.target.closest('[data-action="confirm-pin"]')) {
      const input = panel.querySelector('[data-new-pin]');
      const errorEl = panel.querySelector('[data-pin-change-error]');
      const newPin = input ? input.value.trim() : '';
      const result = changePin(newPin);
      if (result.ok) {
        restoreActionButtons(panel);
        showSaveToast(panel);
      } else {
        if (errorEl) errorEl.textContent = result.error;
      }
      return;
    }

    // Step 2b: Cancel PIN change
    if (event.target.closest('[data-action="cancel-pin"]')) {
      restoreActionButtons(panel);
      return;
    }
  });
}

/**
 * Show a brief "Opgeslagen!" toast inside the parent panel.
 * @param {HTMLElement} panel
 */
function showSaveToast(panel) {
  let toast = document.querySelector('.save-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'save-toast';
    toast.textContent = '✓ Opgeslagen!';
    document.body.appendChild(toast);
  }
  toast.classList.remove('save-toast--visible');
  // Force reflow so the animation restarts
  void toast.offsetWidth;
  toast.classList.add('save-toast--visible');
}

/**
 * Restore the default action buttons (reset + change-pin) in the actions area.
 * @param {HTMLElement} panel
 */
function restoreActionButtons(panel) {
  const actionsEl = panel.querySelector('[data-actions-area]');
  if (actionsEl) {
    actionsEl.innerHTML = `
      <button class="btn btn--danger" data-action="reset-progress">Voortgang wissen</button>
      <button class="btn"            data-action="change-pin">Pincode wijzigen</button>`;
  }
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
