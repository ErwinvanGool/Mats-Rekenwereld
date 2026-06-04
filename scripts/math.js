/**
 * math.js
 * Math problem generation and answer verification.
 */

import { OPERATIONS, QUESTIONS_PER_SESSION } from './data.js';
import { state } from './state.js';

// ---------------------------------------------------------------------------
// Problem generation
// ---------------------------------------------------------------------------

/**
 * Generate a single math problem for the given operation and level config.
 *
 * @param {string} operationId
 * @param {{ maxA: number, maxB: number }} levelConfig
 * @returns {MathQuestion}
 */
export function generateQuestion(operationId, levelConfig) {
  const { maxA, maxB, difficulty = 'easy' } = levelConfig;

  switch (operationId) {
    case 'addition': {
      const a = randomInt(0, maxA);
      const b = randomInt(0, maxB);
      return { operationId, a, b, answer: a + b, display: `${a} + ${b}`, difficulty };
    }

    case 'subtraction': {
      // Ensure result is never negative for children
      const b = randomInt(0, maxB);
      const a = randomInt(b, maxA);
      return { operationId, a, b, answer: a - b, display: `${a} − ${b}`, difficulty };
    }

    case 'multiplication': {
      const a = randomInt(1, maxA);
      const b = randomInt(1, maxB);
      return { operationId, a, b, answer: a * b, display: `${a} × ${b}`, difficulty };
    }

    case 'division': {
      // Generate a clean (integer) division
      const b = randomInt(1, maxB);
      const quotient = randomInt(1, Math.floor(maxA / b));
      const a = b * quotient;
      return { operationId, a, b, answer: quotient, display: `${a} ÷ ${b}`, difficulty };
    }

    default:
      throw new Error(`[math] Unknown operation: "${operationId}"`);
  }
}

/**
 * Build an array of `count` unique-ish questions for the current session.
 *
 * @param {string} operationId
 * @returns {MathQuestion[]}
 */
export function buildQuestionSet(operationId) {
  const operation = OPERATIONS[operationId];
  if (!operation) throw new Error(`[math] Unknown operation: "${operationId}"`);

  const levelId = state.settings.operationLevels[operationId] ?? 1;
  const levelConfig = operation.levels.find((l) => l.id === levelId)
    ?? operation.levels[0];

  const questions = [];
  for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
    questions.push(generateQuestion(operationId, levelConfig));
  }
  return questions;
}

// ---------------------------------------------------------------------------
// Answer checking
// ---------------------------------------------------------------------------

/**
 * Check whether the given answer matches the expected answer.
 * Accepts both string and number inputs (trims and normalises input).
 *
 * @param {MathQuestion} question
 * @param {string|number} givenAnswer
 * @returns {boolean}
 */
export function checkAnswer(question, givenAnswer) {
  const parsed = parseInt(String(givenAnswer).trim(), 10);
  if (Number.isNaN(parsed)) return false;
  return parsed === question.answer;
}

/**
 * Return 3–4 plausible wrong answer options plus the correct one, shuffled.
 * Useful for multiple-choice mode.
 *
 * @param {MathQuestion} question
 * @returns {number[]}
 */
export function generateChoices(question) {
  const correct = question.answer;
  const offsets = [-3, -2, -1, 1, 2, 3];
  const wrongs = new Set();

  // Shuffle offsets and pick 3 wrong answers that are >= 0
  shuffleArray(offsets);
  for (const offset of offsets) {
    const candidate = correct + offset;
    if (candidate >= 0 && candidate !== correct) {
      wrongs.add(candidate);
    }
    if (wrongs.size === 3) break;
  }

  const choices = [correct, ...Array.from(wrongs)];
  shuffleArray(choices);
  return choices;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Return a random integer between min and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Fisher-Yates shuffle in place.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
