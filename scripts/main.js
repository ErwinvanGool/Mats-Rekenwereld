/**
 * main.js
 * Application entry point.
 *
 * Responsibility: bootstrap all modules, wire up UI event handlers,
 * and orchestrate the exercise session loop.
 *
 * Implementation order followed here:
 *   1. Load persisted state from localStorage
 *   2. Initialise navigation (data-nav attributes)
 *   3. Render the home screen
 *   4. Register screen-change listeners (progress, builds, parent)
 *   5. Wire up exercise flow (operation select → question loop → result)
 *   6. Wire up drag-and-drop in workshop
 *   7. Wire up parent settings panel
 */

import { loadState, saveState }       from './storage.js';
import { state, resetSession }        from './state.js';
import { navigateTo, initNavigation } from './navigation.js';
import { buildQuestionSet, checkAnswer, generateChoices } from './math.js';
import { awardSessionStars, evaluateBadges, starDisplayText, badgeListHtml } from './rewards.js';
import { placePart, getActiveBuild, buildPaletteHtml, getAvailableBuilds, setActiveBuild } from './builds.js';
import { initDragDrop }               from './dragdrop.js';
import { recordAnswer, recordSession, renderProgressScreen } from './progress.js';
import { initPinScreen, initParentPanel } from './parent-settings.js';
import { OPERATIONS, BUILDS }         from './data.js';

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // 1. Hydrate state from localStorage
  loadState();

  // 2. Set up data-nav click routing
  initNavigation();

  // 3. Render initial home screen UI
  updateStarDisplay();

  // 4. React to screen changes
  document.addEventListener('screenchange', onScreenChange);

  // 5. Exercise flow
  initOperationScreen();
  initExerciseScreen();

  // 6. Workshop drag-and-drop
  const workshop = document.getElementById('screen-builds');
  if (workshop) initDragDrop(workshop);
  workshop?.addEventListener('partDropped', onPartDropped);

  // 7. Parent panel
  const pinScreen    = document.getElementById('screen-parent');
  const parentPanel  = document.getElementById('screen-parent-panel');
  if (pinScreen)   initPinScreen(pinScreen, parentPanel);
  if (parentPanel) initParentPanel(parentPanel);

  // Start on the home screen
  navigateTo('screen-home');
});

// ---------------------------------------------------------------------------
// Star display (shown in the header on every screen)
// ---------------------------------------------------------------------------

function updateStarDisplay() {
  document.querySelectorAll('[data-star-display]').forEach((el) => {
    el.textContent = starDisplayText();
  });
}

// ---------------------------------------------------------------------------
// Screen-change reactions
// ---------------------------------------------------------------------------

/** @param {CustomEvent} event */
function onScreenChange({ detail: { screenId } }) {
  if (screenId === 'screen-progress') {
    const container = document.querySelector('#screen-progress .progress__content');
    if (container) renderProgressScreen(container);
  }

  if (screenId === 'screen-builds') {
    renderBuildsScreen();
  }

  if (screenId === 'screen-parent-panel') {
    renderParentPanel();
  }
}

// ---------------------------------------------------------------------------
// Operation selection screen
// ---------------------------------------------------------------------------

function initOperationScreen() {
  const screen = document.getElementById('screen-operation');
  if (!screen) return;

  screen.addEventListener('click', (event) => {
    const card = event.target.closest('[data-operation-id]');
    if (!card) return;

    const operationId = card.dataset.operationId;
    startSession(operationId);
  });

  // Render operation cards on first load
  renderOperationCards(screen);
}

/**
 * @param {HTMLElement} screen
 */
function renderOperationCards(screen) {
  const grid = screen.querySelector('[data-operation-grid]');
  if (!grid) return;

  grid.innerHTML = Object.values(OPERATIONS)
    .map((op) => {
      const enabled = state.settings.enabledOperations.includes(op.id);
      return `
        <button class="operation-card${enabled ? '' : ' operation-card--disabled'}"
                data-operation-id="${op.id}"
                ${enabled ? '' : 'disabled aria-disabled="true"'}>
          <span class="operation-card__symbol">${op.symbol}</span>
          <span class="operation-card__label">${op.label}</span>
        </button>`;
    })
    .join('');
}

// ---------------------------------------------------------------------------
// Exercise session
// ---------------------------------------------------------------------------

/**
 * Start a new session for the given operation.
 * @param {string} operationId
 */
function startSession(operationId) {
  resetSession(operationId);
  state.session.questions = buildQuestionSet(operationId);
  navigateTo('screen-exercise');
  showCurrentQuestion();
}

function initExerciseScreen() {
  const screen = document.getElementById('screen-exercise');
  if (!screen) return;

  const submitBtn = screen.querySelector('[data-action="submit-answer"]');
  const answerInput = screen.querySelector('[data-answer-input]');

  submitBtn?.addEventListener('click', () => submitAnswer());
  answerInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitAnswer();
  });

  // Multiple-choice buttons
  screen.addEventListener('click', (event) => {
    const choiceBtn = event.target.closest('[data-choice]');
    if (choiceBtn) submitAnswer(choiceBtn.dataset.choice);
  });
}

function showCurrentQuestion() {
  const screen = document.getElementById('screen-exercise');
  if (!screen) return;

  const { questions, currentQuestionIndex } = state.session;
  if (currentQuestionIndex >= questions.length) {
    finishSession();
    return;
  }

  const question = questions[currentQuestionIndex];
  const total    = questions.length;
  const progress = currentQuestionIndex + 1;

  // Update progress bar
  const progressBar = screen.querySelector('[data-progress-bar]');
  if (progressBar) {
    progressBar.value   = progress;
    progressBar.max     = total;
    progressBar.textContent = `${progress} / ${total}`;
  }

  const counter = screen.querySelector('[data-question-counter]');
  if (counter) counter.textContent = `Vraag ${progress} van ${total}`;

  // Display problem
  const problemEl = screen.querySelector('[data-problem]');
  if (problemEl) problemEl.textContent = `${question.display} = ?`;

  // Clear answer input
  const answerInput = screen.querySelector('[data-answer-input]');
  if (answerInput) {
    answerInput.value = '';
    answerInput.focus();
  }

  // Render multiple-choice buttons
  const choicesEl = screen.querySelector('[data-choices]');
  if (choicesEl) {
    const choices = generateChoices(question);
    choicesEl.innerHTML = choices
      .map(
        (c) =>
          `<button class="choice-btn" data-choice="${c}">${c}</button>`
      )
      .join('');
  }

  // Clear feedback
  const feedback = screen.querySelector('[data-feedback]');
  if (feedback) {
    feedback.textContent = '';
    feedback.className = 'exercise__feedback';
  }
}

/**
 * @param {string|number|undefined} choiceValue – provided when using MC buttons
 */
function submitAnswer(choiceValue) {
  const { questions, currentQuestionIndex } = state.session;
  const question = questions[currentQuestionIndex];

  let givenAnswer = choiceValue;
  if (givenAnswer === undefined) {
    const input = document.querySelector('[data-answer-input]');
    givenAnswer = input ? input.value : '';
  }

  const correct = checkAnswer(question, givenAnswer);
  recordAnswer({ question, given: givenAnswer, correct });

  state.session.answers.push({ question, given: givenAnswer, correct });
  state.session.currentQuestionIndex += 1;

  const feedback = document.querySelector('[data-feedback]');
  if (feedback) {
    feedback.textContent = correct ? '✅ Goed zo!' : `❌ Het antwoord was ${question.answer}`;
    feedback.className   = `exercise__feedback exercise__feedback--${correct ? 'correct' : 'wrong'}`;
  }

  // Brief delay before next question
  setTimeout(() => {
    if (state.session.currentQuestionIndex < questions.length) {
      showCurrentQuestion();
    } else {
      finishSession();
    }
  }, 1200);
}

function finishSession() {
  const { answers, activeOperation } = state.session;
  const correctCount = answers.filter((a) => a.correct).length;
  const total        = answers.length;

  const starsEarned = awardSessionStars(correctCount, total);

  recordSession({
    date:        new Date().toISOString(),
    operationId: activeOperation,
    correct:     correctCount,
    total,
    starsEarned,
  });

  const newBadges = evaluateBadges();
  updateStarDisplay();

  renderResultScreen(correctCount, total, starsEarned, newBadges);
  navigateTo('screen-result');
}

// ---------------------------------------------------------------------------
// Result screen
// ---------------------------------------------------------------------------

function renderResultScreen(correct, total, stars, newBadges) {
  const screen = document.getElementById('screen-result');
  if (!screen) return;

  const isPerfect = correct === total;

  const resultEl = screen.querySelector('[data-result-summary]');
  if (resultEl) {
    resultEl.innerHTML = `
      <p class="result__score">
        ${isPerfect ? '🎉 Perfect!' : '👍 Goed gedaan!'}
      </p>
      <p class="result__detail">${correct} van de ${total} goed</p>
      <p class="result__stars">+${stars} ⭐</p>
      ${newBadges.length > 0
        ? `<div class="result__badges">
             <p>Nieuwe badge${newBadges.length > 1 ? 's' : ''}!</p>
             <ul>${newBadges.map((b) => `<li>${b.icon} ${b.label}</li>`).join('')}</ul>
           </div>`
        : ''}
    `;
  }
}

// ---------------------------------------------------------------------------
// Builds / workshop screen
// ---------------------------------------------------------------------------

function renderBuildsScreen() {
  const screen = document.getElementById('screen-builds');
  if (!screen) return;

  // Build selector tabs
  const tabsEl = screen.querySelector('[data-build-tabs]');
  if (tabsEl) {
    tabsEl.innerHTML = getAvailableBuilds()
      .map((b) => {
        const active = b.id === state.builds.activeBuildId;
        return `<button class="build-tab${active ? ' build-tab--active' : ''}"
                        data-build-id="${b.id}">${b.label}</button>`;
      })
      .join('');

    tabsEl.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-build-id]');
      if (btn) {
        setActiveBuild(btn.dataset.buildId);
        renderBuildsScreen();
      }
    });
  }

  // Parts palette
  const paletteEl = screen.querySelector('[data-build-palette]');
  if (paletteEl) paletteEl.innerHTML = buildPaletteHtml();

  // Build canvas / slots
  const canvasEl = screen.querySelector('[data-build-canvas]');
  if (canvasEl) {
    const build = getActiveBuild();
    canvasEl.innerHTML = build.parts
      .map((part) => {
        const placed = state.builds.placedParts.includes(part.id);
        return `<div class="build-slot${placed ? ' build-slot--filled' : ''}"
                     data-slot-id="${part.slot}"
                     data-expects-part="${part.id}"
                     aria-label="${part.label} slot">
                  ${placed
                    ? `<span class="build-slot__part">${part.label}</span>`
                    : `<span class="build-slot__hint">Sleep hier</span>`}
                </div>`;
      })
      .join('');
  }
}

/** @param {CustomEvent} event */
function onPartDropped({ detail: { partId, slotId } }) {
  const screen   = document.getElementById('screen-builds');
  const canvas   = screen?.querySelector('[data-build-canvas]');
  const slot     = canvas?.querySelector(`[data-slot-id="${slotId}"]`);
  const expected = slot?.dataset.expectsPart;

  if (expected !== partId) {
    // Dropped on the wrong slot — visual shake feedback
    slot?.classList.add('build-slot--wrong');
    setTimeout(() => slot?.classList.remove('build-slot--wrong'), 600);
    return;
  }

  const { placed, buildCompleted } = placePart(partId);
  if (placed) {
    updateStarDisplay();
    evaluateBadges();
    renderBuildsScreen();

    if (buildCompleted) {
      setTimeout(() => alert('🎉 Gefeliciteerd! Je hebt dit bouwwerk afgemaakt!'), 100);
    }
  }
}

// ---------------------------------------------------------------------------
// Parent panel rendering
// ---------------------------------------------------------------------------

function renderParentPanel() {
  const panel = document.getElementById('screen-parent-panel');
  if (!panel) return;

  const settingsEl = panel.querySelector('[data-settings-content]');
  if (!settingsEl) return;

  settingsEl.innerHTML = `
    <h3>Oefeningen</h3>
    ${Object.values(OPERATIONS)
      .map((op) => {
        const enabled = state.settings.enabledOperations.includes(op.id);
        const levelId = state.settings.operationLevels[op.id] ?? 1;
        const levelOptions = op.levels
          .map((l) => `<option value="${l.id}" ${l.id === levelId ? 'selected' : ''}>${l.description}</option>`)
          .join('');
        return `
          <div class="parent-setting">
            <label class="parent-setting__label">
              <input type="checkbox" data-operation-toggle="${op.id}" ${enabled ? 'checked' : ''}>
              ${op.label}
            </label>
            <select data-level-select="${op.id}" class="parent-setting__select">
              ${levelOptions}
            </select>
          </div>`;
      })
      .join('')}

    <h3>Geluid</h3>
    <label class="parent-setting__label">
      <input type="checkbox" data-sound-toggle ${state.settings.soundEnabled ? 'checked' : ''}>
      Geluid inschakelen
    </label>

    <h3>Beheer</h3>
    <div class="parent-setting__actions">
      <button class="btn btn--danger" data-action="reset-progress">Voortgang wissen</button>
      <button class="btn"            data-action="change-pin">Pincode wijzigen</button>
    </div>

    <h3>Badges verdiend</h3>
    <ul class="badge-list">${badgeListHtml()}</ul>
  `;
}
