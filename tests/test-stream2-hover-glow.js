/**
 * Test Suite for Stream 2: Dynamic Spotlight & Hover Glow System
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE: Stream 2 (Dynamic Spotlight & Hover Glow) ===\n');

const styleCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

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

// 1. Dynamic Spotlight JS Engine
test('1.1: App implements initSpotlightHover with pointermove delegation and requestAnimationFrame', () => {
  assert(appJs.includes('initSpotlightHover()'), 'App implements initSpotlightHover');
  assert(appJs.includes("matchMedia('(hover: hover) and (pointer: fine)')"), 'Checks for fine pointer and hover support');
  assert(appJs.includes("addEventListener('pointermove'"), 'Uses delegated pointermove event listener');
  assert(appJs.includes('requestAnimationFrame'), 'Uses requestAnimationFrame to throttle variable updates');
  assert(appJs.includes("--mx") && appJs.includes("--my"), 'Updates --mx and --my CSS variables');
  assert(appJs.includes('this.initSpotlightHover()'), 'App invokes initSpotlightHover in event setup');
});

// 2. Spotlight CSS Pseudo-Elements on Cards & Buttons
test('2.1: CSS defines pseudo-element spotlight with radial-gradient on cards and buttons', () => {
  assert(styleCss.includes('@media (hover: hover) and (pointer: fine)'), 'Encapsulates hover effects inside fine pointer media query');
  assert(styleCss.includes('.deck-card::before'), 'Deck cards have spotlight ::before layer');
  assert(styleCss.includes('.stat-card::before'), 'Stat cards have spotlight ::before layer');
  assert(styleCss.includes('.quiz-card::before'), 'Quiz cards have spotlight ::before layer');
  assert(styleCss.includes('.bank-card-item::before'), 'Bank card items have spotlight ::before layer');
  assert(styleCss.includes('.btn-primary::before'), 'Primary buttons have spotlight ::before layer');
  assert(styleCss.includes('radial-gradient'), 'Uses radial-gradient for mouse spotlight');
  assert(styleCss.includes('var(--mx, 50%) var(--my, 50%)'), 'Spotlight coordinates bind to --mx and --my');
});

// 3. GPU Offloaded Transitions & Inset Glow (Clip-safe)
test('3.1: Hover effects animate opacity and transform, avoiding outward clip', () => {
  assert(styleCss.includes('opacity: 0;') && styleCss.includes('opacity: 1;'), 'Spotlight fades in via opacity 0 -> 1');
  assert(styleCss.includes('inset 0 0 16px rgba(167, 139, 250'), 'Uses clip-safe inset glow');
  assert(styleCss.includes('transform: translateY(-3px) translateZ(0)'), 'Uses hardware accelerated translateY');
});

// 4. Mobile / Touch Isolation & Accessibility
test('4.1: Mobile devices have hover disabled and active press feedback; reduced motion respected', () => {
  assert(styleCss.includes('@media (hover: none), (pointer: coarse)'), 'Defines touch device isolation');
  assert(styleCss.includes('.deck-card:active'), 'Defines crisp active touch feedback');
  assert(styleCss.includes('@media (prefers-reduced-motion: reduce)'), 'Defines prefers-reduced-motion safety');
});

console.log(`\nStream 2 Verification Summary: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
