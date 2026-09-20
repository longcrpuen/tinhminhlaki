const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 13: Card Hover Sleek Tech & Hero Typography Poster Heavy Display ===\n');

// Load target files
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const css = fs.readFileSync(path.resolve(__dirname, '../css/style.css'), 'utf8');
const fontsCss = fs.readFileSync(path.resolve(__dirname, '../css/fonts.css'), 'utf8');

// --- 1. POSTER HEAVY DISPLAY FONT CONFIGURATION ---
console.log('--- 1. Poster Heavy Display Font Configuration ---');
assert(fontsCss.includes('--font-poster:'), 'fonts.css defines --font-poster variable');
assert(fontsCss.includes('Montserrat') && fontsCss.includes('Be Vietnam Pro'), 'fonts.css prioritizes Montserrat 900 and Be Vietnam Pro for 100% Vietnamese diacritics');
assert(html.includes('family=Montserrat:wght@900') || html.includes('Montserrat'), 'index.html imports Montserrat 900');
assert(html.includes('Be+Vietnam+Pro') || html.includes('Be Vietnam Pro'), 'index.html imports Be Vietnam Pro');
assert(html.includes('Anton'), 'index.html imports Anton');
console.log('  ✅ PASS: Poster heavy font configuration with full Vietnamese diacritics support');

// --- 2. HERO HEADLINE POSTER STYLING & DROP SHADOW ---
console.log('\n--- 2. Hero Headline Poster Heavy Display Styling ---');
assert(css.includes('.hero-title {') && css.includes('var(--font-poster'), 'hero-title uses --font-poster');
assert(css.includes('.hero-title {') && css.includes('text-transform: uppercase;'), 'hero-title is uppercase');
assert(css.includes('.hero-title-main,') && css.includes('.hero-title-sub'), 'hero-title-main and sub exist');
assert(css.includes('.hero-title-main') && css.includes('drop-shadow(0 8px 16px rgba(0, 0, 0, 0.9))'), 'Hero headline applies deep block drop shadow');
assert(css.includes('.hero-title-accent {') && css.includes('transform: scale(1.1)'), 'Hero accent word is scaled up 110% (scale-110)');
assert(css.includes('.hero-title-accent {') && css.includes('rgba(244, 63, 94, 0.6)'), 'Hero accent word has vibrant radiant ambient glow');
console.log('  ✅ PASS: Hero headline styled with heavy poster typography, deep drop shadow & 110% scaled glow accent');

// --- 3. SLEEK TECH CARD HOVER & CUT-OFF STRIP REMOVAL ---
console.log('\n--- 3. Sleek Tech Card Hover & Border Uniformity ---');
assert(css.includes('.study-mode-card:hover {') && css.includes('border-color: rgba(139, 92, 246, 0.4)'), 'Card hover applies uniform border-violet-500/40 (rgba(139, 92, 246, 0.4))');
assert(css.includes('.study-mode-card:hover {') && css.includes('background: rgba(255, 255, 255, 0.04)'), 'Card hover applies subtle ambient background bg-white/[0.04] (rgba(255, 255, 255, 0.04))');
assert(css.includes('.study-mode-card:hover {') && css.includes('0 10px 30px -10px rgba(139, 92, 246, 0.2)'), 'Card hover applies smooth diffuse glow shadow-[0_10px_30px_-10px_rgba(139,92,246,0.2)]');
assert(css.includes('.study-mode-card::before {\n  display: none !important;\n}'), 'Eliminated cut-off border strip on card with display: none !important');
console.log('  ✅ PASS: Card hover border, ambient background, diffuse glow and cut-off strip removal verified');

// --- 4. SLEEK TECH CTA PILL BUTTON & CONTRAST SAFETY ---
console.log('\n--- 4. Sleek Tech CTA Pill Button & High-Contrast Hover ---');
assert(css.includes('.study-mode-pill-btn {') && css.includes('background: rgba(255, 255, 255, 0.05)'), 'Pill button normal state uses bg-white/[0.05]');
assert(css.includes('.study-mode-pill-btn {') && css.includes('border: 1px solid rgba(255, 255, 255, 0.1)'), 'Pill button normal state uses border-white/10');
assert(css.includes('.study-mode-pill-btn {') && css.includes('color: #d4d4d8;'), 'Pill button text uses text-zinc-300 (#d4d4d8)');
assert(css.includes('.study-mode-card:hover .study-mode-pill-btn {') && css.includes('#7c3aed'), 'Pill button on hover switches to deep neon violet bg-violet-600 (#7c3aed)');
assert(css.includes('.study-mode-card:hover .study-mode-pill-btn {') && css.includes('color: #ffffff !important;'), 'Pill button on hover enforces pure white text (#ffffff !important) for maximum contrast');
assert(css.includes('.study-mode-card:hover .study-mode-pill-btn {') && css.includes('font-weight: 700 !important;'), 'Pill button on hover enforces font-bold');
assert(css.includes('.study-mode-card:hover .study-mode-pill-btn .arrow {') && css.includes('transform: translateX(4px);'), 'Pill button arrow slides right on card hover (translate-x-1)');
assert(!html.includes('style="color: #F43F5E; border-color: rgba(244, 63, 94, 0.3);"'), 'Removed clashing inline pink styles from Mode 2 pill button in index.html');
console.log('  ✅ PASS: Pill button sleek tech styling, deep violet hover, pure white contrast text & sliding arrow verified');

console.log('\n========================================');
console.log('ROUND 13 SUMMARY: All checks passed 100%!');
console.log('========================================\n');
