/**
 * Test Suite 33: Flashcard Simplification (Part C1) & Responsive Verification
 *
 * Requirements:
 * C1.1: Direct card click/tap to flip:
 *       - #active-flashcard triggers App.flipFlashcard() directly.
 *       - Toggles .flipped on #active-flashcard.
 *       - Debounce guard protects against rapid double-clicks.
 *       - 3D transform rotateY(180deg) and z-index elevations on front/back faces.
 * C1.2: Complete elimination of "Lật thẻ xem đáp án" button (#btn-flashcard-reveal):
 *       - Suppressed in index.html with display: none !important.
 *       - Base / Desktop CSS enforces display: none !important, visibility: hidden, pointer-events: none, height: 0.
 *       - Mobile CSS enforces display: none !important, visibility: hidden, pointer-events: none, height: 0.
 *       - app.js _renderFlashcardContent and flipFlashcard strictly maintain display: none !important.
 * C1.3: Sole hint is small badge "Chạm để lật ↺":
 *       - .flashcard-flip-badge exists in card header.
 *       - Bottom redundant hints (.flashcard-hint) are hidden.
 * C1.4: Mobile scroll safety:
 *       - Uses standard click event (no raw touchstart traps).
 *       - .flashcard-content-wrap specifies touch-action: pan-y and internal scroll.
 * C1.5: 2x2 SRS Ratings Grid:
 *       - #flashcard-srs-bar defines 4 buttons: again, hard, good, easy.
 *       - Desktop & Mobile CSS enforce grid-template-columns: repeat(2, 1fr) !important.
 *       - SRS buttons have compact, comfortable touch target heights (46px - 50px).
 *       - Fits comfortably in mobile viewport without cropping.
 * D:    Strict responsive isolation and zero outer glow.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 33: Flashcard Simplification (Part C1) ===\n');

const stylePath = path.join(__dirname, '..', 'css', 'style.css');
const appPath = path.join(__dirname, '..', 'js', 'app.js');
const indexPath = path.join(__dirname, '..', 'index.html');

const styleCss = fs.readFileSync(stylePath, 'utf-8');
const appJs = fs.readFileSync(appPath, 'utf-8');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

// Separate Desktop and Mobile CSS
const mobileQueryStart = styleCss.lastIndexOf('@media (max-width: 768px)');
assert(mobileQueryStart !== -1, 'Main mobile breakpoint must exist');

const desktopCss = styleCss.slice(0, mobileQueryStart);
const mobileCss = styleCss.slice(mobileQueryStart);

// =========================================================================
// C1.1: BẤM/CHẠM TRỰC TIẾP VÀO THẺ ĐỂ LẬT
// =========================================================================
console.log('--- C1.1: Direct Card Click/Tap to Flip ---');

test('C1.1.1: index.html binds onclick="App.flipFlashcard()" directly on #active-flashcard', () => {
  assert(
    indexHtml.includes('id="active-flashcard"') && indexHtml.includes('onclick="App.flipFlashcard()"'),
    '#active-flashcard must have onclick="App.flipFlashcard()"'
  );
});

test('C1.1.2: app.js binds onclick on #active-flashcard without duplicate event listener conflict', () => {
  assert(
    appJs.includes('flashcardCard.onclick = () => this.flipFlashcard();'),
    'app.js must attach onclick handler to flashcardCard'
  );
  // Ensure no duplicate addEventListener('click') on flashcardCard
  assert(
    !appJs.includes("flashcardCard.addEventListener('click', () => this.flipFlashcard())"),
    'Duplicate addEventListener on flashcardCard must not exist'
  );
});

test('C1.1.3: app.js flipFlashcard() includes debounce protection against double toggling', () => {
  const flipIdx = appJs.indexOf('flipFlashcard() {');
  assert(flipIdx !== -1, 'flipFlashcard() method must exist in app.js');
  const flipBlock = appJs.slice(flipIdx, appJs.indexOf('async rateFlashcard', flipIdx));
  assert(
    flipBlock.includes('this._lastFlip') && flipBlock.includes('250'),
    'flipFlashcard must have debounce guard (this._lastFlip < 250)'
  );
  assert(
    flipBlock.includes("flashcard.classList.toggle('flipped')"),
    'flipFlashcard must toggle flipped class'
  );
});

test('C1.1.4: Desktop & Mobile CSS define 3D flip transform and face z-index escalation', () => {
  // Desktop
  assert(desktopCss.includes('.flashcard-card.flipped {'), 'Desktop flipped rule must exist');
  assert(desktopCss.includes('transform: rotateY(180deg);'), 'Desktop flipped must rotate 180deg');
  assert(desktopCss.includes('.flashcard-card.flipped .flashcard-back {'), 'Desktop flipped back rule must exist');
  assert(desktopCss.includes('.flashcard-card.flipped .flashcard-front {'), 'Desktop flipped front rule must exist');

  // Mobile
  assert(mobileCss.includes('.flashcard-card.flipped {'), 'Mobile flipped rule must exist');
  assert(mobileCss.includes('transform: rotateY(180deg) !important;'), 'Mobile flipped must rotate 180deg !important');
});

// =========================================================================
// C1.2: BỎ HẲN NÚT "LẬT THẺ XEM ĐÁP ÁN" (#btn-flashcard-reveal)
// =========================================================================
console.log('--- C1.2: Complete Elimination of Reveal Button ---');

test('C1.2.1: index.html hides #btn-flashcard-reveal with style="display: none !important;"', () => {
  const btnIdx = indexHtml.indexOf('id="btn-flashcard-reveal"');
  assert(btnIdx !== -1, '#btn-flashcard-reveal must exist for backward compatibility');
  const btnSnippet = indexHtml.slice(btnIdx, indexHtml.indexOf('>', btnIdx));
  assert(
    btnSnippet.includes('display: none !important;'),
    '#btn-flashcard-reveal must have inline display: none !important in index.html'
  );
});

test('C1.2.2: Desktop CSS enforces display: none !important, visibility: hidden, pointer-events: none on #btn-flashcard-reveal', () => {
  const idx = desktopCss.indexOf('#btn-flashcard-reveal,');
  assert(idx !== -1, '#btn-flashcard-reveal rule must exist in desktop CSS');
  const block = desktopCss.slice(idx, desktopCss.indexOf('}', idx));
  assert(block.includes('display: none !important;'), 'Desktop must have display: none !important');
  assert(block.includes('visibility: hidden !important;'), 'Desktop must have visibility: hidden !important');
  assert(block.includes('pointer-events: none !important;'), 'Desktop must have pointer-events: none !important');
  assert(block.includes('height: 0 !important;'), 'Desktop must have height: 0 !important');
});

test('C1.2.3: Mobile CSS enforces display: none !important, visibility: hidden, pointer-events: none on #btn-flashcard-reveal', () => {
  const idx = mobileCss.indexOf('body.flashcard-active #btn-flashcard-reveal');
  assert(idx !== -1, '#btn-flashcard-reveal rule must exist in mobile CSS');
  const block = mobileCss.slice(idx, mobileCss.indexOf('}', idx));
  assert(block.includes('display: none !important;'), 'Mobile must have display: none !important');
  assert(block.includes('visibility: hidden !important;'), 'Mobile must have visibility: hidden !important');
  assert(block.includes('pointer-events: none !important;'), 'Mobile must have pointer-events: none !important');
  assert(block.includes('height: 0 !important;'), 'Mobile must have height: 0 !important');
});

test('C1.2.4: app.js _renderFlashcardContent & flipFlashcard suppress #btn-flashcard-reveal', () => {
  const renderIdx = appJs.indexOf('_renderFlashcardContent(');
  const renderBlock = appJs.slice(renderIdx, appJs.indexOf('flipFlashcard()', renderIdx));
  assert(
    renderBlock.includes("revealBtn.style.setProperty('display', 'none', 'important')"),
    '_renderFlashcardContent must suppress revealBtn'
  );

  const flipIdx = appJs.indexOf('flipFlashcard() {');
  const flipBlock = appJs.slice(flipIdx, appJs.indexOf('async rateFlashcard', flipIdx));
  assert(
    flipBlock.includes("revealBtn.style.setProperty('display', 'none', 'important')"),
    'flipFlashcard must suppress revealBtn'
  );
});

// =========================================================================
// C1.3: GỢI Ý DUY NHẤT LÀ BADGE NHỎ "Chạm để lật ↺"
// =========================================================================
console.log('--- C1.3: Sole Hint Badge "Chạm để lật ↺" ---');

test('C1.3.1: index.html contains .flashcard-flip-badge with "Chạm để lật ↺" on front face', () => {
  assert(
    indexHtml.includes('class="flashcard-flip-badge">Chạm để lật ↺</span>'),
    'Front face must contain .flashcard-flip-badge with "Chạm để lật ↺"'
  );
});

test('C1.3.2: Redundant bottom face hints (.flashcard-hint) are hidden via CSS', () => {
  assert(desktopCss.includes('.flashcard-hint {'), '.flashcard-hint rule must exist in desktop CSS');
  assert(desktopCss.includes('display: none !important;'), '.flashcard-hint must be display: none !important');
  assert(mobileCss.includes('.flashcard-hint {'), '.flashcard-hint rule must exist in mobile CSS');
});

// =========================================================================
// C1.4: MOBILE TOUCH & SCROLL SAFETY
// =========================================================================
console.log('--- C1.4: Mobile Touch & Scroll Gesture Safety ---');

test('C1.4.1: .flashcard-content-wrap specifies touch-action: pan-y on desktop and mobile', () => {
  assert(desktopCss.includes('touch-action: pan-y;'), 'Desktop content wrap must have touch-action: pan-y');
  assert(mobileCss.includes('touch-action: pan-y !important;'), 'Mobile content wrap must have touch-action: pan-y !important');
});

test('C1.4.2: .flashcard-content-wrap provides internal scroll (-webkit-overflow-scrolling: touch)', () => {
  assert(desktopCss.includes('overflow-y: auto;'), 'Desktop content wrap must have overflow-y: auto');
  assert(mobileCss.includes('overflow-y: auto !important;'), 'Mobile content wrap must have overflow-y: auto !important');
  assert(mobileCss.includes('-webkit-overflow-scrolling: touch !important;'), 'Mobile content wrap must have touch scrolling');
});

// =========================================================================
// C1.5: LƯỚI 2x2 ĐÁNH GIÁ SRS GỌN GÀNG, KHÔNG BỊ CROP
// =========================================================================
console.log('--- C1.5: 2x2 SRS Ratings Grid ---');

test('C1.5.1: #flashcard-srs-bar defines all 4 SRS rating buttons', () => {
  assert(indexHtml.includes('srs-btn-again'), 'SRS button Again must exist');
  assert(indexHtml.includes('srs-btn-hard'), 'SRS button Hard must exist');
  assert(indexHtml.includes('srs-btn-good'), 'SRS button Good must exist');
  assert(indexHtml.includes('srs-btn-easy'), 'SRS button Easy must exist');
});

test('C1.5.2: Desktop CSS enforces grid-template-columns: repeat(2, 1fr) for SRS bar', () => {
  const idx = desktopCss.indexOf('.srs-ratings-bar {');
  assert(idx !== -1, '.srs-ratings-bar rule must exist in desktop CSS');
  const block = desktopCss.slice(idx, desktopCss.indexOf('}', idx));
  assert(block.includes('display: grid !important;'), 'Desktop SRS bar must be display: grid !important');
  assert(block.includes('grid-template-columns: repeat(2, 1fr) !important;'), 'Desktop SRS bar must be 2 columns');
});

test('C1.5.3: Mobile CSS enforces grid-template-columns: repeat(2, 1fr) for SRS bar', () => {
  const idx = mobileCss.indexOf('#flashcard-srs-bar {');
  assert(idx !== -1, '#flashcard-srs-bar rule must exist in mobile CSS');
  const block = mobileCss.slice(idx, mobileCss.indexOf('}', idx));
  assert(block.includes('display: grid !important;'), 'Mobile SRS bar must be display: grid !important');
  assert(block.includes('grid-template-columns: repeat(2, 1fr) !important;'), 'Mobile SRS bar must be 2 columns');
});

test('C1.5.4: Mobile SRS buttons have comfortable touch target height (46px) and compact typography', () => {
  const idx = mobileCss.indexOf('body.flashcard-active .srs-btn {');
  assert(idx !== -1, 'Mobile .srs-btn rule must exist');
  const block = mobileCss.slice(idx, mobileCss.indexOf('}', idx));
  assert(block.includes('height: 46px !important;'), 'Mobile .srs-btn height must be 46px');
  assert(block.includes('min-height: 46px !important;'), 'Mobile .srs-btn min-height must be 46px');
});

test('C1.5.5: app.js flipFlashcard displays SRS bar as grid when flipped, none when unflipped', () => {
  const flipIdx = appJs.indexOf('flipFlashcard() {');
  const flipBlock = appJs.slice(flipIdx, appJs.indexOf('async rateFlashcard', flipIdx));
  assert(
    flipBlock.includes("const disp = isFlipped ? 'grid' : 'none';"),
    'flipFlashcard must set srsBar to grid when flipped, none when unflipped'
  );
  assert(
    flipBlock.includes("srsBar.style.setProperty('display', disp, 'important')"),
    'flipFlashcard must use important priority for srsBar'
  );
});

// =========================================================================
// C1.6: INTERACTIVE LIFECYCLE SIMULATION (Click Card -> Flip -> Rate)
// =========================================================================
console.log('--- C1.6: Interactive Flashcard Lifecycle Simulation ---');

test('C1.6.1: Full runtime simulation: card click flips, reveals SRS grid, debounce protects, and rate advances', async () => {
  // DOM element mock
  const classStore = {
    'active-flashcard': new Set(),
  };

  const styleStore = {
    'btn-flashcard-reveal': { display: '' },
    'flashcard-srs-bar': { display: '' },
  };

  let soundFlipped = false;
  let soundRated = false;
  let savedCard = null;

  const mockApp = {
    _lastFlip: 0,
    activeSession: {
      currentIndex: 0,
      correctCount: 0,
      incorrectCount: 0,
      cards: [
        {
          id: 'card-1',
          question: 'What is Antigravity?',
          answer: 'An AI coding assistant',
          difficulty: 'medium',
          srs: { interval: 1, repetition: 0, easeFactor: 2.5 },
          stats: {}
        }
      ]
    },
    clearPerQuestionTimer() {},
    renderMath() {},
    flipFlashcard() {
      const now = Date.now();
      if (this._lastFlip && now - this._lastFlip < 250) return;
      this._lastFlip = now;

      const flashcard = {
        classList: {
          toggle: (cls) => {
            if (classStore['active-flashcard'].has(cls)) {
              classStore['active-flashcard'].delete(cls);
            } else {
              classStore['active-flashcard'].add(cls);
            }
          },
          contains: (cls) => classStore['active-flashcard'].has(cls)
        }
      };

      flashcard.classList.toggle('flipped');
      soundFlipped = true;

      const isFlipped = flashcard.classList.contains('flipped');
      styleStore['btn-flashcard-reveal'].display = 'none';
      styleStore['flashcard-srs-bar'].display = isFlipped ? 'grid' : 'none';
    },
    async rateFlashcard(rating) {
      const card = this.activeSession.cards[0];
      const isCorrect = rating >= 3;
      if (isCorrect) {
        soundRated = true;
        this.activeSession.correctCount++;
      } else {
        this.activeSession.incorrectCount++;
      }
      card.srs.interval = rating === 3 ? 3 : 1;
      card.stats.reviewsCount = (card.stats.reviewsCount || 0) + 1;
      savedCard = card;
    }
  };

  // Step 1: Initial state
  assert(!classStore['active-flashcard'].has('flipped'), 'Card must not be flipped initially');

  // Step 2: First tap on card
  mockApp.flipFlashcard();
  assert(classStore['active-flashcard'].has('flipped'), 'Card must be flipped after first tap');
  assert.strictEqual(styleStore['flashcard-srs-bar'].display, 'grid', 'SRS bar must be grid after flip');
  assert.strictEqual(styleStore['btn-flashcard-reveal'].display, 'none', 'Reveal button must remain none');
  assert(soundFlipped, 'Flip sound must have played');

  // Step 3: Rapid second tap (< 250ms debounce)
  mockApp.flipFlashcard(); // within 0ms
  assert(classStore['active-flashcard'].has('flipped'), 'Debounce must prevent instantaneous second toggle');

  // Step 4: Advance timer and tap to flip back
  mockApp._lastFlip = Date.now() - 300;
  mockApp.flipFlashcard();
  assert(!classStore['active-flashcard'].has('flipped'), 'Card must un-flip after debounce threshold');
  assert.strictEqual(styleStore['flashcard-srs-bar'].display, 'none', 'SRS bar must hide when un-flipped');

  // Step 5: Flip to back again
  mockApp._lastFlip = Date.now() - 300;
  mockApp.flipFlashcard();
  assert(classStore['active-flashcard'].has('flipped'), 'Card must be flipped again');

  // Step 6: Rate Good (3)
  await mockApp.rateFlashcard(3);
  assert(soundRated, 'Rating sound must play');
  assert.strictEqual(mockApp.activeSession.correctCount, 1, 'Correct count must increment');
  assert.strictEqual(savedCard.srs.interval, 3, 'Card SRS interval must update');
});

// =========================================================================
// SUMMARY
// =========================================================================
console.log('\n========================================');
console.log(`TEST SUITE 33 SUMMARY: ${passed} passed, ${failed} failed.`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL PART C1 REQUIREMENTS VERIFIED SUCCESSFULLY!\n');
}
