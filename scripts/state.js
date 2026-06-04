/**
 * state.js
 * Single-source-of-truth for runtime application state.
 *
 * Do NOT import this into data.js or storage.js (would create a cycle).
 * All other modules read/write state through the exported `state` object
 * or the helper functions below.
 */

import { OPERATIONS, BUILDS, QUESTIONS_PER_SESSION } from './data.js';

// ---------------------------------------------------------------------------
// Default (blank-slate) state shapes
// ---------------------------------------------------------------------------

/** @returns {ProgressState} */
function defaultProgress() {
  return {
    totalCorrect: 0,
    totalAttempts: 0,
    currentStreak: 0,
    bestStreak: 0,
    earnedStars: 0,
    /** @type {SessionRecord[]} */
    history: [],
    /** @type {string[]} badge IDs */
    earnedBadges: [],
    /** Which operations the child has ever attempted */
    triedOperations: [],
  };
}

/** @returns {BuildsState} */
function defaultBuilds() {
  return {
    /** Part IDs that have been physically placed on a build */
    placedParts: [],
    /** Build IDs that are fully assembled */
    completedBuilds: [],
    /** The build currently open in the workshop */
    activeBuildId: BUILDS[0].id,
  };
}

/** @returns {SettingsState} */
function defaultSettings() {
  return {
    /** 4-digit PIN to protect the parent panel (stored as string) */
    parentPin: '1234',
    /** Operations enabled for sessions */
    enabledOperations: [OPERATIONS.addition.id],
    /** Difficulty level per operation: operationId → levelId */
    operationLevels: {
      addition:       1,
      subtraction:    1,
      multiplication: 1,
      division:       1,
    },
    soundEnabled: true,
    language: 'nl',
  };
}

/** @returns {SessionState} */
function defaultSession() {
  return {
    /** The operation currently being practised */
    activeOperation: null,
    /** Questions for the current session */
    questions: [],
    /** Index of the question currently displayed */
    currentQuestionIndex: 0,
    /** Answers given this session: Array<{ question, given, correct }> */
    answers: [],
    /** Stars earned in this session */
    starsEarned: 0,
    /** Whether the session is finished */
    finished: false,
  };
}

// ---------------------------------------------------------------------------
// Live state object
// ---------------------------------------------------------------------------

/**
 * The global state object.
 * Modules mutate properties directly, then call storage.save() to persist.
 */
export const state = {
  /** @type {ProgressState} */
  progress: defaultProgress(),

  /** @type {BuildsState} */
  builds: defaultBuilds(),

  /** @type {SettingsState} */
  settings: defaultSettings(),

  /** @type {SessionState} – not persisted between page loads */
  session: defaultSession(),

  /** ID of the currently visible screen */
  currentScreen: 'screen-home',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Reset the session state before starting a new exercise round.
 * @param {string} operationId
 */
export function resetSession(operationId) {
  state.session = defaultSession();
  state.session.activeOperation = operationId;
}

/**
 * Replace the persisted portions of state with data loaded from storage.
 * Called once on app init.
 * @param {{ progress: ProgressState, builds: BuildsState, settings: SettingsState }} saved
 */
export function hydrateState(saved) {
  if (saved.progress) {
    state.progress = { ...defaultProgress(), ...saved.progress };
  }
  if (saved.builds) {
    state.builds = { ...defaultBuilds(), ...saved.builds };
  }
  if (saved.settings) {
    state.settings = { ...defaultSettings(), ...saved.settings };
  }
}

/**
 * Return only the portions of state that should be persisted.
 * @returns {{ progress: ProgressState, builds: BuildsState, settings: SettingsState }}
 */
export function getPersistedState() {
  return {
    progress: state.progress,
    builds:   state.builds,
    settings: state.settings,
  };
}
