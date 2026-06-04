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
import { earnBlocksForAnswer, evaluateBadges, blockDisplayText, stickerDisplayText, badgeListHtml } from './rewards.js';
import { placePart, getActiveBuild, buildPaletteHtml, buildCanvasHtml, buildReferenceHtml, getAvailableBuilds, setActiveBuild, isBuildComplete } from './builds.js';
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
  updateBlockDisplay();

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
// Block / sticker display (shown in the header on every screen)
// ---------------------------------------------------------------------------

function updateBlockDisplay() {
  document.querySelectorAll('[data-block-display]').forEach((el) => {
    el.textContent = blockDisplayText();
  });
  document.querySelectorAll('[data-sticker-display]').forEach((el) => {
    el.textContent = stickerDisplayText();
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

  // Award blocks immediately on correct answers (streak already updated above)
  let rewardInfo = null;
  if (correct) {
    rewardInfo = earnBlocksForAnswer(question.difficulty);
    updateBlockDisplay();
  }

  state.session.answers.push({ question, given: givenAnswer, correct });
  state.session.currentQuestionIndex += 1;

  const feedback = document.querySelector('[data-feedback]');
  if (feedback) {
    if (correct) {
      const bonusText = rewardInfo.bonusBlocks > 0
        ? ` (+${rewardInfo.bonusBlocks} bonus!)` : '';
      const stickerText = rewardInfo.stickerEarned ? ' 🌟 Sticker!' : '';
      feedback.textContent = `✅ +${rewardInfo.baseBlocks} 🧱${bonusText}${stickerText}`;
    } else {
      feedback.textContent = `❌ Het antwoord was ${question.answer}`;
    }
    feedback.className = `exercise__feedback exercise__feedback--${correct ? 'correct' : 'wrong'}`;
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
  // Blocks were credited per-answer inside earnBlocksForAnswer.
  // Count the minimum (1 per correct) for the session record; real total is in state.
  const blocksEarned = correctCount;

  recordSession({
    date:         new Date().toISOString(),
    operationId:  activeOperation,
    correct:      correctCount,
    total,
    blocksEarned: correctCount, // min accounting; real totals are in state
  });

  const newBadges = evaluateBadges();
  updateBlockDisplay();

  renderResultScreen(correctCount, total, newBadges);
  navigateTo('screen-result');
}

// ---------------------------------------------------------------------------
// Result screen
// ---------------------------------------------------------------------------

function renderResultScreen(correct, total, newBadges) {
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
      <p class="result__blocks">${blockDisplayText()}</p>
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

  const build = getActiveBuild();

  // Build title
  const titleEl = screen.querySelector('[data-active-build-title]');
  if (titleEl) titleEl.textContent = `${build.emoji} ${build.label}`;

  // Block inventory count
  const blocksEl = screen.querySelector('[data-blocks-available]');
  if (blocksEl) blocksEl.textContent = state.progress.earnedBlocks;

  // Progress bar + label
  const placedCount = build.parts.filter((p) => state.builds.placedParts.includes(p.id)).length;
  const totalParts  = build.parts.length;
  const progressBar = screen.querySelector('[data-build-progress-bar]');
  if (progressBar) { progressBar.value = placedCount; progressBar.max = totalParts; }
  const progressLabel = screen.querySelector('[data-build-progress-label]');
  if (progressLabel) progressLabel.textContent = `${placedCount} / ${totalParts}`;

  // Build selector tabs (attach listener only once)
  const tabsEl = screen.querySelector('[data-build-tabs]');
  if (tabsEl) {
    tabsEl.innerHTML = getAvailableBuilds()
      .map((b) => {
        const active = b.id === state.builds.activeBuildId;
        return `<button class="build-tab${active ? ' build-tab--active' : ''}"
                        data-build-id="${b.id}"
                        aria-selected="${active}">${b.emoji} ${b.label}</button>`;
      })
      .join('');

    if (!tabsEl.dataset.listenerReady) {
      tabsEl.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-build-id]');
        if (btn) { setActiveBuild(btn.dataset.buildId); renderBuildsScreen(); }
      });
      tabsEl.dataset.listenerReady = '1';
    }
  }

  // Reference preview
  const referenceEl = screen.querySelector('[data-build-reference]');
  if (referenceEl) referenceEl.innerHTML = buildReferenceHtml();

  // Parts palette
  const paletteEl = screen.querySelector('[data-build-palette]');
  if (paletteEl) paletteEl.innerHTML = buildPaletteHtml();

  // Visual build canvas
  const canvasEl = screen.querySelector('[data-build-canvas]');
  if (canvasEl) canvasEl.innerHTML = buildCanvasHtml();

  // Hide completed overlay when switching builds
  const overlay = screen.querySelector('[data-build-complete-overlay]');
  if (overlay && !isBuildComplete(build.id)) overlay.hidden = true;
}

/** @param {CustomEvent} event */
function onPartDropped({ detail: { partId, slotId } }) {
  const screen      = document.getElementById('screen-builds');
  const canvas      = screen?.querySelector('[data-build-canvas]');
  if (!canvas) return;

  const correctSlot = canvas.querySelector(`[data-expects-part="${partId}"]`);
  const targetSlot  = canvas.querySelector(`[data-slot-id="${slotId}"]`);

  // Already placed – ignore
  if (correctSlot?.classList.contains('build-slot--filled')) return;

  // Dropped on wrong slot: gentle shake + glow on correct target
  if (targetSlot && targetSlot !== correctSlot) {
    targetSlot.classList.add('build-slot--wrong');
    setTimeout(() => targetSlot.classList.remove('build-slot--wrong'), 650);
    correctSlot?.classList.add('build-slot--hint');
    setTimeout(() => correctSlot?.classList.remove('build-slot--hint'), 1400);
    showBuildFeedback('🤔 Bijna! Zoek het goede plekje!', false);
    return;
  }

  const { placed, buildCompleted } = placePart(partId);
  if (placed) {
    updateBlockDisplay();
    renderBuildsScreen();
    showBuildFeedback('⭐ Super! Goed geplaatst!', true);
    playBrickSound();
    if (buildCompleted) {
      setTimeout(() => showBuildComplete(), 500);
    }
  }
}

/**
 * Show a brief toast message on the builds screen.
 * @param {string}  msg
 * @param {boolean} isPositive
 */
function showBuildFeedback(msg, isPositive) {
  const screen = document.getElementById('screen-builds');
  const el     = screen?.querySelector('[data-build-feedback]');
  if (!el) return;
  el.textContent = msg;
  el.className   = `builds__feedback builds__feedback--${isPositive ? 'ok' : 'hint'}`;
  el.hidden      = false;
  clearTimeout(el._feedbackTimer);
  el._feedbackTimer = setTimeout(() => { el.hidden = true; }, 2000);
}

/** Celebrate a completed build with confetti overlay. */
function showBuildComplete() {
  const screen  = document.getElementById('screen-builds');
  const build   = getActiveBuild();
  const overlay = screen?.querySelector('[data-build-complete-overlay]');
  if (!overlay) return;

  const dots = Array.from({ length: 24 }, (_, i) =>
    `<span class="confetti-dot" style="--i:${i};--hue:${(i * 15) % 360}"></span>`
  ).join('');

  overlay.innerHTML = `
    <div class="complete-overlay__confetti" aria-hidden="true">${dots}</div>
    <span class="complete-overlay__icon" aria-hidden="true">🎉</span>
    <p class="complete-overlay__title">Klaar!</p>
    <p class="complete-overlay__badge">${build.completionBadge}</p>
    <div class="complete-overlay__svg" aria-label="${build.label} klaar">${build.referenceSvg}</div>
    <button class="btn btn--cta complete-overlay__btn" data-nav="screen-worldmap">
      🌍 Terug naar de kaart
    </button>
  `;
  overlay.hidden = false;
  playCompleteSound();
}

/** Play a short "brick snap" tone using the Web Audio API. */
function playBrickSound() {
  if (!state.settings.soundEnabled) return;
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (_) { /* audio not available */ }
}

/** Play a celebratory fanfare on build completion. */
function playCompleteSound() {
  if (!state.settings.soundEnabled) return;
  try {
    const ctx   = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      const t = ctx.currentTime + i * 0.13;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  } catch (_) { /* audio not available */ }
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
