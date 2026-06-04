# Building Experience Review — Review 3

### Review Summary
- **Review number:** 3
- **Date:** June 4, 2026
- **Overall score:** 3.4 / 5
- **Previous score:** 3.2 / 5 (Review 2)
- **Score change:** +0.2

---

### Rubric Scores

#### Category 1: Clarity

**1. Is it immediately clear what the child should do when entering the build screen? 3/5** *(was 2)*
In HTML mode the bouncing `👇` emoji in every available slot gives a clear, animated "drag here" signal without a word of text. In LEGO mode the reference thumbnail now appears above the canvas, but the two-step select-chip-then-tap-canvas workflow still has no animated first-step guide or pulse on the first tray item.

**2. Is the build example/reference clearly visible and easy to understand? 3/5** *(was 2)*
LEGO canvas mode now shows a `.lego-reference` thumbnail (110×72px) via `scripts/main.js` lines 516–519 — the car SVG is visible above the canvas. HTML mode reference is unchanged at the same size. Both modes now show a target image; neither is prominent enough to call a hero reference.

**3. Are visual cues sufficient to guide building without any text? 3/5** *(was 2)*
The `👇` bounce replaces "Sleep hier" in every unlocked slot (`scripts/builds.js` line 178), removing the most pervasive read-to-understand instruction. Part labels ("Carrosserie", "Wiel voor-links"), column headings ("🏗️ Jouw bouwwerk", "🧱 Blokken"), the reference label ("🎯 Zo moet het worden:"), and locked-part cost text still require reading.

**4. Is it clear which blocks are available and how many the child has? 3/5**
Unchanged. Header block counter is live; locked-part costs still require reading a number.

**5. Is it clear when a build is finished? 5/5**
Unchanged — full-screen overlay, fireworks, badge, sound.

---

#### Category 2: Fun and engagement

**6. Does dragging blocks feel satisfying and playful? 4/5** *(was 3)*
`event.preventDefault()` in `onPointerDown` (`scripts/dragdrop.js` line 106) combined with `touch-action: none` on `.build-part` means the ghost drag now actually starts on iPad instead of being eaten by scroll. The ghost, `brickPop` snap animation, and color-tinted fills are intact. HTML mode drag is now genuinely fun on a touchscreen.

**7. Is there enough visual and audio feedback during building? 3/5**
Unchanged. Correct placements are well-celebrated. `playWrongSound()` is still never called in `onPartDropped` — wrong drops in the build screen remain silent.

**8. Would a 6-year-old want to keep building for at least 5 minutes? 3/5**
Unchanged. HTML mode emoji-grid still does not visually transform into a recognizable object as parts are placed.

**9. Does the building experience feel like play, not like homework? 3/5**
The bouncing `👇` adds a playful, animated touch to slots. LEGO mode now shows the reference SVG. These are small visual improvements but HTML mode's fundamental white-card-with-dashed-slots structure is unchanged.

**10. Is there a sense of creative freedom within the guided experience? 3/5**
Unchanged. LEGO free-placement is still the only creative outlet.

---

#### Category 3: Reward satisfaction

**11. Does earning a block after a correct answer feel rewarding? 4/5**
Unchanged — block-earned flash fires correctly.

**12. Is the connection between math and building clear and motivating? 3/5**
Unchanged — header counter is live and updates after every correct answer.

**13. Does completing a build feel like a real celebration? 4/5**
Unchanged — fireworks overlay remains excellent.

**14. Are streak bonuses and stickers visible and exciting? 3/5**
Unchanged — streak is text-dependent, no large visual burst at milestone.

**15. Does the child want to start the next build after completing one? 3/5**
Unchanged — completion overlay has no teaser of the newly unlocked destination.

---

#### Category 4: Frustration risk

**16. What happens when a block is placed wrong? Is it gentle and encouraging? 4/5**
Unchanged — shake, pulse-glow, encouraging toast. Still no sound on wrong drops in build screen.

**17. Can the child get stuck with no way forward? 4/5**
Unchanged — pulsing "Ga rekenen!" CTA shows when all parts are locked.

**18. Is there too much complexity for a 6-year-old? 3/5**
Unchanged — build tabs, two-step LEGO placement, five-zone layout all remain.

**19. Can the child accidentally lose progress? 4/5**
Unchanged — `saveState()` on every placement.

**20. Is there always a visible way to go back to the world map? 4/5**
Unchanged — two-tap path home in place.

---

#### Category 5: Touch and interaction

**21. Are drag targets large enough for small fingers on iPad? 3/5**
Unchanged. `.build-part` still has no `min-height` (sitting around 40px). Gap between palette items is still `0.5rem` (9px).

**22. Does drag-and-drop work smoothly on touch devices? 4/5** *(was 3)*
`event.preventDefault()` (`scripts/dragdrop.js` line 106) prevents iOS Safari from cancelling the pointer sequence. `touch-action: none` on `.build-part` instructs the browser not to scroll when touching a palette item. Together these fully resolve the touch drag path.

**23. Are there any interactions that require precision a child cannot achieve? 3/5**
Unchanged. Isometric `_screenToGrid` rounding and small 2×2 wheel design zones remain.

**24. Is scrolling handled correctly so it does not interfere with dragging? 4/5** *(was 2)*
Both guards are now in place: `event.preventDefault()` in the pointer-down handler stops the browser intercepting the gesture, and `touch-action: none` on the draggable elements declares the intent at the CSS level. The Critical issue from reviews 1 and 2 is resolved.

**25. Do all interactive elements have sufficient spacing between them? 3/5**
Unchanged. `.build-palette { gap: 0.5rem }` (9px) is still below the recommended 8mm HIG threshold. No `min-height` added to `.build-part`.

---

#### Category 6: Visual design

**26. Is the build screen colorful, cheerful, and toy-like? 3/5**
The animated `👇` bounce adds a lively, toy-like touch to empty slots. LEGO mode reference thumbnail adds visual richness. HTML mode core structure (white card, dashed borders) is unchanged.

**27. Are there unnecessary text labels that could be replaced with icons? 3/5** *(was 2)*
"Sleep hier" is gone from all available slots — replaced by the bouncing `👇`. Part names ("Carrosserie"), column headings ("🏗️ Jouw bouwwerk"), the reference label ("🎯 Zo moet het worden:"), and progress fraction ("X / Y stukken") still require reading. One major text label removed; several remain.

**28. Is the layout clean and uncluttered? 3/5**
The LEGO reference thumbnail adds a small element above the canvas — compact enough (110×72px) not to create clutter. No significant change.

**29. Are colors and shapes consistent with the rest of the game? 4/5**
Unchanged. New `.lego-reference` card uses the same border, shadow, and background as the existing reference panel — consistent.

**30. Are animations smooth, delightful, and not distracting? 4/5**
The `hintBounce` animation on `👇` (1s ease-in-out infinite, 6px travel) is gentle and purposeful — not distracting. All existing animations unchanged.

---

### Top 5 Issues

**1. No visual onboarding for the first action in LEGO canvas mode**
- **What:** When the build screen opens in LEGO mode, there is no animated hint telling the child to first tap a chip in the tray, then tap the canvas. Tapping the canvas first still does nothing.
- **Why it matters:** First-session confusion causes children to abandon a game. The LEGO mode's two-step workflow remains invisible to a non-reader.
- **Where:** `scripts/main.js` lines 556–575 (`_renderLegoPalette()`, end of `renderBuildsScreen()`)
- **Severity:** High

**2. Text labels still pervasive for part names and column headings**
- **What:** Part labels in palette ("Carrosserie", "Wiel voor-links"), column headings ("🏗️ Jouw bouwwerk", "🧱 Blokken"), reference label ("🎯 Zo moet het worden:"), and progress fraction ("X / Y stukken").
- **Why it matters:** Mats cannot read. These labels provide zero information value for the target user.
- **Where:** `scripts/builds.js` line 142, `scripts/builds.js` line 196, `index.html` lines 413–422
- **Severity:** High

**3. Palette touch targets still too small and too close together**
- **What:** `.build-palette { gap: 0.5rem }` (9px between items); `.build-part` has no `min-height`, rendering items at approximately 40px tall. Apple HIG recommends minimum 44pt with ≥8mm between targets.
- **Why it matters:** On an iPad, small fingers will regularly hit the wrong palette item or accidentally start scrolling the palette instead of grabbing a block.
- **Where:** `styles/styles.css` (`.build-palette`, `.build-part`)
- **Severity:** Medium

**4. No sound on wrong placement in build screen**
- **What:** `onPartDropped` in `scripts/main.js` plays no sound when a block is dropped on the wrong slot. `playWrongSound()` is imported but never called in this code path.
- **Why it matters:** Silence on a wrong drop makes the gentle-shake feedback feel less alive. Audio cues are especially important for young children to understand cause-and-effect.
- **Where:** `scripts/main.js` lines 630–636
- **Severity:** Medium

**5. Reference thumbnail too small in both modes**
- **What:** Both the HTML `.builds__reference-svg` and the new `.lego-reference` are 110×72px — small enough that a 6-year-old holding an iPad at arm's length may not clearly see the target shape.
- **Why it matters:** The child needs to glance at the reference frequently while building. At 110px wide the SVG illustrations are quite compact, reducing their usefulness as a building guide.
- **Where:** `styles/styles.css` (`.lego-reference`, `.builds__reference-svg`)
- **Severity:** Low

---

### Top 5 Improvements

**1. Add a pulse hint on the first available palette item (LEGO mode onboarding)**
- **What:** At the end of `_renderLegoPalette()` (`scripts/main.js` line 556), after rendering chips, find the first `.lego-chip--available` button and add class `lego-chip--pulse`. Define `lego-chip--pulse` in CSS using the existing `pulseGlow` keyframe for 3s, 3 repetitions. Clear the class after 3s with `setTimeout`.
- **Expected impact:** Items 1, 18 — tells the child exactly what to tap first in LEGO mode without text.
- **Effort:** Small
- **Files:** `scripts/main.js`, `styles/styles.css`

**2. Increase palette gap and add `min-height` to `.build-part`**
- **What:** Change `.build-palette { gap: 0.5rem }` to `gap: 1rem`. Add `min-height: 52px` to `.build-part`. Change `.lego-tray { gap: 8px }` to `gap: 12px`.
- **Expected impact:** Items 21, 25 — reduces mis-taps between adjacent palette items.
- **Effort:** Small
- **Files:** `styles/styles.css`

**3. Add `playWrongSound()` on wrong drop in build screen**
- **What:** In `onPartDropped` (`scripts/main.js` line 630), add `playWrongSound()` immediately after the wrong-slot branch is detected.
- **Expected impact:** Items 7, 16 — makes wrong placements feel acknowledged, not silent.
- **Effort:** Small (one line)
- **Files:** `scripts/main.js`

**4. Enlarge the reference thumbnail**
- **What:** Increase `.lego-reference` and `.builds__reference-svg` from `110×72px` to `160×105px`. The reference panel row in HTML mode can absorb this by using `flex-wrap: wrap`.
- **Expected impact:** Items 2, 8, 9 — makes the target image actually useful as a building guide.
- **Effort:** Small
- **Files:** `styles/styles.css`

**5. Replace part labels in palette with larger emoji icons**
- **What:** In `buildPaletteHtml()` (`scripts/builds.js` line 142), remove the `<span class="build-part__label">` text span for available parts, and increase `build-part__emoji` font-size to `2rem`. Keep text only for placed (✅) and locked (🔒) states. For LEGO chips, show only the color chip without the Dutch label text.
- **Expected impact:** Items 3, 27 — removes the biggest remaining cluster of read-dependent text.
- **Effort:** Small–Medium
- **Files:** `scripts/builds.js`, `styles/styles.css`

---

### Quick Wins

- **Add `playWrongSound()` to `onPartDropped`** — one line, makes wrong drops feel real.
- **`gap: 1rem` + `min-height: 52px` on `.build-part`** — two CSS lines, reduces mis-taps.
- **Pulse first available LEGO chip on render** — ~10 lines, eliminates the remaining LEGO onboarding gap.
- **`width: 160px; height: 105px` on `.lego-reference`** — one CSS rule, makes target image meaningfully larger.

---

### Risky Changes

Unchanged from review 2 — no new risky areas introduced.

---

### Comparison with Previous Review

**Items that improved (Review 2 → Review 3):**
- Item 1 (clarity on entry): 2→3 — bouncing `👇` in slots gives clear drag-here signal in HTML mode
- Item 2 (reference visible): 2→3 — LEGO mode now shows reference thumbnail via `.lego-reference`
- Item 3 (visual cues without text): 2→3 — "Sleep hier" removed from all unlocked slots
- Item 6 (dragging feels satisfying): 3→4 — `event.preventDefault()` + `touch-action: none` makes drag work on iPad
- Item 22 (drag-and-drop on touch): 3→4 — pointer drag fully hardened against iOS scroll cancellation
- Item 24 (scroll vs drag): 2→4 — Critical issue resolved; scroll no longer competes with block drag
- Item 27 (text labels): 2→3 — "Sleep hier" removed; one major text label eliminated

**Items that declined:** None

**Items unchanged:** All remaining 23 items

**Overall trend:** Improving steadily — the Critical touch blocker is now resolved, and three clarity issues improved together. The remaining open issues are lower-severity polish items rather than fundamental blockers.

---

### Verdict

**Almost there** (overall score 3.4 / 5)

Mats can now actually drag blocks on his iPad without the screen scrolling away — that was the biggest problem and it's fixed. The building screen also learned to show a picture of what he's building, and slots now bounce a little finger to show him where to drop. The game is getting noticeably more fun. What's left are smaller things: the text labels on parts he can't read, no sound when he puts a block in the wrong spot, and the palette items are still a bit cramped for little fingers. Fix those and this is close to something Mats would genuinely love.
