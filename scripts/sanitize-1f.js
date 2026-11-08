// File: scripts/sanitize-1f.js
const fs = require('fs');
const path = require('path');

// 1. Quét và thay thế toàn bộ mã màu tím viết cứng trong css/style.css
const stylePath = path.join(__dirname, '..', 'css', 'style.css');
let css = fs.readFileSync(stylePath, 'utf8');

const cssReplacements = [
  // Hover nút bị tím
  [/rgba\(\s*36\s*,\s*29\s*,\s*58\s*,\s*0\.95\s*\)\s*!important/gi, 'var(--btn-secondary-hover-bg) !important'],
  [/rgba\(\s*36\s*,\s*29\s*,\s*58\s*,\s*[0-9.]+\s*\)/gi, 'var(--btn-secondary-hover-bg)'],
  // Dropdown nền đen tím & item active tím
  [/#131122\s*!important/gi, 'var(--dropdown-bg) !important'],
  [/#12101e\s*!important/gi, 'var(--dropdown-menu-bg) !important'],
  [/rgba\(\s*124\s*,\s*58\s*,\s*237\s*,\s*0\.20\s*\)\s*!important/gi, 'var(--dropdown-item-active-bg) !important'],
  [/#c4b5fd\s*!important/gi, 'var(--dropdown-item-active-text) !important'],
  // Nút Tiếp theo trên Mobile bị gradient tím
  [/linear-gradient\(\s*135deg\s*,\s*var\(--accent\)\s*0%\s*,\s*#c084fc\s*100%\s*\)\s*!important/gi, 'var(--btn-primary-bg) !important'],
  // Các mã màu tím rời rạc còn sót
  [/rgba\(\s*167\s*,\s*139\s*,\s*250\s*,\s*0\.[0-9]+\s*\)/gi, 'var(--accent-glow)'],
  [/rgba\(\s*192\s*,\s*132\s*,\s*252\s*,\s*0\.[0-9]+\s*\)/gi, 'var(--accent-soft)'],
  [/rgba\(\s*124\s*,\s*58\s*,\s*237\s*,\s*0\.[0-9]+\s*\)/gi, 'var(--accent-soft)'],
  [/linear-gradient\(\s*180deg\s*,\s*#c084fc\s*0%,\s*#a78bfa\s*40%,\s*#7c3aed\s*100%\s*\)/gi, 'var(--accent)'],
  [/linear-gradient\(\s*135deg\s*,\s*#7635d2\s*,\s*#7c3aed\s*\)/gi, 'var(--battery-segment-active-bg)'],
  [/linear-gradient\(\s*135deg\s*,\s*#7c3aed\s*,\s*#8835e5\s*\)/gi, 'var(--battery-segment-active-bg)'],
  [/#a78bfa/gi, 'var(--accent)'],
  [/#8b5cf6/gi, 'var(--accent)'],
  [/#7c3aed/gi, 'var(--accent-strong)']
];

for (const [pattern, replacement] of cssReplacements) {
  css = css.replace(pattern, replacement);
}
fs.writeFileSync(stylePath, css, 'utf8');
console.log('[sanitize-1f] Đã đồng bộ xong toàn bộ mã màu cứng trong css/style.css');
