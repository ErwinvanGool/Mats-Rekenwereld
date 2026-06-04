# Copilot Instructions for Mats Rekenwereld

## Project Overview
This is "Mats Rekenwereld", a browser-based educational game for a 6-year-old child.
The child solves simple addition problems to earn building blocks, then uses those blocks
in a playful drag-and-drop building experience to create objects like a car, house,
dinosaur, rocket, and fire truck.

The game is deployed on GitHub Pages and must work on iPad in landscape mode.

## Target User
A 6-year-old boy who:
- loves building with toy bricks
- is just learning to add numbers
- can barely read
- uses an iPad with touch gestures

This means: minimal text, large buttons, bright colors, icons over words,
sound effects, animations, and immediate visual rewards.

## Tech Stack
- Plain HTML5
- CSS3 (no preprocessors)
- Vanilla JavaScript (ES6+, modular)
- localStorage for all persistence
- No backend, no database, no API calls
- No frameworks (no React, no Vue, no Angular)
- No build tools required (no Webpack, no Vite)
- Must run as static files on GitHub Pages

## Project Structure

    mats-rekenwereld/
    ├── index.html
    ├── styles/
    │   └── styles.css
    ├── scripts/
    │   ├── main.js              # App bootstrap
    │   ├── state.js             # Central app state
    │   ├── storage.js           # localStorage save/load
    │   ├── navigation.js        # Screen switching
    │   ├── math.js              # Question generation and validation
    │   ├── rewards.js           # Streaks, stickers, block rewards
    │   ├── builds.js            # Build definitions and unlock logic
    │   ├── dragdrop.js          # Drag-and-drop building interactions
    │   ├── parent-settings.js   # Parent controls
    │   ├── progress.js          # Progress summaries
    │   └── data.js              # Build data, sticker data, content
    ├── assets/
    │   ├── sounds/
    │   ├── images/
    │   └── icons/
    ├── docs/
    │   ├── mats-game-context.md
    │   ├── build-ux-rubric.md
    │   └── reviews/
    ├── .github/
    │   ├── copilot-instructions.md
    │   └── agents/
    │       ├── child-playtester.agent.md
    │       └── build-implementer.agent.md
    └── README.md

## Coding Guidelines

### JavaScript
- Use ES6+ features: const/let, arrow functions, template literals, destructuring
- Keep files small and focused on one responsibility
- Use descriptive function and variable names in English
- Add comments for non-obvious logic
- No global variables; use the state module
- Export/import via ES modules where possible
- All DOM manipulation should be in the relevant screen/component module, not in data/logic modules
- Keep data modules pure (no DOM code in math.js, rewards.js, data.js, state.js, storage.js)

### CSS
- Use a flat, simple structure
- Use CSS custom properties (variables) for colors and spacing
- Class names in English, lowercase, hyphen-separated (e.g., build-screen, block-inventory)
- Mobile/touch-first approach
- Optimize for iPad landscape (1024x768 minimum)
- Large touch targets: minimum 44x44px, preferably 60x60px or larger
- Use animations and transitions for feedback and delight

### HTML
- Semantic structure
- Each main screen is a section or div with a unique ID
- Screen switching is done by showing/hiding containers
- Keep the HTML readable and well-indented

## Game Design Rules

### Math System
- Level 1: addition up to 10
- Level 2: addition up to 20, including crossing tens (e.g., 8 + 7)
- Questions can be numeric (3 + 4 = ?) or visual (3 apples + 4 apples)
- Answers are always multiple choice with 3 large buttons
- One correct answer, two plausible distractors
- First wrong answer: encourage retry
- Repeated wrong answers: show a visual hint
- Never punish, always encourage

### Reward System
- Each correct answer gives building blocks
- Easy problems give 1 block
- Harder problems give 2 or 3 blocks
- 3 correct in a row: +1 bonus block
- 5 correct in a row: 1 sticker reward
- Completed builds trigger fireworks/confetti celebration

### Building System
- Drag-and-drop blocks into a build area
- Show a visual reference/example of the target object
- Allow wrong placements with friendly feedback
- Save unfinished builds in localStorage
- 5 starter builds: car, house, dinosaur, rocket, fire truck
- Each build has a different difficulty and block requirement

### World Map
- Main hub screen titled "Mats Rekenwereld"
- Each build is a location on the map
- Show locked, unlocked, and completed states visually
- Unlocking should feel rewarding

### Parent Settings
- Accessible behind a simple parent gate (e.g., long press)
- Settings: max number, problem type, difficulty, level, sound on/off, reset progress
- Basic progress viewing

## Persistence
Use localStorage to save:
- Unlocked and completed builds
- Unfinished build states
- Stickers earned
- High score and best streak
- Selected level
- Parent settings
- Last played state

Use a single top-level key like "matsRekenwereld" with a structured JSON object underneath.

## UX Principles (always follow these)
- Minimal text, maximum visuals
- Large touch targets for small fingers
- Bright, cheerful, toy-inspired colors
- Positive reinforcement only, never negative feedback
- Immediate reward after every correct answer
- Sound effects and animations for all key moments
- Short play sessions of around 10 minutes should feel satisfying
- Navigation must be simple and icon-based
- Child-safe: no ads, no login, no external links, no purchases

## Audio
- Use short, friendly sound effects
- Correct answer, wrong answer, block earned, sticker, build complete, fireworks, button tap
- Sound files are stored in assets/sounds/
- All audio must respect the parent settings mute toggle
- Audio must only play after a user interaction (iPad browser requirement)

## What Copilot Should NOT Do
- Do not introduce any frameworks or build tools
- Do not add external API calls or network dependencies
- Do not add login, authentication, or user accounts
- Do not add ads, tracking, analytics, or cookies
- Do not add external links in the child-facing UI
- Do not use complex language or long text in the child UI
- Do not remove existing features without explicit permission
- Do not put all logic into a single file
- Do not break localStorage save/load compatibility between changes

## Custom Agents
This project uses two custom agents for iterative improvement:

1. **Child Playtester** (.github/agents/child-playtester.agent.md)
   Reviews the building UX from a child's perspective using docs/build-ux-rubric.md

2. **Build Implementer** (.github/agents/build-implementer.agent.md)
   Implements targeted improvements based on playtester feedback

Shared context: docs/mats-game-context.md
Evaluation rubric: docs/build-ux-rubric.md

When working on the building experience, always read both documents first.

## Useful Commands
- To run locally: open index.html in a browser, or use Live Server in VS Code
- To deploy: push to main branch, GitHub Pages serves from root
- To test on iPad: use the GitHub Pages URL in Safari
