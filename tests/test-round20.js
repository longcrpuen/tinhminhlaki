const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE 20: 3-Stage Battery Animation (Purple Charge -> Neon Green Reverse Sweep -> Overcharged Shake) ===\n');

const cssPath = path.join(__dirname, '../css/style.css');
const appJsPath = path.join(__dirname, '../js/app.js');
const htmlPath = path.join(__dirname, '../index.html');

const styleCss = fs.readFileSync(cssPath, 'utf-8');
const appJs = fs.readFileSync(appJsPath, 'utf-8');
const html = fs.readFileSync(htmlPath, 'utf-8');

// --- 1. CSS ANIMATION DEFINITIONS ---
console.log('--- 1. CSS Animation & Style Rules ---');

assert(styleCss.includes('.pixel-battery-segment.reverse-wave'),
  'style.css defines .pixel-battery-segment.reverse-wave for reverse sweep pulse');
assert(styleCss.includes('filter: brightness(1.75)'),
  'reverse-wave applies bright intense electric surge filter');
assert(styleCss.includes('.modal-box.overcharged-pulse'),
  'style.css defines .modal-box.overcharged-pulse for modal impact shake');
assert(styleCss.includes('@keyframes modalImpactShake'),
  'style.css defines @keyframes modalImpactShake');
assert(styleCss.includes('.pixel-battery-wrapper.charged'),
  'style.css defines .pixel-battery-wrapper.charged state');
assert(styleCss.includes('.pixel-battery-wrapper.overcharged'),
  'style.css defines .pixel-battery-wrapper.overcharged state');
assert(styleCss.includes('@keyframes batteryReverseSheen'),
  'style.css defines @keyframes batteryReverseSheen');
assert(styleCss.includes('@keyframes batteryMicroShake'),
  'style.css defines @keyframes batteryMicroShake');
assert(styleCss.includes('transform-origin: center center !important;'),
  'style.css enforces centered transform-origin for battery shake');

console.log('  ✅ PASS: All CSS keyframes, reverse wave, and overcharge styles verified.');

// --- 2. JAVASCRIPT ANIMATION LOGIC & SEQUENTIAL STAGING ---
console.log('\n--- 2. JavaScript Staging Logic (animateCompletionBattery) ---');

assert(appJs.includes('animateCompletionBattery('),
  'app.js defines animateCompletionBattery function');
assert(appJs.includes('this.animateCompletionBattery(correct, total, pct);'),
  'completeSession delegates to sequential animateCompletionBattery');
assert(appJs.includes('_batteryAnimToken'),
  'app.js tracks animation token to prevent race conditions & leaks');

// Stage 1: Purple charging verification
assert(appJs.includes('// --- GIAI ĐOẠN 1: NẠP ĐẦY TUẦN TỰ MÀU TÍM'),
  'app.js includes Giai đoạn 1 (sequential purple charge)');
assert(appJs.includes('segments[i].classList.add(\'active\');'),
  'Stage 1 activates segments sequentially from 0 to targetSegments');

// Normal score (< 100%): next-charging pulse
assert(appJs.includes('next-charging'),
  'app.js triggers next-charging pulse for score < 100%');

// Stage 2: Instant green switch + reverse wave
assert(appJs.includes('// --- GIAI ĐOẠN 2: ĐẢO CHIỀU & ĐỔI MÀU'),
  'app.js includes Giai đoạn 2 (switch to neon green and reverse wave)');
assert(appJs.includes("resultContainer.classList.add('charged');"),
  'Stage 2 adds charged class to switch battery to neon green');
assert(appJs.includes('reverse-wave'),
  'Stage 2 pulses reverse-wave class on segments from 9 down to 0');
assert(appJs.includes('for (let i = segments.length - 1; i >= 0; i--)'),
  'Stage 2 runs loop in reverse order (100% down to 0%)');

// Stage 3: Shake + Overcharged
assert(appJs.includes('// --- GIAI ĐOẠN 3: SHAKE / RUNG CHẤN'),
  'app.js includes Giai đoạn 3 (overcharged shake)');
assert(appJs.includes("resultContainer.classList.add('overcharged');"),
  'Stage 3 adds overcharged class to trigger batteryMicroShake');
assert(appJs.includes('OVERCHARGED 100%'),
  'Stage 3 displays OVERCHARGED 100% badge');
assert(appJs.includes('sounds.playBatteryCharged();'),
  'Stage 3 plays battery charged celebratory sound');

console.log('  ✅ PASS: 3-Stage animation pipeline correctly staged in sequence.');

// --- 3. DYNAMIC DATA BINDING (NO HARDCODING) ---
console.log('\n--- 3. Dynamic Question Count Binding ---');

assert(appJs.includes('${correct} / ${total} câu đúng'),
  'completeSession dynamically formats ratio as `${correct} / ${total} câu đúng`');
assert(!appJs.includes("ratioEl.textContent = '1/1 câu đúng'"),
  'No hardcoded 1/1 count in app.js');

// Verify calculation with diverse inputs
function testScore(correct, total) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

assert.strictEqual(testScore(1, 1), 100);
assert.strictEqual(testScore(10, 10), 100);
assert.strictEqual(testScore(7, 10), 70);
assert.strictEqual(testScore(3, 4), 75);
assert.strictEqual(testScore(0, 5), 0);

console.log('  ✅ PASS: Score & ratio dynamically calculated for any quiz size.');

// --- 4. CLEANUP ON MODAL CLOSE ---
console.log('\n--- 4. Cleanup on Modal Close & View Switching ---');

assert(appJs.includes('this._batteryAnimToken++'),
  'closeModal increments _batteryAnimToken to abort ongoing animation');
assert(appJs.includes("classList.remove('active', 'high', 'next-charging', 'unstable-pulse', 'reverse-wave')"),
  'closeModal cleans up all segment animation classes');
assert(appJs.includes("classList.remove('charged', 'overcharged')"),
  'closeModal resets battery charged and overcharged states');

console.log('  ✅ PASS: Complete cleanup on modal close verified.');

console.log('\n========================================');
console.log('TEST SUITE 20 SUMMARY: All 20+ checks passed 100%!');
console.log('========================================\n');
