// File: scripts/sanitize-1g.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// 1. Kiểm tra và thay thế các mã màu tím/đen cứng còn sót trong css/style.css
const cssPath = path.join(root, 'css', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css
  // Xóa màu chữ trắng cứng trên dropdown trigger gây mờ chữ ở Light/White-Orange mode
  .replace(/color:\s*#e4e4e7\s*!important;/gi, 'color: var(--dropdown-text) !important;')
  // Xóa màu tím cứng trên scrollbar của dropdown và toàn cục
  .replace(/scrollbar-color:\s*rgba\(\s*139\s*,\s*92\s*,\s*246\s*,\s*0\.[0-9]+\s*\)\s*transparent;/gi, 'scrollbar-color: var(--scrollbar-thumb) transparent;')
  // Xóa nền đen tím cứng của .modal-footer, .toast, .restore-banner
  .replace(/background:\s*rgba\(\s*22\s*,\s*19\s*,\s*36\s*,\s*0\.98\s*\);/gi, 'background: transparent;')
  .replace(/background:\s*#221e36;/gi, 'background: var(--status-glass-bg);')
  .replace(/color:\s*#ede9f6;/gi, 'color: var(--status-glass-text);');

fs.writeFileSync(cssPath, css, 'utf8');

// 2. Liệt kê bất kỳ dòng nào trong index.html và js/app.js còn chứa Unicode Emoji để thay bằng SVG đơn sắc
const emojiRegex = /\p{Extended_Pictographic}/gu;
for (const rel of ['index.html', 'js/app.js']) {
  const full = path.join(root, rel);
  const lines = fs.readFileSync(full, 'utf8').split('\n');
  let count = 0;
  lines.forEach((line, idx) => {
    const m = line.match(emojiRegex);
    if (m) {
      count += m.length;
      console.log(`[Emoji Audit] ${rel}:${idx + 1} -> ${m.join(' ')} | ${line.trim().slice(0, 90)}`);
    }
  });
  console.log(`[Emoji Audit Summary] ${rel} total remaining emojis: ${count}`);
}
