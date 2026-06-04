/**
 * stickers.js
 * Sticker reward overlay system.
 *
 * When the child earns a sticker (every STICKER_STREAK_THRESHOLD correct
 * answers in a row) we show a full-screen modal with an animated sticker,
 * confetti, and a celebratory sound.
 *
 * Sticker definitions live here so they can be extended easily.
 */

import { state }         from './state.js';
import { launchConfetti } from './confetti.js';
import { playStickerSound } from './sounds.js';

// ---------------------------------------------------------------------------
// Sticker catalogue (emoji + label, no image files required)
// ---------------------------------------------------------------------------

export const STICKER_CATALOGUE = [
  { id: 'star1',    emoji: '⭐', label: 'Ster',         color: '#FFE44D' },
  { id: 'star2',    emoji: '🌟', label: 'Gouden Ster',  color: '#FCD34D' },
  { id: 'rocket1',  emoji: '🚀', label: 'Raket',        color: '#60A5FA' },
  { id: 'dino1',    emoji: '🦕', label: 'Dinosaurus',   color: '#4ADE80' },
  { id: 'fire1',    emoji: '🔥', label: 'Vuur',         color: '#F97316' },
  { id: 'rainbow1', emoji: '🌈', label: 'Regenboog',    color: '#A78BFA' },
  { id: 'heart1',   emoji: '💛', label: 'Hart',         color: '#FBBF24' },
  { id: 'crown1',   emoji: '👑', label: 'Kroon',        color: '#FCD34D' },
  { id: 'diamond1', emoji: '💎', label: 'Diamant',      color: '#7DD3FC' },
  { id: 'trophy1',  emoji: '🏆', label: 'Trofee',       color: '#F59E0B' },
  { id: 'magic1',   emoji: '✨', label: 'Magie',        color: '#C4B5FD' },
  { id: 'cake1',    emoji: '🎂', label: 'Taart',        color: '#FB923C' },
];

/**
 * Return the sticker definition for a given index (cycles through catalogue).
 * @param {number} index – 0-based index (total stickers earned − 1)
 * @returns {{ id, emoji, label, color }}
 */
export function getStickerForIndex(index) {
  return STICKER_CATALOGUE[index % STICKER_CATALOGUE.length];
}

// ---------------------------------------------------------------------------
// Modal overlay
// ---------------------------------------------------------------------------

const MODAL_ID = 'sticker-modal';

/**
 * Show an animated sticker reward overlay.
 * Auto-dismisses after 4 s or on tap.
 * @param {{ emoji: string, label: string, color: string }} sticker
 */
export function showStickerModal(sticker) {
  // Remove any existing modal
  document.getElementById(MODAL_ID)?.remove();

  const modal = document.createElement('div');
  modal.id = MODAL_ID;
  modal.setAttribute('role', 'alertdialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', `Sticker gewonnen: ${sticker.label}`);
  modal.className = 'sticker-modal';
  modal.style.setProperty('--sticker-color', sticker.color);

  modal.innerHTML = `
    <div class="sticker-modal__card">
      <p class="sticker-modal__title">🎉 Sticker!</p>
      <div class="sticker-modal__sticker" aria-hidden="true">${sticker.emoji}</div>
      <p class="sticker-modal__label">${sticker.label}</p>
      <p class="sticker-modal__sub">Geweldig gedaan!</p>
      <button class="sticker-modal__close btn btn--cta" aria-label="Doorgaan">
        ✓ Doorgaan!
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  playStickerSound();
  launchConfetti(80);

  // Dismiss on button or tap outside
  const dismiss = () => {
    modal.classList.add('sticker-modal--out');
    setTimeout(() => modal.remove(), 350);
  };

  modal.querySelector('.sticker-modal__close').addEventListener('click', dismiss);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) dismiss();
  });

  // Auto-dismiss after 4 s
  setTimeout(dismiss, 4000);
}

// ---------------------------------------------------------------------------
// Sticker collection rendering (used on progress screen)
// ---------------------------------------------------------------------------

/**
 * Return an HTML string displaying the child's earned sticker collection.
 * @returns {string} HTML
 */
export function stickerCollectionHtml() {
  const earned = state.progress.earnedStickers;

  if (earned === 0) {
    return `<p class="sticker-collection__empty">
      Beantwoord 5 vragen goed achter elkaar voor je eerste sticker! 🌟
    </p>`;
  }

  const stickers = Array.from({ length: earned }, (_, i) =>
    getStickerForIndex(i)
  );

  const items = stickers
    .map(
      (s) => `
      <div class="sticker-item" style="--sticker-color:${s.color}" aria-label="${s.label}">
        <span class="sticker-item__emoji" aria-hidden="true">${s.emoji}</span>
        <span class="sticker-item__label">${s.label}</span>
      </div>`
    )
    .join('');

  return `<div class="sticker-collection">${items}</div>`;
}
