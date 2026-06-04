# Parent Settings Review — Review 1

### Review Summary
- **Review number:** 1
- **Date:** 2026-06-04
- **Overall score:** 3.2 / 5
- **Previous score:** First review
- **Score change:** N/A

---

### Rubric Scores

#### Category 1: Parent Gate

1. **Is the parent gate effective at keeping a 6-year-old out?** 3/5
   The PIN keypad itself is a good gate — 4-digit numeric entry a child cannot accidentally pass. However, the 🔒 trigger button lives in the persistent header and is visible during all game screens, making it tempting for a curious child to tap. The default PIN is `1234`, which is trivially guessable. Score would be higher if the default was randomised or the trigger were less prominent.

2. **Is the parent gate easy for an adult to pass through quickly?** 4/5
   The PIN keypad has large 80×80 px touch buttons — comfortable for adult fingers. The OK button is clearly labelled and distinctly styled (purple). A parent who knows the PIN can get through in 3–4 taps. Deducted one point because the default PIN `1234` means a new parent might wonder whether the gate is even active.

3. **Is it visually clear where the parent gate trigger is?** 4/5
   A 🔒 lock icon button sits consistently in the top-right of the sticky header on every game screen. There is also a "🔒 Ouders" text link in the start-screen footer. Easy to find. Minor deduction because the header button has no dedicated CSS style — it inherits base `button {}` resets and appears as an unstyled icon with no visual affordance (no border, no background).

4. **Does the parent gate close properly and return to the game cleanly?** 4/5
   Both the PIN screen and the settings panel have a `nav-back` button that navigates directly to `screen-worldmap`. Transitions use the same `fadeSlideIn` animation as all other screens — no flash of settings content. Minor deduction: returning always goes to the world map rather than the screen the parent was on; a parent mid-game who taps settings comes back to the map instead of where they left off.

#### Category 2: Clarity and Usability

5. **Are all settings clearly labeled and easy to understand?** 3/5
   The section headings "Oefeningen", "Geluid", "Beheer", "Badges verdiend" are clear Dutch labels. However, they are plain `<h3>` tags with no CSS class — they render in unstyled browser-default heading font, which is visually inconsistent with the game. Operation labels come from `op.label` (defined in `data.js`) and appear alongside a checkbox and level dropdown, which is functional but not self-explanatory. There is nothing explaining what "Level 1" vs "Level 2" means without opening the dropdown to read the description.

6. **Can the parent see the current value of each setting at a glance?** 4/5
   Checkboxes are pre-checked/unchecked based on state. Select dropdowns have the correct `selected` option pre-set. The sound toggle is a plain checkbox, not the styled toggle switch from CSS — but the checked state is still visible. Deducted one point because the panel shows no summary of the child's current state (level, blocks, streak).

7. **Are the controls appropriate for each setting type?** 3/5
   Checkboxes for enabling/disabling operations: appropriate. Dropdowns for level selection: appropriate. Reset/PIN change as buttons: appropriate. However, the sound setting is rendered as a plain `<input type="checkbox">` without the `.toggle` CSS class wrapper that IS defined in `styles.css` — so the custom styled toggle switch is never displayed. The checkbox works but feels out of place in a polished game UI.

8. **Is the settings panel organized in a logical order?** 3/5
   The order (Operations → Sound → Management → Badges) is logical. However, there is no visual grouping — the `<h3>` headings float above setting rows without card/section containers or dividers beyond a thin `border-bottom` on individual rows. The "Beheer" section mixes both a destructive reset action and a security action (PIN change), which could be clearer if they were separated.

9. **Can a parent complete all settings changes in under 30 seconds?** 4/5
   Everything is on a single scrollable panel — no nested screens or tabs. A parent can toggle an operation, change a level, and adjust sound in quick succession. Minor deduction: PIN change still requires a `window.prompt()` step (a separate browser dialog), which interrupts the flow and cannot be dismissed with an in-game button.

10. **Is the settings panel usable on iPad in landscape mode?** 3/5
    The `.parent-panel` CSS card styles (white background, max-width 760 px, rounded border, shadow) are defined in `styles.css` but **never applied** — the section uses class `screen screen--parent-panel`, not `parent-panel`. The settings appear as a plain flex column on the app background with no card container. Individual `.parent-setting` rows and buttons are correctly sized for touch, but the overall layout looks unfinished.

#### Category 3: Completeness

11. **Are all expected settings present?** 2/5
    Present: operation enable/disable, level per operation (level 1 / level 2), sound on/off, reset progress, change PIN.
    **Missing:** explicit max number slider or range control; problem type selector (numeric symbols vs. visual icons vs. mixed) — both are listed as required settings in the project rubric. Parents cannot control whether their child sees "3 + 4 = ?" vs. "🍎🍎🍎 + 🍎🍎🍎🍎 = ?".

12. **Can the parent view the child's progress?** 1/5
    The parent panel shows only the badges list. There is no summary of total correct answers, total attempts, best streak, blocks earned, stickers earned, or completed builds. All this data exists in `state.progress` and `state.builds` but none of it is surfaced in the parent panel. A parent re-opening the app after a week has no quick way to see how their child has been doing from within the settings panel.

13. **Is there a reset progress option with a safety confirmation?** 3/5
    The "Voortgang wissen" button triggers `window.confirm()` with a Dutch confirmation message, followed by `window.alert('Voortgang gewist.')`. This technically works and has a confirmation step. Deducted points because `window.confirm` and `window.alert` use the browser's native unstyled dialogs — they look completely out of place in the game UI and a child could see the alert message if they are nearby.

14. **Can the parent adjust settings as the child improves over time?** 4/5
    Level dropdowns per operation allow progressive difficulty adjustment without resetting any progress. Switching from Level 1 (addition up to 10) to Level 2 (addition up to 20) is a single dropdown change. Deducted one point because there is no preview or explanation of what each level means unless the parent opens the dropdown and reads the option text.

#### Category 4: Visual Design

15. **Does the settings panel look clean and professional?** 2/5
    The `.parent-panel` CSS block is defined but never matched — the section element uses `class="screen screen--parent-panel"`, not `class="parent-panel"`. As a result, the white card background, max-width constraint, box-shadow, and border defined in CSS are never rendered. The settings panel is an unstyled flex column on the app background. The `<h3>` section headings have no CSS class and render in browser-default heading styles. Individual `.parent-setting` rows are styled, but the overall impression is that of a bare debug panel.

16. **Is the visual style consistent with the rest of the game?** 3/5
    The `.btn` buttons, the `.parent-setting` rows, and the `.badge-list` items all use the game's design tokens and look consistent. The PIN screen has a purple theme (`.parent-pin`) that differentiates parent space from child space. However, the missing card wrapper and default-styled `<h3>` headings break the visual consistency that the rest of the game achieves.

17. **Is the settings panel visually distinct from the child's game screens?** 3/5
    The PIN screen has a purple radial gradient background — clearly different from child screens. The settings panel itself, due to the missing `.parent-panel` card, looks similar to the unstyled base screen and doesn't maintain the distinct purple parent-zone feel. If a parent leaves settings open and a child comes back, the child might not immediately understand they are in a different zone.

18. **Are interactive elements visually clear?** 3/5
    The `.btn` buttons are clearly tappable and have press effects. The `.parent-setting__select` dropdowns are styled. However, the sound checkbox is an unstyled `<input type="checkbox">` — not the custom `.toggle` switch defined in CSS. Native browser checkboxes on iPad Safari are small (default system size) and don't match the game's design. The 🔒 parent gate button in the header has no dedicated CSS styling.

#### Category 5: Functionality

19. **Are settings saved to localStorage immediately and reliably?** 4/5
    `saveState()` is called inside every mutation function (`setOperationEnabled`, `setOperationLevel`, `setSoundEnabled`, `resetProgress`, `changePin`). The `loadState()` hydrates from localStorage on boot. Deducted one point: the `change` event handler on the panel fires for all `<input>` and `<select>` elements, but there is a subtle risk — if the event fires before the state mutation completes (not a real issue with synchronous JS, but worth noting), changes could be missed. In practice this works correctly.

20. **Does the parent receive visual confirmation that settings were saved?** 2/5
    There is no save confirmation toast or checkmark when a setting is toggled. For the reset action, `window.alert('Voortgang gewist.')` is used — a browser-native dialog. For PIN change, `window.alert('Pincode gewijzigd.')` is used. These communicate success but are jarring native dialogs rather than in-game feedback. A parent changing the sound toggle or level has no indication that the change was persisted.

21. **Are saved settings correctly applied during gameplay?** 4/5
    `buildQuestionSet()` in `math.js` reads `state.settings.operationLevels[operationId]` to select the level config, and only generates questions for operations in `state.settings.enabledOperations`. Sound state is read from `state.settings.soundEnabled` in the sounds module. Settings flow correctly from parent panel → state → gameplay. Deducted one point: the missing "problem type" setting means the parent cannot control numeric vs. visual question mode.

22. **Does the reset progress function work completely and correctly?** 4/5
    `resetProgress()` correctly resets all progress fields (`totalCorrect`, `totalAttempts`, `currentStreak`, `bestStreak`, `earnedBlocks`, `earnedStickers`, `history`, `earnedBadges`, `triedOperations`) and build state (`placedParts`, `completedBuilds`, `activeBuildId`). Settings (PIN, difficulty, sound) are intentionally preserved. `saveState()` is called. Deducted one point: after reset, the settings panel does not visually refresh — for example the badge list still shows the pre-reset state until the parent navigates away and back.

---

### Category Averages

- **Parent Gate (items 1–4):** 3.75 / 5
- **Clarity and Usability (items 5–10):** 3.33 / 5
- **Completeness (items 11–14):** 2.50 / 5
- **Visual Design (items 15–18):** 2.75 / 5
- **Functionality (items 19–22):** 3.50 / 5

---

### Top 5 Issues

1. **No parent-facing progress summary**
   - **What:** The settings panel shows only earned badges. Fields like `totalCorrect`, `bestStreak`, `earnedBlocks`, `earnedStickers`, and `completedBuilds` all exist in state but are never shown to the parent.
   - **Why it matters:** A parent returning after a week has no way to see how their child is progressing. Without this, the parent panel feels like a control panel with no dashboard — you can tune the engine but you can't see the speedometer.
   - **Where:** `scripts/main.js` → `renderParentPanel()` (line 869); `scripts/state.js` → `state.progress` and `state.builds`
   - **Severity:** Critical

2. **`.parent-panel` CSS card never applied (class mismatch)**
   - **What:** `styles.css` defines a polished card style under `.parent-panel` (white background, max-width 760 px, box-shadow, purple border). The actual section has class `screen screen--parent-panel`, not `parent-panel`. The card styles are entirely inert.
   - **Why it matters:** The settings panel looks like a bare debug screen rather than a polished parent dashboard. The parent's first impression is that the app is unfinished.
   - **Where:** `index.html` line 564 (section class); `styles/styles.css` `.parent-panel` block (~line 1740)
   - **Severity:** High

3. **Missing required settings: max number and problem type**
   - **What:** The rubric requires a max-number control and a problem-type selector (numeric / visual / mixed). Neither exists in the panel. Level selection partially covers difficulty, but a parent cannot cap the number range to, say, 5+5 for a struggling child, nor switch to visual counting mode.
   - **Why it matters:** Without these controls, a parent cannot tune the game precisely to where their child is. A parent of a child who is still struggling with basic addition cannot reduce the number range below Level 1's ceiling.
   - **Where:** `scripts/main.js` → `renderParentPanel()` (line 869); `scripts/math.js` → `buildQuestionSet()` (line 62)
   - **Severity:** High

4. **No save confirmation feedback for settings changes**
   - **What:** When a parent toggles a checkbox or changes a level dropdown, `saveState()` runs silently. There is no toast, checkmark, or any visible signal that the change was stored.
   - **Why it matters:** A parent in a hurry might tap a toggle and immediately close the panel, unsure whether the change stuck. This erodes trust in the settings system.
   - **Where:** `scripts/parent-settings.js` → `initParentPanel()` (line 170); no confirmation toast is shown anywhere.
   - **Severity:** Medium

5. **Native browser dialogs for reset and PIN change**
   - **What:** Reset progress uses `window.confirm()` + `window.alert()`. PIN change uses `window.prompt()`. These are unstyled system dialogs that interrupt the game's visual style, may not be touch-optimised on iPad Safari, and could expose settings text to a nearby child.
   - **Why it matters:** The game's brand is warm, playful, and polished. A cold grey browser dialog instantly undermines that impression. `window.prompt()` for PIN input also provides no validation UX.
   - **Where:** `scripts/parent-settings.js` lines 182–197 (reset) and 199–207 (PIN change)
   - **Severity:** Medium

---

### Top 5 Improvements

1. **Add a progress summary section to the parent panel**
   - **What:** Render a small stats grid showing: total correct answers, best streak, blocks earned, stickers earned, and completed builds count. Data is already available in `state.progress` and `state.builds`.
   - **Expected impact:** Fixes item 12 (progress viewing: 1→4). Also improves overall parent trust and usability.
   - **Effort:** Small
   - **Files involved:** `scripts/main.js` → `renderParentPanel()`

2. **Fix the `.parent-panel` CSS class mismatch**
   - **What:** Add `class="parent-panel"` to the `<div class="parent-panel__body" data-settings-content>` wrapper, or alternatively move the card CSS to target `screen--parent-panel` directly. The simpler fix is to add `parent-panel` to the existing `data-settings-content` div.
   - **Expected impact:** Fixes items 15 (professional appearance: 2→4) and 16 (style consistency: 3→4). The card container, max-width, shadow, and border will all render correctly.
   - **Effort:** Small
   - **Files involved:** `index.html` (line ~575, the `data-settings-content` div)

3. **Apply the styled toggle switch to the sound setting**
   - **What:** The sound checkbox in `renderParentPanel()` should be wrapped in `<label class="toggle"><input ...><span class="toggle__track"></span> Geluid aan</label>` — the CSS for this is fully defined in `styles.css` (`.toggle`, `.toggle__track`). Currently only a plain checkbox is rendered.
   - **Expected impact:** Improves item 7 (controls appropriate: 3→4) and item 18 (controls visually clear: 3→4).
   - **Effort:** Small
   - **Files involved:** `scripts/main.js` → `renderParentPanel()` (~line 895)

4. **Add CSS classes to the `<h3>` section headings in the parent panel**
   - **What:** The dynamically rendered `<h3>Oefeningen</h3>` etc. headings should use a class like `class="settings-group__heading"` with styles matching the game's typography (font-weight 900, colour from palette, letter-spacing).
   - **Expected impact:** Improves item 5 (clear labels: 3→4), item 15 (professional appearance), and item 17 (distinct from child screens).
   - **Effort:** Small
   - **Files involved:** `scripts/main.js` → `renderParentPanel()` and `styles/styles.css` (add new rule)

5. **Show a save confirmation toast when settings change**
   - **What:** After each `change` event triggers a save, briefly display a small toast ("✅ Opgeslagen") at the top of the panel. The game already has animation infrastructure for toasts.
   - **Expected impact:** Fixes item 20 (save confirmation: 2→4). Significantly increases parent confidence.
   - **Effort:** Small
   - **Files involved:** `scripts/main.js` → `renderParentPanel()` or `scripts/parent-settings.js` → `initParentPanel()`

---

### Quick Wins

- **Fix class mismatch** on the settings panel wrapper (add `parent-panel` class to the `data-settings-content` div) — one-line HTML change, unlocks all the card styling at once.
- **Apply `.toggle` CSS** to the sound checkbox — changes 3 lines in `renderParentPanel()`.
- **Add a basic stats row** (blocks 🧱, stickers 🌟, streak 🔥) at the top of the parent panel — 5–10 lines of template HTML in `renderParentPanel()`.
- **Add CSS classes to `<h3>` headings** — add one CSS rule and update template strings.
- **Re-render the panel after reset** by calling `renderParentPanel()` at the end of the reset handler so the badge list clears immediately.

---

### Risky Changes

- **Replacing `window.confirm/alert/prompt`** with in-game dialogs requires building or reusing a modal component. Reusing the existing `reward-modal` structure is possible but could introduce regressions in the reward flow if not kept separate.
- **Adding max-number and problem-type settings** requires changes to `math.js` (`buildQuestionSet()`), `state.js` (default settings schema), `storage.js` (migration to version 3), and `parent-settings.js`. A missed migration will silently break the settings for existing users.
- **Changing the default PIN** from `1234` to something random generated on first run requires special handling in `hydrateState()` and may confuse parents who read "default PIN is 1234" in any documentation.

---

### Comparison with Previous Review

N/A — this is the first parent review.

---

### Verdict

**Almost there** (overall score 3.2 / 5)

The core of the parent settings works: the PIN gate protects access, settings are saved immediately to localStorage and correctly applied during gameplay, and there is a safety-confirmed reset function. However, a parent opening the panel for the first time would feel underwhelmed — the settings panel looks unfinished because a CSS class mismatch prevents the polished card layout from rendering, there is no quick view of how the child is actually doing, and two required settings (max number range and problem type) are simply missing. The quick wins listed above would lift the score to the "Ready to use" range with modest effort.
