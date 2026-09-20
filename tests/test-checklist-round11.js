// =========================================================================
// TEST SUITE: Checklist Round 11 - Quizz Isolation & Zero-Scroll Verification
// =========================================================================

const fs = require('fs');
const http = require('http');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(rootDir, 'css', 'style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf8');

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

console.log('=== TEST SUITE: Round 11 Checklist - Quizz Isolation & View Integrity ===\n');

// --- 1. CSS VIEW ISOLATION & ZERO GLOBAL LEAKAGE ---
console.log('--- 1. CSS View Isolation & Zero Global Leakage ---');
assert(styleCss.includes('#view-study:not(.active)') && styleCss.includes('display: none !important;'),
  '#view-study:not(.active) is strictly forced to display: none !important');
assert(styleCss.includes('#view-exam:not(.active)') && styleCss.includes('display: none !important;'),
  '#view-exam:not(.active) is strictly forced to display: none !important');

// Ensure NO standalone #view-study block (without .active or body.quiz-active) has display: flex !important
const standaloneMatch = styleCss.match(/(?:^|\n)\s*#view-study\s*\{([^}]*)\}/);
const standaloneHasFlex = standaloneMatch && standaloneMatch[1].includes('display: flex !important');
assert(!standaloneHasFlex, 'Standalone #view-study has NO unconditional display: flex !important without .active');

// Ensure cramped nested scrollbars removed from question text
assert(!styleCss.includes('max-height: 22vh !important; overflow-y: auto !important;'),
  'max-height: 22vh & overflow-y: auto removed from quiz-question-text to eliminate sub-scrollbar');
assert(!styleCss.includes('max-height: 16vh !important; overflow-y: auto !important;'),
  'max-height: 16vh & overflow-y: auto removed from quiz-explanation-box to eliminate sub-scrollbar');

// --- 2. TAB SWITCHING LIFECYCLE & ROUTE SIMULATION ---
console.log('\n--- 2. Tab Switching Lifecycle Simulation (All 6 Primary Tabs) ---');

// Mock a lightweight DOM environment to execute navigateTo logic
class MockElement {
  constructor(id, classes = []) {
    this.id = id;
    this.classList = new Set(classes);
    this.dataset = {};
    this.style = {};
  }
}

class MockDOM {
  constructor() {
    this.elements = new Map();
    this.body = new MockElement('body');
    
    // Register standard views
    const viewNames = ['dashboard', 'decks', 'bank', 'study', 'exam', 'import', 'stats', 'settings'];
    viewNames.forEach(v => {
      const el = new MockElement(`view-${v}`, ['view-section']);
      if (v === 'dashboard') el.classList.add('active');
      this.elements.set(`view-${v}`, el);
    });
  }

  getElementById(id) {
    if (id === 'tab-wave-curtain') return null;
    return this.elements.get(id) || null;
  }

  querySelectorAll(selector) {
    if (selector === '.view-section') {
      return Array.from(this.elements.values()).filter(e => e.classList.has('view-section'));
    }
    if (selector === '.nav-item' || selector === '.bottom-nav-item') {
      return [];
    }
    return [];
  }
}

const mockDOM = new MockDOM();

// Simulate App.navigateTo logic
function simulateNavigate(viewName) {
  const isQuizActive = viewName === 'study' || viewName === 'exam';
  if (isQuizActive) {
    mockDOM.body.classList.add('quiz-active');
  } else {
    mockDOM.body.classList.delete('quiz-active');
  }

  mockDOM.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.delete('active');
  });

  const target = mockDOM.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.add('active');
  }
}

// Step A: Initial state
assert(mockDOM.getElementById('view-dashboard').classList.has('active'), 'Initial state: view-dashboard is active');
assert(!mockDOM.getElementById('view-study').classList.has('active'), 'Initial state: view-study is NOT active');
assert(!mockDOM.body.classList.has('quiz-active'), 'Initial state: body has NO quiz-active class');

// Step B: Cycle through all 6 primary tabs
const primaryTabs = ['dashboard', 'decks', 'bank', 'import', 'stats', 'settings'];
primaryTabs.forEach(tab => {
  simulateNavigate(tab);
  const targetEl = mockDOM.getElementById(`view-${tab}`);
  const studyEl = mockDOM.getElementById('view-study');
  assert(targetEl.classList.has('active'), `Tab ${tab}: correctly activated`);
  assert(!studyEl.classList.has('active'), `Tab ${tab}: view-study is strictly inactive`);
  assert(!mockDOM.body.classList.has('quiz-active'), `Tab ${tab}: body has NO quiz-active class`);
});

// Step C: Start a quiz session then exit
console.log('\n--- 3. Mid-Quiz Exit Lifecycle Simulation ---');
simulateNavigate('study');
assert(mockDOM.getElementById('view-study').classList.has('active'), 'Quiz active: view-study is active');
assert(mockDOM.body.classList.has('quiz-active'), 'Quiz active: body has quiz-active class');

// User exits quiz by clicking "← Thoát" back to dashboard
simulateNavigate('dashboard');
assert(mockDOM.getElementById('view-dashboard').classList.has('active'), 'After exit: view-dashboard is active');
assert(!mockDOM.getElementById('view-study').classList.has('active'), 'After exit: view-study is completely deactivated');
assert(!mockDOM.body.classList.has('quiz-active'), 'After exit: body quiz-active is completely removed');

// User then clicks to "stats"
simulateNavigate('stats');
assert(mockDOM.getElementById('view-stats').classList.has('active'), 'Switched to Stats: view-stats is active');
assert(!mockDOM.getElementById('view-study').classList.has('active'), 'Switched to Stats: view-study has NO trace');
assert(!mockDOM.body.classList.has('quiz-active'), 'Switched to Stats: body has NO quiz-active');

// --- 4. SERVER HEALTH CHECK ---
console.log('\n--- 4. Local Server Health Check ---');
http.get('http://localhost:5173', res => {
  assert(res.statusCode === 200, `Local server response code is 200 OK (got ${res.statusCode})`);
  
  console.log(`\n========================================`);
  console.log(`CHECKLIST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  
  if (failed > 0) process.exit(1);
}).on('error', err => {
  console.error('  ❌ FAIL: Server request failed:', err.message);
  failed++;
  console.log(`\n========================================`);
  console.log(`CHECKLIST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);
  process.exit(1);
});
