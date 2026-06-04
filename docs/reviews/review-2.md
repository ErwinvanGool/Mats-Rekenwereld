# Building Experience Review — Review 2

### Review Summary
- **Review number:** 2
- **Date:** June 4, 2026
- **Overall score:** 3.2 / 5
- **Previous score:** 3.1 / 5
- **Score change:** +0.1

---

### Rubric Scores

#### Category 1: Clarity

**1. Is it immediately clear what the child should do when entering the build screen? 2/5**
Unchanged. No pulse hint, animated arrow, or guide gesture was added. In LEGO mode a child who taps the canvas before selecting a chip in the tray still sees nothing happen with no explanation why.

**2. Is the build example/reference clearly visible and easy to understand? 2/5**
Unchanged. In LEGO canvas mode `htmlRefEl.hidden = true` (`scripts/main.js` line 512) is still the active code path. The car build — the only brickGrid build — still shows no reference image. Ghost outlines remain the only visual goal.

**3. Are visual cues sufficient to guide building without any text? 2/5**
Unchanged. "Sleep hier" is still in `buildCanvasHtml()` (`scripts/builds.js` line 178), column headings "🏗️ Jouw bouwwerk" and "🧱 Blokken" still require reading, and part labels like "Carrosserie" and "Wiel voor-links" are still text-only.

**4. Is it clear which blocks are available and how many the child has? 3/5**
Slightly improved. The header `<span>` now carries `data-block-display` (`index.html` line 31), so `updateBlockDisplay()` correctly refreshes the counter after every correct answer. The count is now live and visible, though the locked-part cost labels still require reading.

**5. Is it clear when a build is finished? 5/5**
Unchanged — excellent. Overlay, fireworks, completion badge, and sound all fire together.

---

#### Category 2: Fun and engagement

**6. Does dragging blocks feel satisfying and playful? 3/5**
Unchanged. LEGO mode still uses tap-select/tap-place. No dragging, no ghost, no tactile pickup feeling.

**7. Is there enough visual and audio feedback during building? 3/5**
Marginally improved. The `[data-block-earned]` element now fires correctly — `blockEarnedEl.hidden = false` is set in `submitAnswer()` (`scripts/main.js` lines 336–341) and a "+X 🧱" flash appears for 1.1 seconds. However no sound plays on a wrong drop in the builds screen (`playWrongSound()` is still never called in `onPartDropped`), keeping this below 4.

**8. Would a 6-year-old want to keep building for at least 5 minutes? 3/5**
Unchanged. HTML mode still shows a plain emoji grid that does not visually transform into a car or house as parts are placed.

**9. Does the building experience feel like play, not like homework? 3/5**
Unchanged. HTML mode still looks like a form. LEGO mode still looks like a toy.

**10. Is there a sense of creative freedom within the guided experience? 3/5**
Unchanged. LEGO mode free-placement is still the only creative element.

---

#### Category 3: Reward satisfaction

**11. Does earning a block after a correct answer feel rewarding? 4/5** *(was 3)*
The `[data-block-earned]` flash element now actually fires — this was a dead-code path in review 1. The child now sees "+1 🧱" briefly in the exercise screen after every correct answer, alongside the 16-star burst and correct sound. A genuine improvement.

**12. Is the connection between math and building clear and motivating? 3/5** *(was 2)*
The header block counter at `[data-block-display]` (`index.html` line 31) now correctly updates in real time throughout every screen via `updateBlockDisplay()`. The child can see their block total growing as they answer. Still not a strong visual bridge (no flying-block animation between screens), but no longer a silent bug.

**13. Does completing a build feel like a real celebration? 4/5**
Unchanged — fireworks and overlay remain excellent.

**14. Are streak bonuses and stickers visible and exciting? 3/5**
Unchanged. Streak indicator is text-dependent; no large visual burst at the streak milestone.

**15. Does the child want to start the next build after completing one? 3/5**
Unchanged. The completion overlay still shows no teaser of the newly unlocked build.

---

#### Category 4: Frustration risk

**16. What happens when a block is placed wrong? Is it gentle and encouraging? 4/5**
Unchanged — gentle shake, pulse-glow, friendly toast. Still no sound on wrong drops in the builds screen, but handling remains positive.

**17. Can the child get stuck with no way forward? 4/5** *(was 3)*
A "🔓 Ga rekenen!" CTA button is now rendered inside `[data-earn-cta]` (`index.html` lines 446–452) and shown by `renderBuildsScreen()` whenever all palette items are locked (`scripts/main.js` lines 538–551). The button pulses with a CSS `pulse` animation. When the child is blocked, they now see a clear, animated path forward. Solid improvement.

**18. Is there too much complexity for a 6-year-old? 3/5**
Unchanged. Build tabs, two-step LEGO placement, and five-zone layout are still present.

**19. Can the child accidentally lose progress? 4/5**
Unchanged. `saveState()` on every placement.

**20. Is there always a visible way to go back to the world map? 4/5**
Unchanged. Two-tap path home still in place.

---

#### Category 5: Touch and interaction

**21. Are drag targets large enough for small fingers on iPad? 3/5**
Unchanged. `.build-part` still has no `min-height`, placing items near 40px.

**22. Does drag-and-drop work smoothly on touch devices? 3/5**
Unchanged. The pointer fallback exists but is not hardened. No `touch-action` CSS was added.

**23. Are there any interactions that require precision a child cannot achieve? 3/5**
Unchanged. Isometric rounding in `_screenToGrid` and small 2×2 design zones remain.

**24. Is scrolling handled correctly so it does not interfere with dragging? 2/5**
Unchanged — still the most critical open issue. `onPointerDown` in `scripts/dragdrop.js` line 104 still has no `event.preventDefault()` call. The two `preventDefault()` calls that exist in the file (lines 75 and 91) are in `onDragOver` and `onDrop` — neither is the touch fallback path used on iPad. On Safari, a child's first finger-down on a palette item will still start a page scroll rather than a block drag.

**25. Do all interactive elements have sufficient spacing between them? 3/5**
Unchanged. `.build-palette` gap is still `0.5rem` (9px). No `touch-action: none` was added to `.build-part`.

---

#### Category 6: Visual design

**26. Is the build screen colorful, cheerful, and toy-like? 3/5**
Unchanged. LEGO mode is delightful; HTML mode is still dull.

**27. Are there unnecessary text labels that could be replaced with icons? 2/5**
Unchanged. "Sleep hier" is still the slot hint text in `scripts/builds.js` line 178. Column headings and part names still require reading.

**28. Is the layout clean and uncluttered? 3/5**
Unchanged. The new "Ga rekenen!" CTA is correctly hidden when not needed, so it does not add clutter.

**29. Are colors and shapes consistent with the rest of the game? 4/5**
Unchanged.

**30. Are animations smooth, delightful, and not distracting? 4/5**
Unchanged. The new pulsing CTA button adds a purposeful animation that is not distracting.

---

### Top 5 Issues

**1. `onPointerDown` still missing `event.preventDefault()` — scroll kills drag on iPad**
- **What:** `scripts/dragdrop.js` line 104, `onPointerDown` has no `event.preventDefault()`. Lines 75 and 91 only protect the HTML5 drag path, which never fires on iOS Safari.
- **Why it matters:** A 6-year-old will tap a block, the iPad will scroll, and the block will not lift. This remains the most likely reason Mats gives up on building.
- **Where:** `scripts/dragdrop.js` line 104
- **Severity:** Critical — unchanged from review 1

**2. Reference image hidden in LEGO canvas mode**
- **What:** `htmlRefEl.hidden = true` (`scripts/main.js` line 512) still hides the SVG reference when `build.brickGrid` exists.
- **Why it matters:** The child building the car has no picture of what a car looks like. The faint ghost outlines are not enough.
- **Where:** `scripts/main.js` line 512
- **Severity:** High — unchanged from review 1

**3. Text labels throughout build screen require reading**
- **What:** "Sleep hier" (`scripts/builds.js` line 178), column headings "🏗️ Jouw bouwwerk" / "🧱 Blokken", part names like "Carrosserie", progress fraction "X / Y stukken".
- **Why it matters:** Mats cannot read. Every text-only label is a dead instruction.
- **Where:** `scripts/builds.js` line 178, `index.html` lines 413–422
- **Severity:** High — unchanged from review 1

**4. No visual onboarding tells the child what to do first**
- **What:** The build screen opens with no animated first-step hint. In LEGO mode, tapping the canvas before the palette does nothing visible.
- **Why it matters:** First-time confusion is the leading cause of children abandoning digital games.
- **Where:** `scripts/main.js` lines 475–550 (`renderBuildsScreen()`)
- **Severity:** High — unchanged from review 1

**5. Insufficient touch spacing between palette items**
- **What:** `.build-palette` has `gap: 0.5rem` (9px); no `touch-action: none` on `.build-part`.
- **Why it matters:** At 9px gap, adjacent items on the palette are 9px apart. A 6-year-old finger will routinely hit the wrong item or trigger a scroll.
- **Where:** `styles/styles.css` (`.build-palette`), `scripts/dragdrop.js` line 104
- **Severity:** Medium — unchanged from review 1

---

### Top 5 Improvements

**1. Add `event.preventDefault()` to `onPointerDown`**
- **What:** One line in `onPointerDown` (`scripts/dragdrop.js` line 104): `event.preventDefault()`. Also add `touch-action: none` to `.build-part` in CSS so the browser knows from the start not to scroll.
- **Expected impact:** Items 22, 24 — unblocks the entire drag-and-drop experience on iPad.
- **Effort:** Small
- **Files:** `scripts/dragdrop.js`, `styles/styles.css`

**2. Show reference thumbnail in LEGO canvas mode**
- **What:** In `renderBuildsScreen()` (`scripts/main.js` line 511), instead of hiding `htmlRefEl`, inject a compact version: `htmlRefEl.innerHTML = '<div class="lego-reference">' + build.referenceSvg + '</div>'`. A 100×70px floating card in the top-right corner is sufficient.
- **Expected impact:** Items 2, 3, 8, 9 — makes the building goal immediately obvious.
- **Effort:** Small
- **Files:** `scripts/main.js`, `styles/styles.css`

**3. Replace "Sleep hier" with an animated drag-arrow emoji**
- **What:** In `buildCanvasHtml()` (`scripts/builds.js` line 178), replace `<span class="build-slot__hint">Sleep hier</span>` with `<span class="build-slot__hint-icon" aria-hidden="true">👇</span>`. Add a `bounce` animation to `.build-slot__hint-icon` in CSS.
- **Expected impact:** Items 3, 27 — eliminates the last reading requirement in the drop slots.
- **Effort:** Small
- **Files:** `scripts/builds.js`, `styles/styles.css`

**4. Add first-action pulse hint on first-available palette item**
- **What:** At the end of `_renderLegoPalette()` and after `buildPaletteHtml()` renders, find the first available (unlocked, unplaced) chip/part and add a `build-part--pulse` class that plays `pulseGlow` for 3 seconds.
- **Expected impact:** Items 1, 6 — guides eye to first action without any text.
- **Effort:** Small
- **Files:** `scripts/main.js`, `styles/styles.css`

**5. Increase palette touch-target spacing**
- **What:** Change `.build-palette { gap: 0.5rem }` to `gap: 1rem` and add `min-height: 52px` to `.build-part` to ensure a 44px+ tap area.
- **Expected impact:** Items 21, 25 — reduces mis-taps on small-fingered users.
- **Effort:** Small
- **Files:** `styles/styles.css`

---

### Quick Wins

- **Add `event.preventDefault()` + `touch-action: none`** — two lines total, fixes the iPad drag-blocking scroll (Critical).
- **Show reference SVG in LEGO mode** — change one `hidden = true` to `innerHTML = compact reference`, zero new files.
- **Swap "Sleep hier" for `👇`** — one-line string change in `buildCanvasHtml()`.
- **Add `gap: 1rem` to `.build-palette`** — one CSS property change.

---

### Risky Changes

Unchanged from review 1 — no new risky areas introduced.

---

### Comparison with Previous Review

**Items that improved:**
- Item 11 (block earn feels rewarding): 3→4 — `[data-block-earned]` flash now fires correctly
- Item 12 (math-to-building connection): 2→3 — header block counter now live via `data-block-display`
- Item 17 (child cannot get stuck): 3→4 — pulsing "Ga rekenen!" CTA added for all-locked state

**Items that declined:**
- None

**Items unchanged:** All remaining 27 items

**Overall trend:** Improving — three targeted quick fixes landed correctly. The four highest-impact issues from review 1 remain unaddressed.

---

### Verdict

**Almost there** (overall score 3.2 / 5)

Three real improvements landed since the first review — the block counter now works, the "go earn blocks" button now appears when Mats is stuck, and the earned-block flash finally fires. These make the game feel more alive and connected. But the single most damaging issue — drag gestures being eaten by iPad scroll — is still open, and a child trying to build the car would still have no picture of what they are making. Fix those two and the next review score should jump meaningfully.
