# Prompt 1e: Zoned Design Tokens, 19 Anti-Slop Rules, Monochrome SVGs, Liquid Glass, Study by Subject/Chapter & SM-2 Mastery Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute the 5-phase architectural overhaul defined in `docs/promt/promt1e.md`, eliminating all hardcoded color leaks across 3 themes, stripping AI slop and multi-color emojis in favor of crisp monochrome SVGs, unifying card rendering, creating a non-overlapping floating HUD capsule with morphing icon animation, perfecting the Liquid Glass sidebar and 3D flashcard flip, adding dual Subject/Chapter study to Mode 5, redesigning SM-2 mastery distribution, and achieving 144+ FPS in the deck library.

**Architecture:** 
- Centralized token groups in `css/theme.css` with 6 structured zones (`surfaces`, `typography`, `accent/buttons`, `hover/spotlight`, `quiz/flashcard`, and component variables).
- Clean DOM and unified component architecture: `_createDeckCardHtml` as single source of truth for deck cards; removal of filler badges and OS emojis.
- Layered liquid glass UI with optical gradients instead of compounding `backdrop-filter: blur()`, maintaining fluid 144+ FPS performance.

**Tech Stack:** Vanilla JavaScript (ES2022 / ES Modules), CSS3 (Modern Glassmorphism, CSS Custom Properties, CSS Grid, 3D Transforms, `content-visibility`), HTML5 Semantic & Inline SVGs, IndexedDB (Dexie-free vanilla, DB_NAME preserved).

**Spec:** `docs/promt/promt1e.md`

## Global Constraints
- Preserve `const DB_NAME = 'MindSparksQuizDB';` and all IndexedDB stores/schemas intact.
- Keep `_detachSidebarLabels()` and `_attachSidebarLabels()` methods in `App` object for test suite compatibility.
- Ensure all DOM IDs tested by `test-runner.js`, `test-round35...`, `test-round39...`, `test-round40...`, and `test-round41...` remain valid (`#stat-breakdown-new`, `#stat-breakdown-learning`, `#stat-breakdown-review`, `#stat-breakdown-mastered`, `#study-quiz-area`, `#view-decks`, etc.).
- Never append another `@media (max-width: 768px)` at the end of `css/style.css` (test suite 35 requires exact last index at line 3546); place mobile responsive rules under `@media (max-width: 767px)`.
- Use Node scripts for CRLF-safe file modifications on Windows.

## Review Focus
- Hardcoded purple/black leaking into monochrome or white-orange themes.
- Unintentional breaking of `App._detachSidebarLabels()` / `_attachSidebarLabels()` DOM detach logic.
- Flashcard 3D flip preserving answer visibility and SRS button grid responsiveness.
- Mode 5 Dual picker properly filtering cards when selecting subjects or chapters without throwing when a deck has undefined topic.
- 144+ FPS performance in `#view-decks` with optical liquid glass without multiple stacked `backdrop-filter: blur()`.

---

### Task 1: Phase 1 — Token Zoning in `css/theme.css` & Eradicate Hardcoded Colors

**Files:**
- Modify: `css/theme.css`
- Modify: `index.html` (lines 315-408: remove hardcoded inline styles on 7 `.study-mode-card`)
- Modify: `css/style.css` (dropdowns, LMS guide, subject headers, energy/progress bars, spotlight hover)

- [ ] **Step 1: Restructure `css/theme.css` into 6 standardized token groups**
  - Group 1: Surfaces & Liquid Glass (`--bg-base`, `--surface-card`, `--surface-card-hover`, `--surface-elevated`, `--surface-header`, `--surface-dropdown`, `--surface-dropdown-menu`, `--surface-code`, `--surface-sidebar`, `--surface-hud`, `--glass-border`, `--glass-border-strong`, `--glass-highlight`, `--glass-specular`)
  - Group 2: Typography & Contrast (`--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-accent`, font families)
  - Group 3: Accent, Buttons & Progress Bars (`--accent`, `--accent-strong`, `--accent-subtle-bg`, `--accent-border`, `--btn-primary-bg`, `--btn-primary-text`, `--btn-primary-hover`, `--btn-secondary-bg`, `--btn-secondary-text`, `--btn-secondary-border`, `--progress-track-bg`, `--progress-fill-bg`)
  - Group 4: Hover, Spotlight & Focus (`--spotlight-primary`, `--spotlight-secondary`, `--card-hover-border`, `--card-hover-shadow`)
  - Group 5: Quiz Options & Flashcard SRS (`--option-bg`, `--option-border`, `--option-text`, `--option-letter`, `--option-correct-bg`, `--option-correct-border`, `--option-correct-text`, `--option-wrong-bg`, `--option-wrong-border`, `--option-wrong-text`)
  - Group 6: Component-specific variables
  - Define all 6 groups for `:root, [data-theme="violet-rose"]`, `[data-theme="monochrome"]`, and `[data-theme="white-orange"]`.

- [ ] **Step 2: Strip inline styles on the 7 `.study-mode-card` in `index.html`**
  - Remove all inline `style="color: ...; background: ...;"` on `.study-mode-icon` and `.tech-tag`.

- [ ] **Step 3: Replace hardcoded colors in `css/style.css`**
  - Dropdowns: replace `#131122 !important` and `#12101e !important` with `var(--surface-dropdown) !important` and `var(--surface-dropdown-menu) !important`.
  - LMS cards: `.lms-format-guide-card` and `.lms-sample-snippet` replace hardcoded `rgba(16, 15, 26, 0.75)` and `rgba(0,0,0,0.4)` with `var(--surface-elevated)` and `var(--surface-code)`.
  - Subject groups: `.subject-group` and `.subject-group-header` use `var(--surface-card)` and `var(--surface-header)` and `var(--glass-border)`.
  - Hover on `.study-mode-card:hover .study-mode-pill-btn`: replace `#7c3aed` with `var(--btn-primary-bg) !important; color: var(--btn-primary-text) !important;`.
  - Spotlight hover and progress bars: replace static purple `rgba(192, 132, 252, ...)` and `#a78bfa` with `var(--spotlight-primary)` and `var(--progress-fill-bg)`.

- [ ] **Step 4: Verify test suite and visual tokens**
  - Run `npm test` to ensure zero regressions in existing tests.

---

### Task 2: Phase 2 — 19 Anti-AI-Slop Rules, Tabular Nums, Latex Bold, Monochrome SVGs & Unified `.deck-card`

**Files:**
- Modify: `index.html`
- Modify: `js/app.js`
- Modify: `css/style.css`

- [ ] **Step 1: Delete filler badges across `index.html` and `js/app.js`**
  - Remove `MODE // 01`..`07`, `ADAPTIVE`, `LIBRARY // ALL`, `LMS // AUTO-PARSER`, `ANALYTICS // SM-2`, `REF//MS-...` in `_renderQuizContent`, `HỌC ĐỀU ĐẶN // SM-2`.
  - Remove duplicate `Môn học: ...` italic prefix from deck card description.
  - Set `font-variant-numeric: tabular-nums;` for numbers in `.stat-num`, `.deck-meta`, `.item-count`, `#exam-timer-display`, `.sm2-stage-num`.

- [ ] **Step 2: Support Markdown bold `**...**` in `App.renderLatexText(text)`**
  - In `js/app.js`: In `renderLatexText`, add `.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')` to parse bold keywords within regular text.

- [ ] **Step 3: Convert all remaining emojis to Monochrome Inline SVGs**
  - Replace emojis in `.study-mode-card` (7 modes): Shuffle, Target, Repeat Clock, Timer, Layers/Book, Eye-Off, Zap.
  - Replace emojis in `.stat-card`, `.deck-meta`, `.bank-filter-bar`, `.cyber-dropdown-icon`, `.topic-filter-chip` with clean inline SVG (`stroke="currentColor" stroke-width="1.8" fill="none"`).
  - Apply `filter: grayscale(100%)` to subject badges in `monochrome` mode.

- [ ] **Step 4: Unify `.deck-card` HTML generator**
  - Unify `_createDeckCardHtml(deck, totalCards, dueCards, subject, options = { showDelete: false })` in `js/app.js`.
  - Make `renderDecks()` in Deck Library call `this._createDeckCardHtml(...)` with `options.showDelete = true`.
  - Remove redundant icons from `.deck-actions` buttons (`Ôn tập`, `Lật thẻ`, `Thi thử`, `Thêm câu`, `Đặt lại`).

- [ ] **Step 5: Verify test suite**
  - Run `npm test`.

---

### Task 3: Phase 3 — Topbar HUD Capsule, Morph Theme Icon, Liquid Glass Sidebar & 360° Flashcard Flip

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`
- Modify: `js/app.js`

- [ ] **Step 1: Implement `.topbar-hud-capsule`**
  - Move `.app-topbar` into a non-overlapping utility row (`position: relative; display: flex; justify-content: flex-end; align-items: center; padding: 14px 32px 0 32px; z-index: 100;`).
  - Merge the theme switcher and streak counter into `.topbar-hud-capsule` (height: 38px, pill radius: 999px, background: `var(--surface-hud)`, backdrop-filter: blur(20px), border: `1px solid var(--glass-border)`).
  - Add vertical divider (`1px solid var(--glass-border)`, height: 18px).

- [ ] **Step 2: Add theme icon morph transition**
  - Smooth indicator slide via `transform: translateX(...)` with `cubic-bezier(0.34, 1.56, 0.64, 1)`.
  - Morph SVG transition with `transform: rotate(360deg) scale(1.15)` on active theme icon.

- [ ] **Step 3: Refactor Liquid Glass Sidebar (Ảnh 8 & 9)**
  - Sidebar glass styling: `border: 1px solid var(--glass-border); box-shadow: var(--glass-specular), 0 16px 40px rgba(0,0,0,0.22); overflow: hidden !important;`.
  - Active nav indicator: left vertical glow beam (`::before` 3.5px wide, 22px high, radius 4px, background `var(--accent)`) + subtle gradient fill `linear-gradient(90deg, var(--accent-subtle-bg) 0%, transparent 100%)`.
  - Grid column structure: `grid-template-columns: 44px 1fr;` ensuring icon position is strictly fixed at 44px during collapse/expand.
  - Smooth label transition: `opacity` + `transform: translate3d(-8px, 0, 0)` + `filter: blur(...)`. Preserve `_detachSidebarLabels()` & `_attachSidebarLabels()`.

- [ ] **Step 4: Seamless 3D Arc Flashcard Flip**
  - `.flashcard-stage { perspective: 1600px; }`.
  - `.flashcard-card` uses `transform-style: preserve-3d; transition: transform 0.52s cubic-bezier(0.22, 1, 0.36, 1);`.
  - Add arc lift keyframe: 45% scale(1.035).
  - Smooth spin transition on card swap in `rateFlashcard`.

- [ ] **Step 5: Verify test suite**
  - Run `npm test`.

---

### Task 4: Phase 4 — Mode 5 "Ôn theo Môn & Chương" & SM-2 Mastery Distribution Overhaul

**Files:**
- Modify: `index.html`
- Modify: `js/app.js`
- Modify: `css/style.css`

- [ ] **Step 1: Update Mode 5 UI & Dual Picker Modal**
  - In `index.html`: Update Mode 5 title to `5. Ôn theo Môn & Chương` and description.
  - Update `#modal-topic-picker`: Dual section tabs/containers:
    - Section 1: Study by Subject (list of subjects with "Ôn cả môn" and click-to-filter chapters).
    - Section 2: Study by Chapter (list of chapters with question counts, multi-select checkboxes, and start button).
  - In `js/app.js`: Update `openTopicPickerModal()`, handle subject selection, chapter aggregation, and filtered session launch.

- [ ] **Step 2: Redesign SM-2 Retention Distribution in `#view-stats`**
  - Add SM-2 Stacked Mastery Spectrum Bar (`#sm2-mastery-spectrum-bar`, height: 14px, radius 999px) with 4 segment fills: `#sm2-bar-new`, `#sm2-bar-learning`, `#sm2-bar-review`, `#sm2-bar-mastered`.
  - Upgrade the 4 `.sm2-stage-card` elements:
    - Numbers font size `clamp(2.0rem, 3.2vw, 2.75rem)`, `font-weight: 800`, `tabular-nums`.
    - Percentage badges `#stat-pct-new`, `#stat-pct-learning`, `#stat-pct-review`, `#stat-pct-mastered`.
    - Descriptive cycle subtitles: `Chưa học lần nào`, `Chu kỳ ngắn < 3 ngày`, `Chu kỳ củng cố 3–21 ngày`, `Trí nhớ dài hạn > 21 ngày`.
  - In `js/app.js` (`renderStatsView`): Calculate counts, percentages, and update bar segment widths and badge texts.

- [ ] **Step 3: Verify test suite**
  - Run `npm test`.

---

### Task 5: Phase 5 — 144+ FPS Deck Library, White-Orange Contrast & Mobile Ergonomics

**Files:**
- Modify: `css/style.css`
- Modify: `css/theme.css`

- [ ] **Step 1: Eradicate repetitive `backdrop-filter` in long lists for 144+ FPS**
  - Limit `backdrop-filter: blur(...)` to only 3 top-level elements (`.app-sidebar`, `.topbar-hud-capsule` / `.bottom-nav`, `.modal-box`).
  - Set `backdrop-filter: none !important; -webkit-backdrop-filter: none !important;` on `.deck-card`, `.subject-group`, `.bank-card-item`, `.study-mode-card`, `.lms-preview-card`.
  - Replace with Optical Liquid Glass Surface (semi-transparent gradient + specular inset rim + shadow).
  - Add `content-visibility: auto; contain-intrinsic-size: 0 260px;` on `.subject-group` and `.bank-card-item`.

- [ ] **Step 2: Perfect White-Orange Contrast**
  - In `[data-theme="white-orange"]`:
    - Quiz questions: `#1c1410 !important; font-weight: 700;`.
    - Quiz options: background `rgba(255, 255, 255, 0.82) !important`, border `1.5px solid rgba(234, 88, 12, 0.25) !important`, text `#1c1410 !important`, option letter `#c2410c !important`.
    - Correct options: Forest green text `#064e3b !important`, border `#059669 !important`, background `rgba(16, 185, 129, 0.20) !important`.
    - Incorrect options: Deep red text `#7f1d1d !important`, border `#dc2626 !important`, background `rgba(239, 68, 68, 0.16) !important`.
    - Explanation boxes: background `rgba(255, 247, 237, 0.90) !important`, border-left `4px solid #ea580c !important`, text `#29201a !important`.
    - Flashcard answer text: `#047857 !important` or `#c2410c !important`.

- [ ] **Step 3: Mobile Layout Ergonomics**
  - Position `.topbar-hud-capsule` neatly in top-right of mobile view without overlapping headers.
  - Liquid glass `.bottom-nav` with monochrome SVGs, compact active indicator pill that does not exceed nav height.
  - Test at 375px, 414px, 768px viewports for zero horizontal overflow.

- [ ] **Step 4: Verify test suite**
  - Run `npm test`, `tests/test-round35...`, `tests/test-round39...`, `tests/test-round40...`.

---

### Task 6: Phase 6 — Full Verification, Documentation & Handoff

**Files:**
- Create: `docs/handoff/PROGRESS-1E.md`
- Modify: `PRODUCT.md`
- Modify: `DESIGN.md`

- [ ] **Step 1: Run comprehensive tests and build**
  - Run `npm test` (all 283+ tests must pass).
  - Run `npm run build` (build must succeed).
  - Ensure zero orphaned `node server.js` processes.

- [ ] **Step 2: Update documentation**
  - Create `docs/handoff/PROGRESS-1E.md` with complete checklist of all 5 phases.
  - Update `DESIGN.md` and `PRODUCT.md` reflecting the 6 token groups, monochrome SVG system, Mode 5 Subject/Chapter feature, and 144 FPS optical glass architecture.

- [ ] **Step 3: Commit all changes**
  - Clean git status and verify commit history.
