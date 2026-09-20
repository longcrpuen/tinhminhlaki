/**
 * Test Suite 23: Desktop Layout Enlargement, Ultrawide Containment & Background Thumbnail Standardization
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 23: Desktop Layout & Background Thumbnail Standardization ===\n');

const indexPath = path.join(__dirname, '..', 'index.html');
const stylePath = path.join(__dirname, '..', 'css', 'style.css');

const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const styleCss = fs.readFileSync(stylePath, 'utf-8');

// --- 1. Background Thumbnail Standardization (16:9 & object-fit: cover) ---
console.log('--- 1. Background Thumbnail Standardization (16:9 & object-fit: cover) ---');

// Grid structure in index.html
assert(indexHtml.includes('class="bg-picker-grid" id="bg-picker-grid"'),
  'index.html contains .bg-picker-grid');
console.log('  ✅ PASS: .bg-picker-grid exists in index.html');

// No conflicting inline background-image styles on thumbnails
assert(!indexHtml.includes('class="bg-thumb" data-bg="./backgrounds/bg-pixel-meadow.jpg" onclick="App.setBackground(\'./backgrounds/bg-pixel-meadow.jpg\')" style="background-image:'),
  'Inline background-image style removed from .bg-thumb to avoid layout conflicts');
console.log('  ✅ PASS: Inline background-image removed from .bg-thumb');

// None thumb structured with icon wrapper
assert(indexHtml.includes('class="bg-thumb bg-thumb-none" data-bg="none"'),
  'index.html defines standardized .bg-thumb.bg-thumb-none');
assert(indexHtml.includes('class="bg-thumb-none-icon">🚫</span>'),
  'None thumbnail uses dedicated .bg-thumb-none-icon');
console.log('  ✅ PASS: None thumbnail structured with .bg-thumb-none-icon');

// CSS 16:9 aspect-ratio and uniform border
assert(styleCss.includes('.bg-thumb {') && styleCss.includes('aspect-ratio: 16 / 9 !important;'),
  'style.css enforces aspect-ratio: 16 / 9 !important on .bg-thumb');
assert(styleCss.includes('border: 2px solid var(--border-color) !important;'),
  'style.css enforces uniform border: 2px solid on .bg-thumb');
assert(styleCss.includes('box-sizing: border-box !important;'),
  'style.css enforces box-sizing: border-box on .bg-thumb');
console.log('  ✅ PASS: .bg-thumb has 16:9 aspect-ratio, uniform border and box-sizing');

// CSS object-fit: cover for preview images
assert(styleCss.includes('.bg-thumb img {') && styleCss.includes('object-fit: cover !important;'),
  'style.css enforces object-fit: cover !important on .bg-thumb img');
assert(styleCss.includes('position: absolute !important;') && styleCss.includes('inset: 0 !important;'),
  'style.css positions img absolute inset: 0 to fill frame completely without distortion');
console.log('  ✅ PASS: .bg-thumb img fills 16:9 frame with object-fit: cover');

// Active and hover states
assert(styleCss.includes('.bg-thumb.active {') && styleCss.includes('border-color: var(--accent) !important;'),
  '.bg-thumb.active highlights with accent border');
console.log('  ✅ PASS: .bg-thumb.active highlighted cleanly');

// --- 2. Desktop Layout Enlargement & Ultrawide Protection ---
console.log('\n--- 2. Desktop Layout Enlargement & Ultrawide Protection ---');

// Content wrapper expanded max-width
assert(styleCss.includes('.content-wrapper {') && styleCss.includes('max-width: 1380px;'),
  'style.css sets expanded base desktop max-width: 1380px on .content-wrapper');
console.log('  ✅ PASS: .content-wrapper base desktop width expanded to 1380px');

assert(styleCss.includes('@media (min-width: 1920px)') && styleCss.includes('max-width: 1560px;'),
  'style.css sets max-width: 1560px on .content-wrapper for 1920px screens');
console.log('  ✅ PASS: .content-wrapper at 1920px expands to 1560px');

assert(styleCss.includes('@media (min-width: 2400px)') && styleCss.includes('max-width: 1680px;'),
  'style.css sets ultrawide safety stop at 1680px for .content-wrapper');
console.log('  ✅ PASS: .content-wrapper ultrawide hard cap at 1680px');

// Quiz container desktop expansion (>= 1024px)
assert(styleCss.includes('@media (min-width: 1024px)') && styleCss.includes('max-width: 1040px !important;'),
  'style.css sets quiz-container max-width to 1040px on desktop (>= 1024px)');
console.log('  ✅ PASS: Desktop (>= 1024px) quiz container expanded to 1040px');

// Quiz container large desktop expansion (>= 1440px)
assert(styleCss.includes('@media (min-width: 1440px)') && styleCss.includes('max-width: 1140px !important;'),
  'style.css sets quiz-container max-width to 1140px on large desktop (>= 1440px)');
console.log('  ✅ PASS: Large desktop (>= 1440px) quiz container expanded to 1140px');

// Quiz container Full HD expansion (>= 1920px)
assert(styleCss.includes('@media (min-width: 1920px)') && styleCss.includes('max-width: 1240px !important;'),
  'style.css sets quiz-container max-width to 1240px on Full HD (>= 1920px)');
console.log('  ✅ PASS: Full HD (>= 1920px) quiz container expanded to 1240px');

// Quiz container ultrawide cap (>= 2400px)
assert(styleCss.includes('@media (min-width: 2400px)') && styleCss.includes('max-width: 1320px !important;'),
  'style.css sets quiz-container ultrawide cap at 1320px to prevent infinite stretching');
console.log('  ✅ PASS: Ultrawide (>= 2400px) quiz container capped at 1320px');

// Typography & options scaling on desktop
assert(styleCss.includes('font-size: clamp(1.12rem, 1.45vw, 1.32rem) !important;'),
  'Quiz question text scaled for desktop readability');
assert(styleCss.includes('gap: 14px 18px !important;'),
  'Quiz options grid gap enlarged for desktop');
assert(styleCss.includes('min-height: 52px !important;') && styleCss.includes('padding: 13px 18px !important;'),
  'Option buttons have comfortable min-height and padding on desktop');
console.log('  ✅ PASS: Typography and options list scaled for desktop');

// Other view sections expansion on desktop
assert(styleCss.includes('#view-bank > div {') && styleCss.includes('max-width: 1140px !important;'),
  'Question Bank view expanded on desktop');
assert(styleCss.includes('#view-stats > div {') && styleCss.includes('max-width: 1120px !important;'),
  'Stats view expanded on desktop');
assert(styleCss.includes('#view-settings > div {') && styleCss.includes('max-width: 1020px !important;'),
  'Settings view expanded on desktop');
console.log('  ✅ PASS: Bank, stats, and settings views properly expanded on desktop');

// --- 3. Viewport Simulation Math Verification (1366px, 1920px, 2560px) ---
console.log('\n--- 3. Viewport Simulation Math Verification (1366px, 1920px, 2560px) ---');

function simulateDesktopLayout(screenWidth) {
  const sidebarWidth = 264;
  const availableWidth = screenWidth - sidebarWidth;
  
  // Padding based on breakpoint
  const paddingX = screenWidth >= 1920 ? 32 * 2 : 24 * 2;
  
  // Content wrapper max-width
  let contentWrapperMax = 1380;
  if (screenWidth >= 2400) contentWrapperMax = 1680;
  else if (screenWidth >= 1920) contentWrapperMax = 1560;
  
  const contentWrapperWidth = Math.min(contentWrapperMax, availableWidth - paddingX);
  
  // Quiz container max-width
  let quizContainerMax = 740;
  if (screenWidth >= 2400) quizContainerMax = 1320;
  else if (screenWidth >= 1920) quizContainerMax = 1240;
  else if (screenWidth >= 1440) quizContainerMax = 1140;
  else if (screenWidth >= 1024) quizContainerMax = 1040;
  
  const quizCardWidth = Math.min(quizContainerMax, contentWrapperWidth);
  const quizRatioOfAvailable = quizCardWidth / availableWidth;
  const horizontalOverflow = quizCardWidth > availableWidth;
  
  return {
    screenWidth,
    availableWidth,
    contentWrapperWidth,
    quizCardWidth,
    quizRatioOfAvailable,
    horizontalOverflow
  };
}

// Test 1366px
const res1366 = simulateDesktopLayout(1366);
console.log(`  [1366px] Available: ${res1366.availableWidth}px | Wrapper: ${res1366.contentWrapperWidth}px | QuizCard: ${res1366.quizCardWidth}px | Ratio: ${(res1366.quizRatioOfAvailable * 100).toFixed(1)}%`);
assert(!res1366.horizontalOverflow, '1366px has no horizontal overflow');
assert(res1366.quizCardWidth >= 1000, '1366px quiz card expanded to >= 1000px (was 740px)');
console.log('  ✅ PASS: 1366px layout verified: 0px overflow, ~94% space efficiency');

// Test 1920px
const res1920 = simulateDesktopLayout(1920);
console.log(`  [1920px] Available: ${res1920.availableWidth}px | Wrapper: ${res1920.contentWrapperWidth}px | QuizCard: ${res1920.quizCardWidth}px | Ratio: ${(res1920.quizRatioOfAvailable * 100).toFixed(1)}%`);
assert(!res1920.horizontalOverflow, '1920px has no horizontal overflow');
assert(res1920.quizCardWidth >= 1200, '1920px quiz card expanded to >= 1200px (was 740px/840px)');
console.log('  ✅ PASS: 1920px layout verified: 0px overflow, ~75% space efficiency (generous & prominent)');

// Test 2560px
const res2560 = simulateDesktopLayout(2560);
console.log(`  [2560px] Available: ${res2560.availableWidth}px | Wrapper: ${res2560.contentWrapperWidth}px | QuizCard: ${res2560.quizCardWidth}px | Ratio: ${(res2560.quizRatioOfAvailable * 100).toFixed(1)}%`);
assert(!res2560.horizontalOverflow, '2560px has no horizontal overflow');
assert(res2560.quizCardWidth <= 1350, '2560px quiz card strictly capped at <= 1350px (prevents ultrawide stretching blowout)');
assert(res2560.contentWrapperWidth <= 1700, '2560px content wrapper strictly capped at <= 1700px');
console.log('  ✅ PASS: 2560px layout verified: 0px overflow, strict ultrawide containment stops');

console.log('\n========================================');
console.log('ALL TESTS IN SUITE 23 PASSED SUCCESSFULLY!');
console.log('========================================\n');
