# CLAUDE.md - PLL Recognition Trainer

## Project Overview

Client-side Vue 3 web app for speedcubers to practice recognizing PLL (Permutation of the Last Layer) cases. No backend — everything runs in the browser with localStorage persistence. Hosted at bestsiteever.net/pll_recognition.

## Tech Stack

- **Framework:** Vue 3 (Composition API)
- **Build:** Vite 4
- **State:** Pinia (4 stores)
- **Routing:** Vue Router 4 (hash mode)
- **UI:** Bootstrap 5 + 17 swappable themes (12 light + 5 dark)
- **Cube rendering:** sr-puzzlegen-pll (SVG output)

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build

## Architecture

```
main.js → App.vue
              ├── NavBar (+ ThemeSwitcher)
              └── Router
                   ├── / → HomeView (landing page + PllShowcase)
                   ├── /trainer → MetaTrainerView
                   │                ├── TrainerView (game active)
                   │                │    ├── PllPic (cube SVG)
                   │                │    ├── PllCaseInfo (mistake feedback + Note)
                   │                │    ├── GuideHint → GuideGroupCard (recognition guide card)
                   │                │    ├── OnScreenKeyboard (mobile)
                   │                │    ├── ResultsList → ResultItem → PllPic + Note
                   │                │    └── ResultsModal (mobile results overlay)
                   │                └── EvalResults (evaluation done)
                   │                     └── ResultsList → ResultItem
                   └── /settings → SettingsView (+ PllPic preview)
```

- CaseVariationsModal — standalone modal showing all 16 AUF/color-shift variations of a case (opened by clicking a PllPic)
- PllShowcase — grid of all 21 PLL cases on the home page, with selectable cases opening CaseVariationsModal

## State Management (4 Pinia Stores)

| Store | localStorage Key | Purpose |
|-------|-----------------|---------|
| SessionStore | `pll_store` | Game state machine (Paused/Playing/EvaluationDone), case queue, results array, current mistake tracking, `lastSubmission` for button feedback |
| SettingsStore | `pll_recognition_settings` | Cube view angle, stroke width, color scheme, allowed cross colors, on-screen keyboard toggle, fullNameMode |
| NotesStore | `pll_notes` | Per-case user notes keyed by `"name/auf"` |
| ThemeStore | `my_pll.*` | Dark/light mode, theme names |

## Core Game Loop

1. **Queue generation** — `allPllKeys()` creates all 21 PLL case x rotation combos, `keysToCases()` assigns random AUF and color shifts
2. **Playing** — A case is shown via PllPic (sr-puzzlegen SVG). User presses a letter key (13 valid PLL letters: A, E, F, G, H, J, N, R, T, U, V, Y, Z). In fullNameMode, two-letter cases (Aa, Gb, etc.) require typing both letters.
3. **Answer processing** — `submitAnswer()` checks the answer against `currentCase.name`, records timing and mistake status
4. **Result** — `{pllCase, started, finished, mistake}` pushed to results array
5. **Evaluation** — When queue empty, EvalResults shows performance breakdown

### Adaptive Algorithm (pll_cases.js:evalResultsToNewQueue)

Sorts results worst-to-best, then: worst 15% repeated 4x, next 15% 3x, next 20% 2x, remaining 1x, unattempted cases 1x. Queue is shuffled with fresh random AUF/color shifts.

## Data Models

**PLL Case:** `{ name, rotation, dTurn, colorShift, crossColor }`

**Result:** `{ pllCase, started: Date, finished: Date, mistake: "" | "-" | "WrongLetter" }`

**Algorithm DB** (src/assets/algs/pll.json): 21 PLL cases, each with 4 AUF variants (noAuf, U, U2, U'), multiple algorithm strings per variant.

## Key Directories

- `src/components/` — Vue components
- `src/composables/` — Vue composables (useKeydown)
- `src/stores/` — Pinia state management
- `src/views/` — Page-level components
- `src/scripts/` — Utility modules (helpers, colors, pll_cases, cube_sim, guide_lookup, time_formatter, device)
- `src/assets/algs/` — PLL algorithm database (JSON)
- `src/assets/guide/` — Two-sided PLL recognition guide data (JSON)
- `src/assets/bootstrap_themes/` — 17 pre-bundled Bootstrap theme CSS files
- `docs/` — Technical documentation (guide integration, cube simulator)

## Rendering Pipeline

PllPic.vue calls sr-puzzlegen's `SVG()` with a scramble string (inverse of the PLL algorithm), color scheme (shifted by colorShift), view type and camera rotation from settings, and optional puzzle mask (to show only last layer).

## Keyboard Input

Handled in TrainerView.vue via `useKeydown` composable: Space (resume / "Press Space to start" on HomeView), Escape (pause), A-Z (submit answer filtered by isPllLetter), Minus/F1/? (give up), Shift+N (edit note). Mobile users get OnScreenKeyboard.vue with 13 letter buttons (or 21 full-name buttons in fullNameMode).

## Recognition Guide Integration

On a wrong answer, `GuideHint` shows the matching card from Mark49152's Two-Sided PLL Recognition Guide with the relevant row highlighted. A pre-computed lookup table (built at module load) maps every `(caseName, rotation)` to a guide group + row.

The lookup uses `cube_sim.js` to simulate the PLL algorithm on a solved cube, reads the 6 camera-visible top-row stickers (F+R faces), converts to relative colors, and matches against guide patterns using **structural matching** — an injective mapping check that accepts any consistent color reassignment, plus mirror (spatial reversal). This achieves 73/73 coverage with 0 conflicts.

See `docs/guide_integration.md` for full details and `docs/cube_sim.md` for the simulator.

## Design Decisions

- Zero backend — full offline capability, no auth, no server
- Hash routing — works on static hosting without server-side routing config
- 16 variations per case — 4 AUFs x 4 color shifts ensure recognition from any angle
- localStorage persistence — session survives refresh; no data export/import
