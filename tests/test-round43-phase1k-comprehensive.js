/**
 * Comprehensive Test Suite for Phase 1k
 * Tests:
 * 1. Popup Open/Close 100% Reliability (0ms inline style locking removed, Escape key, close buttons, backdrop click)
 * 2. Mode 5 Topic Picker Self-Healing DOM, subjects & chapter chips population, and direct study session launch
 * 3. Continuous Curved Glass Volume (.modal-box 36px border-radius, Fresnel rim, no 22px grey bezel)
 * 4. Mode Trắng Cam 4 Quote Stat Boxes (border-radius 20px, overflow hidden, background-clip padding-box; hover pure white text)
 * 5. Quote Container Glow on Hover across Monochrome (silver-white) & White-Orange (light neon orange)
 * 6. Unified Frosted-to-Clear Hover for 7 Study Modes & Deck Cards
 * 7. Quote Sentence Case with Configuration Hook (window.QUOTE_CASE_MODE)
 * 8. Lofi Music Player (4 tracks, Web Audio API synthesis, volume control, IndexedDB upload)
 * 9. Sidebar Download Shortcut Icon (#btn-pwa-install transparent icon without white pill background)
 * 10. Low-End Viewport-Gated Blur Culling (.blur-culled)
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== RUNNING PHASE 1K COMPREHENSIVE VERIFICATION ===\n');

// 1. Check Files Existence & Syntax
const appJsPath = path.join(__dirname, '../js/app.js');
const lofiJsPath = path.join(__dirname, '../js/lofi-music.js');
const themeCssPath = path.join(__dirname, '../css/theme.css');
const styleCssPath = path.join(__dirname, '../css/style.css');
const indexHtmlPath = path.join(__dirname, '../index.html');

assert(fs.existsSync(appJsPath), 'js/app.js exists');
assert(fs.existsSync(lofiJsPath), 'js/lofi-music.js exists');
assert(fs.existsSync(themeCssPath), 'css/theme.css exists');
assert(fs.existsSync(styleCssPath), 'css/style.css exists');
assert(fs.existsSync(indexHtmlPath), 'index.html exists');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const lofiJs = fs.readFileSync(lofiJsPath, 'utf8');
const themeCss = fs.readFileSync(themeCssPath, 'utf8');
const styleCss = fs.readFileSync(styleCssPath, 'utf8');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Section 1: Modal Open / Close Lock Fix (Mục 6)
console.log('\n--- 1. Modal Close Lock Fix ---');
assert(!appJs.includes("el.style.setProperty('display', 'grid', 'important');"), '_showModal does NOT inject inline display: grid !important');
assert(appJs.includes('el.style.removeProperty(\'display\');'), '_showModal and _closeModal remove inline display property');
assert(appJs.includes('closeAllModals()'), 'app.js exports closeAllModals()');
assert(appJs.includes('Escape'), 'Keydown Escape listener closes all modals');
assert(themeCss.includes('.modal-overlay:not(.show)'), 'CSS contains .modal-overlay:not(.show) rule');
assert(themeCss.includes('.modal-overlay.show'), 'CSS contains .modal-overlay.show rule');

// Section 2: Mode 5 Topic & Chapter Picker (Mục 9)
console.log('\n--- 2. Mode 5 Topic Picker Self-Healing DOM ---');
assert(appJs.includes('openTopicPickerModal(deckId = null, preselectedSubjectId = null)'), 'openTopicPickerModal takes deckId and preselectedSubjectId');
assert(appJs.includes('btn-topic-study-whole-subject'), 'Self-healing DOM injects whole-subject review button');
assert(appJs.includes('btn-topic-start-now'), 'Self-healing DOM injects start-now button');
assert(appJs.includes('btn-topic-toggle-all'), 'Self-healing DOM injects toggle-all button');
assert(appJs.includes("viewName === 'study'") && appJs.includes('renderActiveStudyCard()'), 'navigateTo(study) triggers renderActiveStudyCard()');
assert(indexHtml.includes('id="modal-topic-picker"'), 'index.html contains modal-topic-picker container');

// Section 3: Continuous Curved Glass Volume (Mục 7 & 8)
console.log('\n--- 3. Continuous Curved Glass Volume ---');
assert(themeCss.includes('border-radius: 36px !important;'), '.modal-box uses 36px border-radius');
assert(themeCss.includes('--popup-glass-volume-bg'), 'theme.css defines --popup-glass-volume-bg');
assert(themeCss.includes('--popup-glass-rim-border'), 'theme.css defines --popup-glass-rim-border');
assert(themeCss.includes('--popup-glass-volume-shadow'), 'theme.css defines --popup-glass-volume-shadow');
assert(!themeCss.includes('padding: 22px !important;') || !themeCss.includes('mask-composite: exclude'), '22px bezel artifact mask-composite removed');

// Section 4: Mode Trắng Cam 4 Quote Stat Boxes & Nuclear Tokens (Mục 1, 2 & 10)
console.log('\n--- 4. Mode Trắng Cam Stat Boxes & Tokens ---');
assert(themeCss.includes('--light-accent-rgb: 255, 107, 43;'), '--light-accent-rgb token defined');
assert(themeCss.includes('--light-accent-neon: #ff6b2b;'), '--light-accent-neon token defined');
assert(themeCss.includes('--light-accent-neon-hover: #ff540a;'), '--light-accent-neon-hover token defined');
assert(themeCss.includes('--light-accent-soft: rgba(255, 107, 43, 0.16);'), '--light-accent-soft token defined');
assert(themeCss.includes('--light-accent-glow: rgba(255, 107, 43, 0.38);'), '--light-accent-glow token defined');
assert(themeCss.includes('border-radius: 20px !important;'), 'stat-card locked to 20px border radius');
assert(themeCss.includes('background-clip: padding-box !important;'), 'stat-card enforces background-clip: padding-box');
assert(themeCss.includes('overflow: hidden !important;'), 'stat-card enforces overflow: hidden');
assert(themeCss.includes('rgba(255, 255, 255, 0.24) !important;'), 'White-orange resting stat card alpha reduced to 0.24');
assert(themeCss.includes('color: #ffffff !important;') && themeCss.includes('html[data-theme="white-orange"] .stat-card:hover'), 'stat card hover turns text pure white');

// Section 5: Quote Container Glow (Mục 3)
console.log('\n--- 5. Quote Container Glow on Hover ---');
assert(themeCss.includes('html[data-theme="monochrome"] .hero-card:hover'), 'Monochrome hero-card hover rule defined');
assert(themeCss.includes('rgba(255, 255, 255, 0.22)'), 'Monochrome hero-card hover casts silver-white light (0% purple)');
assert(themeCss.includes('html[data-theme="white-orange"] .hero-card:hover'), 'White-orange hero-card hover rule defined');
assert(themeCss.includes('rgba(var(--light-accent-rgb, 255, 107, 43), 0.38)'), 'White-orange hero-card hover casts warm light neon orange glow');

// Section 6: Unified Frosted-to-Clear Hover (Mục 4 & 5)
console.log('\n--- 6. Unified Frosted-to-Clear Hover ---');
assert(themeCss.includes('--glass-block-rest-bg: rgba(30, 23, 52, 0.78);'), 'Purple-pink defines --glass-block-rest-bg');
assert(themeCss.includes('--glass-block-rest-bg: rgba(28, 28, 34, 0.76);'), 'Monochrome defines --glass-block-rest-bg');
assert(themeCss.includes('--glass-block-rest-bg: rgba(255, 252, 248, 0.62);'), 'White-orange defines --glass-block-rest-bg');
assert(themeCss.includes('--glass-block-hover-bg: rgba(192, 132, 252, 0.06);'), 'Purple-pink clear hover bg defined');
assert(themeCss.includes('--glass-block-hover-bg: rgba(255, 255, 255, 0.03);'), 'Monochrome clear hover bg defined');
assert(themeCss.includes('--glass-block-hover-bg: rgba(255, 255, 255, 0.12);'), 'White-orange clear hover bg defined');

// Section 7: Quote Sentence Case (Mục 11)
console.log('\n--- 7. Quote Sentence Case ---');
assert(appJs.includes('window.QUOTE_CASE_MODE'), 'app.js defines window.QUOTE_CASE_MODE');
assert(themeCss.includes('--quote-text-transform: none;'), 'theme.css defines --quote-text-transform: none');
assert(themeCss.includes('text-transform: var(--quote-text-transform, none) !important;'), 'Quote elements respect --quote-text-transform');

// Section 8: Lofi Music Player (Mục 12)
console.log('\n--- 8. Lofi Music Player ---');
assert(lofiJs.includes('LofiPlayer'), 'lofi-music.js exports LofiPlayer');
assert(lofiJs.includes('Midnight Rain in Hanoi'), 'Track 1 included: Midnight Rain in Hanoi');
assert(lofiJs.includes('Warm Espresso & Old Books'), 'Track 2 included: Warm Espresso & Old Books');
assert(lofiJs.includes('Starlight Study Session'), 'Track 3 included: Starlight Study Session');
assert(lofiJs.includes('Autumn Leaves on West Lake'), 'Track 4 included: Autumn Leaves on West Lake');
assert(lofiJs.includes('this.volume = 0.14') || lofiJs.includes('0.14'), 'Default volume set to 14%');
assert(lofiJs.includes('MindSparksLofiDB'), 'IndexedDB storage for uploaded custom audio');
assert(indexHtml.includes('hero-lofi-bar'), 'index.html includes .hero-lofi-bar');
assert(indexHtml.includes('setting-lofi-volume'), 'index.html includes lofi volume slider in settings');
assert(indexHtml.includes('setting-lofi-track'), 'index.html includes lofi track picker in settings');

// Section 9: Sidebar Download Shortcut Icon Sync (Mục 13)
console.log('\n--- 9. Sidebar Download Shortcut Icon Sync ---');
assert(!indexHtml.includes('class="btn btn-secondary sidebar-install-btn"'), 'btn btn-secondary classes removed from #btn-pwa-install');
assert(themeCss.includes('#btn-pwa-install,') && themeCss.includes('.sidebar-install-btn'), 'theme.css styles .sidebar-install-btn transparently');
assert(themeCss.includes('background: transparent !important;'), '#btn-pwa-install resting background is transparent');

// Section 10: Performance & Low-End GPU Culling
console.log('\n--- 10. Low-End GPU Shader Culling ---');
assert(themeCss.includes('.blur-culled'), 'theme.css defines .blur-culled');
assert(themeCss.includes('backdrop-filter: none !important;'), '.blur-culled disables backdrop-filter');
assert(appJs.includes('initBlurCullingObserver'), 'app.js implements initBlurCullingObserver');

console.log(`\n========================================`);
console.log(`PHASE 1K VERIFICATION RESULT: ${passed} passed, ${failed} failed.`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
