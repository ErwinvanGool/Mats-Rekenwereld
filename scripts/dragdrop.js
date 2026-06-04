/**
 * dragdrop.js
 * Pointer/touch-based drag-and-drop for the build workshop.
 *
 * Architecture
 * ────────────
 * • Uses the HTML5 Drag-and-Drop API (draggable="true") with a touch fallback
 *   via `pointermove`.
 * • Droppable slots are elements with `data-slot-id`.
 * • Draggable parts are elements with `data-part-id` and `draggable="true"`.
 * • On a successful drop the `partDropped` custom event is dispatched so that
 *   builds.js can be called without a circular import.
 */

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/**
 * Attach all drag-and-drop event listeners to the workshop container.
 * Call once after the builds screen's HTML has been rendered.
 *
 * @param {HTMLElement} container – the workshop root element
 */
export function initDragDrop(container) {
  // ── Drag source events ──
  container.addEventListener('dragstart', onDragStart);
  container.addEventListener('dragend',   onDragEnd);

  // ── Drop target events ──
  container.addEventListener('dragover',  onDragOver);
  container.addEventListener('dragleave', onDragLeave);
  container.addEventListener('drop',      onDrop);

  // Touch / pointer fallback
  container.addEventListener('pointerdown', onPointerDown);
}

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** The part ID currently being dragged. */
let draggedPartId = null;

/** Ghost element used during touch drag. */
let ghostEl = null;

// ---------------------------------------------------------------------------
// HTML5 drag handlers
// ---------------------------------------------------------------------------

/** @param {DragEvent} event */
function onDragStart(event) {
  const part = event.target.closest('[data-part-id][draggable="true"]');
  if (!part) return;

  draggedPartId = part.dataset.partId;
  event.dataTransfer.setData('text/plain', draggedPartId);
  event.dataTransfer.effectAllowed = 'move';
  part.classList.add('build-part--dragging');
}

/** @param {DragEvent} event */
function onDragEnd(event) {
  const part = event.target.closest('[data-part-id]');
  if (part) part.classList.remove('build-part--dragging');
  draggedPartId = null;
}

/** @param {DragEvent} event */
function onDragOver(event) {
  const slot = event.target.closest('[data-slot-id]');
  if (!slot) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  slot.classList.add('build-slot--over');
}

/** @param {DragEvent} event */
function onDragLeave(event) {
  const slot = event.target.closest('[data-slot-id]');
  if (slot) slot.classList.remove('build-slot--over');
}

/** @param {DragEvent} event */
function onDrop(event) {
  const slot = event.target.closest('[data-slot-id]');
  if (!slot) return;

  event.preventDefault();
  slot.classList.remove('build-slot--over');

  const partId = event.dataTransfer.getData('text/plain') || draggedPartId;
  if (partId) {
    dispatchPartDropped(slot, partId);
  }
  draggedPartId = null;
}

// ---------------------------------------------------------------------------
// Touch / pointer fallback handlers
// ---------------------------------------------------------------------------

/** @param {PointerEvent} event */
function onPointerDown(event) {
  const part = event.target.closest('[data-part-id][draggable="true"]');
  if (!part) return;

  // Prevent iOS Safari from scrolling instead of dragging the block.
  event.preventDefault();

  draggedPartId = part.dataset.partId;

  // Create a visual ghost that follows the pointer
  ghostEl = part.cloneNode(true);
  ghostEl.classList.add('build-part--ghost');
  ghostEl.style.position = 'fixed';
  ghostEl.style.pointerEvents = 'none';
  ghostEl.style.zIndex = '1000';
  document.body.appendChild(ghostEl);
  moveGhost(event.clientX, event.clientY);

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup',   onPointerUp, { once: true });
}

/** @param {PointerEvent} event */
function onPointerMove(event) {
  if (ghostEl) moveGhost(event.clientX, event.clientY);
}

/** @param {PointerEvent} event */
function onPointerUp(event) {
  document.removeEventListener('pointermove', onPointerMove);

  if (ghostEl) {
    document.body.removeChild(ghostEl);
    ghostEl = null;
  }

  // Find the element under the pointer (ghost has pointer-events: none)
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const slot = target ? target.closest('[data-slot-id]') : null;

  if (slot && draggedPartId) {
    dispatchPartDropped(slot, draggedPartId);
  }

  draggedPartId = null;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * @param {number} x
 * @param {number} y
 */
function moveGhost(x, y) {
  if (!ghostEl) return;
  ghostEl.style.left = `${x - 40}px`;
  ghostEl.style.top  = `${y - 40}px`;
}

/**
 * Dispatch a `partDropped` CustomEvent on the slot element.
 * Listeners in builds.js / main.js handle the actual state mutation.
 *
 * @param {HTMLElement} slot
 * @param {string}      partId
 */
function dispatchPartDropped(slot, partId) {
  slot.dispatchEvent(
    new CustomEvent('partDropped', {
      bubbles: true,
      detail: { partId, slotId: slot.dataset.slotId },
    })
  );
}
