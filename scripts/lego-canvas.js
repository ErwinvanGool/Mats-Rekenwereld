/**
 * lego-canvas.js
 * 2-D top-down flat LEGO grid renderer for the build workshop.
 *
 * The view is a flat overhead grid – like looking straight down at a LEGO
 * baseplate.  Bricks are coloured rounded rectangles with stud circles on
 * top.  Higher-layer bricks (e.g. the car window on layer 1) simply render
 * on top of lower-layer ones.
 *
 * Architecture:
 *  - One HTML5 Canvas element covers the flat baseplate grid.
 *  - "Design bricks" come from build.brickGrid.bricks; placement is tracked
 *    via the existing placePart() / isPartPlaced() system (persisted).
 *  - "Decorative bricks" are placed freely (in-memory only, not persisted).
 *  - Selecting a chip then clicking a cell places the brick at its design
 *    position (if the click lands in that brick's footprint) or as a free
 *    1×1 deco brick elsewhere.
 *  - Dispatches 'legoBrickPlaced' CustomEvent so main.js can persist without
 *    creating a circular import.
 */

import { isPartPlaced } from './builds.js';

// ---------------------------------------------------------------------------
// Rendering constants
// ---------------------------------------------------------------------------

const TILE    = 56;   // pixels per stud (square grid)
const STUD_R  = 10;   // stud circle radius
const BRICK_R = 5;    // brick rounded-corner radius
const GAP     = 3;    // gap between adjacent bricks (shows baseplate underneath)
const PAD     = 18;   // canvas padding around the baseplate

// Baseplate colours
const BASE_FILL     = '#4ea32e';
const BASE_ALT_FILL = '#459c27';
const BASE_STUD_CLR = '#3d8c22';
const BASE_BORDER   = '#2e6618';

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

/** @type {HTMLCanvasElement|null} */
let _canvas = null;
/** @type {CanvasRenderingContext2D|null} */
let _ctx    = null;
/** @type {object|null} The active build definition (must have .brickGrid). */
let _build  = null;

/** Palette-selected partId (or null). */
let _selectedPartId = null;

/** Grid cell the pointer is hovering over. @type {{col:number,row:number}|null} */
let _hoverCell = null;

/** Bricks placed freely by the child – not persisted.
 *  @type {Array<{col:number,row:number,layer:number,w:number,d:number,color:string}>} */
let _decoBricks = [];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialise (or re-initialise) the canvas for the given build.
 * Calling this clears any previous state including decorative bricks.
 * @param {HTMLCanvasElement} canvas
 * @param {object} build  A BUILDS entry that has a `.brickGrid` property.
 */
export function initLegoCanvas(canvas, build) {
  if (_canvas) _detach();

  _canvas          = canvas;
  _ctx             = canvas.getContext('2d');
  _build           = build;
  _selectedPartId  = null;
  _hoverCell       = null;
  _decoBricks      = [];

  _sizeCanvas();

  _canvas.addEventListener('click',      _onClick);
  _canvas.addEventListener('mousemove',  _onMouseMove);
  _canvas.addEventListener('mouseleave', _onMouseLeave);
  _canvas.addEventListener('touchend',   _onTouchEnd, { passive: false });

  _render();
}

/** Remove all event listeners and release references. Safe to call when none active. */
export function destroyLegoCanvas() {
  _detach();
}

/**
 * Set which part from the palette is currently selected.
 * Pass null to clear the selection.
 * @param {string|null} partId
 */
export function setLegoSelectedPart(partId) {
  _selectedPartId = partId;
  _render();
}

/** Return the currently selected part ID (or null). */
export function getLegoSelectedPart() {
  return _selectedPartId;
}

/** Force a full re-render without re-initialising state (preserves deco bricks). */
export function renderLegoCanvas() {
  _render();
}

// ---------------------------------------------------------------------------
// Private – canvas lifecycle
// ---------------------------------------------------------------------------

function _detach() {
  if (!_canvas) return;
  _canvas.removeEventListener('click',      _onClick);
  _canvas.removeEventListener('mousemove',  _onMouseMove);
  _canvas.removeEventListener('mouseleave', _onMouseLeave);
  _canvas.removeEventListener('touchend',   _onTouchEnd);
  _canvas = null;
  _ctx    = null;
  _build  = null;
}

function _sizeCanvas() {
  const { baseplateWidth: W, baseplateDepth: D } = _build.brickGrid;
  _canvas.width  = W * TILE + PAD * 2;
  _canvas.height = D * TILE + PAD * 2;
}

// ---------------------------------------------------------------------------
// Coordinate helpers
// ---------------------------------------------------------------------------

/** Grid cell (col, row) → top-left screen pixel. */
function _cellToScreen(col, row) {
  return { x: PAD + col * TILE, y: PAD + row * TILE };
}

/** Screen pixel (sx, sy) → grid cell (col, row). */
function _screenToCell(sx, sy) {
  return {
    col: Math.floor((sx - PAD) / TILE),
    row: Math.floor((sy - PAD) / TILE),
  };
}

// ---------------------------------------------------------------------------
// Main render loop
// ---------------------------------------------------------------------------

function _render() {
  if (!_ctx || !_build) return;
  _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
  _drawBaseplate();
  _drawGhosts();
  _drawPlacedBricks();
  if (_hoverCell) _drawHoverCell(_hoverCell.col, _hoverCell.row);
}

// ---------------------------------------------------------------------------
// Baseplate
// ---------------------------------------------------------------------------

function _drawBaseplate() {
  const { baseplateWidth: W, baseplateDepth: D } = _build.brickGrid;

  // Base fill with rounded border
  _ctx.fillStyle = BASE_FILL;
  _roundRect(PAD, PAD, W * TILE, D * TILE, 8);
  _ctx.fill();

  // Alternating tile shade + stud dot per cell
  for (let c = 0; c < W; c++) {
    for (let r = 0; r < D; r++) {
      const { x, y } = _cellToScreen(c, r);

      if ((c + r) % 2 === 0) {
        _ctx.fillStyle = BASE_ALT_FILL;
        _ctx.fillRect(x, y, TILE, TILE);
      }

      // Stud dot
      _ctx.beginPath();
      _ctx.arc(x + TILE / 2, y + TILE / 2, STUD_R * 0.48, 0, Math.PI * 2);
      _ctx.fillStyle = BASE_STUD_CLR;
      _ctx.fill();
    }
  }

  // Grid lines
  _ctx.strokeStyle = 'rgba(0,0,0,0.10)';
  _ctx.lineWidth = 0.5;
  for (let c = 1; c < W; c++) {
    const x = PAD + c * TILE;
    _ctx.beginPath(); _ctx.moveTo(x, PAD); _ctx.lineTo(x, PAD + D * TILE); _ctx.stroke();
  }
  for (let r = 1; r < D; r++) {
    const y = PAD + r * TILE;
    _ctx.beginPath(); _ctx.moveTo(PAD, y); _ctx.lineTo(PAD + W * TILE, y); _ctx.stroke();
  }

  // Outer border
  _ctx.strokeStyle = BASE_BORDER;
  _ctx.lineWidth = 3;
  _roundRect(PAD, PAD, W * TILE, D * TILE, 8);
  _ctx.stroke();
}

// ---------------------------------------------------------------------------
// Ghost outlines for unplaced design bricks
// ---------------------------------------------------------------------------

function _drawGhosts() {
  for (const brick of _build.brickGrid.bricks) {
    if (isPartPlaced(brick.partId)) continue;
    const isSelected = brick.partId === _selectedPartId;
    _drawBrick2D(brick.col, brick.row, brick.w, brick.d, brick.color, {
      alpha: isSelected ? 0.52 : 0.24,
      ghost: true,
      glow:  isSelected ? '#FFD700' : null,
    });
  }
}

// ---------------------------------------------------------------------------
// Placed bricks (decorative + design)
// ---------------------------------------------------------------------------

function _drawPlacedBricks() {
  /** @type {Array<{col,row,layer,w,d,color}>} */
  const all = [..._decoBricks];

  for (const b of _build.brickGrid.bricks) {
    if (isPartPlaced(b.partId)) {
      all.push({ col: b.col, row: b.row, layer: b.layer ?? 0, w: b.w, d: b.d, color: b.color });
    }
  }

  // Sort by layer so higher-layer bricks render on top
  all.sort((a, b) => a.layer - b.layer);

  for (const b of all) {
    _drawBrick2D(b.col, b.row, b.w, b.d, b.color, {});
  }
}

// ---------------------------------------------------------------------------
// Hover cell highlight
// ---------------------------------------------------------------------------

function _drawHoverCell(col, row) {
  const { baseplateWidth: W, baseplateDepth: D } = _build.brickGrid;
  if (col < 0 || col >= W || row < 0 || row >= D) return;
  const { x, y } = _cellToScreen(col, row);
  _ctx.fillStyle = 'rgba(255,255,100,0.38)';
  _ctx.fillRect(x, y, TILE, TILE);
}

// ---------------------------------------------------------------------------
// Core 2-D brick drawing
// ---------------------------------------------------------------------------

/**
 * Draw a flat top-down LEGO brick.
 * @param {number} col   top-left grid column
 * @param {number} row   top-left grid row
 * @param {number} w     width in studs
 * @param {number} d     depth in studs
 * @param {string} color '#RRGGBB' hex
 * @param {object} opts  { alpha, ghost, glow }
 */
function _drawBrick2D(col, row, w, d, color, opts = {}) {
  const { alpha = 1, ghost = false, glow = null } = opts;
  const { x, y } = _cellToScreen(col, row);
  const bx = x + GAP;
  const by = y + GAP;
  const bw = w * TILE - GAP * 2;
  const bh = d * TILE - GAP * 2;

  _ctx.globalAlpha = alpha;
  if (glow) { _ctx.shadowColor = glow; _ctx.shadowBlur = 20; }

  if (!ghost) {
    // Drop shadow (offset 3px)
    _ctx.fillStyle = _bright(color, -55);
    _roundRect(bx + 3, by + 3, bw, bh, BRICK_R);
    _ctx.fill();

    // Brick body
    _ctx.fillStyle = color;
    _roundRect(bx, by, bw, bh, BRICK_R);
    _ctx.fill();

    // Stud circles
    const studFill  = _bright(color, 30);
    const studEdge  = _bright(color, -20);
    for (let ci = 0; ci < w; ci++) {
      for (let ri = 0; ri < d; ri++) {
        const cx = x + ci * TILE + TILE / 2;
        const cy = y + ri * TILE + TILE / 2;
        _ctx.beginPath();
        _ctx.arc(cx, cy, STUD_R, 0, Math.PI * 2);
        _ctx.fillStyle = studFill;
        _ctx.fill();
        _ctx.strokeStyle = studEdge;
        _ctx.lineWidth = 1;
        _ctx.stroke();
      }
    }
  } else {
    // Ghost: semi-transparent fill + dashed outline
    _ctx.fillStyle = color;
    _roundRect(bx, by, bw, bh, BRICK_R);
    _ctx.fill();

    _ctx.strokeStyle = glow ?? _bright(color, 40);
    _ctx.lineWidth   = glow ? 2.5 : 1.5;
    _ctx.setLineDash([6, 4]);
    _roundRect(bx, by, bw, bh, BRICK_R);
    _ctx.stroke();
    _ctx.setLineDash([]);

    // Faint stud circles
    for (let ci = 0; ci < w; ci++) {
      for (let ri = 0; ri < d; ri++) {
        const cx = x + ci * TILE + TILE / 2;
        const cy = y + ri * TILE + TILE / 2;
        _ctx.beginPath();
        _ctx.arc(cx, cy, STUD_R * 0.6, 0, Math.PI * 2);
        _ctx.fillStyle = _bright(color, 25);
        _ctx.fill();
      }
    }
  }

  _ctx.globalAlpha = 1;
  _ctx.shadowColor = 'transparent';
  _ctx.shadowBlur  = 0;
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

/** Convert a DOM event with clientX/clientY to canvas pixel coordinates. */
function _getCanvasPos(event) {
  const rect   = _canvas.getBoundingClientRect();
  const scaleX = _canvas.width  / rect.width;
  const scaleY = _canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top)  * scaleY,
  };
}

function _onClick(event) {
  if (!_selectedPartId) return;
  const { x, y }    = _getCanvasPos(event);
  const { col, row } = _screenToCell(x, y);
  const { baseplateWidth: W, baseplateDepth: D } = _build.brickGrid;

  if (col < 0 || col >= W || row < 0 || row >= D) return;

  const designBrick = _build.brickGrid.bricks.find(b => b.partId === _selectedPartId);
  if (!designBrick) return;

  // Is the click inside the design brick's footprint?
  const inDesignZone =
    col >= designBrick.col && col < designBrick.col + designBrick.w &&
    row >= designBrick.row && row < designBrick.row + designBrick.d;

  if (inDesignZone) {
    // Snap to design position – main.js will persist the placement
    _canvas.dispatchEvent(new CustomEvent('legoBrickPlaced', {
      bubbles: true,
      detail:  { partId: _selectedPartId, atDesignPosition: true },
    }));
    _selectedPartId = null;
  } else {
    // Place as a 1×1 decorative brick (fun free-play, not persisted)
    _decoBricks.push({
      col, row,
      layer: 0,
      w: 1, d: 1,
      color: designBrick.color,
    });
    _canvas.dispatchEvent(new CustomEvent('legoBrickPlaced', {
      bubbles: true,
      detail:  { partId: _selectedPartId, atDesignPosition: false },
    }));
    _render();
  }
}

function _onMouseMove(event) {
  const { x, y }     = _getCanvasPos(event);
  const { col, row }  = _screenToCell(x, y);
  const { baseplateWidth: W, baseplateDepth: D } = _build.brickGrid;
  _hoverCell = (col >= 0 && col < W && row >= 0 && row < D)
    ? { col, row }
    : null;
  _render();
}

function _onMouseLeave() {
  _hoverCell = null;
  _render();
}

function _onTouchEnd(event) {
  event.preventDefault(); // suppress the browser's 300 ms synthetic click
  const t = event.changedTouches[0];
  if (t) _onClick(t);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Trace a rounded-rectangle path. Caller must fill/stroke. */
function _roundRect(x, y, w, h, r) {
  _ctx.beginPath();
  _ctx.moveTo(x + r, y);
  _ctx.lineTo(x + w - r, y);
  _ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  _ctx.lineTo(x + w, y + h - r);
  _ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  _ctx.lineTo(x + r, y + h);
  _ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  _ctx.lineTo(x, y + r);
  _ctx.quadraticCurveTo(x, y, x + r, y);
  _ctx.closePath();
}

/**
 * Adjust the brightness of a '#RRGGBB' hex colour.
 * Positive amount = lighter, negative = darker.
 * @param {string} hex
 * @param {number} amount  −255 … +255
 * @returns {string}
 */
function _bright(hex, amount) {
  const clamp = (v) => Math.min(255, Math.max(0, v));
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  const r = clamp(parseInt(h.slice(0, 2), 16) + amount);
  const g = clamp(parseInt(h.slice(2, 4), 16) + amount);
  const b = clamp(parseInt(h.slice(4, 6), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
