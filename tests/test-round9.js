// =========================================================================
// TEST SUITE: Round 9 Hero Typography, SM-2 Retention & Critical Overload
// =========================================================================

const fs = require('fs');
const http = require('http');

const html = fs.readFileSync('./index.html', 'utf8');
const fontsCss = fs.readFileSync('./css/fonts.css', 'utf8');
const styleCss = fs.readFileSync('./css/style.css', 'utf8');
const appJs = fs.readFileSync('./js/app.js', 'utf8');

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

console.log('=== TEST SUITE 9: Editorial Tech Hero, SM-2 Retention & Critical Overload ===\n');

// --- 1. HERO TYPOGRAPHY: EDITORIAL TECH CONTRAST ---
console.log('--- 1. Hero Editorial Typography ---');
assert(fontsCss.includes('--font-editorial:'), 'fonts.css defines --font-editorial variable');
assert(html.includes('hero-title-main') && html.includes('hero-title-accent'), 'index.html splits hero heading into foundation and accent spans');
assert(html.includes('TÔI') && html.includes('BẠN CŨNG THẾ'), 'Foundation text contains bold uppercase phrase');
assert(html.includes('NGU'), 'Accent text contains editorial script/serif phrase');
assert(styleCss.includes('.hero-title-main'), 'style.css styles .hero-title-main');
assert(styleCss.includes('.hero-title-accent'), 'style.css styles .hero-title-accent');
assert(styleCss.includes('font-family: var(--font-editorial'), 'hero-title-accent uses editorial serif font');
assert(styleCss.includes('font-style: italic'), 'hero-title-accent is styled with italic contrast');
assert(styleCss.includes('drop-shadow(0 10px 22px rgba(0, 0, 0, 0.75))'), 'Hero heading applies deep text drop shadow');

// --- 2. DASHBOARD DEDUPLICATION & SM-2 RETENTION WIDGET ---
console.log('\n--- 2. Dashboard Deduplication & SM-2 Retention Widget ---');
assert(html.includes('id="dashboard-battery-container" style="display: none;"'), 'Duplicate dashboard battery is hidden from user view');
assert(html.includes('id="dashboard-retention-card"'), 'index.html defines SM-2 retention card');
assert(html.includes('id="dashboard-retention-pct"'), 'index.html defines retention percentage readout');
assert(html.includes('id="dashboard-retention-fill"'), 'index.html defines retention progress track fill');
assert(html.includes('id="mini-heatmap-days"'), 'index.html defines 7-day mini heatmap container');
assert(styleCss.includes('.sm2-retention-card'), 'style.css styles .sm2-retention-card');
assert(styleCss.includes('.sm2-retention-fill'), 'style.css styles .sm2-retention-fill');
assert(styleCss.includes('.mini-day-dot'), 'style.css styles .mini-day-dot');
assert(appJs.includes('dashboard-retention-pct'), 'app.js populates dashboard retention percentage');
assert(appJs.includes('mini-heatmap-days'), 'app.js dynamically generates 7-day mini heatmap dots');

// --- 3. CRITICAL OVERLOAD & UNSTABLE CHARGING PULSE ---
console.log('\n--- 3. Critical Overload & Charging Pulse Effects ---');
assert(styleCss.includes('.pixel-battery-wrapper.overcharged'), 'style.css styles .overcharged state');
assert(styleCss.includes('box-shadow: 0 0 35px rgba(217, 70, 239, 0.7), 0 0 70px rgba(168, 85, 247, 0.4)'), 'Overcharged state has dramatic high-energy radiant glow');
assert(styleCss.includes('@keyframes batteryMicroShake'), 'style.css defines batteryMicroShake micro-tremor animation');
assert(styleCss.includes('@keyframes lightningFlicker'), 'style.css defines lightningFlicker flashing animation');
assert(styleCss.includes('.next-charging'), 'style.css styles .next-charging pulse block');
assert(styleCss.includes('@keyframes batteryBlinkPulse'), 'style.css defines batteryBlinkPulse keyframe');
assert(html.includes('class="pixel-battery-icon"'), 'index.html defines lightning icon element');
assert(appJs.includes("'overcharged'"), 'app.js triggers overcharged state on 100% quiz completion');
assert(appJs.includes('OVERCHARGED 100%'), 'app.js displays OVERCHARGED 100% celebratory badge');
assert(appJs.includes('next-charging'), 'app.js triggers next-charging pulse on incomplete battery');

// --- 4. SERVER HEALTH CHECK ---
console.log('\n--- 4. Local Server Health Check ---');
http.get('http://localhost:5173', (res) => {
  assert(res.statusCode === 200, `Local server response code is 200 OK (got ${res.statusCode})`);
  
  console.log(`\n========================================`);
  console.log(`ROUND 9 SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  
  if (failed > 0) process.exit(1);
}).on('error', (err) => {
  console.error('  ❌ FAIL: Server request failed:', err.message);
  failed++;
  console.log(`\n========================================`);
  console.log(`ROUND 9 SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  process.exit(1);
});
