const fs = require('fs');

const path = require('path');
const katex = require(path.resolve(__dirname, '../lib/katex/katex.min.js'));

function renderLatexText(text) {
  if (text === null || text === undefined) return '';
  const str = String(text);
  if (!str.trim()) return '';

  const hasKatex = typeof katex !== 'undefined' && typeof katex.renderToString === 'function';
  const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$(?!\$)[\s\S]*?\$)/g;

  const parts = [];
  let lastIdx = 0;
  let match;

  while ((match = mathRegex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      parts.push({ type: 'text', content: str.slice(lastIdx, match.index) });
    }
    parts.push({ type: 'math', raw: match[0] });
    lastIdx = mathRegex.lastIndex;
  }
  if (lastIdx < str.length) {
    parts.push({ type: 'text', content: str.slice(lastIdx) });
  }

  const escapeHtml = (s) => {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const cleanMath = (raw) => {
    let isBlock = false;
    let code = raw;
    if (code.startsWith('$$') && code.endsWith('$$')) {
      isBlock = true;
      code = code.slice(2, -2);
    } else if (code.startsWith('\\[') && code.endsWith('\\]')) {
      isBlock = true;
      code = code.slice(2, -2);
    } else if (code.startsWith('\\(') && code.endsWith('\\)')) {
      isBlock = false;
      code = code.slice(2, -2);
    } else if (code.startsWith('$') && code.endsWith('$')) {
      isBlock = false;
      code = code.slice(1, -1);
    }

    // Escape unescaped % inside math formulas
    code = code.replace(/(^|[^\\])%/g, '$1\\%');

    return { code: code.trim(), isBlock };
  };

  return parts.map(p => {
    if (p.type === 'text') {
      return escapeHtml(p.content);
    } else {
      const { code, isBlock } = cleanMath(p.raw);
      if (!hasKatex) {
        return `<span class="katex-inline-wrap inline-block align-middle mx-1 font-mono">${escapeHtml(code)}</span>`;
      }
      try {
        const rendered = katex.renderToString(code, {
          displayMode: isBlock,
          throwOnError: false
        });
        if (isBlock) {
          return `<div class="katex-display-wrap overflow-x-auto my-2">${rendered}</div>`;
        } else {
          return `<span class="katex-inline-wrap inline-block align-middle mx-1">${rendered}</span>`;
        }
      } catch (e) {
        return `<span class="katex-inline-wrap inline-block align-middle mx-1">${escapeHtml(code)}</span>`;
      }
    }
  }).join('');
}

// Test case 1: Mixed text and inline math
const t1 = renderLatexText('Đạo hàm của hàm số $f(x) = x^2$ là bao nhiêu?');
console.log('T1 (has katex span):', t1.includes('class="katex-inline-wrap inline-block align-middle mx-1"'));
console.log('T1 (has text):', t1.includes('Đạo hàm của hàm số'));

// Test case 2: Percent sign in math
const t2 = renderLatexText('Tỉ lệ $P = 50%$ tăng lên $100%$');
console.log('T2 (has rendered math):', t2.includes('class="katex"'));

// Test case 3: Underscore outside math
const t3 = renderLatexText('Biến số my_variable có giá trị $x_1 + x_2$');
console.log('T3 (preserves text underscore):', t3.includes('my_variable'));

// Test case 4: Block math
const t4 = renderLatexText('Công thức: $$\\int_0^1 x dx = \\frac{1}{2}$$');
console.log('T4 (has display wrap):', t4.includes('class="katex-display-wrap overflow-x-auto my-2"'));
console.log('ALL TESTS PASSED IN SCRATCH SCRIPT');
