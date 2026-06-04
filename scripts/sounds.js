/**
 * sounds.js
 * Centralised Web Audio API sound effects.
 * All sounds are synthesised inline — no external files needed.
 * GitHub Pages compatible, no dependencies.
 */

import { state } from './state.js';

// Lazily created shared AudioContext (avoids "too many contexts" warnings).
let _ctx = null;

function getCtx() {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume on user gesture if suspended (Safari / iOS requirement).
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

/**
 * Play a sequence of notes using the given waveform.
 * @param {{ freq: number, t: number, dur: number, vol?: number }[]} notes
 * @param {OscillatorType} [type='triangle']
 */
function playNotes(notes, type = 'triangle') {
  if (!state.settings.soundEnabled) return;
  try {
    const ctx = getCtx();
    notes.forEach(({ freq, t, dur, vol = 0.22 }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      const at = ctx.currentTime + t;
      osc.frequency.setValueAtTime(freq, at);
      gain.gain.setValueAtTime(vol, at);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      osc.start(at);
      osc.stop(at + dur);
    });
  } catch (_) { /* audio not available */ }
}

// ---------------------------------------------------------------------------
// Public sound effects
// ---------------------------------------------------------------------------

/** Short ascending "ding" for a correct answer. */
export function playCorrectSound() {
  playNotes([
    { freq: 523, t: 0,    dur: 0.12 }, // C5
    { freq: 659, t: 0.10, dur: 0.12 }, // E5
    { freq: 784, t: 0.20, dur: 0.25 }, // G5
  ]);
}

/** Gentle descending tone for a wrong answer (not punishing). */
export function playWrongSound() {
  playNotes([
    { freq: 400, t: 0,    dur: 0.14, vol: 0.15 },
    { freq: 320, t: 0.12, dur: 0.18, vol: 0.10 },
  ]);
}

/** Subtle "click" hint nudge after repeated wrong attempts. */
export function playHintSound() {
  playNotes([
    { freq: 440, t: 0,   dur: 0.08, vol: 0.12 },
    { freq: 480, t: 0.1, dur: 0.08, vol: 0.12 },
  ]);
}

/** Tactile brick-snap for placing a part. */
export function playBrickSound() {
  playNotes([
    { freq: 440, t: 0,    dur: 0.06, vol: 0.25 },
    { freq: 660, t: 0.06, dur: 0.20, vol: 0.18 },
  ], 'square');
}

/** Celebratory fanfare for a completed build. */
export function playCompleteSound() {
  playNotes([
    { freq: 523,  t: 0,    dur: 0.45 }, // C5
    { freq: 659,  t: 0.13, dur: 0.45 }, // E5
    { freq: 784,  t: 0.26, dur: 0.45 }, // G5
    { freq: 1047, t: 0.39, dur: 0.65 }, // C6
  ]);
}

/** Sparkle jingle for earning a sticker. */
export function playStickerSound() {
  playNotes([
    { freq: 880,  t: 0,    dur: 0.10, vol: 0.20 }, // A5
    { freq: 1109, t: 0.09, dur: 0.10, vol: 0.20 }, // C#6
    { freq: 1319, t: 0.18, dur: 0.10, vol: 0.20 }, // E6
    { freq: 1760, t: 0.27, dur: 0.30, vol: 0.18 }, // A6
  ]);
}

/** Bonus-block chime for a streak milestone. */
export function playBonusSound() {
  playNotes([
    { freq: 392, t: 0,    dur: 0.12, vol: 0.22 }, // G4
    { freq: 523, t: 0.10, dur: 0.12, vol: 0.22 }, // C5
    { freq: 659, t: 0.20, dur: 0.22, vol: 0.22 }, // E5
    { freq: 784, t: 0.30, dur: 0.30, vol: 0.22 }, // G5
  ]);
}

/** Satisfying "unlock pop" for a newly unlocked map pin. */
export function playUnlockSound() {
  playNotes([
    { freq: 300, t: 0,    dur: 0.08, vol: 0.20 },
    { freq: 600, t: 0.07, dur: 0.10, vol: 0.22 },
    { freq: 900, t: 0.15, dur: 0.25, vol: 0.20 },
  ], 'sine');
}
