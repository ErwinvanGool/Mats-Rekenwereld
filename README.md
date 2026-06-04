# Mats Rekenwereld

Een interactieve reken-app voor kinderen, gebouwd als een single-page web-app
zonder externe frameworks of build-stappen.

---

## 1. Folder structure

```
mats-rekenwereld/
├── index.html              # SPA shell – alle schermen als <section>-elementen
├── styles/
│   └── styles.css          # Globale stijlen (tokens, schermen, componenten)
├── scripts/
│   ├── main.js             # Bootstrap, event-orchestratie, screen-logica
│   ├── state.js            # In-memory app-state singleton + hydration helpers
│   ├── storage.js          # localStorage lezen/schrijven (met migratie)
│   ├── navigation.js       # Scherm-routing via data-nav attributen
│   ├── math.js             # Opgaven genereren en antwoorden controleren
│   ├── rewards.js          # Sterren bijhouden en badges uitdelen
│   ├── builds.js           # Bouwspel-logica (onderdelen plaatsen, voortgang)
│   ├── dragdrop.js         # HTML5 drag-and-drop + pointer/touch-fallback
│   ├── parent-settings.js  # PIN-invoer, instellingen wijzigen, reset
│   ├── progress.js         # Voortgang vastleggen en weergeven
│   └── data.js             # Statische data (operaties, bouwprojecten, badges)
├── assets/
│   ├── sounds/             # Geluidsbestanden (.mp3 / .ogg)
│   ├── images/             # Afbeeldingen (thumbnails, illustraties)
│   └── icons/              # SVG-iconen
└── README.md
```

---

## 2. Screen flow

```
[Home]
  ├─► [Operation selection]  ──► [Exercise]  ──► [Result]
  │                                                  │
  │                                                  └──► [Builds]
  ├─► [Builds / Workshop]
  ├─► [Progress]
  └─► [Parent PIN]  ──► [Parent Panel]
```

| Screen ID              | Beschrijving                                         |
|------------------------|------------------------------------------------------|
| `screen-home`          | Hoofdmenu met vier knoppen                           |
| `screen-operation`     | Keuze: optellen, aftrekken, vermenigvuldigen, delen  |
| `screen-exercise`      | Actieve rekenoefening (multiple-choice of typen)     |
| `screen-result`        | Einde sessie: score, sterren, nieuwe badges          |
| `screen-builds`        | Bouwplaats: sleep onderdelen naar de juiste plek     |
| `screen-progress`      | Statistieken: sterren, juiste antwoorden, sessies    |
| `screen-parent`        | PIN-invoer als toegangspoort                         |
| `screen-parent-panel`  | Ouderinstellingen: moeilijkheidsgraad, reset, PIN    |

Navigation werkt via `data-nav="<screen-id>"` attributen; `navigation.js`
luistert op `click`-events en roept `navigateTo()` aan. Bij elke
schermwissel wordt een `screenchange` CustomEvent op `document` gegooid zodat
modules (progress, builds, parent-panel) hun inhoud kunnen renderen.

---

## 3. JavaScript module breakdown

| Module                | Verantwoordelijkheid                                                    |
|-----------------------|-------------------------------------------------------------------------|
| `data.js`             | Constanten: operatie-configs, bouwprojecten, badge-definities           |
| `state.js`            | Eén globaal `state`-object; `hydrateState()` en `getPersistedState()`  |
| `storage.js`          | `loadState()`, `saveState()`, `clearState()` + schema-migratie          |
| `navigation.js`       | `navigateTo()`, `initNavigation()`, `currentScreen()`                   |
| `math.js`             | `buildQuestionSet()`, `generateQuestion()`, `checkAnswer()`, `generateChoices()` |
| `rewards.js`          | `awardSessionStars()`, `spendStars()`, `evaluateBadges()`, render-helpers |
| `builds.js`           | `placePart()`, `setActiveBuild()`, queries, `buildPaletteHtml()`        |
| `dragdrop.js`         | `initDragDrop()` – HTML5 + pointer-fallback, dispatcht `partDropped`    |
| `progress.js`         | `recordAnswer()`, `recordSession()`, `renderProgressScreen()`           |
| `parent-settings.js`  | PIN-verificatie, instellingen mutaties, `initPinScreen()`, `initParentPanel()` |
| `main.js`             | Bootstrap; wires alle modules samen; orkestreert de sessie-loop         |

Modules importeren alleen omlaag in de stapel (geen cirkels):

```
main.js
  ├── state.js ← storage.js ← (data.js)
  ├── navigation.js ← state.js
  ├── math.js ← data.js, state.js
  ├── rewards.js ← data.js, state.js, storage.js
  ├── builds.js ← data.js, state.js, storage.js
  ├── dragdrop.js  (geen state-imports)
  ├── progress.js ← data.js, state.js, storage.js
  └── parent-settings.js ← data.js, state.js, storage.js, navigation.js
```

---

## 4. Data model

### ProgressState
```js
{
  totalCorrect:    number,   // totaal juiste antwoorden ooit
  totalAttempts:   number,   // totaal geprobeerde antwoorden
  currentStreak:   number,   // huidige reeks juiste antwoorden op rij
  bestStreak:      number,   // beste reeks ooit
  earnedStars:     number,   // totaal aantal verdiende sterren
  history:         SessionRecord[],  // max 50 sessies (nieuwste eerst)
  earnedBadges:    string[],  // badge IDs
  triedOperations: string[],  // operatie IDs die ooit geprobeerd zijn
}
```

### SessionRecord
```js
{
  date:        string,   // ISO 8601
  operationId: string,
  correct:     number,
  total:       number,
  starsEarned: number,
}
```

### BuildsState
```js
{
  placedParts:     string[],  // part IDs die geplaatst zijn
  completedBuilds: string[],  // build IDs die volledig zijn
  activeBuildId:   string,    // huidig open bouwproject
}
```

### SettingsState
```js
{
  parentPin:         string,             // 4-cijferige pincode (default "1234")
  enabledOperations: string[],           // operatie IDs die actief zijn
  operationLevels:   Record<string, number>, // operationId → levelId (1–4)
  soundEnabled:      boolean,
  language:          string,             // 'nl' (uitbreidbaar)
}
```

### SessionState (alleen runtime, niet opgeslagen)
```js
{
  activeOperation:      string | null,
  questions:            MathQuestion[],
  currentQuestionIndex: number,
  answers:              { question, given, correct }[],
  starsEarned:          number,
  finished:             boolean,
}
```

### MathQuestion
```js
{
  operationId: string,
  a:           number,
  b:           number,
  answer:      number,
  display:     string,   // bijv. "4 + 7"
}
```

### Badge
```js
{
  id:        string,
  label:     string,
  icon:      string,       // emoji
  condition: {
    totalCorrect?:    number,
    streak?:          number,
    allOperations?:   boolean,
    completedBuilds?: number,
  }
}
```

---

## 5. localStorage structure

Sleutel: `mats_rekenwereld`  
Waarde: JSON-object:

```json
{
  "version": 1,
  "progress": { ...ProgressState },
  "builds":   { ...BuildsState   },
  "settings": { ...SettingsState }
}
```

- `version` maakt toekomstige schema-migraties mogelijk (via `migrate()` in
  `storage.js`).
- De `SessionState` wordt **niet** opgeslagen (wordt bij elke sessiestart
  opnieuw aangemaakt).
- `storage.js` vangt `JSON.parse`-fouten op en valt terug op de
  standaard-state.

---

## 6. Implementation order

| Stap | Module(s)                     | Reden                                                    |
|------|-------------------------------|----------------------------------------------------------|
| 1    | `data.js`                     | Geen dependencies; alle andere modules leunen hierop     |
| 2    | `state.js`                    | Hangt af van `data.js`; nodig voor alle mutaties         |
| 3    | `storage.js`                  | Hangt af van `state.js`; nodig vóór enige UI             |
| 4    | `navigation.js`               | Basisrouting zonder spellogica                           |
| 5    | `math.js`                     | Kern-functionaliteit; onafhankelijk van UI               |
| 6    | `rewards.js`                  | Hangt af van `state`, `storage`, `data`                  |
| 7    | `progress.js`                 | Hangt af van `state`, `storage`, `data`                  |
| 8    | `builds.js`                   | Hangt af van `state`, `storage`, `data`                  |
| 9    | `dragdrop.js`                 | Puur DOM; dispatcht events die `builds.js` afhandelt     |
| 10   | `parent-settings.js`          | Hangt af van alle bovenstaande modules                   |
| 11   | `index.html` + `styles.css`   | HTML-shell en volledige stijlen                          |
| 12   | `main.js`                     | Bootstrap; wires alles samen                             |

---

## Hoe starten

Open `index.html` direct in een browser **of** start een lokale server:

```bash
npx serve .
# of
python3 -m http.server 8080
```

Geen build-stap vereist. De app gebruikt native ES-modules (`type="module"`).

---

## Standaard pincode ouderzone

De standaard pincode is **1234**. Wijzig deze via het ouderpaneel zodra de
app voor het eerst wordt gebruikt.
