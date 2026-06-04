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
import { placePart, getActiveBuild, buildPaletteHtml, buildCanvasHtml, buildReferenceHtml, getAvailableBuilds, setActiveBuild, isBuildComplete, isPartPlaced, isPartUnlocked } from './builds.js';
import { initLegoCanvas, destroyLegoCanvas, setLegoSelectedPart, getLegoSelectedPart, renderLegoCanvas } from './lego-canvas.js';
import { initDragDrop }               from './dragdrop.js';
import { recordAnswer, recordSession, renderProgressScreen } from './progress.js';
import { initPinScreen, initParentPanel } from './parent-settings.js';
import { OPERATIONS, BUILDS }         from './data.js';
import { playCorrectSound, playWrongSound, playHintSound, playBrickSound, playCompleteSound, playBonusSound, playUnlockSound } from './sounds.js';
import { launchConfetti, launchFireworks, popStarsAt } from './confetti.js';
import { showStickerModal, getStickerForIndex } from './stickers.js';

// ---------------------------------------------------------------------------
// Per-question hint state
// ---------------------------------------------------------------------------

/** Number of wrong attempts on the current question. */
let _wrongAttempts = 0;

/** Build IDs that were already unlocked before this screen visit (for unlock animation). */
let _previouslyUnlockedBuilds = [];

/** The build ID currently shown in the LEGO canvas (null when HTML mode is active). */
let _currentCanvasBuildId = null;

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
  workshop?.addEventListener('partDropped',      onPartDropped);
  workshop?.addEventListener('legoBrickPlaced',  onLegoBrickPlaced);

  // 7. Parent panel
  const pinScreen    = document.getElementById('screen-parent');
  const parentPanel  = document.getElementById('screen-parent-panel');
  if (pinScreen)   initPinScreen(pinScreen, parentPanel);
  if (parentPanel) initParentPanel(parentPanel, renderParentPanel);

  // 8. World map
  initWorldMap();

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
  // When leaving the builds screen, release the canvas
  if (screenId !== 'screen-builds') {
    destroyLegoCanvas();
    _currentCanvasBuildId = null;
  }

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

  if (screenId === 'screen-worldmap') {
    renderWorldMap();
  }

  if (screenId === 'screen-build-select') {
    renderBuildSelectFromState();
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

  // Reset per-question wrong-attempt counter
  _wrongAttempts = 0;

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

  // Update streak display
  updateStreakDisplay();

  // Clear feedback
  const feedback = screen.querySelector('[data-feedback]');
  if (feedback) {
    feedback.textContent = '';
    feedback.className = 'exercise__feedback';
  }
}

/** Refresh the streak flame indicator in the exercise header. */
function updateStreakDisplay() {
  const streak = state.progress.currentStreak;
  const el = document.querySelector('[data-streak-display]');
  if (!el) return;
  if (streak >= 3) {
    el.textContent = `🔥 ${streak} op rij!`;
    el.className = 'exercise__streak exercise__streak--active';
  } else {
    el.textContent = '';
    el.className = 'exercise__streak';
  }
}

/**
 * @param {string|number|undefined} choiceValue – provided when using MC buttons
 */
function submitAnswer(choiceValue) {
  const screen = document.getElementById('screen-exercise');
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

  const feedback = document.querySelector('[data-feedback]');

  if (correct) {
    _wrongAttempts = 0;
    state.session.currentQuestionIndex += 1;

    // Sound
    if (rewardInfo.bonusBlocks > 0) {
      playBonusSound();
    } else {
      playCorrectSound();
    }

    // Star pop on the clicked button
    const clickedBtn = screen?.querySelector(`[data-choice="${givenAnswer}"]`);
    if (clickedBtn) popStarsAt(clickedBtn, 16);

    // Animate chosen button
    clickedBtn?.classList.add('choice-btn--correct');

    // Flash the block-earned element
    const blockEarnedEl = screen?.querySelector('[data-block-earned]');
    if (blockEarnedEl) {
      blockEarnedEl.textContent = `+${rewardInfo.totalBlocks} 🧱`;
      blockEarnedEl.hidden = false;
      setTimeout(() => { blockEarnedEl.hidden = true; }, 1100);
    }

    if (feedback) {
      const bonusText = rewardInfo.bonusBlocks > 0
        ? ` +${rewardInfo.bonusBlocks} bonus! 🎉` : '';
      const stickerText = rewardInfo.stickerEarned ? ' 🌟 Sticker!' : '';
      feedback.textContent = `✅ +${rewardInfo.baseBlocks} 🧱${bonusText}${stickerText}`;
      feedback.className = 'exercise__feedback exercise__feedback--correct';
    }

    // Show sticker modal if one was just earned (delay slightly for UX flow)
    if (rewardInfo.stickerEarned) {
      const stickerIndex = state.progress.earnedStickers - 1;
      const sticker = getStickerForIndex(stickerIndex);
      setTimeout(() => showStickerModal(sticker), 900);
    }

    // Brief delay before next question
    setTimeout(() => {
      if (state.session.currentQuestionIndex < questions.length) {
        showCurrentQuestion();
      } else {
        finishSession();
      }
    }, 1200);

  } else {
    _wrongAttempts += 1;
    playWrongSound();

    // Animate wrong button
    const wrongBtn = screen?.querySelector(`[data-choice="${givenAnswer}"]`);
    wrongBtn?.classList.add('choice-btn--wrong');
    setTimeout(() => wrongBtn?.classList.remove('choice-btn--wrong'), 600);

    if (feedback) {
      feedback.className = 'exercise__feedback exercise__feedback--wrong';
    }

    // Hint system: escalating help after mistakes
    if (_wrongAttempts === 1) {
      if (feedback) feedback.textContent = '🤔 Probeer nog eens!';
    } else if (_wrongAttempts === 2) {
      // Second wrong: highlight the correct button
      playHintSound();
      highlightCorrectChoice(question.answer);
      if (feedback) feedback.textContent = '💡 Kijk goed naar de gele knop!';
    } else {
      // Third+ wrong: reveal the answer
      playHintSound();
      highlightCorrectChoice(question.answer);
      if (feedback) feedback.textContent = `💡 Het goede antwoord is ${question.answer}!`;
    }
  }
}

/**
 * Highlight the correct answer button with a gentle glow.
 * @param {number} correctAnswer
 */
function highlightCorrectChoice(correctAnswer) {
  const screen = document.getElementById('screen-exercise');
  if (!screen) return;
  screen.querySelectorAll('[data-choice]').forEach((btn) => {
    if (Number(btn.dataset.choice) === correctAnswer) {
      btn.classList.add('choice-btn--hint');
    }
  });
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

  // ---- Build view: LEGO canvas mode vs. HTML drag-and-drop mode ----
  const htmlRefEl  = screen.querySelector('[data-build-reference]');
  const htmlCvsEl  = screen.querySelector('[data-build-canvas]');
  const legoCvsEl  = screen.querySelector('#lego-build-canvas');
  const paletteEl  = screen.querySelector('[data-build-palette]');

  if (build.brickGrid) {
    // LEGO canvas mode — show a compact reference thumbnail above the canvas
    if (htmlRefEl) {
      htmlRefEl.hidden = false;
      htmlRefEl.innerHTML = `<div class="lego-reference" aria-label="Voorbeeld ${build.label}" role="img">${build.referenceSvg}</div>`;
    }
    if (htmlCvsEl) htmlCvsEl.hidden = true;
    if (legoCvsEl) legoCvsEl.hidden = false;

    if (legoCvsEl && _currentCanvasBuildId !== build.id) {
      _currentCanvasBuildId = build.id;
      initLegoCanvas(legoCvsEl, build);
    } else if (legoCvsEl) {
      renderLegoCanvas();
    }
    _renderLegoPalette(paletteEl, build);
  } else {
    // HTML drag-and-drop mode
    _currentCanvasBuildId = null;
    destroyLegoCanvas();
    if (htmlRefEl) { htmlRefEl.hidden = false; htmlRefEl.innerHTML = buildReferenceHtml(); }
    if (htmlCvsEl) { htmlCvsEl.hidden = false; htmlCvsEl.innerHTML = buildCanvasHtml(); }
    if (legoCvsEl) legoCvsEl.hidden = true;
    if (paletteEl) paletteEl.innerHTML = buildPaletteHtml();
  }

  // Hide completed overlay when switching builds
  const overlay = screen.querySelector('[data-build-complete-overlay]');
  if (overlay && !isBuildComplete(build.id)) overlay.hidden = true;

  // Show "earn more blocks" CTA if all remaining parts are locked
  const earnCtaEl = screen.querySelector('[data-earn-cta]');
  if (earnCtaEl) {
    let hasUnlocked = false;
    if (build.brickGrid) {
      hasUnlocked = build.brickGrid.bricks.some(
        (b) => !isPartPlaced(b.partId) && isPartUnlocked({ blocksToUnlock: b.blocksToUnlock })
      );
    } else {
      hasUnlocked = build.parts.some(
        (p) => !isPartPlaced(p.id) && isPartUnlocked(p)
      );
    }
    earnCtaEl.hidden = hasUnlocked || isBuildComplete(build.id);
  }
}

/**
 * Render the LEGO parts-tray palette for a canvas-mode build.
 * @param {HTMLElement|null} paletteEl
 * @param {object} build
 */
function _renderLegoPalette(paletteEl, build) {
  if (!paletteEl) return;
  paletteEl.className = 'build-palette lego-tray';
  const selectedId = getLegoSelectedPart();
  paletteEl.innerHTML = build.brickGrid.bricks.map((brick) => {
    const placed   = isPartPlaced(brick.partId);
    const unlocked = isPartUnlocked({ blocksToUnlock: brick.blocksToUnlock });
    const disabled = placed || !unlocked;
    const stateClass = placed    ? ' lego-chip--placed'
                     : !unlocked ? ' lego-chip--locked'
                     :             ' lego-chip--available';
    const selectedClass = (!disabled && selectedId === brick.partId) ? ' lego-chip--selected' : '';
    const ariaLabel = brick.label
      + (placed    ? ' – geplaatst'                              : '')
      + (!unlocked ? ` – ${brick.blocksToUnlock} blokken nodig`  : '');
    return `<button
      class="lego-chip${stateClass}${selectedClass}"
      data-lego-part-id="${brick.partId}"
      style="--chip-color: ${brick.color}"
      ${disabled ? 'disabled' : ''}
      aria-label="${ariaLabel}"
    ><span class="lego-chip__studs"><span class="lego-chip__stud"></span><span class="lego-chip__stud"></span></span
    ><span class="lego-chip__label">${placed ? '✅ ' + brick.label : !unlocked ? '🔒 ' + brick.blocksToUnlock + ' 🧱' : brick.label}</span></button>`;
  }).join('');

  paletteEl.querySelectorAll('[data-lego-part-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const partId = btn.dataset.legoPartId;
      const isAlreadySelected = getLegoSelectedPart() === partId;
      const next = isAlreadySelected ? null : partId;
      setLegoSelectedPart(next);
      paletteEl.querySelectorAll('[data-lego-part-id]').forEach((b) =>
        b.classList.toggle('lego-chip--selected', b.dataset.legoPartId === next),
      );
    });
  });

  // Pulse the first available (unlocked, unplaced) chip to guide the child's eye.
  const firstAvailable = paletteEl.querySelector('.lego-chip--available');
  if (firstAvailable) {
    firstAvailable.classList.add('lego-chip--pulse');
    setTimeout(() => firstAvailable.classList.remove('lego-chip--pulse'), 3000);
  }
}

/** Handle a brick-placement event dispatched by lego-canvas.js.
 *  @param {CustomEvent} event */
function onLegoBrickPlaced({ detail: { partId, atDesignPosition } }) {
  if (!atDesignPosition) {
    // Decorative free-placement – fun, but not persisted
    showBuildFeedback('🎨 Vrij geplaatst!', true);
    playBrickSound();
    return;
  }

  const { placed, buildCompleted } = placePart(partId);
  if (placed) {
    updateBlockDisplay();
    // Refresh palette and canvas without re-initialising (preserves deco bricks)
    const screen = document.getElementById('screen-builds');
    if (screen) _renderLegoPalette(screen.querySelector('[data-build-palette]'), getActiveBuild());
    renderLegoCanvas();
    showBuildFeedback('⭐ Super! Goed geplaatst!', true);
    playBrickSound();
    if (buildCompleted) {
      setTimeout(() => showBuildComplete(), 600);
    }
  }
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
    playWrongSound();
    return;
  }

  const { placed, buildCompleted } = placePart(partId);
  if (placed) {
    updateBlockDisplay();
    renderBuildsScreen();
    showBuildFeedback('⭐ Super! Goed geplaatst!', true);
    playBrickSound();
    // Pop stars at the filled slot after re-render
    const filledSlot = canvas.querySelector(`[data-expects-part="${partId}"]`);
    if (filledSlot) popStarsAt(filledSlot, 10);
    if (buildCompleted) {
      setTimeout(() => showBuildComplete(), 600);
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

/** Celebrate a completed build with fireworks overlay. */
function showBuildComplete() {
  const screen  = document.getElementById('screen-builds');
  const build   = getActiveBuild();
  const overlay = screen?.querySelector('[data-build-complete-overlay]');
  if (!overlay) return;

  overlay.innerHTML = `
    <span class="complete-overlay__icon" aria-hidden="true">🎉</span>
    <p class="complete-overlay__title">Klaar!</p>
    <p class="complete-overlay__badge">${build.completionBadge}</p>
    <div class="complete-overlay__svg" aria-label="${build.label} klaar">${build.referenceSvg}</div>
    <p class="complete-overlay__reward">+${build.rewards.stickers} 🌟  +${build.rewards.bonusBlocks} 🧱</p>
    <button class="btn btn--cta complete-overlay__btn" data-nav="screen-worldmap">
      🌍 Terug naar de kaart
    </button>
  `;
  overlay.hidden = false;

  // Credit stickers + bonus blocks for build completion
  state.progress.earnedStickers += build.rewards.stickers;
  state.progress.earnedBlocks   += build.rewards.bonusBlocks;
  if (!state.builds.completedBuilds.includes(build.id)) {
    state.builds.completedBuilds.push(build.id);
  }
  evaluateBadges();
  saveState();
  updateBlockDisplay();

  playCompleteSound();
  launchFireworks();
}

// ---------------------------------------------------------------------------
// World map
// ---------------------------------------------------------------------------

/** One-time world map setup: delegate click to map pins. */
function initWorldMap() {
  const grid = document.querySelector('[data-worldmap-grid]');
  if (!grid) return;
  grid.addEventListener('click', (event) => {
    const pin = event.target.closest('[data-build-id]');
    if (!pin || pin.classList.contains('map-pin--locked')) return;
    const buildId = pin.dataset.buildId;
    selectBuild(buildId);
  });
}

/**
 * Render / refresh the world map grid, animating newly-unlocked pins.
 */
function renderWorldMap() {
  const grid = document.querySelector('[data-worldmap-grid]');
  if (!grid) return;

  const nowUnlocked = BUILDS.filter(
    (b) => state.progress.earnedBlocks >= b.blocksRequired
  ).map((b) => b.id);

  // Detect pins that just became unlocked since last render
  const newlyUnlocked = nowUnlocked.filter(
    (id) => !_previouslyUnlockedBuilds.includes(id)
  );
  if (newlyUnlocked.length > 0) {
    playUnlockSound();
  }

  grid.innerHTML = BUILDS.map((build) => {
    const isUnlocked  = state.progress.earnedBlocks >= build.blocksRequired;
    const isDone      = state.builds.completedBuilds.includes(build.id);
    const isNew       = newlyUnlocked.includes(build.id);

    const stateClass = isDone
      ? 'map-pin--done'
      : isUnlocked
        ? `map-pin--active${isNew ? ' map-pin--newly-unlocked' : ''}`
        : 'map-pin--locked';

    const badge = isDone
      ? '✅'
      : isUnlocked
        ? '🔓'
        : `🔒 ${build.blocksRequired}🧱`;

    return `
      <div class="map-pin ${stateClass}"
           data-build-id="${build.id}"
           role="button"
           tabindex="${isUnlocked ? 0 : -1}"
           aria-disabled="${!isUnlocked}"
           aria-label="${build.label}${isDone ? ' – voltooid' : isUnlocked ? '' : ' – vergrendeld'}"
      >
        <span class="map-pin__icon" aria-hidden="true">${build.emoji}</span>
        <span class="map-pin__label">${build.label}</span>
        <span class="map-pin__badge" aria-hidden="true">${badge}</span>
      </div>`;
  }).join('');

  _previouslyUnlockedBuilds = nowUnlocked;
}

/**
 * Select a build and navigate to the build-select screen.
 * @param {string} buildId
 */
function selectBuild(buildId) {
  setActiveBuild(buildId);
  state._selectedBuildId = buildId;
  renderBuildSelectFromState();
  navigateTo('screen-build-select');
}

/** Render the build-select detail panel for the currently selected build. */
function renderBuildSelectFromState() {
  const buildId = state.builds.activeBuildId;
  const build   = BUILDS.find((b) => b.id === buildId);
  if (!build) return;

  const screen     = document.getElementById('screen-build-select');
  if (!screen) return;

  const detailEl   = screen.querySelector('[data-build-select-detail]');
  const lockedEl   = screen.querySelector('[data-build-locked]');
  const actionsEl  = screen.querySelector('[data-build-actions]');
  if (!detailEl) return;

  const isUnlocked = state.progress.earnedBlocks >= build.blocksRequired;
  const isDone     = state.builds.completedBuilds.includes(build.id);
  const placed     = build.parts.filter((p) => state.builds.placedParts.includes(p.id)).length;
  const total      = build.parts.length;
  const pct        = total > 0 ? Math.round((placed / total) * 100) : 0;

  detailEl.innerHTML = `
    <div class="build-select__preview" aria-label="${build.label} voorbeeld">
      ${build.referenceSvg}
    </div>
    <h2 class="build-select__name">${build.emoji} ${build.label}</h2>
    <div class="build-select__meta">
      <span class="build-select__difficulty">${difficultyStars(build.difficulty)}</span>
      <span class="build-select__blocks-needed">🧱 ${build.blocksToComplete} blokken nodig</span>
    </div>
    <div class="build-select__progress-wrap" aria-label="Bouwvoortgang">
      <div class="build-select__progress-bar"
           role="progressbar"
           aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"
           style="--progress:${pct}%"></div>
    </div>
    <p class="build-select__progress-label">${placed} / ${total} stukken geplaatst</p>
    ${isDone ? '<p class="build-select__done-badge">✅ Voltooid!</p>' : ''}
  `;

  if (lockedEl)  lockedEl.hidden  = isUnlocked;
  if (actionsEl) actionsEl.hidden = !isUnlocked;

  if (!isUnlocked && lockedEl) {
    const needed = build.blocksRequired - state.progress.earnedBlocks;
    const starsNeededEl = lockedEl.querySelector('[data-stars-needed]');
    if (starsNeededEl) starsNeededEl.textContent = needed;
  }

  // Wire the "start build" button
  const startBtn = screen.querySelector('[data-action="start-build"]');
  if (startBtn && !startBtn.dataset.listenerReady) {
    startBtn.addEventListener('click', () => navigateTo('screen-builds'));
    startBtn.dataset.listenerReady = '1';
  }
}

/**
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {string}
 */
function difficultyStars(difficulty) {
  const map = { easy: '⭐', medium: '⭐⭐', hard: '⭐⭐⭐' };
  return map[difficulty] ?? '⭐';
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
    <div class="parent-progress-summary">
      <div class="parent-stat">✅ <strong>${state.progress.totalCorrect}</strong> goed</div>
      <div class="parent-stat">🔥 <strong>${state.progress.bestStreak}</strong> reeks</div>
      <div class="parent-stat">🧱 <strong>${state.progress.earnedBlocks}</strong> blokken</div>
      <div class="parent-stat">⭐ <strong>${state.progress.earnedStickers}</strong> stickers</div>
      <div class="parent-stat">🏗️ <strong>${state.builds.completedBuilds.length}</strong> bouwsels</div>
    </div>

    <h3 class="settings-group__heading">Oefeningen</h3>
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

    <h3 class="settings-group__heading">Geluid</h3>
    <div class="parent-setting">
      <span class="parent-setting__label">🔊 Geluid inschakelen</span>
      <label class="toggle">
        <input type="checkbox" data-sound-toggle ${state.settings.soundEnabled ? 'checked' : ''}>
        <span class="toggle__track"></span>
      </label>
    </div>

    <h3 class="settings-group__heading">Beheer</h3>
    <div class="parent-setting__actions">
      <button class="btn btn--danger" data-action="reset-progress">Voortgang wissen</button>
      <button class="btn"            data-action="change-pin">Pincode wijzigen</button>
    </div>

    <h3 class="settings-group__heading">Badges verdiend</h3>
    <ul class="badge-list">${badgeListHtml()}</ul>
  `;
}
