# PLL Recognition Trainer — Improvement Suggestions

## Context

The PLL Recognition Trainer is a polished, functional tool for speedcubers to practice recognizing PLL cases. It works well for what it does — but it's a **single-session tool**. Every training session starts from scratch with no memory of the past. There's no way to track progress over time, no control over what to practice, and no motivation hooks to build a daily habit. The UI is clean but lacks polish in a few areas (no route transitions, native browser confirm dialogs, desktop has no progress bar). These gaps prevent it from being the tool a serious speedcuber opens every day.

---

## Phase 1: History & Stats (Foundation)

*Everything else depends on persistent history. This is the #1 gap.*

### 1A. Create `HistoryStore` (new Pinia store)

**New file:** `src/stores/HistoryStore.js`
**localStorage key:** `pll_history`

Data model:
```
sessions[]        — archive of completed sessions (capped at 100)
caseStats{}       — per "name/rotation" key: attempts, mistakes, bestTimeMs, recentTimes[20], lastPracticed
dailyLog{}        — per "YYYY-MM-DD": casesAttempted, sessionsCompleted
lifetimeStats     — totalCases, totalSessions, totalTimeMs, firstSessionDate
streaks           — current, best, lastActiveDate
```

**Hook points in `SessionStore.js`:**
- `restartEvaluation()` — before `store.results = []`, call `historyStore.archiveSession()`
- `startPersonalized()` — same

### 1B. Create `/stats` route + `StatsView.vue`

**New files:** `src/views/StatsView.vue`
**Modify:** `src/router/index.js`, `src/components/nav/NavBar.vue` (add bar-chart icon)

Sections:
1. **Lifetime summary card** — total cases, sessions, time, days active, current streak
2. **Per-case table** — sortable by name, accuracy %, avg time, best time, last practiced; color-coded rows by mastery
3. **Session history** — expandable list of past sessions with summary stats
4. **30-day activity heatmap** — simple colored div grid from dailyLog

No chart library needed — CSS bar charts and flex grids.

### 1C. Data Export/Import

**New file:** `src/scripts/data_io.js`
**Modify:** `src/views/SettingsView.vue` (add Export/Import buttons below Reset)

- Export: collect all localStorage keys → JSON Blob → download
- Import: file input → validate → merge into localStorage → reload

---

## Phase 2: Training Customization

*After tracking progress, the next need is control over what to practice.*

### 2A. Case Selection

**New file:** `src/components/CaseSelector.vue`
**Modify:** `src/stores/SettingsStore.js` (add `trainingConfig`), `src/stores/SessionStore.js` (filter queue by selected cases)

- Grid of 21 toggle buttons (same visual style as CrossColorPicker)
- Presets: "All", "2-letter only", "Worst cases" (reads HistoryStore)
- Configurable session size (0 = all, or N cases)
- Place in SettingsView between cross colors and view settings

### 2B. Drill Mode

**Modify:** `src/stores/SessionStore.js`, `src/scripts/pll_cases.js`

- New mode: generates N repetitions of selected cases with randomized AUF/colorShift
- When queue empties, auto-regenerates (no evaluation screen)
- Optional: show drill summary on demand

### 2C. Recognition Timer

**New file:** `src/components/RecognitionTimer.vue`
**Modify:** `src/views/TrainerView.vue`, `src/stores/SettingsStore.js` (add `targetTimeMs`)

- Thin bar below cube that fills as time passes
- Color transitions: green → yellow → red approaching target
- Uses `requestAnimationFrame`, reads `store.currentRecognitionStarted`
- Informational only (no auto-fail)

---

## Phase 3: Gamification & Motivation

*All items read from HistoryStore. Small, independent, high-retention impact.*

### 3A. Streaks
- Computed in `HistoryStore.archiveSession()` — check lastActiveDate vs today
- Display: flame icon + count in NavBar (when streak ≥ 2) and on StatsView

### 3B. Personal Bests
- Session-level bests stored in HistoryStore (best avg time, best accuracy, best correct streak)
- When PB achieved → "New personal best!" badge in EvalResults with `animate__tada`
- Per-case PB → small star icon in results sidebar during play

### 3C. Mastery Levels Per Case
**New file:** `src/scripts/mastery.js`

Levels computed from caseStats (accuracy + avg time over last 20 attempts):
- 0: Never attempted (gray)
- 1: Learning (red) — <50% accuracy
- 2: Developing (orange) — 50-70% or avg >4s
- 3: Proficient (yellow) — 70-90%, 2-4s
- 4: Mastered (green) — >90%, <2s

Shown in StatsView per-case table and optionally in PllShowcase on home page.

### 3D. Session Summary Enhancements
**Modify:** `src/views/EvalResults.vue`

- Compare to previous session: "2.1s avg (↓0.3s from last time)"
- Per-case improvement arrows when HistoryStore has prior data
- Longest correct streak within session

---

## Phase 4: UI/UX Polish

*Small, independent fixes that make the tool feel professional.*

| Item | What | Where | Effort |
|------|------|-------|--------|
| **4A** | Desktop progress bar | TrainerView.vue — remove `d-md-none`, add thin top bar | Tiny |
| **4B** | Themed confirm dialogs | New `ConfirmModal.vue`, replace `confirm()` in NavBar + SettingsView | Low |
| **4C** | Route transitions | App.vue — wrap RouterView in `<Transition name="fade" mode="out-in">` | Tiny |
| **4D** | Keyboard shortcut reference | New `KeyboardShortcuts.vue` — "?" icon opens modal listing all hotkeys | Low |
| **4E** | First-time user empty states | TrainerView (welcome message when no results), StatsView (prompt to train) | Tiny |
| **4F** | Theme-aware shimmer | `global.css` — change hardcoded white to `var(--bs-body-color-rgb)` | Tiny |
| **4G** | Algorithm display on mistakes | TrainerView.vue — show algorithm from pll.json below guide card | Low |

---

## Phase 5: Accessibility

| Item | What | Where | Effort |
|------|------|-------|--------|
| **5A** | Fix navbar tab navigation | NavBar.vue — remove `tabindex="-1"`, add conditional logic during play | Tiny |
| **5B** | ARIA live regions | TrainerView.vue — `aria-live="polite"` on hint text, `aria-live="assertive"` on mistake area | Tiny |
| **5C** | Focus trap in ResultsModal | ResultsModal.vue — trap Tab within overlay, restore focus on close | Low |
| **5D** | Color-independent status | ResultItem.vue — add icons alongside colored badges | Tiny |

---

## Phase 6: Advanced Training

### 6A. Spaced Repetition (SRS)
**New file:** `src/scripts/srs.js`
**Modify:** `src/stores/SessionStore.js`, `src/stores/SettingsStore.js`

- Calculate urgency score per case: mastery level x time-since-last-practice x historical error rate
- Cases once known but not recently practiced get high urgency (time decay)
- Toggle in settings: "Use spaced repetition" (off by default)

### 6B. Review Mistakes Mode
**Modify:** `src/stores/SessionStore.js`, `src/views/EvalResults.vue`, `src/views/TrainerView.vue`

- "Review mistakes" button in EvalResults alongside "Start personalized training"
- Queue of only mistaken cases, guide card visible from the start
- No scoring — press Space to advance through each case
- New game state: `GameState.Reviewing`

---

## Implementation Order

```
Sprint 1:  1A (HistoryStore) + 1C (Export/Import)         <- foundation
Sprint 2:  1B (StatsView) + 4A,4E,4F (quick UI wins)      <- make history visible
Sprint 3:  2A (Case Selection) + 2C (Timer)                <- user agency
Sprint 4:  3A,3B,3C,3D (all gamification, parallel)        <- daily habit hooks
Sprint 5:  4B,4C,4D,4G + 5A,5B,5C,5D (polish + a11y)     <- professional feel
Sprint 6:  2B (Drill Mode) + 6B (Review Mistakes)          <- advanced training
Sprint 7:  6A (SRS)                                        <- requires tuning
```

## New Files Summary

| File | Type |
|------|------|
| `src/stores/HistoryStore.js` | Pinia store |
| `src/views/StatsView.vue` | View |
| `src/scripts/data_io.js` | Utility |
| `src/scripts/mastery.js` | Utility |
| `src/scripts/srs.js` | Utility |
| `src/components/CaseSelector.vue` | Component |
| `src/components/RecognitionTimer.vue` | Component |
| `src/components/ConfirmModal.vue` | Component |
| `src/components/KeyboardShortcuts.vue` | Component |

## Key Files to Modify

| File | Phases |
|------|--------|
| `src/stores/SessionStore.js` | 1A, 2A, 2B, 6A, 6B |
| `src/stores/SettingsStore.js` | 2A, 2C, 6A |
| `src/views/TrainerView.vue` | 2C, 4A, 4E, 4G, 5A, 5B, 6B |
| `src/views/EvalResults.vue` | 3B, 3D, 6B |
| `src/views/SettingsView.vue` | 1C, 2A |
| `src/components/nav/NavBar.vue` | 1B, 3A, 4B, 4D, 5A |
| `src/router/index.js` | 1B |
| `src/scripts/pll_cases.js` | 2A, 2B, 6A |
| `src/App.vue` | 4C |
| `src/assets/global.css` | 4F |

## Verification

- After Phase 1: Complete a training session -> check StatsView shows archived data -> export JSON -> import on another browser -> verify data matches
- After Phase 2: Select subset of cases -> verify queue only contains those cases -> enable timer -> verify it displays and color-transitions correctly
- After Phase 3: Complete 2 sessions on consecutive days -> verify streak shows 2 -> beat a previous time -> verify PB badge appears
- After Phase 4: Navigate between views -> verify fade transitions -> press "?" -> verify shortcut modal -> restart evaluation -> verify themed confirm dialog
- After Phase 5: Tab through navbar -> verify all buttons reachable -> trigger mistake -> verify screen reader announces it
- After Phase 6: Enable SRS -> verify neglected cases appear more often -> use "Review mistakes" -> verify guide cards shown upfront
