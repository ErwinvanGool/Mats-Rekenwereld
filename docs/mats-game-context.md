# Mats Rekenwereld - Project Context

This document contains the complete project context for "Mats Rekenwereld".
Both custom agents (Child Playtester and Build Implementer) must read this
document before starting any review or implementation work.

This document is also useful for any regular Copilot interaction that
involves understanding the game, its audience, or its design decisions.

---

## Project Overview

**Project name:** Mats Rekenwereld

**What it is:** A browser-based educational game for a 6-year-old child that combines
simple math practice with a rewarding creative building experience.

**Deployed on:** GitHub Pages

**Device:** iPad in landscape mode

**Tech stack:** Plain HTML5, CSS3, Vanilla JavaScript (ES6+), localStorage

---

## Core Game Concept

The core gameplay loop is:

1. The child opens the world map titled "Mats Rekenwereld"
2. The child selects a build destination (e.g., car, dinosaur, rocket)
3. The child solves simple addition problems
4. Correct answers reward the child with building blocks
5. The child uses earned blocks in a playful drag-and-drop building activity
6. Completing or progressing in builds unlocks rewards, stickers, and new items on the world map
7. The child returns to the world map to choose the next adventure

The game should feel like a joyful toy-like building adventure,
not like a school exercise or a boring worksheet.

---

## Target Audience

The primary user is a 6-year-old boy named Mats who:
- loves building with toy bricks (Lego-style)
- is just starting to learn addition
- can barely read
- uses an iPad with touch gestures
- has a short attention span (around 10 minutes per session)
- needs immediate visual rewards to stay motivated
- gets frustrated by unclear instructions or tiny buttons
- gets confused by too much text on screen
- loves bright colors, animations, sounds, and celebrations
- wants to see results quickly
- enjoys dragging and dropping things on a touchscreen
- feels proud when he completes something
- does not understand abstract concepts or complex navigation
- expects the game to feel like a toy, not like a school exercise

### UI implications
Because the child can barely read, the game must use:
- very little text (icons and visuals instead)
- large icons and illustrations
- clear visual hierarchy
- audio feedback for all key moments
- animations for transitions and rewards
- bright and cheerful colors
- large touch targets (minimum 44x44px, preferably 60x60px or larger)
- simple icon-based navigation
- immediate rewards after every correct answer

The interface should never depend on reading long instructions.
The game should teach through visuals, motion, and interaction.

---

## Platform and Technical Goals

The app must:
- run in the browser (Safari on iPad)
- work well on iPad in landscape mode
- be deployable on GitHub Pages as static files
- not require a backend, database, or API calls
- store all progress locally with localStorage
- use plain HTML5, CSS3, and Vanilla JavaScript (ES6+)
- avoid heavy frameworks (no React, Vue, Angular)
- avoid build tools (no Webpack, Vite, etc.)
- remain lightweight and responsive
- be easy to maintain and extend
- work offline after initial page load as much as possible

---

## Design Goals

The visual style should be:
- colorful and bright
- playful and warm
- friendly and inviting
- toy-brick-inspired
- suitable for young children

The experience should include:
- cheerful animations
- playful transitions between screens
- satisfying reward moments
- fun sound effects
- celebratory feedback (fireworks, confetti)
- sticker rewards
- clear visual states for success, progress, and unlocks
- very little text, maximum visuals

The design should feel polished and complete, not like a rough prototype.

---

## Game Structure

The game includes the following main screens:

1. **Start screen** - Welcome screen with a big play button
2. **World map** - Main hub titled "Mats Rekenwereld" with build destinations
3. **Build selection** - Choose which object to build
4. **Math challenge screen** - Solve addition problems to earn blocks
5. **Building screen** - Drag-and-drop blocks to build the chosen object
6. **Reward screen/modal** - Celebration after completing a build or earning a sticker
7. **Parent settings panel** - Configuration for parents (behind a parent gate)
8. **Progress overview** - Collection of stickers, completed builds, and scores

---

## World Map

The world map is the main hub of the game.

**Title:** "Mats Rekenwereld"

**Design:**
- Feels like a playful world with locations, islands, or themed destinations
- Each build example appears as a selectable destination on the map
- Playful movement or subtle animation where appropriate

**Visual states:**
- Locked builds (greyed out, locked icon)
- Unlocked builds (colorful, inviting, ready to play)
- Completed builds (special badge, checkmark, or star)
- Current progress visible

The world map should be exciting and rewarding to return to.
Unlocking a new destination should feel like a real achievement.

---

## Math System

The game has two levels:

### Level 1: Addition up to 10
- Simple problems like 3 + 4 = ?
- All answers and operands are 10 or below
- Easiest difficulty

### Level 2: Addition up to 20
- Problems like 12 + 5 = ? or 8 + 7 = ?
- Includes crossing tens (e.g., 8 + 7 = 15)
- Harder difficulty, rewards more blocks

The child can switch between levels.
Parents can also set the level via parent settings.

---

## Question Presentation

Math questions should be presented in different forms:
- **Numeric format:** 3 + 4 = ?
- **Visual object-based format:** 3 apples + 4 apples (using images or icons)
- **Other visual themes:** stars, blocks, balloons, animals, toys

The game should not rely only on symbolic math.
It should support visual counting and visual understanding.

### Requirements
- Questions must be large and easy to read
- Visually simple and not cluttered
- Suitable for a young child
- Touch-friendly layout
- Use large numbers and large images
- Consistent layout across questions
- Animated or interactive feedback where useful

---

## Answer Input

The child answers by selecting from multiple choice options.

### Requirements
- Always show 3 large answer buttons
- One correct answer
- Two plausible incorrect answers (distractors)
- Answers must be easy to tap on iPad
- Answer placement can vary to avoid memorizing button position
- The child should never need to type an answer

---

## Math Difficulty and Rewards

Correct answers give building blocks.

### Reward logic
- Easy problems: 1 block
- Harder problems: 2 or 3 blocks

### Streak system
- 3 correct answers in a row: +1 bonus block
- 5 correct answers in a row: 1 sticker reward

### Reward experience
The reward loop must feel immediate and satisfying.
After each correct answer, the child should clearly see:
- earned blocks (animated into inventory)
- animated reward feedback
- progress toward the current build
- a sound effect
- sparkles or mini celebration

---

## Wrong Answers and Feedback

Feedback must always be positive and encouraging.
There should never be punishment, frustration, or negative language.

### Wrong answer behavior
- **First wrong attempt:** encourage retry in a friendly way (e.g., gentle shake, "try again" icon)
- **Repeated wrong attempts:** show a visual hint
- **Hints can include:** highlighting quantities, showing grouped objects, visual counting support

### Important principles
- Feedback should guide learning, not mark failure
- The game should feel safe and supportive
- No points are lost for wrong answers
- No blocks are taken away
- No negative sounds or angry visuals

---

## Building System

The building part of the game is one of the main rewards and should feel fun and tactile.

### Requirements
- After correct answers, the child earns blocks
- Those blocks can be used in a drag-and-drop building experience
- The child should see a visual example or target object
- Building should feel playful and somewhat free, not overly strict
- Wrong placements should be allowed
- The game should provide friendly visual feedback for placements
- Unfinished builds must be saved so the child can continue later

### Important
The building system should not feel like only a rigid puzzle.
It should feel like a guided creative activity where the child has
some freedom within the structure of the example.

---

## Starter Build Content

Version 1 includes approximately 5 build examples.

### Suggested builds
1. **Car** - Easier, fewer blocks required
2. **House** - Medium difficulty
3. **Dinosaur** - Medium difficulty
4. **Rocket** - Harder, more blocks required
5. **Fire truck** - Harder, more blocks required

### Each build should have
- A unique id
- A title (short, or icon-based)
- A theme/category
- A difficulty level
- A required number of blocks
- An unlock condition (e.g., complete previous build, earn enough stickers)
- A visual reference image or CSS/SVG representation
- Colors or block palette information
- Completion rewards (sticker, fireworks, next unlock)
- Data needed for saving progress (placed blocks, completion state)

### Variety
Each build can have a different difficulty and block requirement,
so some builds are easier starter builds and some are more aspirational goals.

---

## Reward and Progression System

The game should include progression that feels motivating but not stressful.

### Progression includes
- Unlocking new build examples on the world map
- Earning stickers
- Completing builds
- Achieving a high score or best streak
- Seeing a growing collection of completed items
- Returning to the world map to choose what to do next

### Celebration moments
A completed build should trigger a special celebration:
- Fireworks or confetti animation
- Celebratory sound effect
- Completion badge or sticker reward
- Unlock animation for the next build on the world map

---

## Progress Storage

Use localStorage to save all progress.

### What to save
- Unlocked builds
- Completed builds
- Unfinished build states (placed blocks)
- Stickers earned
- High score
- Best streak
- Currently selected level
- Parent settings
- Last played state
- Total earned blocks (if useful)

### Technical approach
- Use a single top-level localStorage key: "matsRekenwereld"
- Store a structured JSON object underneath
- Keep the data structure simple and extendable
- Handle missing or corrupted data gracefully

---

## Parent Settings

The game includes a parent settings area.

### Configurable options
- Maximum number range (e.g., up to 10 or up to 20)
- Problem type (numeric, visual, or mixed)
- Math difficulty
- Level selection (level 1 or level 2)
- Sound on or off
- Reset all progress
- View basic child progress (scores, completed builds, stickers)

### Parent gate
Because the child is very young, parent settings should not be
too easy to open by accident.

Implement a simple parent gate, for example:
- Long press on a settings icon (3+ seconds)
- A simple adult confirmation step (e.g., solve a harder math problem)
- Another lightweight child-resistant interaction

The parent settings panel should remain simple and easy to maintain.

---

## Session Length and Experience

The ideal play session is around 10 minutes.

### This means
- The game loop should be satisfying in short sessions
- The child can answer a few questions, earn blocks quickly, make visible building progress, and receive a reward
- The child should be able to return later without losing progress
- The experience should encourage repeated short sessions rather than long, complex play
- There should be natural stopping points after completing a build or earning a sticker

---

## UX Principles

Always prioritize:
- Low reading demand
- Large touch targets for small fingers
- Clear visual feedback for every interaction
- Simple icon-based navigation
- Positive reinforcement only
- Low frustration
- Delight and motivation
- Short interaction loops
- Consistency between screens
- Child-safe behavior at all times

Do not design the game like a productivity app or a website.
It must feel like a playful children's game.

---

## Child Safety

The app must be fully child-safe.

### Requirements
- No ads
- No login or user accounts
- No in-app purchases
- No external links in the child-facing UI
- No unsafe content
- No dark patterns
- No manipulative pressure
- No unnecessary data collection
- No cookies (localStorage only)
- All content must remain age-appropriate and friendly

---

## Audio and Animation

### Sound effects
The game should include:
- Positive sound effect for correct answers
- Gentle sound for wrong answers (not harsh)
- Sound for earning blocks
- Sound for earning stickers
- Celebratory sound for completing a build
- Fireworks or confetti sound
- Button tap sound
- Optional drag and drop sounds

### Animation
- Smooth transitions between screens
- Animated block earning (block flies or bounces into inventory)
- Animated build completion (fireworks, confetti, sparkles)
- Playful micro-animations on buttons and interactive elements
- Subtle world map animations (floating islands, wiggling icons)
- Sticker popup animation

### Audio management
- Sound should be optional and manageable through parent settings
- All audio must respect the parent settings mute toggle
- Audio must only play after a user interaction (iPad Safari requirement)
- The game must work well without sound (visual feedback must be sufficient on its own)

---

## Responsiveness and Device Behavior

The app is optimized for iPad landscape.

### Requirements
- Large buttons (minimum 44x44px, preferably 60x60px)
- Large draggable elements
- Comfortable spacing between interactive elements
- No tiny text or tiny controls
- Touch-friendly interactions (no hover-dependent features)
- Responsive layout for tablet-sized screens (1024x768 minimum)
- Landscape orientation only
- Prevent accidental page scrolling during drag-and-drop

---

## Code Organization

The code should be modular and maintainable.

### Separate responsibilities
- main.js: app bootstrap
- state.js: central app state
- storage.js: localStorage persistence
- navigation.js: screen switching
- math.js: question generation and validation
- rewards.js: streaks, stickers, block rewards
- builds.js: build definitions and unlock logic
- dragdrop.js: building interactions
- parent-settings.js: parent controls
- progress.js: progress summaries
- data.js: build data, sticker data, content definitions

### Rules
- Avoid putting all logic into a single file
- Keep naming consistent across all files
- Use English for all code, variable names, and comments
- Keep data structures simple and extendable
- Add comments for non-obvious logic
- Keep DOM manipulation in screen/component modules
- Keep data and logic modules pure (no DOM code)

---

## Version History

### Version 1 (current)
- 2 math levels (up to 10 and up to 20)
- 5 starter builds (car, house, dinosaur, rocket, fire truck)
- World map with lock/unlock states
- Drag-and-drop building
- Streak rewards and stickers
- Parent settings with parent gate
- localStorage persistence
- Sound effects and animations
- Deployed on GitHub Pages

### Future ideas (not in scope for version 1)
- Subtraction problems
- More build examples
- Free building mode
- Multiplayer or sharing
- More sticker collections
- Themed seasonal content
