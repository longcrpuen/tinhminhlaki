# Implementation Plan: Phase 1f — Zero Purple Bleed, Zero Color Emoji, Liquid Glass Popups & HUD, Dashboard Reorder & Mode 5

**Spec File:** `docs/promt/promt1f.md`  
**Target:** TinhMinhLaKey PWA  
**Branch:** `main` (Backup: `backup-before-1f`)

---

## 1. Objectives & Guardrails
- **Zero Hardcoded Purple Tokens:** Completely eliminate hardcoded `#8b5cf6`, `#7c3aed`, `#a78bfa`, `#131122`, `#12101e`, `rgba(36, 29, 58, ...)`, `rgba(124, 58, 237, ...)` in `css/style.css` and `js/app.js`.
- **Zero Color Emojis:** Convert all Unicode emojis (in IndexedDB defaults, question bank, decks, quiz, modals) to monochrome SVG icons (`stroke="currentColor"`).
- **Zero Data Loss:** Preserve IndexedDB database `MindSparksQuizDB`, card schemas, SM-2 algorithm, AI/LMS parsers.
- **Test Invariants:** Maintain 100% pass on `npm test` (all 283 tests) and `npm run build`. Never change the Vietnamese comment header in `css/theme.css` required by `test-runner.js`. Never append `@media (max-width: 768px)` at the end of `css/style.css` (keep last index for test 39). Preserve `App._detachSidebarLabels` & `App._attachSidebarLabels`.

---

## 2. File Modification Map
- `css/theme.css`: Add complete single-source-of-truth tokens (`--bg-glass-hud`, `--bg-glass-liquid`, `--btn-*-hover-*`, `--dropdown-*`, `--subject-pill-*`, `--battery-*`) across all 3 themes (`purple-pink` / `violet-rose`, `monochrome`, `white-orange`).
- `scripts/sanitize-1f.js`: Automated sanitization script targeting hardcoded purple colors in `css/style.css`.
- `css/style.css`: Apply sanitization, update sidebar nav button heights (44px), remove conflicting left vertical beams, update battery widget styling, update `.cyber-dropdown-*` to use variables, style modal liquid glass and HUD capsule, enhance white-orange resting card contrast, and configure Serif thick quote typography.
- `index.html`:
  - Remove `.due-count-badge` from `<li class="nav-item active" data-view="dashboard">`.
  - Reorder dashboard: place 7 study modes above decks grid under hero fold.
  - Convert emojis in `#modal-create-subject`, `#modal-session-complete`, question bank buttons to monochrome SVGs.
- `js/app.js`:
  - Implement `App.getMonoSvg(key)` and `App.renderSubjectIcon(iconKeyOrEmoji)` for 100% SVG icon rendering.
  - Remove hardcoded `style="color: ${s.color}; background: ${s.color}22; ..."` from subject badges, replacing with theme-aware classes.
  - Safeguard `#sidebar-due-badge` update logic.
  - Fix Mode 5 `openTopicPickerModal()` and `startTopicSession()` / `startTopicReview()` for smooth chapter filtering and session startup.
- `docs/handoff/PROGRESS-1F.md`: Record handoff report with checklist and verification outputs.
- `DESIGN.md` & `PRODUCT.md`: Synchronize design tokens and feature specifications.

---

## 3. Tasks Breakdown

### Task 1: Central Theme Tokens & Automated CSS Sanitization
- Add new token definitions in `css/theme.css` for `violet-rose`/`purple-pink`, `monochrome`, and `white-orange`.
- Create and execute `scripts/sanitize-1f.js` to replace hardcoded purple tokens in `css/style.css`.
- Verify remaining hardcoded purple count = 0 using Node grep.
- Run `npm test` to verify no syntax breaks.
- Commit: `feat(phase1f): theme tokens and automated purple sanitization`.

### Task 2: Sidebar Normalization (Items 1.1, 1.10)
- In `index.html`: Remove `.due-count-badge` from dashboard nav item.
- In `js/app.js`: Ensure `sidebar-due-badge` lookups are null-safe.
- In `css/style.css`: Remove `::before`/`::after` left vertical beam conflict; standardize all sidebar buttons to uniform 44px pill.
- Run `npm test` to verify sidebar detachment and suite 7 tests pass.
- Commit: `feat(phase1f): sidebar notification badge removal and pill animation sync`.

### Task 3: Energy Charge Battery Widget Overhaul (Items 1.2, 1.3)
- In `css/style.css`: Replace hardcoded neon/pink/purple in `.pixel-battery-*` with `--battery-*` tokens.
- Ensure Monochrome shows clean white/silver on dark matte, White-Orange shows warm ivory with vibrant orange segments.
- Run `npm test`.
- Commit: `feat(phase1f): theme-adaptive energy battery widget`.

### Task 4: Universal Monochrome SVG System (Items 1.4, 2.2)
- In `js/app.js`: Add `App.getMonoSvg(key)` and `App.renderSubjectIcon(icon)`.
- Replace emojis in subject badges, question bank actions, decks quickbar, and completion modal with monochrome SVGs.
- In `index.html`: Update `#modal-create-subject` with 20 SVG icon buttons.
- Run `npm test`.
- Commit: `feat(phase1f): universal monochrome svg icon helper and zero color emojis`.

### Task 5: Zero Inline Colors on Subject Badges & Cyber Dropdowns (Items 2.1, 3.1, 2.3, 3.2)
- In `js/app.js`: Strip `s.color` inline styling in `renderDecks`, `renderQuestionBank`, `renderSubjectFilterBar`, `renderSubjectPerformanceTable`, `openManageSubjectModal`, `openBulkReassignModal`.
- In `css/style.css`: Ensure `.cyber-dropdown-*` uses `--dropdown-*` tokens.
- Run test suites 37, 39, 40 and `npm test`.
- Commit: `feat(phase1f): zero inline subject colors and theme-driven cyber dropdowns`.

### Task 6: Dashboard Reorder & Mode 5 Dual Picker Fix (Item 1.12)
- In `index.html`: Move 7 study modes section above decks section in `#view-dashboard`.
- In `js/app.js`: Ensure `openTopicPickerModal()` and `startTopicReview()` open `#modal-topic-picker`, display subjects and chapters, and start session cleanly.
- Run `npm test`.
- Commit: `feat(phase1f): dashboard study modes reorder and mode 5 repair`.

### Task 7: White-Orange Contrast & Serif Quote Typography (Items 2.4, 2.5, 2.6)
- In `css/theme.css` / `css/style.css`: Set resting card borders (`1.5px solid rgba(234, 88, 12, 0.28)`) and warm shadow in `white-orange`.
- Configure serif thick quote headline (`font-family: 'Playfair Display', Georgia, serif !important; font-weight: 700; letter-spacing: -0.035em;`) and un-bolded italic accent (`font-weight: 400 !important; font-style: italic !important;`).
- Run `npm test`.
- Commit: `feat(phase1f): white-orange visual contrast and serif quote typography`.

### Task 8: Liquid Glass Popups & Topbar HUD (Items 1.8, 1.9, 1.11)
- In `css/style.css`: Style `.modal-box` with `var(--bg-glass-liquid)` and `backdrop-filter: blur(28px)`.
- Style `.topbar-hud-capsule` with `var(--bg-glass-hud)` and `backdrop-filter: blur(20px)`.
- Ensure mobile fast next buttons (`.btn-quiz-fast-next`, `.btn-quiz-card-next`) use `var(--btn-primary-bg)`.
- Run `npm test`.
- Commit: `feat(phase1f): liquid glass modals and topbar hud capsule`.

### Task 9: Full Quality Audit, Verification & Documentation
- Check remaining hardcoded purple count = 0.
- Run `npm test`, `test-round37`, `test-round39`, `test-round40`.
- Run `npm run build`.
- Ensure 0 orphaned processes.
- Generate `docs/handoff/PROGRESS-1F.md`, update `DESIGN.md` & `PRODUCT.md`.
- Final commit.
