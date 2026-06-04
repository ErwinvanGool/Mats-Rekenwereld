# Building Experience Review — Review 1

### Review Summary
- **Review number:** 1
- **Date:** June 4, 2026
- **Overall score:** 3.1 / 5
- **Previous score:** First review
- **Score change:** N/A

---

### Rubric Scores

#### Category 1: Clarity

**1. Is it immediately clear what the child should do when entering the build screen? 2/5**
No animated "onboarding" gesture or glowing arrow draws attention to the first step. In HTML mode drop-slots show the Dutch text "Sleep hier" — meaningless to a non-reader. In LEGO mode the two-step "tap chip → tap canvas" workflow has zero visual tutorial.

**2. Is the build example/reference clearly visible and easy to understand? 2/5**
In HTML mode the reference SVG is only 110×72 px and labelled "🎯 Zo moet het worden:" — small and text-dependent. In LEGO canvas mode (the car, the only brickGrid build) the reference panel is explicitly hidden (`if (htmlRefEl) htmlRefEl.hidden = true`), so the child has only ghost outlines with no target image at all.

**3. Are visual cues sufficient to guide building without any text? 2/5**
"Sleep hier" slot hints, column headings ("🏗️ Jouw bouwwerk", "🧱 Blokken"), part labels ("Carrosserie", "Wiel voor-links"), and progress fractions ("3 / 6 stukken") all require reading. Ghost outlines and colored borders help but are not enough on their own for a child who cannot read.

**4. Is it clear which blocks are available and how many the child has? 3/5**
The builds topbar shows the earned block count via `data-blocks-available` and locked parts show a lock icon with cost. The available/locked/placed states use distinct colors and icons, which helps. However, reading the numeric cost ("🔒 2 🧱") is still required to understand why a part is locked.

**5. Is it clear when a build is finished? 5/5**
An animated full-screen overlay ("🎉 Klaar!"), `launchFireworks()`, `playCompleteSound()`, a completion badge, and a visible reward summary all fire together. This is excellent — impossible to miss.

---

#### Category 2: Fun and engagement

**6. Does dragging blocks feel satisfying and playful? 3/5**
In HTML mode the pointer-fallback drag with a rotated ghost element, `brickPop` animation on correct drop, and color-tinted slot fill are genuinely satisfying. In LEGO mode there is no dragging at all — the two-step tap-select/tap-place workflow is less tactile and less intuitive for a child who expects to drag things.

**7. Is there enough visual and audio feedback during building? 3/5**
Correct placements trigger `playBrickSound()`, `popStarsAt()` stars burst, and a toast. Wrong HTML-mode drops shake the wrong slot and pulse the correct one. However, there is no sound on wrong drops in the builds screen (`playWrongSound()` is never called in `onPartDropped`), and the dedicated `[data-block-earned]` element in the exercise screen is never unhidden — the animated block-appearing-in-inventory moment that should connect math to building never visually fires.

**8. Would a 6-year-old want to keep building for at least 5 minutes? 3/5**
The LEGO canvas mode allows free decorative brick placement, which adds genuine creative replay value. However, in HTML mode slots show emoji characters in a plain 3-column grid — the build does not visually transform into a recognizable car, house, or dinosaur as parts are placed, which may not sustain a child's motivation.

**9. Does the building experience feel like play, not like homework? 3/5**
The isometric LEGO canvas feels genuinely toy-like and exciting. HTML mode — white card, dashed-border slots, emoji grids, progress fractions — looks closer to a form or puzzle sheet than a toy-building activity.

**10. Is there a sense of creative freedom within the guided experience? 3/5**
LEGO mode explicitly allows placing decorative free bricks anywhere on the baseplate ("🎨 Vrij geplaatst!") — this is a strong creative-play feature. HTML mode has zero flexibility; every placement is a fixed slot with one correct answer.

---

#### Category 3: Reward satisfaction

**11. Does earning a block after a correct answer feel rewarding? 3/5**
`popStarsAt()` bursts 16 stars from the correct-answer button, `playCorrectSound()` fires, and "+1 🧱" appears in feedback text. However, the dedicated `[data-block-earned]` flash element in `index.html` (line 283) is never unhidden by `submitAnswer()` in `scripts/main.js` — the intended "block flying into inventory" animation never plays. The visual connection between answering and gaining a buildable block is weaker than designed.

**12. Is the connection between math and building clear and motivating? 2/5**
The build-select screen shows a progress bar and "🧱 X blokken nodig" which visually connects math to building. But the global header block counter never updates: `updateBlockDisplay()` in `scripts/main.js` queries `[data-block-display]`, while the header in `index.html` uses `data-star-display` / `data-star-count`. No element with `data-block-display` exists in the HTML, so the child's block total in the persistent header never changes — a silent but significant bug.

**13. Does completing a build feel like a real celebration? 4/5**
The full-screen overlay, fireworks canvas, completion badge, reference SVG, and `+stickers / +blocks` reward text work well together. Slightly held back because the overlay shows the static reference SVG rather than the child's own completed construction.

**14. Are streak bonuses and stickers visible and exciting? 3/5**
The streak indicator shows "🔥 X op rij!" at ≥3 streak (text-dependent) and a `showStickerModal()` triggers on milestone. The bonus block moment uses "🎉" in feedback text. These are noticeable but not especially theatrical; there is no large starburst or screen shake at the streak milestone itself.

**15. Does the child want to start the next build after completing one? 3/5**
The completion overlay navigates to the world map where newly-unlocked builds get the `map-pin--newly-unlocked` CSS class (and `playUnlockSound()`). Good. However, the completion overlay itself shows no teaser or preview of what just unlocked — the child must tap through to discover it.

---

#### Category 4: Frustration risk

**16. What happens when a block is placed wrong? Is it gentle and encouraging? 4/5**
In HTML mode the wrong slot shakes, the correct slot pulse-glows in orange, and a toast says "🤔 Bijna! Zoek het goede plekje!" — no sound, no points lost, no negative language. In LEGO mode an off-design tap becomes a free decorative brick, reframed as fun. Very child-friendly handling.

**17. Can the child get stuck with no way forward? 3/5**
The back button and build tabs are always available. However, when all palette items are locked (child needs more blocks), the builds screen shows no CTA to "Go earn more blocks" — the child sees only a wall of 🔒 locks with no obvious next action within that screen.

**18. Is there too much complexity for a 6-year-old? 3/5**
The build tabs allowing switching between multiple active builds add a layer of complexity most 6-year-olds won't need. LEGO mode's two-step interaction (select chip in tray → tap canvas) is a non-obvious workflow. The topbar (title, progress bar, block count) plus tabs plus two-column layout is a lot of UI to parse at once.

**19. Can the child accidentally lose progress or leave the build screen? 4/5**
`saveState()` is called on every `placePart()` — progress is never lost. The app-header title button (`data-nav="screen-home"`) could pull a child out of the flow, but all building progress is preserved in localStorage. No confirmation dialog, but the low-stakes persistence makes this acceptable.

**20. Is there always a visible way to go back to the world map? 4/5**
The back button in the builds topbar navigates to `screen-build-select`. From there a second back button returns to the world map. Two taps to get home is slightly more than ideal but not problematic.

---

#### Category 5: Touch and interaction

**21. Are drag targets large enough for small fingers on iPad? 3/5**
Drop slots have `min-height: 90px` — excellent. Palette `.build-part` items have `padding: 0.7rem 0.9rem` without a minimum height, putting them around 40px — just below the 44px threshold. LEGO canvas design zones for 2×2 wheel bricks are approximately 88×44 screen pixels at typical canvas scale — marginal for small fingers.

**22. Does drag-and-drop work smoothly on touch devices? 3/5**
HTML5 drag events do not fire on iOS Safari; the pointer-event fallback in `scripts/dragdrop.js` handles this correctly. LEGO mode sidesteps dragging entirely with tap-to-place. The technical implementation is sound, but the pointer fallback path has not been hardened against the scroll issue described in item 24.

**23. Are there any interactions that require precision a child cannot achieve? 3/5**
Most HTML drop slots are generous (90px height). The LEGO canvas inverse-isometric calculation (`_screenToGrid` in `scripts/lego-canvas.js`) introduces rounding imprecision. Combined with the small 2×2 wheel zones, a child tapping near-but-not-inside the wheel area may place a decorative brick instead of snapping to the design position.

**24. Is scrolling handled correctly so it does not interfere with dragging? 2/5**
`onPointerDown` in `scripts/dragdrop.js` does **not** call `event.preventDefault()`. On iPad, the browser can interpret the initial down event as the start of a page scroll, cancelling the drag before `pointermove` begins. The palette column also has `overflow-y: auto`, adding a second scroll surface that competes with drag gestures.

**25. Do all interactive elements have sufficient spacing between them? 3/5**
Palette items have `gap: 0.5rem` (9px) between them; LEGO chips have `gap: 8px`. Apple's HIG recommends at least 8mm (≈30px at standard DPI) between touch targets. At 9px gap, adjacent palette items are likely to cause mis-taps on small fingers.

---

#### Category 6: Visual design

**26. Is the build screen colorful, cheerful, and toy-like? 3/5**
The LEGO canvas mode — dark tray, colored chips, isometric green baseplate — is visually exciting and genuinely toy-like. HTML mode — white card, dashed borders, emoji in slots — reads as a gray form. The screen's warm (#fff8f0) background and orange/teal accents help, but HTML-mode builds underdeliver on visual delight.

**27. Are there unnecessary text labels that could be replaced with icons? 2/5**
"Sleep hier" (drop hint), column headings "🏗️ Jouw bouwwerk" and "🧱 Blokken", the reference label "🎯 Zo moet het worden:", progress text "X / Y stukken", and part names like "Carrosserie" and "Wiel voor-links" all require reading. This is a consistent pattern across the screen that a non-reader cannot navigate independently.

**28. Is the layout clean and uncluttered? 3/5**
The two-column layout with a clear palette/canvas division is logical. However, the builds screen stacks: a topbar, a tab row, column headings, a reference panel, and the two-column content — five distinct visual zones before the actual building area. For a 6-year-old this is a lot of UI to parse.

**29. Are colors and shapes consistent with the rest of the game? 4/5**
Brand palette (orange, teal, yellow, green, purple) is used consistently throughout. The dark LEGO tray is a deliberate departure that reads as an intentional material design choice rather than an inconsistency. Rounded corners and brick-shadow buttons are uniform.

**30. Are animations smooth, delightful, and not distracting? 4/5**
`brickPop` (0.35s spring), `shake` (0.45s), `pulseGlow`, `feedbackPop`, and `stampIn` are well-timed and purposeful. The LEGO canvas calls `_render()` on every `mousemove` event — on a large canvas this could cause frame-rate issues on older iPads, though the canvas size (typically under 600px wide) makes it unlikely in practice.

---

### Top 5 Issues

**1. Missing `preventDefault()` on pointer drag start — scroll kills drag**
- **What:** `scripts/dragdrop.js`, `onPointerDown` has no `event.preventDefault()` call.
- **Why it matters:** On iPad, the browser intercepts the initial touch and starts scrolling the page instead of picking up the block. A 6-year-old will repeatedly fail to grab parts and give up.
- **Where:** `scripts/dragdrop.js` lines 90–95
- **Severity:** Critical

**2. `data-block-display` attribute does not exist in HTML — counter never updates**
- **What:** `updateBlockDisplay()` in `scripts/main.js` (line 75) queries `[data-block-display]`, but the header in `index.html` (line 34) uses `data-star-display` / `data-star-count`. No element matches, so the block count the child earns through math is never reflected in the persistent header.
- **Why it matters:** The child cannot see the connection between answering correctly and accumulating building material. The reward loop is invisible.
- **Where:** `scripts/main.js` line 75, `index.html` lines 34–37
- **Severity:** High

**3. Reference image hidden in LEGO canvas mode**
- **What:** In `renderBuildsScreen()` in `scripts/main.js`, when `build.brickGrid` exists, `htmlRefEl.hidden = true`. The child sees only faint ghost outlines with no visible "this is what you are building" image.
- **Why it matters:** A 6-year-old building a car needs to see what a car looks like. Ghost outlines alone do not provide enough context.
- **Where:** `scripts/main.js` lines 507–510
- **Severity:** High

**4. Pervasive text labels require reading throughout the build screen**
- **What:** "Sleep hier" in every empty slot (`scripts/builds.js` line 152), "Zo moet het worden:" reference label (`scripts/builds.js` line 196), column headings "🏗️ Jouw bouwwerk" / "🧱 Blokken", and part names like "Carrosserie", "Wiel voor-links".
- **Why it matters:** The target user cannot read. Any instruction that is only text is invisible guidance for Mats.
- **Where:** `scripts/builds.js` lines 150–165, `index.html` lines 413–422
- **Severity:** High

**5. No visual onboarding tells the child what to do first**
- **What:** Neither HTML mode nor LEGO canvas mode has an animated tutorial step, pulsing first-action hint, or guide arrow when the build screen opens. In LEGO mode specifically there is nothing telling the child to first tap a chip and then tap the canvas.
- **Why it matters:** A 6-year-old who taps the canvas before selecting a chip sees nothing happen and has no idea why. First-time confusion can cause the child to abandon the screen.
- **Where:** `scripts/main.js` lines 475–525 (`renderBuildsScreen()`)
- **Severity:** High

---

### Top 5 Improvements

**1. Add `event.preventDefault()` (and `touch-action: none`) to drag targets**
- **What:** In `onPointerDown` (`scripts/dragdrop.js` line 90), add `event.preventDefault()`. Also add `touch-action: none` to `.build-part` in `styles/styles.css`.
- **Expected impact:** Items 22, 24 — fixes the most critical touch-interaction blocker.
- **Effort:** Small
- **Files:** `scripts/dragdrop.js`, `styles/styles.css`

**2. Fix the block counter data-attribute mismatch**
- **What:** Add `data-block-display` to the header span in `index.html` (line 34), or update `updateBlockDisplay()` in `scripts/main.js` (line 75) to target the existing element. Ensure the earned block count is visibly updated after every correct answer.
- **Expected impact:** Item 12 — makes the math→blocks→building reward loop visible and tangible.
- **Effort:** Small
- **Files:** `index.html`, `scripts/main.js`

**3. Show a compact reference thumbnail overlay in LEGO canvas mode**
- **What:** Instead of hiding `htmlRefEl` entirely, render a small thumbnail (e.g. 100×70px) of `build.referenceSvg` as a floating card in the top-right corner of the LEGO canvas area so the child always sees the target.
- **Expected impact:** Items 2, 8, 9 — makes the goal of building immediately obvious.
- **Effort:** Small
- **Files:** `scripts/main.js` lines 505–515, `styles/styles.css`

**4. Replace "Sleep hier" text with a large animated arrow icon**
- **What:** In `buildCanvasHtml()` (`scripts/builds.js` line 152), replace `<span class="build-slot__hint">Sleep hier</span>` with a large animated down-arrow or finger-drag emoji. Increase spacing between palette items from `0.5rem` to at least `1rem`.
- **Expected impact:** Items 3, 25, 27 — reduces reading requirement, improves touch spacing.
- **Effort:** Small
- **Files:** `scripts/builds.js`, `styles/styles.css`

**5. Add a first-action pulse hint when the build screen opens**
- **What:** When `renderBuildsScreen()` runs and the child has at least one available (unlocked, unplaced) part, add a CSS class `lego-chip--pulse` or `build-part--pulse` to the first available item that plays a gentle `pulseGlow` animation for 3 seconds, drawing the child's eye to the starting point.
- **Expected impact:** Items 1, 6, 10 — eliminates "what do I do first?" confusion without any text.
- **Effort:** Small
- **Files:** `scripts/main.js`, `styles/styles.css`

---

### Quick Wins

These can each be implemented in under 30 minutes and have high child-experience impact:

- **Add `event.preventDefault()` to `onPointerDown`** — one line, fixes scroll-kills-drag on iPad.
- **Add `data-block-display` attribute to the header `<span>`** — one attribute in HTML, makes the reward counter live.
- **Show `build.referenceSvg` as a small floating thumbnail in LEGO mode** — ~10 lines of HTML/CSS, adds the missing target image.
- **Change "Sleep hier" to a large `👇` bounce animation** — reduces reading requirement immediately.
- **Increase `.build-palette` and `.lego-tray` gap to `1rem`** — one CSS line, reduces mis-taps.

---

### Risky Changes

- **Changing the `data-star-count` / `data-block-display` attribute** — the world map and header both read `data-star-count` for display. Changing the attribute name without updating all selectors could break the star counter on the world map. Carefully grep for all usages before changing.
- **Making LEGO canvas fully drag-and-drop** — the isometric canvas would need pointer-drag math across the 2D canvas surface. This is a medium-large refactor. The current tap-select-then-tap-place is simpler to maintain; fixing the onboarding hint may be sufficient.
- **Removing build tabs** — simplifies the build screen for new players but removes the ability to switch between active builds mid-session. Would require a separate "switch build" flow. Only do this if user testing confirms it confuses children.

---

### Verdict

**Almost there** (overall score 3.1 / 5)

A 6-year-old would probably enjoy the LEGO canvas mode — the isometric building tray looks genuinely like a toy and the fireworks at the end are exciting. But there are three things that would make Mats confused right away: drag gestures likely breaking into page scrolls on the iPad, text instructions he can't read ("Sleep hier"), and no obvious guide telling him what to tap first. Fix those three, and this game gets a lot closer to something Mats would beg to play every day.
