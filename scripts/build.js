/**
 * MindSparks Production Build Script
 * Builds clean, zero-dev, production-ready static assets to dist/
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting MindSparks Production Build...\n');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// 1. Static Syntax & Integrity Verification
console.log('📦 Step 1: Validating JavaScript syntax integrity...');
const jsFilesToCheck = [
  'js/app.js',
  'js/db.js',
  'js/parser.js',
  'js/srs.js',
  'js/audio.js',
  'js/audio-config.js',
  'js/confetti.js',
  'quotes.js',
  'sw.js',
  'server.js'
];

for (const relPath of jsFilesToCheck) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Missing critical file: ${relPath}`);
    process.exit(1);
  }
  try {
    execSync(`node --check "${fullPath}"`);
  } catch (err) {
    console.error(`❌ Syntax error in ${relPath}:`, err.message);
    process.exit(1);
  }
}
console.log('   ✅ All core JS files passed syntax validation.\n');

// 2. Prepare Clean dist/ Directory
console.log('📁 Step 2: Preparing dist/ directory...');
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

// 3. Copy Production Assets
console.log('📋 Step 3: Copying production runtime assets...');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const assetsToCopy = [
  { src: 'index.html', dest: 'index.html' },
  { src: 'manifest.json', dest: 'manifest.json' },
  { src: 'sw.js', dest: 'sw.js' },
  { src: 'quotes.js', dest: 'quotes.js' },
  { src: 'meo.png', dest: 'meo.png' },
  { src: 'css', dest: 'css' },
  { src: 'js', dest: 'js' },
  { src: 'lib', dest: 'lib' },
  { src: 'icons', dest: 'icons' },
  { src: 'backgrounds', dest: 'backgrounds' },
  { src: 'data', dest: 'data' }
];

let totalFiles = 0;
let totalBytes = 0;

for (const item of assetsToCopy) {
  const srcPath = path.join(ROOT, item.src);
  const destPath = path.join(DIST, item.dest);
  if (fs.existsSync(srcPath)) {
    copyRecursiveSync(srcPath, destPath);
    console.log(`   + Copied ${item.src} -> dist/${item.dest}`);
  } else {
    console.warn(`   ⚠️ Warning: Asset not found: ${item.src}`);
  }
}

// 4. Calculate stats and verify dist integrity
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkDir(full);
    } else {
      totalFiles++;
      totalBytes += stat.size;
    }
  }
}
walkDir(DIST);

// 5. Verify Critical Output Files
console.log('\n🔍 Step 4: Verifying build outputs...');
const criticalChecks = [
  'index.html',
  'manifest.json',
  'sw.js',
  'quotes.js',
  'css/style.css',
  'css/theme.css',
  'css/fonts.css',
  'js/app.js',
  'js/db.js',
  'js/parser.js',
  'lib/katex/katex.min.js',
  'icons/icon-192.png',
  'meo.png'
];

for (const chk of criticalChecks) {
  const checkPath = path.join(DIST, chk);
  if (!fs.existsSync(checkPath)) {
    console.error(`❌ Build verification failed: Missing dist/${chk}`);
    process.exit(1);
  }
}

console.log('   ✅ All critical production assets confirmed in dist/\n');
console.log('==================================================');
console.log(`🎉 BUILD COMPLETED SUCCESSFULLY!`);
console.log(`   Output Directory: ${DIST}`);
console.log(`   Total Assets:     ${totalFiles} files`);
console.log(`   Bundle Size:      ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Production Ready: 100% Offline-First PWA`);
console.log('==================================================\n');
