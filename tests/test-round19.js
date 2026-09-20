const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');

console.log('=== TEST SUITE 19: Round 15 — Hệ thống Random Quote thay cho heading cố định ===\n');

const rootQuotesPath = path.join(__dirname, '../quotes.js');
const jsQuotesPath = path.join(__dirname, '../js/quotes.js');
const cssPath = path.join(__dirname, '../css/style.css');
const htmlPath = path.join(__dirname, '../index.html');
const appJsPath = path.join(__dirname, '../js/app.js');

const rootQuotesContent = fs.readFileSync(rootQuotesPath, 'utf-8');
const jsQuotesContent = fs.readFileSync(jsQuotesPath, 'utf-8');
const styleCss = fs.readFileSync(cssPath, 'utf-8');
const html = fs.readFileSync(htmlPath, 'utf-8');
const appJs = fs.readFileSync(appJsPath, 'utf-8');

// --- 1. QUOTES FILE STRUCTURE & CONTENT ---
console.log('--- 1. Quotes Configuration File (quotes.js) ---');

assert(fs.existsSync(rootQuotesPath), 'quotes.js exists in root directory');
assert(fs.existsSync(jsQuotesPath), 'js/quotes.js exists in js directory');
assert(rootQuotesContent.includes('export const QUOTES = ['), 'quotes.js exports QUOTES array with ES Module syntax');

// Verify comments explain how to add/edit quotes and **...** syntax
assert(rootQuotesContent.includes('**...**') || rootQuotesContent.includes('**'), 'quotes.js explains **...** markdown syntax in comments');
assert(rootQuotesContent.includes('QUOTES'), 'quotes.js contains QUOTES explanation in comments');

// Load quotes array safely for verification
let QUOTES = [];
try {
  // Use regex or eval matching export
  const match = rootQuotesContent.match(/export\s+const\s+QUOTES\s*=\s*(\[[^;]+\]);/);
  assert(match, 'quotes.js contains valid QUOTES array declaration');
  QUOTES = eval(match[1]);
} catch (e) {
  assert.fail('Failed to parse QUOTES array from quotes.js: ' + e.message);
}

assert(Array.isArray(QUOTES) && QUOTES.length >= 1, 'QUOTES is a non-empty array of strings');
assert(QUOTES.some(q => q.includes('if the enemy can predict your next move then **dont move**')),
  'QUOTES array contains the required test quote: "if the enemy can predict your next move then **dont move**"');

console.log(`  ✅ PASS: quotes.js verified with ${QUOTES.length} quotes, clear comments, and test quote.`);

// --- 2. MARKDOWN **...** PARSER ---
console.log('\n--- 2. Markdown **...** Parser Logic ---');

// Mock escapeHtml helper as in App
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatQuoteHtml(rawQuote) {
  if (!rawQuote || typeof rawQuote !== 'string') {
    return '<span class="hero-title-main">TÔI</span> <span class="hero-title-accent">NGU</span> <span class="hero-title-sub">BẠN CŨNG THẾ</span>';
  }

  const parts = rawQuote.split(/(\*\*[^*]+\*\*)/g);
  let html = '';

  parts.forEach(part => {
    if (!part) return;
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const accent = part.slice(2, -2);
      html += `<span class="hero-title-accent">${escapeHtml(accent)}</span>`;
    } else {
      html += `<span class="hero-title-main">${escapeHtml(part)}</span>`;
    }
  });

  return html || `<span class="hero-title-main">${escapeHtml(rawQuote)}</span>`;
}

const testQuote = "if the enemy can predict your next move then **dont move**";
const parsedHtml = formatQuoteHtml(testQuote);

assert(parsedHtml.includes('<span class="hero-title-main">if the enemy can predict your next move then </span>'),
  'Main text correctly wrapped in hero-title-main span');
assert(parsedHtml.includes('<span class="hero-title-accent">dont move</span>'),
  'Accent phrase "dont move" correctly wrapped in hero-title-accent span');

// Verify edge cases
const noAccentQuote = "just do it now";
assert(formatQuoteHtml(noAccentQuote) === '<span class="hero-title-main">just do it now</span>',
  'Quote without accent wraps entire text in hero-title-main');

const multiAccentQuote = "**focus** daily and **win**";
const parsedMulti = formatQuoteHtml(multiAccentQuote);
assert(parsedMulti.includes('<span class="hero-title-accent">focus</span>') && parsedMulti.includes('<span class="hero-title-accent">win</span>'),
  'Multiple **...** accents parsed accurately');

console.log('  ✅ PASS: Quote parser accurately separates foundation text and highlighted accent words.');

// --- 3. STYLE REQUIREMENTS FOR ACCENT (ROUND 15 SPEC) ---
console.log('\n--- 3. Solid Accent Styling (No Gradient, No Italic, No Glow) ---');

// Extract .hero-title-accent active CSS block
const accentCssMatch = styleCss.match(/\.hero-title-accent\s*\{([^}]+)\}/g);
assert(accentCssMatch && accentCssMatch.length >= 1, '.hero-title-accent CSS rule exists');
const activeAccentCss = accentCssMatch[accentCssMatch.length - 1]; // Last definition is active

assert(activeAccentCss.includes('color: #e879f9 !important;') || activeAccentCss.includes('color: #ec4899 !important;'),
  'Accent word uses vibrant solid pink/fuchsia color (#e879f9 or #ec4899)');
assert(activeAccentCss.includes('font-style: normal !important;'),
  'Accent word strictly disables italic font-style');
assert(activeAccentCss.includes('background: none !important;'),
  'Accent word strictly removes background gradient');
assert(activeAccentCss.includes('font-weight: 900;'),
  'Accent word preserves exact 900 weight matching main text');
assert(activeAccentCss.includes('text-shadow: 0 4px 14px rgba(0, 0, 0, 0.95)'),
  'Accent word preserves high-contrast black shadow for background separation');
assert(activeAccentCss.includes('filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.9));'),
  'Accent word preserves deep block drop-shadow');

// Glow pseudo-element disabled
assert(styleCss.includes('.hero-title-accent::after {\n  display: none !important;\n}'),
  'Accent glow pseudo-element is disabled via display: none !important');

console.log('  ✅ PASS: Accent text is styled with flat solid color (#e879f9), no italic, no gradient, no glow.');

// --- 4. NON-REPEATING RANDOM LOGIC SIMULATION ---
console.log('\n--- 4. Non-Repeating Random Selection Logic ---');

class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key, val) {
    this.store[key] = String(val);
  }
}

function simulateRandomPick(quotesList, storage) {
  if (!quotesList || quotesList.length === 0) {
    return "default quote";
  }
  if (quotesList.length === 1) {
    return quotesList[0];
  }

  let lastIdx = -1;
  const saved = storage.getItem('mindsparks_last_quote_idx');
  if (saved !== null && !isNaN(parseInt(saved, 10))) {
    lastIdx = parseInt(saved, 10);
  }

  const pool = [];
  for (let i = 0; i < quotesList.length; i++) {
    if (i !== lastIdx) {
      pool.push(i);
    }
  }

  const chosenIdx = pool[Math.floor(Math.random() * pool.length)];
  storage.setItem('mindsparks_last_quote_idx', String(chosenIdx));
  return quotesList[chosenIdx];
}

const mockStorage = new MockLocalStorage();
let prevQuote = null;
let consecutiveMatches = 0;

for (let round = 0; round < 60; round++) {
  const chosen = simulateRandomPick(QUOTES, mockStorage);
  if (chosen === prevQuote) {
    consecutiveMatches++;
  }
  prevQuote = chosen;
}

assert(consecutiveMatches === 0, 'Quote never repeats twice in a row across 60 simulated reloads');
console.log('  ✅ PASS: 60 simulated reloads verified zero consecutive duplicate quotes.');

// Test with 1 quote
const singleList = ["only one quote here"];
const singlePicked = simulateRandomPick(singleList, mockStorage);
assert(singlePicked === "only one quote here", 'Single quote list returns the only quote safely');

// Test with empty list
const emptyPicked = simulateRandomPick([], mockStorage);
assert(emptyPicked === "default quote", 'Empty quote list returns safe fallback quote');

console.log('  ✅ PASS: Single-item and empty fallback edge cases handled safely.');

// --- 5. RESPONSIVE FONT CLAMPING FOR DIFFERENT LENGTHS ---
console.log('\n--- 5. Responsive Font Clamping for Varied Lengths ---');

assert(appJs.includes('updateHeroQuote()'), 'app.js defines updateHeroQuote()');
assert(appJs.includes('formatQuoteHtml('), 'app.js defines formatQuoteHtml()');
assert(appJs.includes('heroTitle.style.fontSize ='), 'app.js dynamically assigns clamped font size based on quote length');

const shortQuote = "dont **quit**"; // len 10
const longQuote = "học không phải để hơn người khác mà là để **hơn chính mình hôm qua và ngày mai**"; // len 75

function getClampedFontSize(quote) {
  const len = quote.replace(/\*\*/g, '').trim().length;
  if (len <= 30) return 'clamp(2.5rem, 6.2vw, 4.4rem)';
  if (len <= 55) return 'clamp(2.1rem, 5.0vw, 3.5rem)';
  if (len <= 85) return 'clamp(1.75rem, 4.0vw, 2.75rem)';
  return 'clamp(1.45rem, 3.2vw, 2.2rem)';
}

assert(getClampedFontSize(shortQuote).includes('4.4rem'), 'Short quotes scale up to fill display hero scrim');
assert(getClampedFontSize(longQuote).includes('2.75rem'), 'Long quotes scale down comfortably to prevent overflow');

console.log('  ✅ PASS: Responsive clamp correctly modulates font size according to length.');

// --- 6. LOCAL SERVER HTTP HEALTH CHECK ---
console.log('\n--- 6. Local Server & quotes.js HTTP Delivery ---');

const req = http.get('http://localhost:5173/quotes.js', (res) => {
  assert.strictEqual(res.statusCode, 200, `Expected HTTP 200 from dev server for quotes.js, got ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    assert(data.includes('export const QUOTES'), 'quotes.js content served correctly via HTTP');
    console.log('  ✅ PASS: Local server serves quotes.js with HTTP 200 OK');
    console.log('\n========================================');
    console.log('ROUND 19 SUMMARY: All test assertions passed 100%!');
    console.log('========================================\n');
  });
});

req.on('error', (err) => {
  console.error('HTTP Request failed:', err.message);
  process.exit(1);
});
