// scripts/patch-1f-icons-and-subjects.js
const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'js', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');

// 1. Add getMonoSvg and renderSubjectIcon to App object right after _closeModal
const helperMethods = `
  getMonoSvg(key, customClass = 'mono-icon') {
    const k = (key || '').toLowerCase().trim();
    const svgs = {
      book: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>\`,
      math: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.17 21.17A2 2 0 0 1 19.76 22H4a2 2 0 0 1-2-2V4.24a2 2 0 0 1 .83-1.63L21.17 21.17z"></path><line x1="2" y1="12" x2="6" y2="12"></line><line x1="2" y1="17" x2="11" y2="17"></line></svg>\`,
      flask: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31L4.65 19.01A2 2 0 0 0 6.38 22h11.24a2 2 0 0 0 1.73-2.99L14 9.31V2"></path><line x1="8.5" y1="2" x2="15.5" y2="2"></line><line x1="7" y1="16" x2="17" y2="16"></line></svg>\`,
      dna: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 15 6-6"></path><path d="m9 22 3-3"></path><path d="m2 9 3-3"></path><path d="m15 2 3 3"></path><path d="m15 9 6 6"></path><path d="M7 12a5 5 0 0 1 5-5"></path><path d="M12 17a5 5 0 0 1 5-5"></path></svg>\`,
      code: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>\`,
      globe: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>\`,
      landmark: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><polygon points="12 2 20 7 4 7 12 2"></polygon></svg>\`,
      scale: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"></path><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h18"></path></svg>\`,
      palette: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"></path><circle cx="7.5" cy="11.5" r=".75" fill="currentColor"></circle><circle cx="10.5" cy="7.5" r=".75" fill="currentColor"></circle><circle cx="14.5" cy="7.5" r=".75" fill="currentColor"></circle><circle cx="16.5" cy="11.5" r=".75" fill="currentColor"></circle></svg>\`,
      music: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>\`,
      brain: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z"></path></svg>\`,
      pulse: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>\`,
      chart: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>\`,
      rocket: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>\`,
      zap: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>\`,
      flame: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"></path></svg>\`,
      bulb: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>\`,
      target: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>\`,
      trophy: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>\`,
      star: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>\`,
      folder: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>\`,
      flower: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-8"></path><path d="M9 14c-3 0-5-2-5-5 4 0 5 3 5 5z"></path><path d="M15 11c3 0 5-2 5-5-4 0-5 3-5 5z"></path></svg>\`,
      plus: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>\`,
      tag: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>\`,
      settings: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>\`,
      trash: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>\`,
      edit: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>\`,
      search: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>\`,
      cards: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="14" rx="2" ry="2"></rect><path d="M6 3h12a2 2 0 0 1 2 2v12"></path></svg>\`,
      copy: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>\`,
      eye: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>\`,
      shuffle: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>\`,
      inbox: \`<svg class="\${customClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>\`
    };
    return svgs[k] || svgs.book;
  },

  renderSubjectIcon(iconOrKey, customClass = 'mono-icon') {
    if (!iconOrKey) return this.getMonoSvg('book', customClass);
    const str = String(iconOrKey).trim();
    const knownKeys = ['book', 'math', 'flask', 'dna', 'code', 'globe', 'landmark', 'scale', 'palette', 'music', 'brain', 'pulse', 'chart', 'rocket', 'zap', 'flame', 'bulb', 'target', 'trophy', 'star', 'folder', 'flower', 'plus', 'tag', 'settings', 'trash', 'edit', 'search', 'cards', 'copy', 'eye', 'shuffle', 'inbox'];
    if (knownKeys.includes(str.toLowerCase())) {
      return this.getMonoSvg(str, customClass);
    }
    const emojiMap = {
      '📚': 'book', '📖': 'book', '📕': 'book',
      '📐': 'math', '📏': 'math', '🔢': 'math',
      '🧪': 'flask', '⚗️': 'flask',
      '🧬': 'dna', '🔬': 'dna',
      '💻': 'code', '🖥️': 'code', '⌨️': 'code',
      '🌐': 'globe', '🌍': 'globe', '🌎': 'globe', '🌏': 'globe',
      '🏛️': 'landmark', '🏛': 'landmark',
      '⚖️': 'scale', '⚖': 'scale',
      '🎨': 'palette',
      '🎵': 'music', '🎶': 'music',
      '🧠': 'brain',
      '🩺': 'pulse', '❤️': 'pulse',
      '📊': 'chart', '📈': 'chart', '📉': 'chart', '💰': 'chart',
      '🚀': 'rocket',
      '⚡': 'zap',
      '🔥': 'flame',
      '💡': 'bulb',
      '🎯': 'target',
      '🏆': 'trophy', '🥇': 'trophy',
      '🌟': 'star', '⭐': 'star', '✨': 'star',
      '📁': 'folder', '📂': 'folder',
      '🥀': 'flower', '🥀🥀': 'flower', '🌸': 'flower', '🌹': 'flower', '🌱': 'flower', '🌿': 'flower',
      '➕': 'plus',
      '🏷️': 'tag', '🏷': 'tag',
      '⚙️': 'settings', '⚙': 'settings',
      '🗑️': 'trash', '🗑': 'trash',
      '✏️': 'edit', '✏': 'edit',
      '🔍': 'search',
      '🎴': 'cards',
      '📋': 'copy',
      '👁️': 'eye', '👁': 'eye',
      '🔀': 'shuffle',
      '📥': 'inbox'
    };
    for (const [em, key] of Object.entries(emojiMap)) {
      if (str.includes(em)) {
        return this.getMonoSvg(key, customClass);
      }
    }
    return this.getMonoSvg('book', customClass);
  },
`;

if (!app.includes('getMonoSvg(key')) {
  app = app.replace(
    /(_closeModal\(modal\) \{[\s\S]*?document\.body\.classList\.remove\('modal-open'\);\s*\}\s*\},)/,
    `$1\n${helperMethods}`
  );
  console.log('Added getMonoSvg and renderSubjectIcon to App object.');
}

// 2. Update SUBJECT_ICON_PRESETS and renderSubjectPickerControls
const iconPresets = `
  SUBJECT_ICON_PRESETS: [
    { key: 'book', name: 'Sách giáo trình', emojis: ['📚', '📖', '📕'] },
    { key: 'math', name: 'Toán học & Hình học', emojis: ['📐', '📏', '🔢'] },
    { key: 'flask', name: 'Hóa học & Thí nghiệm', emojis: ['🧪', '⚗️'] },
    { key: 'dna', name: 'Sinh học & Y khoa', emojis: ['🧬', '🔬'] },
    { key: 'code', name: 'Công nghệ & Lập trình', emojis: ['💻', '🖥️', '⌨️'] },
    { key: 'globe', name: 'Địa lý & Quốc tế', emojis: ['🌐', '🌍', '🌎', '🌏'] },
    { key: 'landmark', name: 'Lịch sử & Xã hội', emojis: ['🏛️', '🏛'] },
    { key: 'scale', name: 'Pháp luật & Triết học', emojis: ['⚖️', '⚖'] },
    { key: 'palette', name: 'Nghệ thuật & Thiết kế', emojis: ['🎨'] },
    { key: 'music', name: 'Âm nhạc & Nghệ thuật', emojis: ['🎵', '🎶'] },
    { key: 'brain', name: 'Tư duy & Tâm lý', emojis: ['🧠'] },
    { key: 'pulse', name: 'Sức khỏe & Y tế', emojis: ['🩺', '❤️'] },
    { key: 'chart', name: 'Kinh tế & Thống kê', emojis: ['📊', '📈', '📉', '💰'] },
    { key: 'rocket', name: 'Vũ trụ & Đột phá', emojis: ['🚀'] },
    { key: 'zap', name: 'Năng lượng & Điện tử', emojis: ['⚡'] },
    { key: 'flame', name: 'Nhiệt huyết & Động lực', emojis: ['🔥'] },
    { key: 'bulb', name: 'Ý tưởng & Sáng tạo', emojis: ['💡'] },
    { key: 'target', name: 'Mục tiêu & Trọng tâm', emojis: ['🎯'] },
    { key: 'trophy', name: 'Thành tích & Khen thưởng', emojis: ['🏆', '🥇'] },
    { key: 'star', name: 'Ngôi sao & Xuất sắc', emojis: ['🌟', '⭐', '✨'] }
  ],
  SUBJECT_EMOJI_PRESETS: [
    '📚', '📐', '💻', '🔬', '🧬', '🧪', '⚛️', '🌍',
    '🏛️', '⚖️', '📈', '💰', '🧠', '🩺', '🎨', '🎵',
    '🇬🇧', '🇯🇵', '🇨🇳', '🚀', '⚡', '🎯', '🏆', '🎓'
  ],
`;

app = app.replace(
  /SUBJECT_EMOJI_PRESETS:\s*\[[\s\S]*?\],\s*SUBJECT_COLOR_PRESETS:/,
  `${iconPresets.trim()}\n  SUBJECT_COLOR_PRESETS:`
);

// 3. Update renderSubjectPickerControls, selectSubjectEmoji, updateSubjectModalPreview
const newPickerControls = `
  renderSubjectPickerControls(mode) {
    const emojiContainer = document.getElementById(\`\${mode}-subject-emoji-grid\`);
    const colorContainer = document.getElementById(\`\${mode}-subject-color-grid\`);
    const iconInput = document.getElementById(\`\${mode}-subject-icon\`);
    const colorInput = document.getElementById(\`\${mode}-subject-color\`);
    const currentIcon = iconInput ? (iconInput.value || 'book') : 'book';
    const currentColor = colorInput ? (colorInput.value || '#a855f7') : '#a855f7';

    if (emojiContainer) {
      emojiContainer.innerHTML = this.SUBJECT_ICON_PRESETS.map(preset => {
        const isActive = preset.key === currentIcon || preset.emojis.includes(currentIcon);
        return \`<button type="button" class="emoji-preset-btn \${isActive ? 'active' : ''}" data-icon-key="\${preset.key}" onclick="App.selectSubjectEmoji('\${mode}', '\${preset.key}')" title="\${preset.name}">\${this.getMonoSvg(preset.key)}</button>\`;
      }).join('');
    }

    if (colorContainer) {
      colorContainer.innerHTML = this.SUBJECT_COLOR_PRESETS.map(preset => {
        const isActive = preset.hex.toLowerCase() === currentColor.toLowerCase();
        return \`<button type="button" class="color-swatch-btn \${isActive ? 'active' : ''}" style="--swatch-color: \${preset.hex}; background-color: \${preset.hex};" onclick="App.selectSubjectColor('\${mode}', '\${preset.hex}')" title="\${preset.name} (\${preset.hex})"></button>\`;
      }).join('');
    }

    this.updateSubjectModalPreview(mode);
  },

  selectSubjectEmoji(mode, iconKey) {
    const iconInput = document.getElementById(\`\${mode}-subject-icon\`);
    if (iconInput) iconInput.value = iconKey;
    const grid = document.getElementById(\`\${mode}-subject-emoji-grid\`);
    if (grid) {
      grid.querySelectorAll('.emoji-preset-btn').forEach(btn => {
        const k = btn.getAttribute('data-icon-key');
        btn.classList.toggle('active', k === iconKey);
      });
    }
    this.updateSubjectModalPreview(mode);
  },

  selectSubjectColor(mode, hexColor) {
    const colorInput = document.getElementById(\`\${mode}-subject-color\`);
    if (colorInput) colorInput.value = hexColor;
    const grid = document.getElementById(\`\${mode}-subject-color-grid\`);
    if (grid) {
      grid.querySelectorAll('.color-swatch-btn').forEach(btn => {
        const swatchHex = btn.style.getPropertyValue('--swatch-color');
        btn.classList.toggle('active', swatchHex.toLowerCase() === hexColor.toLowerCase());
      });
    }
    this.updateSubjectModalPreview(mode);
  },

  updateSubjectModalPreview(mode) {
    const nameInput = document.getElementById(\`\${mode}-subject-name\`);
    const iconInput = document.getElementById(\`\${mode}-subject-icon\`);
    const colorInput = document.getElementById(\`\${mode}-subject-color\`);
    const previewBadge = document.getElementById(\`\${mode}-subject-preview-badge\`);
    const previewIcon = document.getElementById(\`\${mode}-subject-preview-icon\`);
    const previewName = document.getElementById(\`\${mode}-subject-preview-name\`);

    const name = nameInput?.value?.trim() || (mode === 'create' ? 'Tên môn học' : 'Môn học');
    const icon = iconInput?.value?.trim() || 'book';
    const color = colorInput?.value || '#a855f7';

    if (previewBadge) {
      previewBadge.style.setProperty('--subj-color', color);
    }
    if (previewIcon) previewIcon.innerHTML = this.renderSubjectIcon(icon);
    if (previewName) previewName.textContent = name;
  },
`;

app = app.replace(
  /renderSubjectPickerControls\(mode\) \{[\s\S]*?updateSubjectModalPreview\(mode\) \{[\s\S]*?if \(previewName\) previewName\.textContent = name;\s*\},/,
  newPickerControls.trim()
);

fs.writeFileSync(appPath, app, 'utf8');
console.log('[patch-1f] Initial icon methods patched in js/app.js');
