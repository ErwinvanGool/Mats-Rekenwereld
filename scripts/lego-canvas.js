/**
 * lego-canvas.js
 * Isometric LEGO-style canvas renderer for the build workshop.
 *
 * Architecture:
 *  - One HTML5 Canvas element covers the isometric baseplate scene.
 *  - "Design bricks" come from build.brickGrid.bricks; their placement is
 *    tracked persistently via the existing placePart() / isPartPlaced() system.
 *  - "Decorative bricks" are placed freely by the child (in-memory only).
 *  - The palette is rendered as HTML chips; selecting one then clicking the
 *    canvas places the brick (snapping to design position when in that zone,
 *    otherwise placing a 1×1 deco brick).
 *  - Dispatches a 'legoBrickPlaced' CustomEvent on the canvas element so
 *    main.js can call placePart() without creating a circular import.
 */

import { isPartPlaced } from './builds.js';

// ---------------------------------------------------------------------------
// Rendering constants
// ---------------------------------------------------------------------------

const TILE    = 22;   // half-width of one stud column in screen pixels
const BRICK_H = 26;   // pixel height of one brick wall layer
const STUD_RX = 6;    // stud ellipse x-radius
const STUD_RY = 3;    // stud ellipse y-radius (≈ half of x)
const STUD_H  = 5;    // how many px the stud cap rises above the top face

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

/** @type {HTMLCanvasElement|null} */
let _canvas = null;
/** @type {CanvasRenderingContext2D|null} */
let _ctx = null;
/** @type {object|null} The active build definition (must have .brickGrid). */
let _build = null;

/** Palette-selected partId (or null). */
let _selectedPartId = null;

/** Grid cell the pointer is hovering over, or null. @type {{col:number,row:number}|null} */
let _hoverCell = null;

/** Bricks placed freely by the child – not persisted.
 *  @type {Array<{col:number,row:number,layer:number,w:number,d:number,color:string}>} */
let _decoBricks = [];

/** Canvas-space origin: isometric grid (0,0,0) maps to (_originX, _originY). */
let _originX = 0;
let _originY = 0;

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
  const maxLayer = 3;
  const pad      = 1; // extra stud-grid margin around the baseplate

  const totalW = W + pad * 2;
  const totalD = D + pad * 2;

  _canvas.width  = (totalW + totalD) * TILE + 20;
  _canvas.height = (totalW + totalD) * (TILE / 2) + maxLayer * BRICK_H + STUD_H + 50;

  // Origin: isometric (0,0) is TILE*pad from the left, at the top
  _originX = totalD * TILE + 10;
  _originY = 20 + maxLayer * BRICK_H + STUD_H + pad * (TILE / 2);
}

// ---------------------------------------------------------------------------
// Coordinate transforms
// ---------------------------------------------------------------------------

/**
 * Isometric: convert grid (col, row, layer) → screen (x, y).
 * @returns {{x:number, y:number}}
 */
function _iso(col, row, layer) {
  return {
    x: _originX + (col - row) * TILE,
    y: _originY + (col + row) * (TILE / 2) - layer * BRICK_H,
  };
}

/**
 * Inverse isometric: convert screen (sx, sy) → approximate grid (col, row).
 * Assumes layer = 0 (baseplate surface).
 * @returns {{col:number, row:number}}
 */
function _screenToGrid(sx, sy) {
  const dx = sx - _originX;
  const dy = sy - _originY;
  // Solve: dx = (col-row)*TILE, dy = (col+row)*(TILE/2)
  const col = (dx / TILE + (2 * dy) / TILE) / 2;
  const row = ((2 * dy) / TILE - dx / TILE)  / 2;
  return { col: Math.floor(col), row: Math.floor(row) };
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
  if (_hoverCell) _drawHoverTile(_hoverCell.col, _hoverCell.row);
}

// ---------------------------------------------------------------------------
// Baseplate
// ---------------------------------------------------------------------------

function _drawBaseplate() {
  const { baseplateWidth: W, baseplateDepth: D } = _build.brickGrid;

  // Tiles
  for (let c = 0; c < W; c++) {
    for (let r = 0; r < D; r++) {
      const even = (c + r) % 2 === 0;
      _drawDiamond(c, r, 0, even ? '#4e8a2e' : '#3f7524');

      // Stud dot on each tile
      const ctr = _iso(c + 0.5, r + 0.5, 0);
      _ctx.beginPath();
      _ctx.ellipse(ctr.x, ctr.y, STUD_RX * 0.58, STUD_RY * 0.58, 0, 0, Math.PI * 2);
      _ctx.fillStyle = even ? '#3a6c1c' : '#306018';
      _ctx.fill();
    }
  }

  // 3-D bottom edge of the baseplate
  const edgeH    = TILE / 2;
  const edgeColor = '#2a5010';

  // Left edge (col = 0 face)
  _ctx.beginPath();
  for (let r = 0; r <= D; r++) {
    const p = _iso(0, r, 0);
    r === 0 ? _ctx.moveTo(p.x, p.y) : _ctx.lineTo(p.x, p.y);
  }
  for (let r = D; r >= 0; r--) {
    const p = _iso(0, r, 0);
    _ctx.lineTo(p.x, p.y + edgeH);
  }
  _ctx.closePath();
  _ctx.fillStyle = edgeColor;
  _ctx.fill();

  // Right edge (row = D face)
  _ctx.beginPath();
  for (let c = W; c >= 0; c--) {
    const p = _iso(c, D, 0);
    c === W ? _ctx.moveTo(p.x, p.y) : _ctx.lineTo(p.x, p.y);
  }
  for (let c = 0; c <= W; c++) {
    const p = _iso(c, D, 0);
    _ctx.lineTo(p.x, p.y + edgeH);
  }
  _ctx.closePath();
  _ctx.fillStyle = edgeColor;
  _ctx.fill();
}

/** Draw a single 1×1 baseplate diamond (top face of a tile). */
function _drawDiamond(col, row, layer, color) {
  const tl = _iso(col,     row,     layer);
  const tr = _iso(col + 1, row,     layer);
  const br = _iso(col + 1, row + 1, layer);
  const bl = _iso(col,     row + 1, layer);
  _ctx.beginPath();
  _ctx.moveTo(tl.x, tl.y);
  _ctx.lineTo(tr.x, tr.y);
  _ctx.lineTo(br.x, br.y);
  _ctx.lineTo(bl.x, bl.y);
  _ctx.closePath();
  _ctx.fillStyle = color;
  _ctx.fill();
  _ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  _ctx.lineWidth = 0.5;
  _ctx.stroke();
}

// ---------------------------------------------------------------------------
// Ghost outlines for unplaced design bricks
// ---------------------------------------------------------------------------

function _drawGhosts() {
  for (const brick of _build.brickGrid.bricks) {
    if (isPartPlaced(brick.partId)) continue;
    const isSelected = brick.partId === _selectedPartId;
    _drawBrick(brick.col, brick.row, brick.layer, brick.w, brick.d, brick.color, {
      alpha:     isSelected ? 0.42 : 0.18,
      outline:   true,
      glowColor: isSelected ? '#FFD700' : null,
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
      all.push({ col: b.col, row: b.row, layer: b.layer, w: b.w, d: b.d, color: b.color });
    }
  }

  // Painter's order: ascending (col + row + layer * 10)
  all.sort((a, b) => (a.col + a.row + a.layer * 10) - (b.col + b.row + b.layer * 10));

  for (const b of all) {
    _drawBrick(b.col, b.row, b.layer, b.w, b.d, b.color, {});
  }
}

// ---------------------------------------------------------------------------
// Hover tile highlight
// ---------------------------------------------------------------------------

function _drawHoverTile(col, row) {
  const { baseplateWidth: W, baseplateDepth: D } = _build.brickGrid;
  if (col < 0 || col >= W || row < 0 || row >= D) return;

  const tl = _iso(col,     row,     0);
  const tr = _iso(col + 1, row,     0);
  const br = _iso(col + 1, row + 1, 0);
  const bl = _iso(col,     row + 1, 0);
  _ctx.beginPath();
  _ctx.moveTo(tl.x, tl.y);
  _ctx.lineTo(tr.x, tr.y);
  _ctx.lineTo(br.x, br.y);
  _ctx.lineTo(bl.x, bl.y);
  _ctx.closePath();
  _ctx.fillStyle = 'rgba(255,255,100,0.30)';
  _ctx.fill();
}

// ---------------------------------------------------------------------------
// Core brick drawing
// ---------------------------------------------------------------------------

/**
 * Draw an isometric LEGO brick.
 * @param {number} col      top-left grid column (col-axis = depth in iso)
 * @param {number} row      top-left grid row
 * @param {number} layer    vertical layer (0 = sitting on baseplate surface)
 * @param {number} w        width in studs (along the col direction)
 * @param {number} d        depth in studs (along the row direction)
 * @param {string} color    '#RRGGBB' hex
 * @param {object} [opts]   { alpha, outline, glowColor }
 */
function _drawBrick(col, row, layer, w, d, color, opts = {}) {
  const { alpha = 1, outline = false, glowColor = null } = opts;
  const ctx = _ctx;

  ctx.globalAlpha = alpha;
  if (glowColor) { ctx.shadowColor = glowColor; ctx.shadowBlur = 22; }

  const topFace  = _bright(color,  38);
  const rightFace = color;
  const frontFace = _bright(color, -38);
  const edgeClr   = _bright(color, -58);

  // Vertices of the top face (at layer+1 height)
  const tl  = _iso(col,     row,     layer + 1);
  const tr  = _iso(col + w, row,     layer + 1);
  const br  = _iso(col + w, row + d, layer + 1);
  const bl  = _iso(col,     row + d, layer + 1);

  // Bottom rim of the vertical walls
  const tr0 = _iso(col + w, row,     layer);
  const br0 = _iso(col + w, row + d, layer);
  const bl0 = _iso(col,     row + d, layer);

  // Top face
  _poly([tl, tr, br, bl], topFace,   outline ? edgeClr : null);
  // Right wall (col+w side)
  _poly([tr, tr0, br0, br], rightFace, outline ? edgeClr : null);
  // Front wall (row+d side)
  _poly([br, br0, bl0, bl], frontFace, outline ? edgeClr : null);

  if (!outline) {
    _drawStuds(col, row, layer + 1, w, d, topFace, edgeClr);
  }

  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur  = 0;
}

/** Draw stud bumps on the top face of a brick. */
function _drawStuds(col, row, layer, w, d, topColor, edgeColor) {
  const studSide = _bright(topColor, -10);
  const studTop  = _bright(topColor,  14);

  for (let ci = 0; ci < w; ci++) {
    for (let ri = 0; ri < d; ri++) {
      const centre = _iso(col + ci + 0.5, row + ri + 0.5, layer);

      // Side band of the stud cylinder
      _ctx.beginPath();
      _ctx.ellipse(centre.x, centre.y + STUD_H, STUD_RX, STUD_RY, 0, 0, Math.PI * 2);
      _ctx.fillStyle = studSide;
      _ctx.fill();

      // Top cap of the stud
      _ctx.beginPath();
      _ctx.ellipse(centre.x, centre.y, STUD_RX, STUD_RY, 0, 0, Math.PI * 2);
      _ctx.fillStyle = studTop;
      _ctx.fill();
      _ctx.strokeStyle = edgeColor;
      _ctx.lineWidth = 0.5;
      _ctx.stroke();
    }
  }
}

/** Fill a polygon path and optionally stroke it. */
function _poly(pts, fill, stroke = null) {
  _ctx.beginPath();
  _ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) _ctx.lineTo(pts[i].x, pts[i].y);
  _ctx.closePath();
  _ctx.fillStyle = fill;
  _ctx.fill();
  if (stroke) {
    _ctx.strokeStyle = stroke;
    _ctx.lineWidth = 1;
    _ctx.stroke();
  }
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
  const { col, row } = _screenToGrid(x, y);
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
  const { col, row }  = _screenToGrid(x, y);
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
// Color utilities
// ---------------------------------------------------------------------------

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
