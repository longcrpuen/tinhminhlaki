/**
 * MindSparks Application Controller
 * Single Page Application Logic, PWA, SRS & Quiz Modes
 */

const App = {
  currentView: 'dashboard',
  currentDeck: null,
  activeSession: null,
  examTimerInterval: null,
  deferredInstallPrompt: null,
  _sidebarLabelsDetached: false,
  _detachedSidebarNodes: [],
  _sidebarTransitionTimer: null,

  // --- INITIALIZATION ---
  async init() {
    // 1. Setup DB
    await db.init();

    // 2. Load User Preferences (Single Dark Purple Theme is directly active on :root)
    // Load saved background with robust error handling
    try {
      const savedBg = await db.getMeta('backgroundSrc', 'none');
      if (savedBg && savedBg !== 'none') {
        await this.setBackground(savedBg, true);
      }
    } catch (bgLoadErr) {
      console.error('[App.init] Lỗi khi nạp hình nền:', bgLoadErr);
    }

    const soundEnabled = await db.getMeta('soundEnabled', true);
    sounds.setEnabled(soundEnabled);
    const soundToggle = document.getElementById('setting-sound');
    if (soundToggle) soundToggle.checked = soundEnabled;

    const tabSoundEnabled = await db.getMeta('tabSoundEnabled', true);
    sounds.setTabSoundEnabled(tabSoundEnabled);
    const tabSoundToggle = document.getElementById('setting-tab-sound');
    if (tabSoundToggle) tabSoundToggle.checked = tabSoundEnabled;

    const dailyGoal = await db.getMeta('dailyGoal', 20);
    const goalInput = document.getElementById('setting-daily-goal');
    if (goalInput) goalInput.value = dailyGoal;

    const perQTimer = await db.getMeta('perQTimerEnabled', false);
    const perQSec = await db.getMeta('perQSeconds', 30);
    const perQToggle = document.getElementById('setting-per-q-timer');
    const perQInput = document.getElementById('setting-per-q-seconds');
    if (perQToggle) perQToggle.checked = perQTimer;
    if (perQInput) perQInput.value = perQSec;

    // Load collapsed sidebar state
    const sidebarCollapsed = await db.getMeta('sidebarCollapsed', false);
    if (sidebarCollapsed) {
      const sidebar = document.getElementById('app-sidebar');
      const main = document.querySelector('.app-main');
      if (sidebar) sidebar.classList.add('collapsed');
      if (main) main.classList.add('sidebar-collapsed');
      this._detachSidebarLabels();
    }

    // Check for saved session to restore (Section 5)
    const savedSession = await db.getMeta('activeSessionBackup', null);
    if (savedSession && savedSession.cardIds && savedSession.cardIds.length > 0) {
      const banner = document.getElementById('session-restore-banner');
      if (banner) banner.style.display = 'flex';
    }

    // 3. Setup Navigation & Events
    this.setupEventListeners();

    // 4. Setup PWA & Service Worker
    this.setupPWA();

    // 5. Initial Render
    this.updateHeroQuote();
    await this.updateGlobalStats();
    await this.renderDashboard();
  },

  // --- ROBUST MIXED LATEX & TEXT PARSER & RENDERER ---
  renderLatexText(text) {
    if (text === null || text === undefined) return '';
    const str = String(text);
    if (!str.trim()) return '';

    const hasKatex = (typeof katex !== 'undefined' && typeof katex.renderToString === 'function') ||
                     (typeof window !== 'undefined' && typeof window.katex !== 'undefined' && typeof window.katex.renderToString === 'function');
    const katexEngine = typeof katex !== 'undefined' && typeof katex.renderToString === 'function'
      ? katex
      : (typeof window !== 'undefined' ? window.katex : null);

    // Regex distinguishes Block Math $$...$$ and \[...\], and Inline Math $...$ and \(...\)
    const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\n]+?\$)/g;

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

      // Step 3 Requirement: Auto-escape unescaped % into \% inside math formulas
      code = code.replace(/(^|[^\\])%/g, '$1\\%');

      return { code: code.trim(), isBlock };
    };

    return parts.map(p => {
      if (p.type === 'text') {
        // Plain text: safely escape HTML (&, <, >, ") without corrupting _ or normal chars
        return escapeHtml(p.content);
      } else {
        const { code, isBlock } = cleanMath(p.raw);
        if (!hasKatex || !katexEngine) {
          return `<span class="katex-inline-wrap inline-block align-middle mx-1 font-mono">${escapeHtml(code)}</span>`;
        }
        try {
          // Inline Math uses displayMode: false; Block Math uses displayMode: true
          const rendered = katexEngine.renderToString(code, {
            displayMode: isBlock,
            throwOnError: false
          });
          if (isBlock) {
            return `<div class="katex-display-wrap overflow-x-auto my-2">${rendered}</div>`;
          } else {
            return `<span class="katex-inline-wrap inline-block align-middle mx-1">${rendered}</span>`;
          }
        } catch (e) {
          console.warn('KaTeX renderToString error:', e);
          return `<span class="katex-inline-wrap inline-block align-middle mx-1">${escapeHtml(code)}</span>`;
        }
      }
    }).join('');
  },

  // --- KATEX MATH RENDERING ---
  renderMath(container) {
    if (typeof renderMathInElement === 'function' && container) {
      try {
        renderMathInElement(container, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      } catch (err) {
        console.warn('KaTeX rendering error:', err);
      }
    }
  },

  // Helper: Resize and compress image on canvas before storing (max 1280px, ~120KB)
  async _compressImage(file, maxDim = 1280, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        try {
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);

          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          URL.revokeObjectURL(objectUrl);
          resolve(compressedBase64);
        } catch (canvasErr) {
          URL.revokeObjectURL(objectUrl);
          reject(canvasErr);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Không thể đọc file ảnh qua đối tượng Image.'));
      };

      img.src = objectUrl;
    });
  },

  // --- BACKGROUND MANAGER ---
  async setBackground(src, skipSave) {
    try {
      const layer = document.getElementById('bg-layer');

      if (!src || src === 'none') {
        if (layer) {
          layer.style.backgroundImage = '';
          layer.classList.remove('active');
        }
        document.body.style.backgroundImage = '';
      } else {
        // Enclose src in quotes for safe CSS url() parsing
        const safeSrc = src.replace(/"/g, '\\"');
        const urlVal = `url("${safeSrc}")`;
        if (layer) {
          layer.style.backgroundImage = urlVal;
          layer.classList.add('active');
        }
        // Direct body background guarantee for complete wallpaper visibility
        document.body.style.backgroundImage = urlVal;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundRepeat = 'no-repeat';
      }

      if (!skipSave) {
        try {
          await db.setMeta('backgroundSrc', src || 'none');
        } catch (dbErr) {
          console.error('[Background] Lỗi lưu backgroundSrc vào IndexedDB:', dbErr);
          throw dbErr;
        }
      }

      // Update picker thumb states
      document.querySelectorAll('.bg-thumb').forEach(thumb => {
        thumb.classList.toggle('active', thumb.dataset.bg === (src || 'none'));
      });
    } catch (err) {
      console.error('[Background] Lỗi cài đặt hình nền:', err);
      throw err;
    }
  },

  async handleBgUpload(event) {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type || !file.type.startsWith('image/')) {
        this.showToast('Vui lòng chọn file ảnh hợp lệ (jpg, png, webp...)', 'warning');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        this.showToast('Ảnh quá lớn (tối đa 15MB)', 'warning');
        return;
      }

      // 1. Instant preview using createObjectURL
      const instantPreviewUrl = URL.createObjectURL(file);
      await this.setBackground(instantPreviewUrl, true);
      this.showToast('Đang tối ưu hóa hình nền...', 'info');

      // 2. Compress image via canvas for persistent storage
      const compressedData = await this._compressImage(file, 1280, 0.82);

      // 3. Save compressed image to DB and apply permanently
      await this.setBackground(compressedData, false);
      this.showToast('Đã lưu hình nền tùy chọn thành công! 🖼️', 'success');

      // Reset file input so user can re-upload same file if desired
      event.target.value = '';
    } catch (err) {
      console.error('Lỗi tải ảnh nền:', err);
      this.showToast('Không thể lưu hình nền: ' + (err.message || 'Lỗi không xác định'), 'danger');
    }
  },

  // --- SIDEBAR DOM DETACH / RE-ATTACH LIFECYCLE ---
  _detachSidebarLabels() {
    if (this._sidebarLabelsDetached) return;
    this._detachedSidebarNodes = [];
    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;

    // 1. Detach brand title
    const brandTitle = sidebar.querySelector('.brand-title');
    if (brandTitle && brandTitle.parentNode) {
      this._detachedSidebarNodes.push({
        parent: brandTitle.parentNode,
        node: brandTitle,
        nextSibling: brandTitle.nextSibling
      });
      brandTitle.remove();
    }

    // 2. Detach nav item labels
    sidebar.querySelectorAll('.nav-item button').forEach(btn => {
      const label = btn.querySelector('.nav-label');
      if (label && label.parentNode) {
        this._detachedSidebarNodes.push({
          parent: label.parentNode,
          node: label,
          nextSibling: label.nextSibling
        });
        label.remove();
      }
    });

    // 3. Detach sidebar footer text & install button label if present
    const footerText = sidebar.querySelector('.sidebar-footer-text');
    if (footerText && footerText.parentNode) {
      this._detachedSidebarNodes.push({
        parent: footerText.parentNode,
        node: footerText,
        nextSibling: footerText.nextSibling
      });
      footerText.remove();
    }

    const installBtnLabel = sidebar.querySelector('#btn-pwa-install .nav-label');
    if (installBtnLabel && installBtnLabel.parentNode) {
      this._detachedSidebarNodes.push({
        parent: installBtnLabel.parentNode,
        node: installBtnLabel,
        nextSibling: installBtnLabel.nextSibling
      });
      installBtnLabel.remove();
    }

    this._sidebarLabelsDetached = true;
  },

  _attachSidebarLabels() {
    if (!this._sidebarLabelsDetached || !this._detachedSidebarNodes.length) return;
    for (const item of this._detachedSidebarNodes) {
      if (item.parent && item.node) {
        item.node.classList.add('sidebar-label-enter');
        if (item.nextSibling && item.nextSibling.parentNode === item.parent) {
          item.parent.insertBefore(item.node, item.nextSibling);
        } else {
          item.parent.appendChild(item.node);
        }
      }
    }
    this._detachedSidebarNodes = [];
    this._sidebarLabelsDetached = false;
  },

  // --- SIDEBAR COLLAPSE TOGGLE ---
  toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const main = document.querySelector('.app-main');
    if (!sidebar) return;

    if (this._sidebarTransitionTimer) {
      clearTimeout(this._sidebarTransitionTimer);
      this._sidebarTransitionTimer = null;
    }

    const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');

    if (!isCurrentlyCollapsed) {
      // --- COLLAPSING FLOW ---
      // 1. Trigger animated width reduction and text fade-out
      sidebar.classList.add('collapsing');
      sidebar.classList.add('collapsed');
      if (main) main.classList.add('sidebar-collapsed');

      // 2. Once animation completes (280ms), completely detach text nodes from DOM
      this._sidebarTransitionTimer = setTimeout(() => {
        this._detachSidebarLabels();
        sidebar.classList.remove('collapsing');
        this._sidebarTransitionTimer = null;
      }, 280);

      db.setMeta('sidebarCollapsed', true);
    } else {
      // --- EXPANDING FLOW ---
      // 1. Re-attach labels to DOM in enter state (opacity: 0)
      this._attachSidebarLabels();

      // 2. Expand width
      sidebar.classList.remove('collapsed');
      if (main) main.classList.remove('sidebar-collapsed');

      // 3. Trigger smooth fade-in
      requestAnimationFrame(() => {
        sidebar.querySelectorAll('.sidebar-label-enter').forEach(el => {
          el.classList.remove('sidebar-label-enter');
        });
      });

      db.setMeta('sidebarCollapsed', false);
    }
  },

  // --- NAVIGATION ---
  navigateTo(viewName, params = {}) {
    const isSameView = this.currentView === viewName;
    if (this.currentView === 'study' && viewName !== 'study') {
      this.clearPerQuestionTimer();
    }
    if (this.currentView === 'exam' && viewName !== 'exam') {
      if (this.examTimerInterval) {
        clearInterval(this.examTimerInterval);
        this.examTimerInterval = null;
      }
    }

    this.currentView = viewName;
    document.body.classList.remove('modal-open');
    document.body.classList.remove('flashcard-active');
    const isQuizActive = viewName === 'study' || viewName === 'exam';
    document.body.classList.toggle('quiz-active', isQuizActive);
    this._isCompletingSession = false;
    if (this._batteryCountTimer) {
      clearInterval(this._batteryCountTimer);
      this._batteryCountTimer = null;
    }
    if (this._batterySegTimer) {
      clearInterval(this._batterySegTimer);
      this._batterySegTimer = null;
    }

    // Trigger tab wave curtain transition & whoosh sound (< 450ms)
    if (!isSameView) {
      sounds.playTabWhoosh();
      const curtain = document.getElementById('tab-wave-curtain');
      if (curtain) {
        curtain.classList.remove('animating');
        void curtain.offsetWidth; // Force reflow
        curtain.classList.add('animating');
        setTimeout(() => curtain.classList.remove('animating'), 400);
      }
    }

    // Update nav classes
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Toggle view sections with strict mutual exclusivity
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.add('active');
      targetSection.style.removeProperty('display');
    }

    // Strict mode isolation between study & exam
    if (viewName === 'exam') {
      const studySec = document.getElementById('view-study');
      if (studySec) {
        studySec.classList.remove('active');
        studySec.style.setProperty('display', 'none', 'important');
      }
    } else if (viewName === 'study') {
      const examSec = document.getElementById('view-exam');
      if (examSec) {
        examSec.classList.remove('active');
        examSec.style.setProperty('display', 'none', 'important');
      }
    } else {
      const studySec = document.getElementById('view-study');
      if (studySec) studySec.style.setProperty('display', 'none', 'important');
      const examSec = document.getElementById('view-exam');
      if (examSec) examSec.style.setProperty('display', 'none', 'important');
    }

    // View specific lifecycle
    if (viewName === 'dashboard') {
      this.renderDashboard();
    } else if (viewName === 'decks') {
      this.renderDecks();
    } else if (viewName === 'bank') {
      this.renderQuestionBank();
    } else if (viewName === 'import') {
      this.setupImportView(params);
    } else if (viewName === 'import-lms') {
      this.setupImportLmsView(params);
    } else if (viewName === 'stats') {
      this.renderStatsView();
    } else if (viewName === 'settings') {
      this.renderSettingsView();
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.querySelector('.app-main');
    if (mainEl) mainEl.scrollTop = 0;
  },

  // --- PWA SETUP ---
  setupPWA() {
    // Register Service Worker in production only (avoid dev cache collisions on localhost)
    if ('serviceWorker' in navigator) {
      const isLocalhost = Boolean(
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1' ||
        location.hostname === '[::1]' ||
        location.hostname.endsWith('.localhost')
      );

      if (isLocalhost) {
        // Cleanly unregister any active workers during localhost development so code edits take effect immediately
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const reg of registrations) {
            reg.unregister();
          }
        }).catch(() => {});
      } else {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js')
            .catch(err => console.warn('SW Registration failed:', err));
        });
      }
    }

    // Handle install prompt
    const installBtn = document.getElementById('btn-pwa-install');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      if (installBtn) installBtn.style.display = 'inline-flex';
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (this.deferredInstallPrompt) {
          try {
            await this.deferredInstallPrompt.prompt();
            const choiceResult = await this.deferredInstallPrompt.userChoice;
            if (choiceResult && choiceResult.outcome === 'accepted') {
              this.showToast('Đã cài đặt ứng dụng vào màn hình chính!', 'success');
            }
          } catch (pwaErr) {
            console.warn('[PWA] Prompt error:', pwaErr);
          }
          this.deferredInstallPrompt = null;
          installBtn.style.display = 'none';
        } else {
          this.showToast('Ứng dụng đã sẵn sàng chạy offline hoặc đã được cài đặt!', 'info');
        }
      });
    }

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      if (installBtn) installBtn.style.display = 'none';
      this.showToast('MindSparks đã được cài đặt thành công!', 'success');
    });

    // Online / Offline notifications
    window.addEventListener('online', () => this.showToast('Đã kết nối lại internet.', 'info'));
    window.addEventListener('offline', () => this.showToast('Đang ở chế độ Offline (Dữ liệu vẫn lưu bình thường).', 'warning'));
  },

  // --- EVENT LISTENERS ---
  setupEventListeners() {
    // Navigation clicks
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        this.navigateTo(view);
      });
    });

    // Sound toggle in settings
    const soundToggle = document.getElementById('setting-sound');
    if (soundToggle) {
      soundToggle.addEventListener('change', (e) => {
        sounds.setEnabled(e.target.checked);
        db.setMeta('soundEnabled', e.target.checked);
        this.showToast(e.target.checked ? 'Đã bật âm thanh' : 'Đã tắt âm thanh', 'info');
      });
    }

    // Tab transition sound toggle in settings
    const tabSoundToggle = document.getElementById('setting-tab-sound');
    if (tabSoundToggle) {
      tabSoundToggle.addEventListener('change', (e) => {
        sounds.setTabSoundEnabled(e.target.checked);
        db.setMeta('tabSoundEnabled', e.target.checked);
        this.showToast(e.target.checked ? 'Đã bật âm thanh chuyển tab' : 'Đã tắt âm thanh chuyển tab', 'info');
      });
    }

    // Daily goal input
    const goalInput = document.getElementById('setting-daily-goal');
    if (goalInput) {
      goalInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value) || 20;
        db.setMeta('dailyGoal', val);
        this.updateGlobalStats();
      });
    }

    // Per-question timer settings (Section 5)
    const perQToggle = document.getElementById('setting-per-q-timer');
    if (perQToggle) {
      perQToggle.addEventListener('change', (e) => {
        db.setMeta('perQTimerEnabled', e.target.checked);
        this.showToast(e.target.checked ? 'Đã bật đếm ngược mỗi câu' : 'Đã tắt đếm ngược mỗi câu', 'info');
      });
    }

    const perQInput = document.getElementById('setting-per-q-seconds');
    if (perQInput) {
      perQInput.addEventListener('change', (e) => {
        const val = Math.max(5, parseInt(e.target.value) || 30);
        db.setMeta('perQSeconds', val);
      });
    }

    // Close modal handlers (buttons and overlay backdrop click)
    const closeModal = () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
      document.body.classList.remove('modal-open');
      this._batteryAnimToken++;
      if (this._batteryCountTimer) {
        clearInterval(this._batteryCountTimer);
        this._batteryCountTimer = null;
      }
      if (this._batterySegTimer) {
        clearInterval(this._batterySegTimer);
        this._batterySegTimer = null;
      }
      const resultContainer = document.getElementById('result-battery-container');
      if (resultContainer) {
        resultContainer.classList.remove('charged', 'overcharged');
        const segments = resultContainer.querySelectorAll('.pixel-battery-segment');
        segments.forEach(s => s.classList.remove('active', 'high', 'next-charging', 'unstable-pulse', 'reverse-wave'));
      }
      const modalBox = document.querySelector('#modal-session-complete .modal-box');
      if (modalBox) {
        modalBox.classList.remove('overcharged-pulse');
      }
      this._isCompletingSession = false;
    };

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          const isCompletionModal = overlay.id === 'modal-session-complete';
          closeModal();
          if (isCompletionModal) {
            this.navigateTo('decks');
          }
        }
      });
    });

    // Global click listener to close Cyber Violet dropdown menus when clicking outside
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.cyber-dropdown.open').forEach(wrap => {
        if (!wrap.contains(e.target)) {
          wrap.classList.remove('open');
        }
      });
    });

    // Card flip click & keyboard spacebar
    const flashcardCard = document.getElementById('active-flashcard');
    if (flashcardCard) {
      flashcardCard.onclick = () => this.flipFlashcard();
    }

    // Card top-right Next button click & tap listener
    const cardNextBtn = document.getElementById('btn-quiz-card-next');
    if (cardNextBtn) {
      cardNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.nextStudyQuestion();
      });
    }

    window.addEventListener('keydown', (e) => {
      // Exit completion modal or Focus mode on ESC
      if (e.key === 'Escape') {
        const completeModal = document.getElementById('modal-session-complete');
        if (completeModal && completeModal.classList.contains('show')) {
          closeModal();
          this.navigateTo('decks');
          return;
        }
        if (document.body.classList.contains('focus-mode-active')) {
          this.toggleFocusMode();
          return;
        }
      }

      if (this.currentView === 'study' && this.activeSession?.mode === 'flashcard') {
        if (e.code === 'Space') {
          e.preventDefault();
          this.flipFlashcard();
        } else if (e.key === '1') {
          this.rateFlashcard(1);
        } else if (e.key === '2') {
          this.rateFlashcard(2);
        } else if (e.key === '3') {
          this.rateFlashcard(3);
        } else if (e.key === '4') {
          this.rateFlashcard(4);
        }
      }
    });

    // High-performance passive scroll listener (zero main thread lag)
    window.addEventListener('scroll', () => {
      const topbar = document.getElementById('app-topbar') || document.querySelector('.app-topbar');
      if (topbar) {
        if (window.scrollY > 8) topbar.classList.add('scrolled');
        else topbar.classList.remove('scrolled');
      }
    }, { passive: true });
  },

  // --- GLOBAL STATS & STREAK ---
  async updateGlobalStats() {
    const streakData = await db.getMeta('streak', { count: 0 });
    const streakDisplay = document.getElementById('global-streak-count');
    if (streakDisplay) streakDisplay.textContent = streakData.count;

    const dueCards = await db.getDueCards();
    const dueBadges = document.querySelectorAll('.due-count-badge');
    dueBadges.forEach(badge => {
      badge.textContent = dueCards.length;
      badge.style.display = dueCards.length > 0 ? 'inline-block' : 'none';
    });
  },

  // --- RANDOM QUOTE GENERATOR (ROUND 15) ---
  defaultQuotes: [
    "if the enemy can predict your next move then **dont move**",
    "khi bạn muốn từ bỏ hãy nhớ lại lý do vì sao bạn **bắt đầu**",
    "kỷ luật là cầu nối giữa **mục tiêu** và **thành tựu**",
    "học không phải để hơn người khác mà là để **hơn chính mình hôm qua**",
    "bước chậm không thành vấn đề miễn là bạn **không dừng lại**",
    "thành công không phải đích đến mà là **hành trình nỗ lực mỗi ngày**"
  ],

  updateHeroQuote() {
    const heroTitle = document.getElementById('hero-title') || document.querySelector('.hero-title');
    if (!heroTitle) return;

    let quotesList = (window.QUOTES && Array.isArray(window.QUOTES) && window.QUOTES.length > 0)
      ? window.QUOTES
      : this.defaultQuotes;

    if (!quotesList || !Array.isArray(quotesList) || quotesList.length === 0) {
      quotesList = ["if the enemy can predict your next move then **dont move**"];
    }

    let selectedQuote = quotesList[0];

    if (quotesList.length > 1) {
      let lastIdx = -1;
      try {
        const savedIdx = localStorage.getItem('mindsparks_last_quote_idx');
        if (savedIdx !== null && !isNaN(parseInt(savedIdx, 10))) {
          lastIdx = parseInt(savedIdx, 10);
        }
      } catch (e) {
        // Safe localStorage access
      }

      // Build available candidate pool excluding the previously displayed quote
      const availableIndices = [];
      for (let i = 0; i < quotesList.length; i++) {
        if (i !== lastIdx) {
          availableIndices.push(i);
        }
      }

      const pool = availableIndices.length > 0 ? availableIndices : quotesList.map((_, i) => i);
      const chosenIdx = pool[Math.floor(Math.random() * pool.length)];

      try {
        localStorage.setItem('mindsparks_last_quote_idx', String(chosenIdx));
      } catch (e) {}

      selectedQuote = quotesList[chosenIdx];
    }

    // Dynamic responsive font size clamp based on quote length
    const cleanLength = String(selectedQuote).replace(/\*\*/g, '').trim().length;
    let responsiveFontSize = 'clamp(2.0rem, 4.8vw, 3.4rem)';
    if (cleanLength <= 30) {
      responsiveFontSize = 'clamp(2.5rem, 6.2vw, 4.4rem)';
    } else if (cleanLength <= 55) {
      responsiveFontSize = 'clamp(2.1rem, 5.0vw, 3.5rem)';
    } else if (cleanLength <= 85) {
      responsiveFontSize = 'clamp(1.75rem, 4.0vw, 2.75rem)';
    } else {
      responsiveFontSize = 'clamp(1.45rem, 3.2vw, 2.2rem)';
    }
    heroTitle.style.fontSize = responsiveFontSize;

    // Parse **...** syntax into solid colored accent and main spans
    heroTitle.innerHTML = this.formatQuoteHtml(selectedQuote);
  },

  formatQuoteHtml(rawQuote) {
    if (!rawQuote || typeof rawQuote !== 'string') {
      return '<span class="hero-title-main">TÔI</span> <span class="hero-title-accent">NGU</span> <span class="hero-title-sub">BẠN CŨNG THẾ</span>';
    }

    const parts = rawQuote.split(/(\*\*[^*]+\*\*)/g);
    let html = '';

    parts.forEach(part => {
      if (!part) return;
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        const accent = part.slice(2, -2);
        html += `<span class="hero-title-accent">${this._escapeHtml(accent)}</span>`;
      } else {
        html += `<span class="hero-title-main">${this._escapeHtml(part)}</span>`;
      }
    });

    return html || `<span class="hero-title-main">${this._escapeHtml(rawQuote)}</span>`;
  },

  // --- DASHBOARD VIEW ---
  async renderDashboard() {
    this.updateHeroQuote();
    await this.updateGlobalStats();
    const decks = await db.getAllDecks();
    const allCards = await db.getAllCards();
    const dueCards = await db.getDueCards();
    const streakData = await db.getMeta('streak', { count: 0 });
    const dailyGoal = await db.getMeta('dailyGoal', 20);

    // Get today's review count
    const todayStr = new Date().toISOString().slice(0, 10);
    const logs = await db.getRecentLogs(200);
    const todayLogs = logs.filter(l => new Date(l.timestamp).toISOString().slice(0, 10) === todayStr);
    const todayReviews = todayLogs.length;

    // Daily Goal Radial Progress & Battery Update
    const goalRatio = Math.min(1, Math.max(0, todayReviews / Math.max(1, dailyGoal)));
    const pctVal = Math.round(goalRatio * 100);

    const radialContainer = document.getElementById('dashboard-radial-container');
    const radialBar = document.getElementById('daily-radial-bar');
    const radialPct = document.getElementById('daily-radial-pct');
    const radialCount = document.getElementById('daily-radial-count');

    if (radialPct) radialPct.textContent = `${pctVal}%`;
    if (radialCount) radialCount.textContent = `${todayReviews} / ${dailyGoal} câu`;
    if (radialBar) {
      const circ = 251.32;
      const offset = circ * (1 - goalRatio);
      radialBar.style.strokeDashoffset = offset;
    }
    if (radialContainer) {
      if (pctVal >= 100) radialContainer.classList.add('goal-reached');
      else radialContainer.classList.remove('goal-reached');
    }

    // Update battery container for test suite compatibility & segmented blocks
    const batteryContainer = document.getElementById('dashboard-battery-container');
    const batteryPct = document.getElementById('dashboard-battery-pct');
    const batteryFill = document.getElementById('dashboard-battery-fill');
    const batterySub = document.getElementById('dashboard-battery-sub');
    if (batteryPct) batteryPct.textContent = `${pctVal}%`;
    if (batteryFill) batteryFill.style.width = `${pctVal}%`;
    if (batterySub) batterySub.textContent = `${todayReviews} / ${dailyGoal} câu`;
    if (batteryContainer) {
      if (pctVal >= 100) batteryContainer.classList.add('charged');
      else batteryContainer.classList.remove('charged');

      const activeSegs = Math.round((pctVal / 100) * 10);
      const segs = batteryContainer.querySelectorAll('.pixel-battery-segment');
      segs.forEach((s, idx) => {
        const isActive = (idx + 1) <= activeSegs;
        s.classList.toggle('active', isActive);
        s.classList.toggle('high', isActive && (idx + 1) >= 8);
      });
    }

    // SM-2 Memory Retention Radar & 7-Day Mini Heatmap Update
    let retentionPct = 96;
    if (allCards.length > 0) {
      const nonLapsedCards = allCards.filter(c => c.srs && c.srs.state !== 'lapsed' && c.srs.repetitions > 0);
      const learnedCards = allCards.filter(c => c.srs && c.srs.repetitions > 0);
      if (learnedCards.length > 0) {
        retentionPct = Math.round((nonLapsedCards.length / learnedCards.length) * 100);
        retentionPct = Math.min(99, Math.max(75, retentionPct));
      }
    }
    const elRetentionPct = document.getElementById('dashboard-retention-pct');
    const elRetentionFill = document.getElementById('dashboard-retention-fill');
    const elRetentionStatus = document.getElementById('dashboard-retention-status');
    if (elRetentionPct) elRetentionPct.textContent = `${retentionPct}%`;
    if (elRetentionFill) elRetentionFill.style.width = `${retentionPct}%`;
    if (elRetentionStatus) {
      if (retentionPct >= 90) elRetentionStatus.textContent = 'Tối ưu (Optimal)';
      else if (retentionPct >= 80) elRetentionStatus.textContent = 'Ổn định (Good)';
      else elRetentionStatus.textContent = 'Cần củng cố (Review Due)';
    }

    // Mini Heatmap 7 Ngày (Last 7 Days)
    const miniHeatmapEl = document.getElementById('mini-heatmap-days');
    if (miniHeatmapEl) {
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const now = new Date();
      const dots = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const isToday = (i === 0);
        const dayReviewCount = logs.filter(l => new Date(l.timestamp).toISOString().slice(0, 10) === dateStr).length;
        const isActive = dayReviewCount > 0 || (isToday && todayReviews > 0);
        const dayLabel = dayNames[d.getDay()];
        const dotTitle = isToday ? `Hôm nay: ${todayReviews} câu` : `${dateStr}: ${dayReviewCount} câu`;
        dots.push(`<div class="mini-day-dot ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}" title="${dotTitle}"><span class="day-dot-label">${dayLabel}</span></div>`);
      }
      miniHeatmapEl.innerHTML = dots.join('');
    }

    // Stats Grid
    const elTotalCards = document.getElementById('stat-total-cards');
    if (elTotalCards) elTotalCards.textContent = allCards.length;

    const elDueToday = document.getElementById('stat-due-today');
    if (elDueToday) elDueToday.textContent = dueCards.length;

    const elMastered = document.getElementById('stat-mastered-cards');
    const masteredCount = allCards.filter(c => c.srs?.state === 'mastered').length;
    if (elMastered) elMastered.textContent = masteredCount;

    const elStreakDays = document.getElementById('stat-streak-days');
    if (elStreakDays) elStreakDays.textContent = `${streakData.count} ngày`;

    // Render Recent Decks
    const grid = document.getElementById('dashboard-decks-grid');
    if (grid) {
      if (decks.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; background: var(--bg-surface); border-radius: var(--radius-card); border: 1px dashed var(--border-color);">
            <p style="color: var(--text-secondary); margin-bottom: 16px;">Bạn chưa có bộ câu hỏi nào.</p>
            <button class="btn btn-primary" onclick="App.navigateTo('import')">
              + Dán câu hỏi từ AI ngay
            </button>
          </div>
        `;
      } else {
        let html = '';
        for (const deck of decks.slice(0, 6)) {
          const deckCards = allCards.filter(c => c.deckId === deck.id);
          const deckDue = deckCards.filter(c => !c.srs?.dueDate || c.srs.dueDate <= Date.now());
          html += this._createDeckCardHtml(deck, deckCards.length, deckDue.length);
        }
        grid.innerHTML = html;
      }
    }
  },

  _createDeckCardHtml(deck, totalCards, dueCards) {
    return `
      <div class="deck-card">
        <div>
          <div class="deck-header">
            <h3 class="deck-name">${this._escapeHtml(deck.name)}</h3>
            <span class="tech-tag subtle">DECK</span>
          </div>
          <p class="deck-desc">${this._escapeHtml(deck.description || 'Không có mô tả')}</p>
        </div>
        <div>
          <div class="deck-meta">
            <span>📚 ${totalCards} câu hỏi</span>
            <span>⏰ ${dueCards} đến hạn</span>
          </div>
          <div class="deck-actions" style="flex-wrap: wrap;">
            <button class="btn btn-primary btn-deck-study" style="flex: 1;" onclick="App.startSession('${deck.id}', 'srs')">
              Ôn tập
            </button>
            <button class="btn btn-secondary" title="Thêm câu hỏi mới vào bộ thẻ này" onclick="App.openAddCardModal('${deck.id}')">
              ➕ Thêm
            </button>
            <button class="btn btn-secondary" title="Lật thẻ ghi nhớ" onclick="App.startSession('${deck.id}', 'flashcard')">
              🎴 Thẻ
            </button>
            <button class="btn btn-secondary" title="Thi thử tính giờ" onclick="App.openExamModal('${deck.id}')">
              ⏱️ Thi
            </button>
            <button class="btn btn-secondary" title="Đặt lại tiến trình học về ban đầu" onclick="App.confirmResetDeckProgress('${deck.id}')">
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // --- DECKS VIEW ---
  async renderDecks() {
    const decks = await db.getAllDecks();
    const allCards = await db.getAllCards();
    const container = document.getElementById('decks-list-container');
    if (!container) return;

    if (decks.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px; background: var(--bg-surface); border-radius: var(--radius-lg);">
          <h3>Chưa có bộ thẻ nào</h3>
          <p style="color: var(--text-secondary); margin: 12px 0 20px;">Dán câu hỏi do AI tạo để bắt đầu học ngay.</p>
          <button class="btn btn-primary" onclick="App.navigateTo('import')">+ Tạo hoặc Dán Thẻ Mới</button>
        </div>
      `;
      return;
    }

    let html = '<div class="decks-grid">';
    for (const deck of decks) {
      const cards = allCards.filter(c => c.deckId === deck.id);
      const due = cards.filter(c => !c.srs?.dueDate || c.srs.dueDate <= Date.now());
      html += `
        <div class="deck-card">
          <div>
            <div class="deck-header">
              <h3 class="deck-name">${this._escapeHtml(deck.name)}</h3>
              <button class="icon-btn" style="width: 30px; height: 30px; color: var(--danger);" title="Xóa bộ thẻ" onclick="App.confirmDeleteDeck('${deck.id}')">
                🗑️
              </button>
            </div>
            <p class="deck-desc">${this._escapeHtml(deck.description || 'Không có mô tả')}</p>
          </div>
          <div>
            <div class="deck-meta">
              <span>📚 ${cards.length} câu</span>
              <span>⏰ ${due.length} cần ôn</span>
            </div>
            <div class="deck-actions" style="flex-wrap: wrap;">
              <button class="btn btn-primary btn-deck-study" style="flex: 1;" onclick="App.startSession('${deck.id}', 'srs')">Ôn tập</button>
              <button class="btn btn-secondary" onclick="App.startSession('${deck.id}', 'flashcard')">Lật thẻ</button>
              <button class="btn btn-secondary" onclick="App.openExamModal('${deck.id}')">Thi thử</button>
              <button class="btn btn-secondary" onclick="App.navigateTo('import', { deckId: '${deck.id}' })">+ Thêm câu</button>
              <button class="btn btn-secondary" onclick="App.confirmResetDeckProgress('${deck.id}')" title="Đặt lại tiến trình học về ban đầu">🔄 Reset</button>
            </div>
          </div>
        </div>
      `;
    }
    html += '</div>';
    container.innerHTML = html;
  },

  async confirmResetDeckProgress(deckId) {
    const deck = await db.getDeck(deckId);
    if (!deck) return;
    if (confirm(`Bạn có chắc chắn muốn đặt lại toàn bộ tiến trình học (SRS) của bộ thẻ "${deck.name}" về ban đầu? (Tất cả thẻ sẽ trở về trạng thái Mới)`)) {
      await db.resetDeckProgress(deckId);
      this.showToast(`Đã đặt lại tiến trình của bộ thẻ "${deck.name}".`, 'info');
      this.renderDecks();
      this.renderDashboard();
      this.updateGlobalStats();
    }
  },

  async confirmDeleteDeck(deckId) {
    const deck = await db.getDeck(deckId);
    if (!deck) return;
    if (confirm(`Bạn có chắc chắn muốn xóa bộ câu hỏi "${deck.name}" và toàn bộ thẻ bên trong?`)) {
      await db.deleteDeck(deckId);
      this.showToast('Đã xóa bộ thẻ thành công.', 'info');
      this.renderDecks();
      this.updateGlobalStats();
    }
  },

  // --- STUDY SESSIONS (7 CORE MODES) ---
  selectedTopicsForReview: new Set(),

  async startSession(deckId, mode = 'srs', options = {}) {
    let cards = [];
    let title = 'Ôn Tập';
    let blindMode = options.blindMode || (mode === 'blind');

    if (mode === 'free') {
      // 1. Luyện tập tự do: Random toàn bộ câu hỏi
      cards = deckId ? await db.getCardsByDeck(deckId) : await db.getAllCards();
      title = '1. Luyện Tập Tự Do';
    } else if (mode === 'mistakes') {
      // 2. Ôn lại câu sai: Ưu tiên câu sai gần nhất hoặc sai nhiều lần
      cards = await db.getMistakeCards(deckId);
      title = '2. Ôn Lại Câu Hay Sai';
      if (cards.length === 0) {
        this.showToast('Bạn chưa có câu trả lời sai nào! Hãy làm một bài luyện tập trước nhé.', 'info');
        cards = deckId ? await db.getCardsByDeck(deckId) : await db.getAllCards();
      }
    } else if (mode === 'srs') {
      // 3. Spaced Repetition SM-2: Thẻ đến hạn
      cards = deckId ? await db.getDueCards(deckId) : await db.getDueCards();
      if (cards.length === 0) {
        cards = deckId ? await db.getCardsByDeck(deckId) : await db.getAllCards();
        title = '3. Luyện Tập Tự Do (Không có câu đến hạn hôm nay)';
      } else {
        title = '3. Lặp Lại Ngắt Quãng (SM-2)';
      }
    } else if (mode === 'topic') {
      // 5. Ôn theo chủ đề / tag cụ thể
      const topics = options.topics || [];
      cards = await db.getCardsByTopics(topics, deckId);
      title = `5. Ôn Theo Chủ Đề: ${topics.join(', ')}`;
    } else if (mode === 'blind') {
      // 6. Đoán trước khi xem đáp án: Ẩn các lựa chọn trước
      cards = deckId ? await db.getCardsByDeck(deckId) : await db.getAllCards();
      title = '6. Đoán Trước Khi Xem Đáp Án (Active Recall)';
      blindMode = true;
    } else if (mode === 'sprint') {
      // 7. Ôn nước rút: Tự động gom N câu từ các chủ đề yếu nhất
      const count = options.count || 15;
      cards = await db.getSprintCards(count, deckId);
      title = `7. Ôn Nước Rút (${cards.length} câu chủ đề yếu nhất) 🚀`;
    } else if (mode === 'flashcard') {
      cards = deckId ? await db.getCardsByDeck(deckId) : await db.getAllCards();
      title = 'Thẻ Ghi Nhớ Flashcard';
    }

    if (!cards || cards.length === 0) {
      this.showToast('Không tìm thấy câu hỏi phù hợp để bắt đầu!', 'warning');
      return;
    }

    // Shuffle cards (except for mistakes mode which preserves mistake priority order)
    if (mode !== 'mistakes' && mode !== 'sprint') {
      this._shuffleArray(cards);
    }

    this.activeSession = {
      mode: mode,
      deckId: deckId,
      title: title,
      cards: cards,
      currentIndex: 0,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      blindMode: blindMode,
      blindRevealed: false,
      userAnswers: {},
      answeredList: []
    };

    this.navigateTo('study');
    this.renderActiveStudyCard();
  },

  renderActiveStudyCard() {
    const session = this.activeSession;
    if (!session || session.currentIndex >= session.cards.length) {
      this.completeSession();
      return;
    }

    const card = session.cards[session.currentIndex];
    const total = session.cards.length;
    const current = session.currentIndex + 1;

    // Reset blindRevealed for current card if not answered
    if (!session.userAnswers?.[session.currentIndex]) {
      session.blindRevealed = false;
    }

    // Clear previous timer and update action toolbar
    this.clearPerQuestionTimer();
    this.updateStudyCardActionsUI(card);
    this.startPerQuestionTimer();

    // Header info
    const titleEl = document.getElementById('study-session-title');
    if (titleEl) titleEl.textContent = session.title;

    const counterEl = document.getElementById('study-counter');
    if (counterEl) counterEl.textContent = `${current} / ${total}`;

    // Auto reset scroll position to top (only for quiz mode, avoid disorienting user in flashcard mode)
    if (session.mode !== 'flashcard') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      const mainEl = document.querySelector('.app-main');
      if (mainEl) mainEl.scrollTop = 0;
    }

    const progressFill = document.getElementById('study-progress-fill');
    if (progressFill) progressFill.style.width = `${((current - 1) / total) * 100}%`;

    // Toggle Blind Recall Button state
    const blindBtn = document.getElementById('btn-toggle-blind');
    const blindLabel = document.getElementById('blind-status-label');
    if (blindBtn) {
      if (session.mode === 'flashcard') {
        blindBtn.style.display = 'none';
      } else {
        blindBtn.style.display = 'inline-flex';
        blindBtn.classList.toggle('active', session.blindMode);
        if (blindLabel) blindLabel.textContent = session.blindMode ? 'Bật' : 'Tắt';
      }
    }

    // Switch between Quiz UI and Flashcard UI with strict mutual exclusivity
    document.body.classList.toggle('flashcard-active', session.mode === 'flashcard');
    const quizArea = document.getElementById('study-quiz-area');
    const flashcardArea = document.getElementById('study-flashcard-area');
    const optionsContainer = document.getElementById('quiz-options-container');

    if (session.mode === 'flashcard') {
      if (quizArea) {
        quizArea.classList.add('hidden-mode');
        quizArea.style.setProperty('display', 'none', 'important');
      }
      if (optionsContainer) {
        // Unmount multiple-choice options completely so 0 option buttons exist in DOM
        optionsContainer.innerHTML = '';
      }
      if (flashcardArea) {
        flashcardArea.classList.remove('hidden-mode');
        flashcardArea.style.setProperty('display', 'flex', 'important');
      }
      this._renderFlashcardContent(card);
    } else {
      if (flashcardArea) {
        flashcardArea.classList.add('hidden-mode');
        flashcardArea.style.setProperty('display', 'none', 'important');
      }
      if (quizArea) {
        quizArea.classList.remove('hidden-mode');
        quizArea.style.setProperty('display', 'block', 'important');
      }
      this._renderQuizContent(card);
    }
  },

  // Multiple Choice Quiz Renderer
  _renderQuizContent(card) {
    const tagEl = document.getElementById('quiz-card-tag');
    const diff = card.difficulty || 'medium';
    const diffLabel = diff === 'easy' ? 'Dễ' : diff === 'hard' ? 'Khó' : 'Trung bình';
    const cardRefCode = card.id ? `REF//MS-${card.id.toString().slice(-4).toUpperCase()}` : 'REF//MS-8X4';
    if (tagEl) {
      tagEl.innerHTML = `
        <span class="topic-badge">🏷️ ${this._escapeHtml(card.topic || card.tag || 'Chung')}</span>
        <span class="difficulty-badge difficulty-${diff}">● ${diffLabel}</span>
        <span class="card-ref-badge">${cardRefCode}</span>
      `;
    }

    const qTextEl = document.getElementById('quiz-card-question');
    if (qTextEl) {
      qTextEl.innerHTML = this.renderLatexText(card.question);
    }

    const answeredState = this.activeSession?.userAnswers?.[this.activeSession.currentIndex];
    const isAnswered = Boolean(answeredState);

    const veil = document.getElementById('quiz-blind-veil');
    const optionsContainer = document.getElementById('quiz-options-container');
    const numericContainer = document.getElementById('quiz-numeric-container');

    if (card.type === 'numeric') {
      if (veil) {
        veil.style.setProperty('display', 'none', 'important');
        veil.classList.add('hidden-mode');
      }
      if (optionsContainer) {
        optionsContainer.innerHTML = '';
        optionsContainer.style.setProperty('display', 'none', 'important');
        optionsContainer.classList.add('hidden-mode');
      }
      if (numericContainer) {
        numericContainer.style.display = 'block';
        const numInput = document.getElementById('quiz-numeric-input');
        const submitBtn = document.getElementById('btn-quiz-numeric-submit');
        const feedbackEl = document.getElementById('quiz-numeric-feedback');
        if (isAnswered) {
          if (numInput) {
            numInput.value = answeredState.userVal !== undefined ? answeredState.userVal : '';
            numInput.disabled = true;
          }
          if (submitBtn) submitBtn.disabled = true;
          if (feedbackEl) {
            feedbackEl.style.display = 'block';
            if (answeredState.isCorrect) {
              feedbackEl.className = 'numeric-feedback correct';
              feedbackEl.innerHTML = `🎉 Chính xác! Đáp án đúng: <b>${card.correct_answer}</b>`;
            } else {
              feedbackEl.className = 'numeric-feedback incorrect';
              feedbackEl.innerHTML = `❌ Chưa chính xác. Bạn nhập: <i>${this._escapeHtml(answeredState.userVal || '')}</i>. Đáp án đúng: <b>${card.correct_answer}</b>`;
            }
          }
        } else {
          if (numInput) {
            numInput.value = '';
            numInput.disabled = false;
            numInput.focus();
          }
          if (submitBtn) submitBtn.disabled = false;
          if (feedbackEl) {
            feedbackEl.style.display = 'none';
            feedbackEl.innerHTML = '';
          }
        }
      }
    } else {
      if (numericContainer) numericContainer.style.display = 'none';

      // Conditional render: If blind mode is on, not answered, and user hasn't clicked reveal yet:
      // Only render panel Active Recall, completely unmount options block from DOM.
      const isBlindActive = Boolean(this.activeSession?.blindMode);
      const isRevealed = Boolean(this.activeSession?.blindRevealed);
      const showBlindPanel = isBlindActive && !isAnswered && !isRevealed;
      const quizCard = document.querySelector('#study-quiz-area .quiz-card');
      const quizArea = document.getElementById('study-quiz-area');
      if (quizCard) {
        quizCard.classList.toggle('blind-active', Boolean(showBlindPanel));
      }
      if (quizArea) {
        quizArea.classList.toggle('blind-active', Boolean(showBlindPanel));
      }
      document.body.classList.toggle('quiz-blind-active', Boolean(showBlindPanel));

      if (showBlindPanel) {
        // 1. Show Active Recall panel
        if (veil) {
          veil.style.setProperty('display', 'block', 'important');
          veil.classList.remove('hidden-mode');
        }
        // 2. Completely unmount / do not render options block into DOM
        if (optionsContainer) {
          optionsContainer.innerHTML = '';
          optionsContainer.style.setProperty('display', 'none', 'important');
          optionsContainer.classList.add('hidden-mode');
        }
      } else {
        // Hide Active Recall panel
        if (veil) {
          veil.style.setProperty('display', 'none', 'important');
          veil.classList.add('hidden-mode');
        }
        // Render options block into DOM
        this._renderOptionsBlock(card, answeredState);
      }
    }

    const expBox = document.getElementById('quiz-explanation-box');
    const fastNextBtn = document.getElementById('btn-quiz-fast-next');
    const cardNextBtn = document.getElementById('btn-quiz-card-next');
    const footerActions = document.querySelector('.quiz-footer-actions');
    const nextBtn = document.getElementById('btn-quiz-next');

    const isBlindActive = Boolean(this.activeSession?.blindMode);
    const isRevealed = Boolean(this.activeSession?.blindRevealed);
    const isBlindUnrevealed = isBlindActive && !isAnswered && !isRevealed;

    if (isAnswered) {
      if (expBox) expBox.style.removeProperty('display');
      if (footerActions) footerActions.style.removeProperty('display');
      const expText = document.getElementById('quiz-explanation-text');
      if (expBox && expText) {
        expText.innerHTML = this.renderLatexText(card.explanation || 'Không có giải thích thêm.');
        expBox.classList.add('show');
        this.renderMath(expBox);
      }
      if (fastNextBtn) {
        fastNextBtn.classList.add('show');
        fastNextBtn.style.display = 'inline-flex';
      }
      if (cardNextBtn) {
        cardNextBtn.classList.add('show');
        cardNextBtn.style.display = 'inline-flex';
        cardNextBtn.style.pointerEvents = 'auto';
        cardNextBtn.style.visibility = 'visible';
      }
      if (footerActions) footerActions.classList.add('show');
      if (nextBtn) {
        nextBtn.classList.add('show');
        nextBtn.style.visibility = 'visible';
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
        nextBtn.style.display = 'inline-flex';
        nextBtn.focus({ preventScroll: true });
      }
    } else {
      // Hide explanation and next button without layout shift
      if (expBox) {
        expBox.classList.remove('show');
        if (isBlindUnrevealed) {
          expBox.style.setProperty('display', 'none', 'important');
        } else {
          expBox.style.removeProperty('display');
        }
      }

      if (fastNextBtn) {
        fastNextBtn.classList.remove('show');
        fastNextBtn.style.display = 'none';
      }

      if (cardNextBtn) {
        cardNextBtn.classList.remove('show');
        cardNextBtn.style.display = 'none';
      }

      if (footerActions) {
        footerActions.classList.remove('show');
        if (isBlindUnrevealed) {
          footerActions.style.setProperty('display', 'none', 'important');
        } else {
          footerActions.style.removeProperty('display');
        }
      }

      if (nextBtn) {
        nextBtn.classList.remove('show');
        nextBtn.style.visibility = 'hidden';
        nextBtn.style.opacity = '0';
        nextBtn.style.pointerEvents = 'none';
        nextBtn.style.display = 'none';
      }
    }

    // Render LaTeX Math Formulas
    const quizArea = document.getElementById('study-quiz-area');
    this.renderMath(quizArea);
  },

  _renderOptionsBlock(card, answeredState) {
    const optionsContainer = document.getElementById('quiz-options-container');
    if (!optionsContainer) return;
    optionsContainer.innerHTML = '';
    optionsContainer.style.setProperty('display', 'flex', 'important');
    optionsContainer.classList.remove('hidden-mode');

    const session = this.activeSession;
    if (session) {
      session.cardShuffledOptions = session.cardShuffledOptions || {};
    }

    let shuffledList;
    if (session && session.cardShuffledOptions?.[session.currentIndex]) {
      shuffledList = session.cardShuffledOptions[session.currentIndex];
    } else {
      const originalOptions = card.options || [];
      const correctIdx = card.answerIndex !== undefined ? card.answerIndex : 0;
      const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

      const prepared = originalOptions.map((optText, idx) => {
        let optId = letters[idx];
        let rawText = optText;
        if (typeof optText === 'object' && optText !== null) {
          optId = optText.id || letters[idx];
          rawText = optText.text || '';
        }
        const isCorrect = (card.correct_option_id && optId === card.correct_option_id) ||
                          (card.correctOptionId && optId === card.correctOptionId) ||
                          (idx === correctIdx);
        return {
          id: optId,
          text: rawText,
          originalIdx: idx,
          isCorrect: Boolean(isCorrect)
        };
      });

      // Part C: Shuffle options randomly every time question is presented (Fisher-Yates)
      shuffledList = this.shuffleArray(prepared);
      if (session) {
        session.cardShuffledOptions[session.currentIndex] = shuffledList;
      }
    }

    const defaultLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const isAnswered = Boolean(answeredState);

    shuffledList.forEach((optObj, displayIdx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn shrink-0 w-full min-h-[52px] h-auto p-4 text-left break-words whitespace-normal rounded-xl bg-white/[0.03] border border-white/10 hover:border-violet-500/40 transition-all flex items-start gap-3';
      btn.dataset.index = displayIdx;

      const displayLetter = defaultLetters[displayIdx] || `${displayIdx + 1}`;
      let cleanText = typeof optObj.text === 'string' ? optObj.text.trim() : String(optObj.text || '');

      while (true) {
        const m = cleanText.match(/^([A-Za-z])[\s.):\-]+(.*)$/s);
        if (!m) break;
        cleanText = m[2].trim();
      }

      btn.innerHTML = `
        <span class="quiz-option-letter font-bold text-violet-400 text-base flex-shrink-0 select-none mt-0.5">${displayLetter}.</span>
        <div class="quiz-option-content flex-1 text-zinc-200 text-sm md:text-base leading-relaxed text-left break-words whitespace-normal">${this.renderLatexText(cleanText)}</div>
      `;

      if (isAnswered) {
        btn.disabled = true;
        if (optObj.isCorrect) {
          btn.classList.add('correct');
        } else if (displayIdx === answeredState.selectedIdx && !answeredState.isCorrect) {
          btn.classList.add('incorrect');
        }
      } else {
        btn.onclick = () => this.handleQuizAnswer(displayIdx, optObj, card, shuffledList);
      }
      optionsContainer.appendChild(btn);
    });

    const quizArea = document.getElementById('study-quiz-area');
    this.renderMath(quizArea);
  },

  revealBlindOptions() {
    if (!this.activeSession) return;
    this.activeSession.blindRevealed = true;

    const veil = document.getElementById('quiz-blind-veil');
    if (veil) {
      veil.style.setProperty('display', 'none', 'important');
      veil.classList.add('hidden-mode');
    }

    const quizCard = document.querySelector('#study-quiz-area .quiz-card');
    if (quizCard) {
      quizCard.classList.remove('blind-active');
    }
    const quizArea = document.getElementById('study-quiz-area');
    if (quizArea) {
      quizArea.classList.remove('blind-active');
    }
    document.body.classList.remove('quiz-blind-active');

    const expBox = document.getElementById('quiz-explanation-box');
    if (expBox) expBox.style.removeProperty('display');
    const footerActions = document.querySelector('.quiz-footer-actions');
    if (footerActions) footerActions.style.removeProperty('display');

    const card = this.activeSession.cards[this.activeSession.currentIndex];
    if (card) {
      const answeredState = this.activeSession.userAnswers?.[this.activeSession.currentIndex];
      this._renderOptionsBlock(card, answeredState);
    }

    sounds.playFlip();
  },

  toggleBlindMode() {
    if (!this.activeSession) return;
    this.activeSession.blindMode = !this.activeSession.blindMode;
    const isBlind = this.activeSession.blindMode;

    const blindBtn = document.getElementById('btn-toggle-blind');
    const blindLabel = document.getElementById('blind-status-label');
    if (blindBtn) {
      blindBtn.classList.toggle('active', isBlind);
      if (blindLabel) blindLabel.textContent = isBlind ? 'Bật' : 'Tắt';
    }

    this.saveActiveSessionState();

    // Check if current question is already answered
    const answeredState = this.activeSession.userAnswers?.[this.activeSession.currentIndex];
    if (answeredState) {
      // If already answered, do not veil or reset options! The answer state is preserved.
      return;
    }

    this.activeSession.blindRevealed = false;
    const card = this.activeSession.cards[this.activeSession.currentIndex];
    if (card) {
      const veil = document.getElementById('quiz-blind-veil');
      const optionsContainer = document.getElementById('quiz-options-container');
      const quizCard = document.querySelector('#study-quiz-area .quiz-card');
      const quizArea = document.getElementById('study-quiz-area');
      const expBox = document.getElementById('quiz-explanation-box');
      const footerActions = document.querySelector('.quiz-footer-actions');

      if (isBlind) {
        if (quizCard) quizCard.classList.add('blind-active');
        if (quizArea) quizArea.classList.add('blind-active');
        document.body.classList.add('quiz-blind-active');
        if (veil) {
          veil.style.setProperty('display', 'block', 'important');
          veil.classList.remove('hidden-mode');
        }
        if (optionsContainer) {
          optionsContainer.innerHTML = '';
          optionsContainer.style.setProperty('display', 'none', 'important');
          optionsContainer.classList.add('hidden-mode');
        }
        if (expBox) expBox.style.setProperty('display', 'none', 'important');
        if (footerActions) footerActions.style.setProperty('display', 'none', 'important');
      } else {
        if (quizCard) quizCard.classList.remove('blind-active');
        if (quizArea) quizArea.classList.remove('blind-active');
        document.body.classList.remove('quiz-blind-active');
        if (veil) {
          veil.style.setProperty('display', 'none', 'important');
          veil.classList.add('hidden-mode');
        }
        if (expBox) expBox.style.removeProperty('display');
        if (footerActions) footerActions.style.removeProperty('display');
        this._renderOptionsBlock(card, null);
      }
    }
  },

  async submitNumericAnswer() {
    const session = this.activeSession;
    if (!session) return;
    const card = session.cards[session.currentIndex];
    if (!card) return;

    if (!session.userAnswers) session.userAnswers = {};
    if (session.userAnswers[session.currentIndex] !== undefined) {
      return; // Already answered, prevent duplicate submission
    }

    const inputEl = document.getElementById('quiz-numeric-input');
    const userVal = inputEl ? inputEl.value.trim() : '';
    if (!userVal) {
      this.showToast('Vui lòng nhập một giá trị số!', 'warning');
      if (inputEl) inputEl.focus();
      return;
    }

    const isCorrect = this.compareNumericAnswer(userVal, card.correct_answer);

    session.userAnswers[session.currentIndex] = {
      type: 'numeric',
      userVal: userVal,
      correctVal: card.correct_answer,
      isCorrect: isCorrect
    };

    this.clearPerQuestionTimer();

    // Play tactile sound
    if (isCorrect) {
      sounds.playCorrect();
      session.correctCount++;
    } else {
      sounds.playIncorrect();
      session.incorrectCount++;
    }

    if (inputEl) inputEl.disabled = true;
    const submitBtn = document.getElementById('btn-quiz-numeric-submit');
    if (submitBtn) submitBtn.disabled = true;

    const feedbackEl = document.getElementById('quiz-numeric-feedback');
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      if (isCorrect) {
        feedbackEl.className = 'numeric-feedback correct';
        feedbackEl.innerHTML = `🎉 Chính xác! Đáp án đúng: <b>${card.correct_answer}</b>`;
      } else {
        feedbackEl.className = 'numeric-feedback incorrect';
        feedbackEl.innerHTML = `❌ Chưa chính xác. Bạn nhập: <i>${this._escapeHtml(userVal)}</i>. Đáp án đúng: <b>${card.correct_answer}</b>`;
      }
    }

    // Show explanation if present
    const expBox = document.getElementById('quiz-explanation-box');
    const expText = document.getElementById('quiz-explanation-text');
    if (expBox && expText) {
      expText.innerHTML = this.renderLatexText(card.explanation || 'Không có giải thích thêm.');
      expBox.classList.add('show');
      this.renderMath(expBox);
    }

    // Reveal Fast-Next button in top header
    const fastNextBtn = document.getElementById('btn-quiz-fast-next');
    if (fastNextBtn) {
      fastNextBtn.classList.add('show');
      fastNextBtn.style.display = 'inline-flex';
    }

    // Reveal card-top Next button (Mobile Item 8)
    const cardNextBtn = document.getElementById('btn-quiz-card-next');
    if (cardNextBtn) {
      cardNextBtn.classList.add('show');
      cardNextBtn.style.display = 'inline-flex';
      cardNextBtn.style.pointerEvents = 'auto';
      cardNextBtn.style.visibility = 'visible';
    }

    // Reveal Next button IMMEDIATELY so user can always continue
    const footerActions = document.querySelector('.quiz-footer-actions');
    if (footerActions) footerActions.classList.add('show');

    const nextBtn = document.getElementById('btn-quiz-next');
    if (nextBtn) {
      nextBtn.classList.add('show');
      nextBtn.style.visibility = 'visible';
      nextBtn.style.opacity = '1';
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.style.display = 'inline-flex';
      nextBtn.focus({ preventScroll: true });
    }

    // Update SRS & Card Stats in DB
    const rating = isCorrect ? 3 : 1;
    const nextSrs = SRS.calculateNext(card.srs, rating);
    card.srs = nextSrs;
    card.stats.reviewsCount = (card.stats.reviewsCount || 0) + 1;
    if (isCorrect) {
      card.stats.correctCount = (card.stats.correctCount || 0) + 1;
    } else {
      card.stats.incorrectCount = (card.stats.incorrectCount || 0) + 1;
    }
    card.stats.lastReviewed = Date.now();

    await db.saveCard(card);
    await db.logReview({
      deckId: card.deckId,
      cardId: card.id,
      rating: rating,
      isCorrect: isCorrect,
      mode: session.mode
    });

    session.answeredList.push({
      card: card,
      userVal: userVal,
      isCorrect: isCorrect
    });

    this.saveActiveSessionState();
  },

  async handleQuizAnswer(selectedIdx, correctIdx, card, optList) {
    const session = this.activeSession;
    if (!session) return;
    if (!session.userAnswers) session.userAnswers = {};
    if (session.userAnswers[session.currentIndex] !== undefined) {
      return; // Already answered, prevent duplicate submission
    }

    let isCorrect = false;
    let actualCorrectDisplayIdx = correctIdx;

    if (optList && Array.isArray(optList)) {
      const chosen = optList[selectedIdx];
      isCorrect = Boolean(chosen?.isCorrect);
      const foundIdx = optList.findIndex(o => o.isCorrect);
      actualCorrectDisplayIdx = foundIdx !== -1 ? foundIdx : 0;
    } else {
      const targetNum = typeof correctIdx === 'number' ? correctIdx : (card.answerIndex || 0);
      isCorrect = selectedIdx === targetNum;
      actualCorrectDisplayIdx = targetNum;
    }

    session.userAnswers[session.currentIndex] = {
      selectedIdx: selectedIdx,
      correctIdx: actualCorrectDisplayIdx,
      isCorrect: isCorrect
    };

    this.clearPerQuestionTimer();

    // Play tactile sound
    if (isCorrect) {
      sounds.playCorrect();
      session.correctCount++;
    } else {
      sounds.playIncorrect();
      session.incorrectCount++;
    }

    // Highlight options
    const optionBtns = document.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach(btn => {
      btn.disabled = true;
      const idx = parseInt(btn.dataset.index);
      if (idx === actualCorrectDisplayIdx) {
        btn.classList.add('correct');
      } else if (idx === selectedIdx && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    // Show explanation if present
    const expBox = document.getElementById('quiz-explanation-box');
    const expText = document.getElementById('quiz-explanation-text');
    if (expBox && expText) {
      expText.innerHTML = this.renderLatexText(card.explanation || 'Không có giải thích thêm.');
      expBox.classList.add('show');
      this.renderMath(expBox);
    }

    // Reveal Fast-Next button in top header
    const fastNextBtn = document.getElementById('btn-quiz-fast-next');
    if (fastNextBtn) {
      fastNextBtn.classList.add('show');
      fastNextBtn.style.display = 'inline-flex';
    }

    // Reveal card-top Next button (Mobile Item 8)
    const cardNextBtn = document.getElementById('btn-quiz-card-next');
    if (cardNextBtn) {
      cardNextBtn.classList.add('show');
      cardNextBtn.style.display = 'inline-flex';
      cardNextBtn.style.pointerEvents = 'auto';
      cardNextBtn.style.visibility = 'visible';
    }

    // Reveal Next button IMMEDIATELY so user can always continue
    const footerActions = document.querySelector('.quiz-footer-actions');
    if (footerActions) footerActions.classList.add('show');

    const nextBtn = document.getElementById('btn-quiz-next');
    if (nextBtn) {
      nextBtn.classList.add('show');
      nextBtn.style.visibility = 'visible';
      nextBtn.style.opacity = '1';
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.style.display = 'inline-flex';
      nextBtn.focus({ preventScroll: true });
    }

    // Update SRS & Card Stats in DB
    const rating = isCorrect ? 3 : 1;
    const nextSrs = SRS.calculateNext(card.srs, rating);
    card.srs = nextSrs;
    card.stats.reviewsCount = (card.stats.reviewsCount || 0) + 1;
    if (isCorrect) {
      card.stats.correctCount = (card.stats.correctCount || 0) + 1;
    } else {
      card.stats.incorrectCount = (card.stats.incorrectCount || 0) + 1;
    }
    card.stats.lastReviewed = Date.now();

    await db.saveCard(card);
    await db.logReview({
      deckId: card.deckId,
      cardId: card.id,
      rating: rating,
      isCorrect: isCorrect,
      mode: session.mode
    });

    session.answeredList.push({
      card: card,
      selectedIdx: selectedIdx,
      isCorrect: isCorrect
    });

    // Auto-save session progress (Section 5)
    this.saveActiveSessionState();
  },

  nextStudyQuestion() {
    const now = Date.now();
    if (this._lastNextClick && now - this._lastNextClick < 200) return;
    this._lastNextClick = now;

    if (this.activeSession) {
      this.activeSession.blindRevealed = false;
      this.activeSession.currentIndex++;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      const mainEl = document.querySelector('.app-main');
      if (mainEl) mainEl.scrollTop = 0;
      const quizArea = document.getElementById('study-quiz-area');
      if (quizArea) {
        quizArea.scrollTop = 0;
        quizArea.classList.remove('blind-active');
      }
      const quizCard = document.querySelector('#study-quiz-area .quiz-card');
      if (quizCard) {
        quizCard.classList.remove('blind-active');
      }
      document.body.classList.remove('quiz-blind-active');
      const expBox = document.getElementById('quiz-explanation-box');
      if (expBox) expBox.style.removeProperty('display');
      const footerActions = document.querySelector('.quiz-footer-actions');
      if (footerActions) footerActions.style.removeProperty('display');

      this.renderActiveStudyCard();
    }
  },

  // 3D Flashcard Renderer
  _renderFlashcardContent(card) {
    const fastNextBtn = document.getElementById('btn-quiz-fast-next');
    if (fastNextBtn) {
      fastNextBtn.classList.remove('show');
      fastNextBtn.style.display = 'none';
    }
    const cardNextBtn = document.getElementById('btn-quiz-card-next');
    if (cardNextBtn) {
      cardNextBtn.classList.remove('show');
      cardNextBtn.style.display = 'none';
    }

    const flashcard = document.getElementById('active-flashcard');
    if (flashcard) flashcard.classList.remove('flipped');
    const flashcardArea = document.getElementById('study-flashcard-area');
    if (flashcardArea) flashcardArea.classList.remove('card-flipped');
    const bottomActions = document.querySelector('.flashcard-bottom-actions');
    if (bottomActions) bottomActions.classList.remove('show');

    // Reset bottom action buttons (reveal button strictly hidden per Part C1)
    const revealBtn = document.getElementById('btn-flashcard-reveal');
    if (revealBtn) {
      revealBtn.style.display = 'none';
      revealBtn.style.setProperty('display', 'none', 'important');
    }

    const srsBar = document.getElementById('flashcard-srs-bar');
    if (srsBar) {
      srsBar.style.display = 'none';
      srsBar.style.setProperty('display', 'none', 'important');
    }

    const tagFront = document.getElementById('flashcard-tag-front');
    const diff = card.difficulty || 'medium';
    const diffLabel = diff === 'easy' ? 'Dễ' : diff === 'hard' ? 'Khó' : 'Trung bình';
    if (tagFront) {
      const typeBadge = card.type === 'numeric' ? '<span class="topic-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc;">🔢 Điền số</span>' : '';
      tagFront.innerHTML = `
        <span class="topic-badge">🏷️ ${this._escapeHtml(card.topic || card.tag || 'Chung')}</span>
        <span class="difficulty-badge difficulty-${diff}">● ${diffLabel}</span>
        ${typeBadge}
      `;
    }

    const qEl = document.getElementById('flashcard-question-text');
    if (qEl) qEl.innerHTML = this.renderLatexText(card.question);

    // Back content
    let correctOpt;
    if (card.type === 'numeric') {
      correctOpt = '🔢 ' + (card.correct_answer !== undefined ? card.correct_answer : '');
    } else {
      correctOpt = card.options?.[card.answerIndex] || 'Đáp án';
    }
    const ansEl = document.getElementById('flashcard-answer-text');
    if (ansEl) ansEl.innerHTML = this.renderLatexText(correctOpt);

    const expWrap = document.getElementById('flashcard-explanation-wrap');
    const expEl = document.getElementById('flashcard-explanation-text');
    const expToggle = document.getElementById('btn-flashcard-exp-toggle');
    if (card.explanation && card.explanation.trim()) {
      if (expWrap) {
        expWrap.style.display = 'block';
        expWrap.classList.remove('is-expanded');
      }
      if (expEl) expEl.innerHTML = this.renderLatexText(card.explanation);

      const plainExp = (card.explanation || '').trim();
      const isLong = plainExp.length > 70 || plainExp.includes('\n');
      if (expWrap) {
        expWrap.classList.toggle('is-collapsible', isLong);
      }
      if (expToggle) {
        expToggle.style.display = isLong ? 'inline-flex' : 'none';
        expToggle.textContent = 'Xem giải thích đầy đủ ▾';
      }
    } else {
      if (expWrap) {
        expWrap.style.display = 'none';
        expWrap.classList.remove('is-expanded', 'is-collapsible');
      }
      if (expEl) expEl.innerHTML = '';
      if (expToggle) expToggle.style.display = 'none';
    }

    // SRS interval preview badges
    const againPreview = document.getElementById('srs-preview-again');
    const hardPreview = document.getElementById('srs-preview-hard');
    const goodPreview = document.getElementById('srs-preview-good');
    const easyPreview = document.getElementById('srs-preview-easy');

    if (againPreview) againPreview.textContent = SRS.getIntervalPreview(card.srs, 1);
    if (hardPreview) hardPreview.textContent = SRS.getIntervalPreview(card.srs, 2);
    if (goodPreview) goodPreview.textContent = SRS.getIntervalPreview(card.srs, 3);
    if (easyPreview) easyPreview.textContent = SRS.getIntervalPreview(card.srs, 4);

    // Render LaTeX math
    this.renderMath(flashcard);
  },

  toggleFlashcardExplanation() {
    const expWrap = document.getElementById('flashcard-explanation-wrap');
    const toggleBtn = document.getElementById('btn-flashcard-exp-toggle');
    if (!expWrap) return;
    const isExpanded = expWrap.classList.toggle('is-expanded');
    if (toggleBtn) {
      toggleBtn.textContent = isExpanded ? 'Thu gọn ▴' : 'Xem giải thích đầy đủ ▾';
    }
  },

  flipFlashcard() {
    const now = Date.now();
    if (this._lastFlip && now - this._lastFlip < 250) return;
    this._lastFlip = now;

    const flashcard = document.getElementById('active-flashcard');
    if (!flashcard) return;

    flashcard.classList.toggle('flipped');
    sounds.playFlip();

    const isFlipped = flashcard.classList.contains('flipped');
    const revealBtn = document.getElementById('btn-flashcard-reveal');
    const srsBar = document.getElementById('flashcard-srs-bar');
    const flashcardArea = document.getElementById('study-flashcard-area');
    const bottomActions = document.querySelector('.flashcard-bottom-actions');

    if (flashcardArea) {
      flashcardArea.classList.toggle('card-flipped', isFlipped);
    }
    if (bottomActions) {
      bottomActions.classList.toggle('show', isFlipped);
    }

    if (revealBtn) {
      revealBtn.style.setProperty('display', isFlipped ? 'none' : 'flex', 'important');
      revealBtn.style.setProperty('display', 'none', 'important');
    }
    if (srsBar) {
      const disp = isFlipped ? 'grid' : 'none';
      srsBar.style.display = disp;
      srsBar.style.setProperty('display', disp, 'important');
    }
  },

  async rateFlashcard(rating) {
    this.clearPerQuestionTimer();
    const session = this.activeSession;
    if (!session) return;
    const card = session.cards[session.currentIndex];

    const isCorrect = rating >= 3;
    if (isCorrect) {
      sounds.playCorrect();
      session.correctCount++;
    } else {
      sounds.playIncorrect();
      session.incorrectCount++;
    }

    const nextSrs = SRS.calculateNext(card.srs, rating);
    card.srs = nextSrs;
    card.stats.reviewsCount = (card.stats.reviewsCount || 0) + 1;
    if (isCorrect) {
      card.stats.correctCount = (card.stats.correctCount || 0) + 1;
    } else {
      card.stats.incorrectCount = (card.stats.incorrectCount || 0) + 1;
    }
    card.stats.lastReviewed = Date.now();

    await db.saveCard(card);
    await db.logReview({
      deckId: card.deckId,
      cardId: card.id,
      rating: rating,
      isCorrect: isCorrect,
      mode: 'flashcard'
    });

    // Auto-save session progress (Section 5)
    this.saveActiveSessionState();

    session.currentIndex++;
    this.renderActiveStudyCard();
  },

  _isCompletingSession: false,
  _batteryCountTimer: null,
  _batterySegTimer: null,
  _batteryAnimToken: 0,

  // Completion Screen — Horizontal Segmented Pixel Battery Celebration (60 FPS Safe)
  completeSession() {
    if (this._isCompletingSession) return;
    this._isCompletingSession = true;

    this.clearPerQuestionTimer();
    this.clearActiveSessionState();
    document.body.classList.remove('flashcard-active');
    const session = this.activeSession;
    if (!session) {
      this._isCompletingSession = false;
      return;
    }

    const total = session.cards.length;
    const correct = session.correctCount;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    // 1. Play celebratory fanfare audio
    sounds.playFanfare();

    // 2. Populate modal elements (dynamically bound to real quiz counts)
    const modal = document.getElementById('modal-session-complete');
    const ratioEl = document.getElementById('complete-correct-ratio');
    const msgEl = document.getElementById('complete-message');
    const resultFill = document.getElementById('result-battery-fill');
    const resultPct = document.getElementById('result-battery-pct');
    const resultBadge = document.getElementById('result-battery-badge');
    const resultContainer = document.getElementById('result-battery-container');
    const segContainer = document.getElementById('result-battery-segments');
    const segments = segContainer ? segContainer.querySelectorAll('.pixel-battery-segment') : [];
    const modalBox = modal ? modal.querySelector('.modal-box') : null;

    // Invalidate any previous running animation tokens and clear timers
    this._batteryAnimToken++;
    if (this._batteryCountTimer) {
      clearInterval(this._batteryCountTimer);
      this._batteryCountTimer = null;
    }
    if (this._batterySegTimer) {
      clearInterval(this._batterySegTimer);
      this._batterySegTimer = null;
    }

    // Reset battery segments and containers before running sequence
    segments.forEach(s => {
      s.classList.remove('active', 'high', 'next-charging', 'unstable-pulse', 'reverse-wave');
    });
    if (resultContainer) {
      resultContainer.classList.remove('charged', 'overcharged');
    }
    if (modalBox) {
      modalBox.classList.remove('overcharged-pulse');
    }
    if (resultFill) {
      resultFill.style.width = '0%';
      resultFill.style.height = '0%';
    }
    if (resultPct) resultPct.textContent = '0%';
    if (resultBadge) resultBadge.style.display = 'none';

    // Strictly dynamic binding — never hardcoded
    if (ratioEl) ratioEl.textContent = `${correct} / ${total} câu đúng`;

    let message = 'Bạn đã hoàn thành phiên ôn tập xuất sắc! 🎉';
    if (pct < 60) message = 'Hãy tiếp tục kiên trì! Ôn lại các câu sai để ghi nhớ sâu hơn nhé.';
    else if (pct === 100) message = 'Hoàn hảo 100%! Trí nhớ của bạn đang hoạt động tuyệt vời! 🌟';
    if (msgEl) msgEl.textContent = message;

    // Halt heavy background gradient animations while modal is open
    document.body.classList.add('modal-open');
    if (modal) modal.classList.add('show');

    // 3. Execute sequential 3-stage battery animation
    this.animateCompletionBattery(correct, total, pct);
  },

  // Sequential 3-Stage Battery Animation
  // Stage 1 (0 -> 100%): Purple charging with smooth block fade
  // Stage 2 (100% -> 0%): Instant neon green switch + reverse energy sweep
  // Stage 3 (Impact): Critical overcharged shake + celebration badge
  async animateCompletionBattery(correct, total, pct) {
    const animId = ++this._batteryAnimToken;
    const isCancelled = () => animId !== this._batteryAnimToken;

    const resultContainer = document.getElementById('result-battery-container');
    const segContainer = document.getElementById('result-battery-segments');
    const segments = segContainer ? segContainer.querySelectorAll('.pixel-battery-segment') : [];
    const resultPct = document.getElementById('result-battery-pct');
    const resultFill = document.getElementById('result-battery-fill');
    const resultBadge = document.getElementById('result-battery-badge');
    const modalBox = document.querySelector('#modal-session-complete .modal-box');

    const targetSegments = Math.round((pct / 100) * 10);

    // Initial small pause for modal smooth fade-in (120ms)
    await new Promise(r => setTimeout(r, 120));
    if (isCancelled()) return;

    // Smooth count-up percentage in parallel
    if (resultPct) {
      let current = 0;
      const step = Math.max(1, Math.floor(pct / 18));
      this._batteryCountTimer = setInterval(() => {
        if (isCancelled()) {
          clearInterval(this._batteryCountTimer);
          this._batteryCountTimer = null;
          return;
        }
        current = Math.min(pct, current + step);
        resultPct.textContent = `${current}%`;
        if (current >= pct) {
          clearInterval(this._batteryCountTimer);
          this._batteryCountTimer = null;
        }
      }, 32);
    }
    if (resultFill) {
      resultFill.style.width = `${pct}%`;
    }

    // --- GIAI ĐOẠN 1: NẠP ĐẦY TUẦN TỰ MÀU TÍM (0% -> PCT%) ---
    // Nạp từng khối từ trái sang phải với màu tím nguyên bản & hiệu ứng chuyển màu mượt mà (fade)
    for (let i = 0; i < targetSegments; i++) {
      if (isCancelled()) return;
      if (segments[i]) {
        segments[i].classList.add('active');
        if (i >= 7) segments[i].classList.add('high');
      }
      await new Promise(r => setTimeout(r, 65));
    }
    if (isCancelled()) return;

    // Đảm bảo số % cuối cùng hiển thị chính xác
    if (resultPct) resultPct.textContent = `${pct}%`;

    // --- XỬ LÝ ĐIỂM THÔNG THƯỜNG (< 100%) ---
    if (pct < 100) {
      // Kích hoạt breathing pulse ở block kế tiếp để khích lệ ôn tập tiếp
      if (segments[targetSegments]) {
        segments[targetSegments].classList.add('next-charging');
      }
      return;
    }

    // --- XỬ LÝ ĐIỂM TUYỆT ĐỐI (MAX 100% / PERFECT) ---
    // Dừng ngắn 90ms để người dùng cảm nhận mốc 100% màu tím đầy đủ
    await new Promise(r => setTimeout(r, 90));
    if (isCancelled()) return;

    // --- GIAI ĐOẠN 2: ĐẢO CHIỀU & ĐỔI MÀU (100% -> 0%) ---
    // 1. Đổi toàn bộ trạng thái thanh pin sang màu xanh neon rực rỡ
    if (resultContainer) {
      resultContainer.classList.add('charged');
    }

    // 2. Chạy xung quét ngược neon liên tục từ block 9 (100%) lùi về block 0 (0%)
    for (let i = segments.length - 1; i >= 0; i--) {
      if (isCancelled()) return;
      if (segments[i]) {
        segments[i].classList.add('reverse-wave');
      }
      await new Promise(r => setTimeout(r, 45));
      if (segments[i]) {
        segments[i].classList.remove('reverse-wave');
      }
    }
    if (isCancelled()) return;

    // Đợi 60ms cho luồng xung hoàn tất chạm mốc 0%
    await new Promise(r => setTimeout(r, 60));
    if (isCancelled()) return;

    // --- GIAI ĐOẠN 3: SHAKE / RUNG CHẤN (OVERCHARGED STATE) ---
    // Kích hoạt rung chấn cho thanh pin và hiệu ứng rung lan toả popup
    if (resultContainer) {
      resultContainer.classList.add('overcharged');
    }
    if (modalBox) {
      modalBox.classList.add('overcharged-pulse');
    }
    if (resultBadge) {
      resultBadge.textContent = '⚡ ⚡ OVERCHARGED 100% ⚡ ⚡';
      resultBadge.style.display = 'inline-block';
    }

    // Âm thanh chiptune bùng nổ năng lượng
    sounds.playBatteryCharged();
  },

  // --- EXAM MODE (MODE 4) ---
  async openExamModal(deckId = null) {
    this.currentDeckIdForExam = deckId;
    const modal = document.getElementById('modal-exam-setup');
    if (modal) modal.classList.add('show');
  },

  toggleExamCountDropdown(e) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById('exam-count-dropdown-wrap');
    const wasOpen = wrap?.classList.contains('open');
    this.closeAllCyberDropdowns();
    if (wrap && !wasOpen) wrap.classList.add('open');
  },

  selectExamQuestionCount(val, label) {
    const select = document.getElementById('exam-question-count');
    if (select) select.value = String(val);
    const labelEl = document.getElementById('exam-count-dropdown-label');
    if (labelEl) labelEl.textContent = label;
    const menu = document.getElementById('exam-count-dropdown-menu');
    if (menu) {
      menu.querySelectorAll('.cyber-dropdown-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', onclickAttr.includes(`(${val},`));
      });
    }
    this.closeAllCyberDropdowns();
  },

  toggleExamTimeDropdown(e) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById('exam-time-dropdown-wrap');
    const wasOpen = wrap?.classList.contains('open');
    this.closeAllCyberDropdowns();
    if (wrap && !wasOpen) wrap.classList.add('open');
  },

  selectExamTimeLimit(val, label) {
    const select = document.getElementById('exam-time-limit');
    if (select) select.value = String(val);
    const labelEl = document.getElementById('exam-time-dropdown-label');
    if (labelEl) labelEl.textContent = label;
    const menu = document.getElementById('exam-time-dropdown-menu');
    if (menu) {
      menu.querySelectorAll('.cyber-dropdown-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', onclickAttr.includes(`(${val},`));
      });
    }
    this.closeAllCyberDropdowns();
  },

  async startExamFromModal() {
    const count = parseInt(document.getElementById('exam-question-count')?.value || '10');
    const minutes = parseInt(document.getElementById('exam-time-limit')?.value || '10');
    const timerEnabled = document.getElementById('exam-timer-enabled')?.checked ?? true;
    const modal = document.getElementById('modal-exam-setup');
    if (modal) modal.classList.remove('show');

    let all = this.currentDeckIdForExam 
      ? await db.getCardsByDeck(this.currentDeckIdForExam)
      : await db.getAllCards();

    if (all.length === 0) {
      this.showToast('Không có câu hỏi để bắt đầu bài thi!', 'warning');
      return;
    }

    this._shuffleArray(all);
    const examCards = all.slice(0, count);

    // Stop previous quiz timer & unmount/reset quiz components
    this.clearPerQuestionTimer();
    const quizOptions = document.getElementById('quiz-options-container');
    if (quizOptions) quizOptions.innerHTML = '';
    const expBox = document.getElementById('quiz-explanation-box');
    if (expBox) expBox.classList.remove('show');
    const fastNext = document.getElementById('btn-quiz-fast-next');
    if (fastNext) {
      fastNext.classList.remove('show');
      fastNext.style.display = 'none';
    }
    const cardNext = document.getElementById('btn-quiz-card-next');
    if (cardNext) {
      cardNext.classList.remove('show');
      cardNext.style.display = 'none';
    }
    const nextBtn = document.getElementById('btn-quiz-next');
    if (nextBtn) {
      nextBtn.classList.remove('show');
      nextBtn.style.display = 'none';
    }
    this.clearActiveSessionState();

    this.activeSession = {
      mode: 'exam',
      cards: examCards,
      currentIndex: 0,
      correctCount: 0,
      incorrectCount: 0,
      timeLimitMinutes: minutes,
      timerEnabled: timerEnabled,
      timeRemainingSec: timerEnabled ? minutes * 60 : null,
      userAnswers: {},
      answeredList: []
    };

    this.navigateTo('exam');
    this.initExamSession();
  },

  initExamSession() {
    const session = this.activeSession;
    if (!session) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.querySelector('.app-main');
    if (mainEl) mainEl.scrollTop = 0;

    if (this.examTimerInterval) clearInterval(this.examTimerInterval);

    const timerDisplay = document.getElementById('exam-timer-display');

    if (!session.timerEnabled) {
      if (timerDisplay) timerDisplay.textContent = 'Không giới hạn';
    } else {
      this.examTimerInterval = setInterval(() => {
        session.timeRemainingSec--;
        if (session.timeRemainingSec <= 0) {
          clearInterval(this.examTimerInterval);
          this.submitExam();
          return;
        }
        const m = Math.floor(session.timeRemainingSec / 60).toString().padStart(2, '0');
        const s = (session.timeRemainingSec % 60).toString().padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = `${m}:${s}`;
      }, 1000);
    }

    this.renderExamQuestion();
  },

  // --- TOPIC PICKER MODAL (MODE 5) ---
  async openTopicPickerModal(deckId = null) {
    this.currentDeckIdForTopic = deckId;
    this.selectedTopicsForReview.clear();
    const topics = await db.getAllTopics(deckId);
    const container = document.getElementById('topic-picker-chips');
    if (!container) return;

    if (topics.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); padding: 12px 0;">Chưa có chủ đề nào trong kho thẻ.</p>';
    } else {
      container.innerHTML = topics.map(t => `
        <div class="topic-chip" data-topic="${this._escapeHtml(t.topic)}" onclick="App.toggleTopicSelection(this, '${this._escapeHtml(t.topic)}')">
          <span>🏷️ ${this._escapeHtml(t.topic)}</span>
          <span class="topic-chip-count">${t.count} câu</span>
        </div>
      `).join('');
    }

    const modal = document.getElementById('modal-topic-picker');
    if (modal) modal.classList.add('show');
  },

  toggleTopicSelection(el, topic) {
    if (this.selectedTopicsForReview.has(topic)) {
      this.selectedTopicsForReview.delete(topic);
      el.classList.remove('selected');
    } else {
      this.selectedTopicsForReview.add(topic);
      el.classList.add('selected');
    }
  },

  startTopicReview() {
    const topics = Array.from(this.selectedTopicsForReview);
    if (topics.length === 0) {
      this.showToast('Vui lòng chọn ít nhất 1 chủ đề!', 'warning');
      return;
    }
    const modal = document.getElementById('modal-topic-picker');
    if (modal) modal.classList.remove('show');
    this.startSession(this.currentDeckIdForTopic, 'topic', { topics });
  },

  // --- SPRINT CRAM MODAL (MODE 7) ---
  openSprintModal(deckId = null) {
    this.currentDeckIdForSprint = deckId;
    const modal = document.getElementById('modal-sprint-setup');
    if (modal) modal.classList.add('show');
  },

  toggleSprintCountDropdown(e) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById('sprint-count-dropdown-wrap');
    const wasOpen = wrap?.classList.contains('open');
    this.closeAllCyberDropdowns();
    if (wrap && !wasOpen) wrap.classList.add('open');
  },

  selectSprintCardCount(val, label) {
    const select = document.getElementById('sprint-card-count');
    if (select) select.value = String(val);
    const labelEl = document.getElementById('sprint-count-dropdown-label');
    if (labelEl) labelEl.textContent = label;
    const menu = document.getElementById('sprint-count-dropdown-menu');
    if (menu) {
      menu.querySelectorAll('.cyber-dropdown-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', onclickAttr.includes(`(${val},`));
      });
    }
    this.closeAllCyberDropdowns();
  },

  startSprintReview() {
    const count = parseInt(document.getElementById('sprint-card-count')?.value || '15');
    const modal = document.getElementById('modal-sprint-setup');
    if (modal) modal.classList.remove('show');
    this.startSession(this.currentDeckIdForSprint, 'sprint', { count });
  },

  renderExamQuestion() {
    const session = this.activeSession;
    const card = session.cards[session.currentIndex];
    const total = session.cards.length;
    const current = session.currentIndex + 1;

    document.getElementById('exam-q-counter').textContent = `Câu ${current} / ${total}`;
    const examQText = document.getElementById('exam-q-text');
    if (examQText) examQText.innerHTML = this.renderLatexText(card.question);

    const optContainer = document.getElementById('exam-options-container');
    const numericContainer = document.getElementById('exam-numeric-container');
    const numericInput = document.getElementById('exam-numeric-input');

    if (card.type === 'numeric') {
      if (optContainer) optContainer.style.display = 'none';
      if (numericContainer) numericContainer.style.display = 'block';
      if (numericInput) {
        numericInput.value = session.userAnswers[session.currentIndex] !== undefined ? session.userAnswers[session.currentIndex] : '';
        numericInput.focus();
      }
    } else {
      if (numericContainer) numericContainer.style.display = 'none';
      if (optContainer) {
        optContainer.style.display = 'flex';
        optContainer.innerHTML = '';
      }

      session.cardShuffledOptions = session.cardShuffledOptions || {};
      let shuffledList = session.cardShuffledOptions[session.currentIndex];
      if (!shuffledList) {
        const originalOptions = card.options || [];
        const correctIdx = card.answerIndex !== undefined ? card.answerIndex : 0;
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        const prepared = originalOptions.map((optText, idx) => {
          let optId = letters[idx];
          let rawText = optText;
          if (typeof optText === 'object' && optText !== null) {
            optId = optText.id || letters[idx];
            rawText = optText.text || '';
          }
          const isCorrect = (card.correct_option_id && optId === card.correct_option_id) ||
                            (card.correctOptionId && optId === card.correctOptionId) ||
                            (idx === correctIdx);
          return { id: optId, text: rawText, originalIdx: idx, isCorrect: Boolean(isCorrect) };
        });
        shuffledList = this.shuffleArray(prepared);
        session.cardShuffledOptions[session.currentIndex] = shuffledList;
      }

      const chosen = session.userAnswers[session.currentIndex];
      const defaultLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

      shuffledList.forEach((optObj, idx) => {
        const btn = document.createElement('button');
        btn.className = `quiz-option-btn w-full min-h-[52px] h-auto p-3.5 md:p-4 rounded-xl text-left bg-white/[0.03] border border-white/10 hover:border-violet-500/40 transition-all flex items-start gap-3 ${chosen === idx ? 'correct' : ''}`;
        
        const defaultLetter = defaultLetters[idx] || `${idx + 1}`;
        let cleanText = typeof optObj.text === 'string' ? optObj.text.trim() : String(optObj.text || '');

        while (true) {
          const m = cleanText.match(/^([A-Za-z])[\s.):\-]+(.*)$/s);
          if (!m) break;
          cleanText = m[2].trim();
        }

        btn.innerHTML = `
          <span class="quiz-option-letter font-bold text-violet-400 text-base flex-shrink-0 select-none mt-0.5">${defaultLetter}.</span>
          <div class="quiz-option-content flex-1 text-zinc-200 text-sm md:text-base leading-relaxed text-left break-words">${this.renderLatexText(cleanText)}</div>
        `;
        btn.onclick = () => {
          session.userAnswers[session.currentIndex] = idx;
          this.renderExamQuestion();
        };
        if (optContainer) optContainer.appendChild(btn);
      });
    }

    this.renderMath(document.getElementById('view-exam'));

    // Prev / Next button state
    document.getElementById('btn-exam-prev').disabled = session.currentIndex === 0;
    const nextBtn = document.getElementById('btn-exam-next');
    if (session.currentIndex === total - 1) {
      nextBtn.textContent = 'Nộp bài 🏁';
      nextBtn.onclick = () => this.submitExam();
    } else {
      nextBtn.textContent = 'Câu sau ➡️';
      nextBtn.onclick = () => {
        session.currentIndex++;
        this.renderExamQuestion();
      };
    }
  },

  onExamNumericInput(event) {
    if (this.activeSession) {
      this.activeSession.userAnswers[this.activeSession.currentIndex] = event.target.value.trim();
    }
  },

  examPrevQuestion() {
    if (this.activeSession && this.activeSession.currentIndex > 0) {
      this.activeSession.currentIndex--;
      this.renderExamQuestion();
    }
  },

  async submitExam() {
    if (this.examTimerInterval) clearInterval(this.examTimerInterval);
    const session = this.activeSession;
    if (!session) return;

    let correct = 0;
    session.cards.forEach((card, idx) => {
      const ans = session.userAnswers[idx];
      let isCorrect = false;

      if (card.type === 'numeric') {
        isCorrect = this.compareNumericAnswer(ans, card.correct_answer);
      } else {
        const shuffledList = session.cardShuffledOptions?.[idx];
        if (shuffledList && ans !== undefined) {
          isCorrect = Boolean(shuffledList[ans]?.isCorrect);
        } else {
          isCorrect = ans === card.answerIndex;
        }
      }

      if (isCorrect) correct++;
      session.answeredList.push({
        card,
        userAns: ans,
        isCorrect
      });
    });

    session.correctCount = correct;
    session.incorrectCount = session.cards.length - correct;
    this.completeSession();
  },

  // --- IMPORT & AI PASTE VIEW ---
  async setupImportView(params = {}) {
    const decks = await db.getAllDecks();
    const select = document.getElementById('import-deck-select');
    if (select) {
      let html = '<option value="__new__">+ Tạo bộ thẻ mới</option>';
      decks.forEach(d => {
        const isSelected = params.deckId === d.id ? 'selected' : '';
        html += `<option value="${d.id}" ${isSelected}>${this._escapeHtml(d.name)}</option>`;
      });
      select.innerHTML = html;
      this.toggleNewDeckFields();
    }

    const curDeckId = select ? select.value : (params.deckId || '__new__');
    const importMenu = document.getElementById('import-deck-dropdown-menu');
    const importLabel = document.getElementById('import-deck-dropdown-label');
    if (importMenu) {
      let menuHtml = `
        <button type="button" class="cyber-dropdown-item ${curDeckId === '__new__' ? 'active' : ''}" onclick="App.selectImportDeck('__new__', '+ Tạo bộ thẻ mới')">
          <span>✨ + Tạo bộ thẻ mới</span>
        </button>
      `;
      decks.forEach(d => {
        const isActive = d.id === curDeckId;
        menuHtml += `
          <button type="button" class="cyber-dropdown-item ${isActive ? 'active' : ''}" onclick="App.selectImportDeck('${d.id}', '${this._escapeHtml(d.name).replace(/'/g, "\\'")}')">
            <span>🎴 ${this._escapeHtml(d.name)}</span>
          </button>
        `;
      });
      importMenu.innerHTML = menuHtml;
      const curDeckObj = decks.find(d => d.id === curDeckId);
      if (importLabel) importLabel.textContent = curDeckObj ? curDeckObj.name : '+ Tạo bộ thẻ mới';
    }
  },

  toggleImportDeckDropdown(e) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById('import-deck-dropdown-wrap');
    const wasOpen = wrap?.classList.contains('open');
    this.closeAllCyberDropdowns();
    if (wrap && !wasOpen) wrap.classList.add('open');
  },

  selectImportDeck(deckId, deckName) {
    const select = document.getElementById('import-deck-select');
    if (select) {
      select.value = deckId;
      this.toggleNewDeckFields();
    }
    const label = document.getElementById('import-deck-dropdown-label');
    if (label) label.textContent = deckName;
    const menu = document.getElementById('import-deck-dropdown-menu');
    if (menu) {
      menu.querySelectorAll('.cyber-dropdown-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', onclickAttr.includes(`'${deckId}'`));
      });
    }
    this.closeAllCyberDropdowns();
  },

  toggleNewDeckFields() {
    const select = document.getElementById('import-deck-select');
    const newFields = document.getElementById('new-deck-fields');
    if (select && newFields) {
      newFields.style.display = select.value === '__new__' ? 'block' : 'none';
    }
  },

  pasteSampleData() {
    const sample = `{
  "quiz_title": "Chương 3: Đạo hàm",
  "questions": [
    {
      "id": "q1",
      "topic": "Đạo hàm",
      "difficulty": "medium",
      "question": "Đạo hàm của $f(x) = x^2$ là gì?",
      "options": [
        { "id": "a", "text": "$2x$" },
        { "id": "b", "text": "$x^2$" },
        { "id": "c", "text": "$2$" },
        { "id": "d", "text": "$x$" }
      ],
      "correct_option_id": "a",
      "explanation": "Áp dụng quy tắc đạo hàm lũy thừa: $\\\\frac{d}{dx}x^n = nx^{n-1}$"
    }
  ]
}`;
    const textarea = document.getElementById('import-raw-input');
    if (textarea) {
      textarea.value = sample;
      this.showToast('Đã dán dữ liệu mẫu chuẩn mục 3!', 'info');
    }
  },

  copyAIPrompt() {
    const topic = document.getElementById('import-new-deck-name')?.value || '';
    const prompt = AIParser.generateAIPromptTemplate({ topic });
    navigator.clipboard.writeText(prompt)
      .then(() => {
        this.showToast('Đã sao chép prompt AI chuẩn vào clipboard! Dán vào ChatGPT/Claude ngay.', 'success');
      })
      .catch(() => {
        prompt('Sao chép prompt dưới đây:', prompt);
      });
  },

  async processImport() {
    const rawInput = document.getElementById('import-raw-input')?.value;
    if (!rawInput || !rawInput.trim()) {
      this.showToast('Vui lòng dán dữ liệu câu hỏi từ AI vào ô!', 'warning');
      return;
    }

    const alertBox = document.getElementById('import-validation-alert');

    try {
      const parsed = AIParser.parse(rawInput);

      // Handle validation warnings / errors
      if (parsed.errors && parsed.errors.length > 0) {
        if (alertBox) {
          alertBox.innerHTML = `
            <div class="validation-alert-box">
              <div class="validation-alert-title">
                ⚠️ Phát hiện ${parsed.errors.length} câu hỏi sai định dạng:
              </div>
              <ul class="validation-alert-list">
                ${parsed.errors.map(e => `<li><b>Câu ${e.index} (${e.id}):</b> ${this._escapeHtml(e.message)}</li>`).join('')}
              </ul>
            </div>
          `;
          alertBox.style.display = 'block';
        }
      } else if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.innerHTML = '';
      }

      if (parsed.cards.length === 0) {
        this.showToast('Không có câu hỏi hợp lệ nào để lưu! Vui lòng kiểm tra lỗi bên dưới.', 'danger');
        return;
      }

      const select = document.getElementById('import-deck-select');
      let targetDeckId = select ? select.value : '__new__';

      if (targetDeckId === '__new__') {
        const inputName = document.getElementById('import-new-deck-name')?.value;
        const inputDesc = document.getElementById('import-new-deck-desc')?.value;
        const deckName = inputName?.trim() || parsed.deckName || 'Bộ thẻ mới';
        const deckDesc = inputDesc?.trim() || parsed.description || '';

        const newDeck = await db.saveDeck({ name: deckName, description: deckDesc });
        targetDeckId = newDeck.id;
      }

      // Attach targetDeckId and guaranteed collision-proof unique ID to all cards
      const cardsToSave = parsed.cards.map(c => ({
        ...c,
        id: db.generateUniqueCardId(),
        deckId: targetDeckId
      }));

      // Create snapshot backup before saving
      await db.createSnapshot('before_import_' + targetDeckId);

      await db.saveCardsBatch(cardsToSave, { forceNew: true });

      // Safely update in-memory active session if user is currently studying this deck
      if (this.activeSession && this.activeSession.deckId === targetDeckId) {
        this.activeSession.cards = [...(this.activeSession.cards || []), ...cardsToSave];
      }

      let msg = `Đã lưu thành công ${cardsToSave.length} câu hỏi vào bộ thẻ! 🎉`;
      if (parsed.errors && parsed.errors.length > 0) {
        msg = `Đã lưu ${cardsToSave.length} câu hợp lệ (Bỏ qua ${parsed.errors.length} câu bị lỗi).`;
      }

      this.showToast(msg, 'success');
      Confetti.fire({ count: 60, duration: 2500 });

      // Clear input
      document.getElementById('import-raw-input').value = '';
      await this.updateGlobalStats();
      this.navigateTo('decks');
    } catch (err) {
      console.error(err);
      if (alertBox) {
        alertBox.innerHTML = `
          <div class="validation-alert-box">
            <div class="validation-alert-title">❌ Lỗi dữ liệu:</div>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">${this._escapeHtml(err.message)}</p>
          </div>
        `;
        alertBox.style.display = 'block';
      }
      this.showToast(err.message, 'danger');
    }
  },

  // --- LMS / MOODLE RAW IMPORT CONTROLLER ---
  _lmsParsedQuestions: [],

  async setupImportLmsView(params = {}) {
    const decks = await db.getAllDecks();
    const select = document.getElementById('lms-deck-select');
    if (select) {
      let html = '<option value="__new__">+ Tạo bộ thẻ mới</option>';
      decks.forEach(d => {
        const isSelected = params.deckId === d.id ? 'selected' : '';
        html += `<option value="${d.id}" ${isSelected}>${this._escapeHtml(d.name)}</option>`;
      });
      select.innerHTML = html;
      this.toggleLmsNewDeckFields();
    }

    const curDeckId = select ? select.value : (params.deckId || '__new__');
    const lmsMenu = document.getElementById('lms-deck-dropdown-menu');
    const lmsLabel = document.getElementById('lms-deck-dropdown-label');
    if (lmsMenu) {
      let menuHtml = `
        <button type="button" class="cyber-dropdown-item ${curDeckId === '__new__' ? 'active' : ''}" onclick="App.selectLmsDeck('__new__', '+ Tạo bộ thẻ mới')">
          <span>✨ + Tạo bộ thẻ mới</span>
        </button>
      `;
      decks.forEach(d => {
        const isActive = d.id === curDeckId;
        menuHtml += `
          <button type="button" class="cyber-dropdown-item ${isActive ? 'active' : ''}" onclick="App.selectLmsDeck('${d.id}', '${this._escapeHtml(d.name).replace(/'/g, "\\'")}')">
            <span>🎴 ${this._escapeHtml(d.name)}</span>
          </button>
        `;
      });
      lmsMenu.innerHTML = menuHtml;
      const curDeckObj = decks.find(d => d.id === curDeckId);
      if (lmsLabel) lmsLabel.textContent = curDeckObj ? curDeckObj.name : '+ Tạo bộ thẻ mới';
    }
  },

  toggleLmsDeckDropdown(e) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById('lms-deck-dropdown-wrap');
    const wasOpen = wrap?.classList.contains('open');
    this.closeAllCyberDropdowns();
    if (wrap && !wasOpen) wrap.classList.add('open');
  },

  selectLmsDeck(deckId, deckName) {
    const select = document.getElementById('lms-deck-select');
    if (select) {
      select.value = deckId;
      this.toggleLmsNewDeckFields();
    }
    const label = document.getElementById('lms-deck-dropdown-label');
    if (label) label.textContent = deckName;
    const menu = document.getElementById('lms-deck-dropdown-menu');
    if (menu) {
      menu.querySelectorAll('.cyber-dropdown-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', onclickAttr.includes(`'${deckId}'`));
      });
    }
    this.closeAllCyberDropdowns();
  },

  toggleLmsNewDeckFields() {
    const select = document.getElementById('lms-deck-select');
    const newFields = document.getElementById('lms-new-deck-fields');
    if (select && newFields) {
      newFields.style.display = select.value === '__new__' ? 'block' : 'none';
    }
  },

  pasteLmsSampleData() {
    const sample = `Câu hỏi 1
Hoàn thành
Đạt điểm 1,00 trên 1,00
Không gắn cờĐặt cờ
Đoạn văn câu hỏi
Câu 39 Để thực hiện thắng lợi mục tiêu đưa Việt Nam trở thành một nước công nghiệp theo hướng hiện đại, xây dựng giai cấp công nhân Việt Nam trong thời kỳ mới cần thực hiện giải pháp chủ yếu nào?
Select one:

a.
Đào tạo, bồi dưỡng, nâng cao trình đọ mọi mặt của công nhân, không ngừng chuyên môn hóa giai cấp công nhân.

b.
Nâng cao nhận thức kiên định quan điểm giai cấp công nhân là giai cấp lãnh đạo cách mạng thông qua đội tiên phong là Đảng Cộng sản Việt Nam.

c.
Xây dựng giai cấp công nhân lớn mạnh gắn với xây dựng và phát huy sức mạnh liên minh giai cấp nông dân và đội ngũ tri thức và doanh nhân.

d.
Thực hiện chiến lược xây dựng giai cấp công nhân lớn mạnh, gắn kết chặt với chiến lược phát triển kinh tế - xã hội, công nghiệp hóa đất nước, hội nhập quốc tế.
Câu hỏi 2
Hoàn thành
Đạt điểm 0,00 trên 1,00
Đặt cờ
Đoạn văn câu hỏi
Câu 27 Đâu là điều kiện khách quan quy định sứ mệnh lịch sử của giai cấp công nhân?
Select one:

a.
Sự liên minh giai cấp giữa giai cấp công nhân với giai cấp nông dân và các tầng lớp lao động khác do giai cấp công nhân thông qua đội tiên phong của nó là Đảng Cộng sản lãnh đạo.

b.
Sự phát triển của bản thân giai cấp công nhân cả về số lượng và chất lượng.

c.
Đảng Cộng sản là nhân tố quan trọng để giai cấp công nhân thực hiện thắng lợi sứ mệnh lịch sử của mình.

d.
Do địa vị chính trị - xã hội của giai cấp công nhân quy định`;

    const textarea = document.getElementById('lms-raw-input');
    if (textarea) {
      textarea.value = sample;
      this.showToast('Đã dán dữ liệu mẫu LMS (Moodle)! Bấm "Phân tích & Tách câu hỏi" để thử.', 'info');
    }
  },

  parseLmsInput() {
    const rawInput = document.getElementById('lms-raw-input')?.value;
    if (!rawInput || !rawInput.trim()) {
      this.showToast('Vui lòng dán nội dung copy từ LMS vào ô trước khi phân tích!', 'warning');
      return;
    }

    const parser = typeof LMSParser !== 'undefined' ? LMSParser : (window.LMSParser || null);
    if (!parser) {
      this.showToast('Module LMSParser chưa sẵn sàng!', 'danger');
      return;
    }

    const parsed = parser.parse(rawInput);
    const questions = Array.isArray(parsed) ? parsed : (parsed?.questions || []);
    if (!questions || questions.length === 0) {
      this.showToast('Không tìm thấy câu hỏi nào trong dữ liệu dán vào. Vui lòng kiểm tra lại định dạng.', 'warning');
      return;
    }

    this._lmsParsedQuestions = questions;

    // Show panels
    const countEl = document.getElementById('lms-preview-count');
    if (countEl) countEl.textContent = questions.length;

    const batchPanel = document.getElementById('lms-batch-panel');
    if (batchPanel) batchPanel.style.display = 'block';

    const previewContainer = document.getElementById('lms-preview-container');
    if (previewContainer) previewContainer.style.display = 'block';

    this.renderLmsPreview();
    this.showToast(`Đã bóc tách thành công ${questions.length} câu hỏi từ LMS!`, 'success');
  },

  renderLmsPreview() {
    const listEl = document.getElementById('lms-preview-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const questions = this._lmsParsedQuestions;
    if (!questions || questions.length === 0) {
      listEl.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 24px;">Không có câu hỏi nào trong danh sách xem trước.</p>';
      return;
    }

    const defaultLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    questions.forEach((q, idx) => {
      const isNeedsReview = Boolean(q.needs_review || q.needsReview);
      const cardEl = document.createElement('div');
      cardEl.className = `lms-preview-card ${isNeedsReview ? 'needs-review' : ''}`;
      cardEl.dataset.index = idx;

      const isNumeric = q.type === 'numeric';
      const warningText = q.reviewWarning || q.reviewReason || (isNeedsReview ? 'Cần kiểm tra lại' : '');
      const reviewBadge = isNeedsReview
        ? `<span class="badge-review-flag" title="${this._escapeHtml(warningText)}">⚠️ Cần kiểm tra (${this._escapeHtml(warningText)})</span>`
        : '';

      let optionsHtml = '';
      if (!isNumeric) {
        optionsHtml = `
          <div class="lms-options-group">
            ${(q.options || []).map((opt, optIdx) => {
              const optId = opt.id || defaultLetters[optIdx].toLowerCase();
              const isCorrect = q.correct_option_id === optId;
              const letterLabel = defaultLetters[optIdx] || optId.toUpperCase();
              return `
                <label class="lms-option-row ${isCorrect ? 'is-correct' : ''}">
                  <input type="radio" class="lms-option-radio" name="lms_correct_${idx}" value="${optId}" ${isCorrect ? 'checked' : ''} onchange="App.onLmsRadioChange(${idx}, '${optId}')">
                  <span class="lms-option-letter">${letterLabel}.</span>
                  <input type="text" class="lms-option-text-input" value="${this._escapeHtml(opt.text || '')}" placeholder="Nội dung phương án ${letterLabel}" oninput="App.onLmsOptionTextChange(${idx}, '${optId}', this.value)">
                </label>
              `;
            }).join('')}
          </div>
        `;
      } else {
        optionsHtml = `
          <div class="lms-numeric-row">
            <span style="font-size: 0.9rem; font-weight: 600; color: var(--accent);">🔢 Đáp án số:</span>
            <input type="text" class="lms-numeric-input" value="${this._escapeHtml(q.correct_answer !== null && q.correct_answer !== undefined ? String(q.correct_answer) : '')}" placeholder="Nhập số đúng (ví dụ: 3.14 hoặc 12,5)" oninput="App.onLmsNumericAnswerChange(${idx}, this.value)">
          </div>
        `;
      }

      const curDiff = q.difficulty || '';
      const diffLabelMap = {
        '': 'Độ khó (Tùy chọn)',
        'easy': 'Dễ (Easy)',
        'medium': 'Trung bình (Medium)',
        'hard': 'Khó (Hard)'
      };
      const diffIconMap = {
        '': '⚡',
        'easy': '🟢',
        'medium': '🟡',
        'hard': '🔴'
      };
      const typeLabel = isNumeric ? 'Điền số' : 'Trắc nghiệm';
      const typeIcon = isNumeric ? '🔢' : '📝';

      cardEl.innerHTML = `
        <div class="lms-preview-card-header">
          <div class="lms-card-badges">
            <span style="font-weight: 700; font-size: 0.95rem;">Câu ${idx + 1}</span>
            <span class="source-badge source-badge-lms">Nguồn: LMS</span>
            ${reviewBadge}
          </div>
          <div class="lms-card-actions">
            <!-- Cyber Violet Dropdown: Loại câu hỏi -->
            <div class="cyber-dropdown lms-type-cyber-dropdown" id="lms-type-dropdown-${idx}">
              <button type="button" class="cyber-dropdown-trigger lms-type-dropdown-trigger" onclick="App.toggleLmsCardTypeDropdown(event, ${idx})">
                <span class="cyber-dropdown-icon">${typeIcon}</span>
                <span class="cyber-dropdown-label" id="lms-type-label-${idx}">${typeLabel}</span>
                <svg class="cyber-dropdown-chevron" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              <div class="cyber-dropdown-menu" id="lms-type-menu-${idx}">
                <button type="button" class="cyber-dropdown-item ${!isNumeric ? 'active' : ''}" onclick="App.selectLmsCardType(${idx}, 'multiple_choice')">
                  <span>📝 Trắc nghiệm</span>
                </button>
                <button type="button" class="cyber-dropdown-item ${isNumeric ? 'active' : ''}" onclick="App.selectLmsCardType(${idx}, 'numeric')">
                  <span>🔢 Điền số</span>
                </button>
              </div>
            </div>
            <select class="lms-type-select" style="display: none;" onchange="App.onLmsTypeChange(${idx}, this.value)">
              <option value="multiple_choice" ${!isNumeric ? 'selected' : ''}>Trắc nghiệm</option>
              <option value="numeric" ${isNumeric ? 'selected' : ''}>Điền số</option>
            </select>
            <button type="button" class="lms-card-delete-btn" title="Xóa câu hỏi này" onclick="App.deleteLmsPreviewCard(${idx})">
              🗑️ Xóa
            </button>
          </div>
        </div>

        <textarea class="lms-question-edit-box" rows="2" placeholder="Nội dung câu hỏi..." oninput="App.onLmsQuestionChange(${idx}, this.value)">${this._escapeHtml(q.question || '')}</textarea>

        ${optionsHtml}

        <div class="lms-meta-row">
          <input type="text" class="form-control" style="font-size: 0.85rem;" placeholder="Chủ đề (Topic)" value="${this._escapeHtml(q.topic || '')}" oninput="App.onLmsTopicChange(${idx}, this.value)">
          
          <!-- Cyber Violet Dropdown: Độ khó -->
          <div class="cyber-dropdown lms-diff-cyber-dropdown" id="lms-diff-dropdown-${idx}">
            <button type="button" class="cyber-dropdown-trigger lms-diff-dropdown-trigger" onclick="App.toggleLmsCardDiffDropdown(event, ${idx})">
              <span class="cyber-dropdown-icon">${diffIconMap[curDiff] || '⚡'}</span>
              <span class="cyber-dropdown-label" id="lms-diff-label-${idx}">${diffLabelMap[curDiff] || 'Độ khó (Tùy chọn)'}</span>
              <svg class="cyber-dropdown-chevron" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div class="cyber-dropdown-menu" id="lms-diff-menu-${idx}">
              <button type="button" class="cyber-dropdown-item ${!curDiff ? 'active' : ''}" onclick="App.selectLmsCardDifficulty(${idx}, '')">
                <span>⚡ Độ khó (Tùy chọn)</span>
              </button>
              <button type="button" class="cyber-dropdown-item ${curDiff === 'easy' ? 'active' : ''}" onclick="App.selectLmsCardDifficulty(${idx}, 'easy')">
                <span>🟢 Dễ (Easy)</span>
              </button>
              <button type="button" class="cyber-dropdown-item ${curDiff === 'medium' ? 'active' : ''}" onclick="App.selectLmsCardDifficulty(${idx}, 'medium')">
                <span>🟡 Trung bình (Medium)</span>
              </button>
              <button type="button" class="cyber-dropdown-item ${curDiff === 'hard' ? 'active' : ''}" onclick="App.selectLmsCardDifficulty(${idx}, 'hard')">
                <span>🔴 Khó (Hard)</span>
              </button>
            </div>
          </div>
          <select class="form-control lms-difficulty-select" style="display: none;" onchange="App.onLmsDifficultyChange(${idx}, this.value)">
            <option value="" ${!q.difficulty ? 'selected' : ''}>Độ khó (Tùy chọn)</option>
            <option value="easy" ${q.difficulty === 'easy' ? 'selected' : ''}>Dễ (Easy)</option>
            <option value="medium" ${q.difficulty === 'medium' ? 'selected' : ''}>Trung bình (Medium)</option>
            <option value="hard" ${q.difficulty === 'hard' ? 'selected' : ''}>Khó (Hard)</option>
          </select>
          <input type="text" class="form-control" style="font-size: 0.85rem;" placeholder="Giải thích chi tiết (tùy chọn)" value="${this._escapeHtml(q.explanation || '')}" oninput="App.onLmsExplanationChange(${idx}, this.value)">
        </div>
      `;

      listEl.appendChild(cardEl);
    });

    this.renderMath(listEl);
  },

  onLmsDifficultyChange(cardIdx, val) {
    if (this._lmsParsedQuestions[cardIdx]) {
      this._lmsParsedQuestions[cardIdx].difficulty = val || null;
    }
  },

  toggleLmsCardTypeDropdown(e, idx) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById(`lms-type-dropdown-${idx}`);
    const wasOpen = wrap?.classList.contains('open');
    this.closeAllCyberDropdowns();
    if (wrap && !wasOpen) wrap.classList.add('open');
  },

  selectLmsCardType(idx, newType) {
    this.closeAllCyberDropdowns();
    const select = document.querySelectorAll('.lms-type-select')[idx];
    if (select) select.value = newType;
    this.onLmsTypeChange(idx, newType);
  },

  toggleLmsCardDiffDropdown(e, idx) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById(`lms-diff-dropdown-${idx}`);
    const wasOpen = wrap?.classList.contains('open');
    this.closeAllCyberDropdowns();
    if (wrap && !wasOpen) wrap.classList.add('open');
  },

  selectLmsCardDifficulty(idx, val) {
    this.closeAllCyberDropdowns();
    this.onLmsDifficultyChange(idx, val);
    const select = document.querySelectorAll('.lms-difficulty-select')[idx];
    if (select) select.value = val;

    const diffMap = {
      '': 'Độ khó (Tùy chọn)',
      'easy': 'Dễ (Easy)',
      'medium': 'Trung bình (Medium)',
      'hard': 'Khó (Hard)'
    };
    const diffIconMap = {
      '': '⚡',
      'easy': '🟢',
      'medium': '🟡',
      'hard': '🔴'
    };

    const labelEl = document.getElementById(`lms-diff-label-${idx}`);
    if (labelEl) labelEl.textContent = diffMap[val] || diffMap[''];

    const wrap = document.getElementById(`lms-diff-dropdown-${idx}`);
    if (wrap) {
      const iconEl = wrap.querySelector('.cyber-dropdown-icon');
      if (iconEl) iconEl.textContent = diffIconMap[val] || '⚡';
      wrap.querySelectorAll('.cyber-dropdown-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', (val === '' && onclickAttr.includes("('')")) || (val && onclickAttr.includes(`'${val}'`)));
      });
    }
  },

  onLmsQuestionChange(idx, val) {
    if (this._lmsParsedQuestions[idx]) {
      this._lmsParsedQuestions[idx].question = val;
    }
  },

  onLmsTypeChange(idx, newType) {
    if (this._lmsParsedQuestions[idx]) {
      this._lmsParsedQuestions[idx].type = newType;
      if (newType === 'multiple_choice' && (!this._lmsParsedQuestions[idx].options || this._lmsParsedQuestions[idx].options.length === 0)) {
        this._lmsParsedQuestions[idx].options = [
          { id: 'a', text: '' },
          { id: 'b', text: '' },
          { id: 'c', text: '' },
          { id: 'd', text: '' }
        ];
        this._lmsParsedQuestions[idx].correct_option_id = 'a';
      }
      this.renderLmsPreview();
    }
  },

  onLmsRadioChange(cardIdx, optId) {
    if (this._lmsParsedQuestions[cardIdx]) {
      this._lmsParsedQuestions[cardIdx].correct_option_id = optId;
      const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
      this._lmsParsedQuestions[cardIdx].answerIndex = letters.indexOf(optId);
      this.renderLmsPreview();
    }
  },

  onLmsOptionTextChange(cardIdx, optId, val) {
    if (this._lmsParsedQuestions[cardIdx]) {
      const opt = (this._lmsParsedQuestions[cardIdx].options || []).find(o => o.id === optId);
      if (opt) opt.text = val;
    }
  },

  onLmsNumericAnswerChange(cardIdx, val) {
    if (this._lmsParsedQuestions[cardIdx]) {
      this._lmsParsedQuestions[cardIdx].correct_answer = val;
    }
  },

  onLmsTopicChange(cardIdx, val) {
    if (this._lmsParsedQuestions[cardIdx]) {
      this._lmsParsedQuestions[cardIdx].topic = val;
    }
  },

  onLmsExplanationChange(cardIdx, val) {
    if (this._lmsParsedQuestions[cardIdx]) {
      this._lmsParsedQuestions[cardIdx].explanation = val;
    }
  },

  deleteLmsPreviewCard(idx) {
    if (this._lmsParsedQuestions) {
      this._lmsParsedQuestions.splice(idx, 1);
      const countEl = document.getElementById('lms-preview-count');
      if (countEl) countEl.textContent = this._lmsParsedQuestions.length;
      this.renderLmsPreview();
      this.showToast('Đã xóa câu hỏi khỏi danh sách xem trước.', 'info');
    }
  },

  applyBatchAnswers() {
    const seq = document.getElementById('lms-batch-answers')?.value;
    if (!seq || !seq.trim()) {
      this.showToast('Vui lòng nhập chuỗi đáp án (ví dụ: b, a, c, d, a)!', 'warning');
      return;
    }

    const parser = typeof LMSParser !== 'undefined' ? LMSParser : (window.LMSParser || null);
    if (!parser) {
      this.showToast('Module LMSParser chưa sẵn sàng!', 'danger');
      return;
    }

    const count = parser.applyBatchAnswers(this._lmsParsedQuestions, seq);
    this.renderLmsPreview();
    this.showToast(`Đã tự động gán đáp án cho ${count} câu hỏi trắc nghiệm! 🎯`, 'success');
  },

  clearLmsPreview() {
    this._lmsParsedQuestions = [];
    const listEl = document.getElementById('lms-preview-list');
    if (listEl) listEl.innerHTML = '';
    const previewContainer = document.getElementById('lms-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';
    const batchPanel = document.getElementById('lms-batch-panel');
    if (batchPanel) batchPanel.style.display = 'none';
    const countEl = document.getElementById('lms-preview-count');
    if (countEl) countEl.textContent = '0';
    this.showToast('Đã xóa dữ liệu xem trước.', 'info');
  },

  async saveLmsImport() {
    const questions = this._lmsParsedQuestions;
    if (!questions || questions.length === 0) {
      this.showToast('Chưa có câu hỏi nào để lưu! Vui lòng dán dữ liệu và phân tích trước.', 'warning');
      return;
    }

    let targetDeckId = document.getElementById('lms-deck-select')?.value;
    const batchTopic = document.getElementById('lms-batch-topic')?.value?.trim() || '';

    // Create new deck if needed
    if (!targetDeckId || targetDeckId === '__new__') {
      const inputName = document.getElementById('lms-new-deck-name')?.value;
      const inputDesc = document.getElementById('lms-new-deck-desc')?.value;
      const deckName = inputName?.trim() || (batchTopic ? `LMS: ${batchTopic}` : 'Bộ câu hỏi LMS');
      const deckDesc = inputDesc?.trim() || 'Nhập từ LMS Moodle';

      const newDeck = await db.saveDeck({ name: deckName, description: deckDesc });
      targetDeckId = newDeck.id;
    }

    const defaultLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const cardsToSave = questions.map((q, idx) => {
      const isNumeric = q.type === 'numeric';
      const rawOptions = (!isNumeric && q.options) ? q.options.map((o, optIdx) => ({
        id: o.id || defaultLetters[optIdx] || `${optIdx + 1}`,
        text: o.text || (typeof o === 'string' ? o : '')
      })) : [];

      const optStrings = rawOptions.map(o => o.text);
      const chosenId = q.correct_option_id || 'a';
      const ansIdx = rawOptions.findIndex(o => o.id === chosenId);

      return {
        id: db.generateUniqueCardId(),
        deckId: targetDeckId,
        type: isNumeric ? 'numeric' : 'multiple_choice',
        question: q.question,
        options: isNumeric ? [] : optStrings,
        rawOptions: isNumeric ? [] : rawOptions,
        correct_option_id: isNumeric ? null : chosenId,
        correctOptionId: isNumeric ? null : chosenId,
        correct_answer: isNumeric ? (q.correct_answer !== undefined && q.correct_answer !== null ? String(q.correct_answer).trim() : '') : null,
        answerIndex: ansIdx !== -1 ? ansIdx : 0,
        explanation: q.explanation || '',
        topic: q.topic || batchTopic || 'LMS',
        tag: q.topic || batchTopic || 'LMS',
        tags: ['Nguồn: LMS', ...(q.topic ? [q.topic] : []), ...(batchTopic ? [batchTopic] : [])],
        difficulty: q.difficulty || 'medium',
        source: 'lms', // Explicit LMS source for Part A
        needsReview: Boolean(q.needs_review || q.needsReview),
        needs_review: Boolean(q.needs_review || q.needsReview),
        reviewReason: q.reviewReason || q.reviewWarning || (Boolean(q.needs_review || q.needsReview) ? '⚠️ Cần kiểm tra' : ''),
        reviewWarning: q.reviewWarning || (Boolean(q.needs_review || q.needsReview) ? '⚠️ Cần kiểm tra' : ''),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        srs: {
          repetition: 0,
          interval: 0,
          easeFactor: 2.5,
          dueDate: Date.now(),
          state: 'new'
        },
        stats: {
          reviewsCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          lastReviewed: null
        }
      };
    });

    // Create snapshot backup before saving
    await db.createSnapshot('before_lms_import_' + targetDeckId);
    await db.saveCardsBatch(cardsToSave, { forceNew: true });

    // Update active session if studying this deck
    if (this.activeSession && this.activeSession.deckId === targetDeckId) {
      this.activeSession.cards = [...(this.activeSession.cards || []), ...cardsToSave];
    }

    this.showToast(`Đã lưu thành công ${cardsToSave.length} câu hỏi từ LMS vào kho thẻ! 🎉`, 'success');
    Confetti.fire({ count: 60, duration: 2500 });

    // Clear preview & input
    const rawInput = document.getElementById('lms-raw-input');
    if (rawInput) rawInput.value = '';
    this.clearLmsPreview();

    await this.updateGlobalStats();
    this.navigateTo('bank');
  },

  // --- STATS VIEW ---
  async renderStatsView() {
    const allCards = await db.getAllCards();
    const logs = await db.getRecentLogs(500);
    const streak = await db.getMeta('streak', { count: 0, history: [] });

    // States breakdown
    const states = { new: 0, learning: 0, review: 0, mastered: 0 };
    allCards.forEach(c => {
      const s = c.srs?.state || 'new';
      states[s] = (states[s] || 0) + 1;
    });

    document.getElementById('stat-breakdown-new').textContent = states.new;
    document.getElementById('stat-breakdown-learning').textContent = states.learning;
    document.getElementById('stat-breakdown-review').textContent = states.review;
    document.getElementById('stat-breakdown-mastered').textContent = states.mastered;

    // Accuracy
    const totalReviews = logs.length;
    const correctReviews = logs.filter(l => l.isCorrect).length;
    const accPct = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

    document.getElementById('stat-acc-pct').textContent = `${accPct}%`;
    document.getElementById('stat-total-reviews').textContent = totalReviews;
    document.getElementById('stat-view-streak').textContent = `${streak.count} ngày`;

    // Render Recent Activity Logs
    const logList = document.getElementById('stats-recent-logs');
    if (logList) {
      if (logs.length === 0) {
        logList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Chưa có lịch sử học tập.</p>';
      } else {
        let html = '';
        logs.slice(0, 15).forEach(l => {
          const d = new Date(l.timestamp).toLocaleDateString('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
          });
          const badge = l.isCorrect 
            ? '<span style="color: var(--success); font-weight: 700;">✓ Đúng</span>' 
            : '<span style="color: var(--danger); font-weight: 700;">✗ Sai</span>';
          html += `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.9rem;">
              <span>${d} (${l.mode || 'quiz'})</span>
              <span>${badge}</span>
            </div>
          `;
        });
        logList.innerHTML = html;
      }
    }

    await this.renderContributionHeatmap();
    await this.renderTopicPerformanceTable();
  },

  // --- SECTION 5: CARD ACTIONS & FOCUS MODE ---
  updateStudyCardActionsUI(card) {
    if (!card) return;
    const isBookmarked = Boolean(
      (typeof card.bookmarked === 'boolean' ? card.bookmarked : false) ||
      (typeof card.isBookmarked === 'boolean' ? card.isBookmarked : false) ||
      (typeof card.bookmarked === 'object' && card.bookmarked !== null ? (card.bookmarked.isBookmarked ?? card.bookmarked.bookmarked ?? false) : false)
    );
    const isFlagged = Boolean(
      (typeof card.flagged === 'boolean' ? card.flagged : false) ||
      (typeof card.isFlagged === 'boolean' ? card.isFlagged : false) ||
      (typeof card.flagged === 'object' && card.flagged !== null ? (card.flagged.isFlagged ?? card.flagged.flagged ?? false) : false)
    );

    const bookmarkBtns = [
      document.getElementById('btn-card-bookmark'),
      document.getElementById('btn-flashcard-bookmark')
    ].filter(Boolean);

    bookmarkBtns.forEach(btn => {
      btn.classList.toggle('active-bookmark', isBookmarked);
      btn.title = isBookmarked ? 'Bỏ lưu câu hỏi (⭐)' : 'Lưu câu hỏi quan trọng (⭐)';
      btn.innerHTML = isBookmarked ? '⭐' : '☆';
    });

    const flagBtns = [
      document.getElementById('btn-card-flag'),
      document.getElementById('btn-flashcard-flag')
    ].filter(Boolean);

    flagBtns.forEach(btn => {
      btn.classList.toggle('active-flag', isFlagged);
      btn.title = isFlagged ? 'Bỏ cờ diễn đạt chưa rõ (🚩)' : 'Đánh dấu diễn đạt chưa rõ (🚩)';
      btn.innerHTML = isFlagged ? '🚩' : '⚑';
    });
  },

  async toggleCurrentCardBookmark() {
    if (!this.activeSession) return;
    const card = this.activeSession.cards[this.activeSession.currentIndex];
    if (!card) return;
    const updated = await db.toggleBookmark(card.id);
    const nextState = Boolean(updated?.isBookmarked ?? updated?.bookmarked ?? false);
    card.bookmarked = nextState;
    card.isBookmarked = nextState;
    this.updateStudyCardActionsUI(card);
    this.showToast(nextState ? 'Đã lưu câu hỏi vào danh sách ⭐' : 'Đã bỏ lưu câu hỏi', 'info');
  },

  async toggleCurrentCardFlag() {
    if (!this.activeSession) return;
    const card = this.activeSession.cards[this.activeSession.currentIndex];
    if (!card) return;
    const updated = await db.toggleFlag(card.id);
    const nextState = Boolean(updated?.isFlagged ?? updated?.flagged ?? false);
    card.flagged = nextState;
    card.isFlagged = nextState;
    this.updateStudyCardActionsUI(card);
    this.showToast(nextState ? 'Đã gắn cờ "Diễn đạt chưa rõ" 🚩' : 'Đã bỏ gắn cờ', 'info');
  },

  toggleFocusMode() {
    document.body.classList.toggle('focus-mode-active');
    const isFocus = document.body.classList.contains('focus-mode-active');
    const btn = document.getElementById('btn-card-focus');
    if (btn) btn.classList.toggle('active', isFocus);
    this.showToast(isFocus ? 'Đã bật Chế độ tập trung 🎯 (ESC để thoát)' : 'Đã thoát Chế độ tập trung', 'info');
  },

  // --- PER-QUESTION COUNTDOWN TIMER ---
  perQuestionTimerTimeout: null,

  async startPerQuestionTimer() {
    this.clearPerQuestionTimer();
    const enabled = await db.getMeta('perQTimerEnabled', false);
    if (!enabled) return;

    const seconds = await db.getMeta('perQSeconds', 30);
    const track = document.getElementById('per-q-timer-wrap');
    const bar = document.getElementById('per-q-timer-bar');
    if (!track || !bar) return;

    track.style.display = 'block';
    bar.style.transition = 'none';
    bar.style.width = '100%';

    // Force layout reflow
    void bar.offsetWidth;

    bar.style.transition = `width ${seconds}s linear`;
    bar.style.width = '0%';

    this.perQuestionTimerTimeout = setTimeout(() => {
      sounds.playThud();
      this.showToast('Hết thời gian suy nghĩ cho câu hỏi này! ⏰', 'warning');
    }, seconds * 1000);
  },

  clearPerQuestionTimer() {
    if (this.perQuestionTimerTimeout) {
      clearTimeout(this.perQuestionTimerTimeout);
      this.perQuestionTimerTimeout = null;
    }
    const track = document.getElementById('per-q-timer-wrap');
    const bar = document.getElementById('per-q-timer-bar');
    if (track) track.style.display = 'none';
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '100%';
    }
  },

  // --- QUICK EDIT CARD MODAL ---
  openEditCurrentCardModal() {
    if (!this.activeSession) return;
    const card = this.activeSession.cards[this.activeSession.currentIndex];
    if (card) this.openEditCardModal(card);
  },

  async openEditCardById(cardId) {
    const card = await db.getCard(cardId);
    if (card) this.openEditCardModal(card);
  },

  async openAddCardModal(deckId = null) {
    const decks = await db.getAllDecks();
    const select = document.getElementById('edit-card-deck-select');
    const group = document.getElementById('edit-card-deck-group');
    if (select) {
      if (decks.length > 0) {
        select.innerHTML = decks.map(d => `<option value="${d.id}">${this._escapeHtml(d.name)}</option>`).join('');
        if (deckId) {
          select.value = deckId;
        } else if (this.currentDeck?.id) {
          select.value = this.currentDeck.id;
        }
      } else {
        select.innerHTML = '<option value="__new__">Bộ thẻ mặc định</option>';
      }
    }
    if (group) group.style.display = 'block';

    const selectedDeckId = select ? select.value : (deckId || decks[0]?.id || '__new__');
    const deckMenu = document.getElementById('edit-card-deck-dropdown-menu');
    const deckLabel = document.getElementById('edit-card-deck-dropdown-label');
    if (deckMenu) {
      if (decks.length > 0) {
        let menuHtml = '';
        decks.forEach(d => {
          const isActive = d.id === selectedDeckId;
          menuHtml += `
            <button type="button" class="cyber-dropdown-item ${isActive ? 'active' : ''}" onclick="App.selectEditCardDeck('${d.id}', '${this._escapeHtml(d.name).replace(/'/g, "\\'")}')">
              <span>🎴 ${this._escapeHtml(d.name)}</span>
            </button>
          `;
        });
        deckMenu.innerHTML = menuHtml;
        const currentDeckObj = decks.find(d => d.id === selectedDeckId) || decks[0];
        if (deckLabel) deckLabel.textContent = currentDeckObj ? currentDeckObj.name : 'Chọn bộ thẻ...';
      } else {
        deckMenu.innerHTML = `
          <button type="button" class="cyber-dropdown-item active" onclick="App.selectEditCardDeck('__new__', 'Bộ thẻ mặc định')">
            <span>🎴 Bộ thẻ mặc định</span>
          </button>
        `;
        if (deckLabel) deckLabel.textContent = 'Bộ thẻ mặc định';
      }
    }

    const title = document.querySelector('#modal-edit-card .modal-title');
    if (title) title.textContent = '➕ Thêm Câu Hỏi Mới';

    document.getElementById('edit-card-id').value = ''; // empty indicates new card
    document.getElementById('edit-card-topic').value = '';
    this.selectEditCardDifficulty('medium');
    document.getElementById('edit-card-question').value = '';

    document.getElementById('edit-card-opt-a').value = '';
    document.getElementById('edit-card-opt-b').value = '';
    document.getElementById('edit-card-opt-c').value = '';
    document.getElementById('edit-card-opt-d').value = '';

    this.selectEditCardCorrect('a');
    document.getElementById('edit-card-explanation').value = '';

    const previewBox = document.getElementById('edit-card-preview-box');
    if (previewBox) previewBox.style.display = 'none';

    const modal = document.getElementById('modal-edit-card');
    if (modal) modal.classList.add('show');
  },

  openEditCardModal(card) {
    const group = document.getElementById('edit-card-deck-group');
    if (group) group.style.display = 'none'; // Keep card in its existing deck

    const title = document.querySelector('#modal-edit-card .modal-title');
    if (title) title.textContent = '✏️ Sửa Nhanh Nội Dung Câu Hỏi';

    document.getElementById('edit-card-id').value = card.id;
    document.getElementById('edit-card-topic').value = card.topic || card.tag || '';
    this.selectEditCardDifficulty(card.difficulty || 'medium');
    document.getElementById('edit-card-question').value = card.question || '';

    document.getElementById('edit-card-opt-a').value = card.options?.[0] || '';
    document.getElementById('edit-card-opt-b').value = card.options?.[1] || '';
    document.getElementById('edit-card-opt-c').value = card.options?.[2] || '';
    document.getElementById('edit-card-opt-d').value = card.options?.[3] || '';

    const letters = ['a', 'b', 'c', 'd'];
    const curCorrect = letters[card.answerIndex] || 'a';
    this.selectEditCardCorrect(curCorrect);

    document.getElementById('edit-card-explanation').value = card.explanation || '';

    const previewBox = document.getElementById('edit-card-preview-box');
    if (previewBox) previewBox.style.display = 'none';

    const modal = document.getElementById('modal-edit-card');
    if (modal) modal.classList.add('show');
  },

  toggleEditCardDeckDropdown(e) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById('edit-card-deck-dropdown-wrap');
    const wasOpen = wrap?.classList.contains('open');
    this.closeAllCyberDropdowns();
    if (wrap && !wasOpen) wrap.classList.add('open');
  },

  selectEditCardDeck(deckId, deckName) {
    const select = document.getElementById('edit-card-deck-select');
    if (select) select.value = deckId;
    const label = document.getElementById('edit-card-deck-dropdown-label');
    if (label) label.textContent = deckName;
    const menu = document.getElementById('edit-card-deck-dropdown-menu');
    if (menu) {
      menu.querySelectorAll('.cyber-dropdown-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', onclickAttr.includes(`'${deckId}'`));
      });
    }
    this.closeAllCyberDropdowns();
  },

  toggleEditCardDiffDropdown(e) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById('edit-card-diff-dropdown-wrap');
    const wasOpen = wrap?.classList.contains('open');
    this.closeAllCyberDropdowns();
    if (wrap && !wasOpen) wrap.classList.add('open');
  },

  selectEditCardDifficulty(diff) {
    const diffMap = {
      easy: '🟢 Dễ (Easy)',
      medium: '🟡 Vừa (Medium)',
      hard: '🔴 Khó (Hard)'
    };
    const select = document.getElementById('edit-card-difficulty');
    if (select) select.value = diff;
    const label = document.getElementById('edit-card-diff-dropdown-label');
    if (label) label.textContent = diffMap[diff] || diffMap.medium;
    const menu = document.getElementById('edit-card-diff-dropdown-menu');
    if (menu) {
      menu.querySelectorAll('.cyber-dropdown-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', onclickAttr.includes(`'${diff}'`));
      });
    }
    this.closeAllCyberDropdowns();
  },

  toggleEditCardCorrectDropdown(e) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById('edit-card-correct-dropdown-wrap');
    const wasOpen = wrap?.classList.contains('open');
    this.closeAllCyberDropdowns();
    if (wrap && !wasOpen) wrap.classList.add('open');
  },

  selectEditCardCorrect(ans) {
    const lower = (ans || 'a').toLowerCase();
    const select = document.getElementById('edit-card-correct');
    if (select) select.value = lower;
    const label = document.getElementById('edit-card-correct-dropdown-label');
    if (label) label.textContent = `Đáp án ${lower.toUpperCase()}`;
    const menu = document.getElementById('edit-card-correct-dropdown-menu');
    if (menu) {
      menu.querySelectorAll('.cyber-dropdown-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', onclickAttr.includes(`'${lower}'`));
      });
    }
    this.closeAllCyberDropdowns();
  },

  toggleEditCardPreview() {
    const previewBox = document.getElementById('edit-card-preview-box');
    const previewContent = document.getElementById('edit-card-preview-content');
    if (!previewBox || !previewContent) return;

    if (previewBox.style.display === 'block') {
      previewBox.style.display = 'none';
      return;
    }

    const q = document.getElementById('edit-card-question').value;
    const a = document.getElementById('edit-card-opt-a').value;
    const b = document.getElementById('edit-card-opt-b').value;
    const c = document.getElementById('edit-card-opt-c').value;
    const d = document.getElementById('edit-card-opt-d').value;
    const exp = document.getElementById('edit-card-explanation').value;
    const correct = document.getElementById('edit-card-correct').value.toUpperCase();

    previewContent.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 6px;">Câu hỏi:</div>
      <div style="margin-bottom: 12px; font-size: 1rem;">${this._escapeHtml(q)}</div>
      <div style="font-weight: 700; margin-bottom: 6px;">Các lựa chọn:</div>
      <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px;">
        <div><b>A:</b> ${this._escapeHtml(a)} ${correct === 'A' ? '✅' : ''}</div>
        <div><b>B:</b> ${this._escapeHtml(b)} ${correct === 'B' ? '✅' : ''}</div>
        ${c ? `<div><b>C:</b> ${this._escapeHtml(c)} ${correct === 'C' ? '✅' : ''}</div>` : ''}
        ${d ? `<div><b>D:</b> ${this._escapeHtml(d)} ${correct === 'D' ? '✅' : ''}</div>` : ''}
      </div>
      <div style="font-weight: 700; margin-bottom: 6px;">Giải thích:</div>
      <div>${this._escapeHtml(exp)}</div>
    `;

    previewBox.style.display = 'block';
    this.renderMath(previewContent);
  },

  async saveCardEdit() {
    const cardId = document.getElementById('edit-card-id').value;

    const topic = document.getElementById('edit-card-topic').value.trim() || 'Chung';
    const difficulty = document.getElementById('edit-card-difficulty').value;
    const question = document.getElementById('edit-card-question').value.trim();

    const optA = document.getElementById('edit-card-opt-a').value.trim();
    const optB = document.getElementById('edit-card-opt-b').value.trim();
    const optC = document.getElementById('edit-card-opt-c').value.trim();
    const optD = document.getElementById('edit-card-opt-d').value.trim();

    if (!question) {
      alert('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    const options = [optA, optB];
    if (optC) options.push(optC);
    if (optD) options.push(optD);

    if (options.length < 2) {
      alert('Cần ít nhất 2 lựa chọn A và B.');
      return;
    }

    const letterMap = { a: 0, b: 1, c: 2, d: 3 };
    const correctLetter = document.getElementById('edit-card-correct').value;
    let answerIndex = letterMap[correctLetter] ?? 0;
    if (answerIndex >= options.length) answerIndex = 0;

    const explanation = document.getElementById('edit-card-explanation').value.trim();

    if (cardId) {
      // 1. UPDATE EXISTING CARD
      const updates = {
        topic,
        tag: topic,
        difficulty,
        question,
        options,
        answerIndex,
        explanation,
        needsReview: false
      };

      await db.updateCardContent(cardId, updates);

      // Update in-memory session if card is currently active
      if (this.activeSession) {
        const idx = this.activeSession.cards.findIndex(c => c.id === cardId);
        if (idx !== -1) {
          Object.assign(this.activeSession.cards[idx], updates);
          if (this.currentView === 'study') {
            this.renderActiveStudyCard();
          }
        }
      }

      this.showToast('Đã lưu chỉnh sửa câu hỏi thành công!', 'success');
    } else {
      // 2. CREATE NEW CARD (ADD QUESTION WITHOUT OVERWRITING)
      let targetDeckId = document.getElementById('edit-card-deck-select')?.value;
      if (!targetDeckId || targetDeckId === '__new__') {
        const decks = await db.getAllDecks();
        if (decks.length > 0) {
          targetDeckId = decks[0].id;
        } else {
          const newDeck = await db.saveDeck({ name: 'Bộ thẻ mặc định', description: 'Tự động tạo khi thêm câu hỏi' });
          targetDeckId = newDeck.id;
        }
      }

      const defaultLetters = ['a', 'b', 'c', 'd'];
      const newCard = {
        id: db.generateUniqueCardId(),
        deckId: targetDeckId,
        question,
        options,
        rawOptions: options.map((t, idx) => ({ id: defaultLetters[idx], text: t })),
        answerIndex,
        correctOptionId: defaultLetters[answerIndex] || 'a',
        explanation,
        topic,
        tag: topic,
        difficulty,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        srs: {
          repetition: 0,
          interval: 0,
          easeFactor: 2.5,
          dueDate: Date.now(),
          state: 'new'
        },
        stats: {
          reviewsCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          lastReviewed: null
        }
      };

      // Append new question safely without data loss
      await db.saveCard(newCard, { forceNew: true });

      // Safe state update: append using spread operator to activeSession if currently studying this deck
      if (this.activeSession && this.activeSession.deckId === targetDeckId) {
        this.activeSession.cards = [...(this.activeSession.cards || []), newCard];
      }

      this.showToast('Đã thêm câu hỏi mới vào bộ thẻ thành công! 🎉', 'success');
      Confetti.fire({ count: 40, duration: 2000 });
    }

    // Refresh views to show the newly added / updated question immediately
    if (this.currentView === 'bank') {
      await this.renderQuestionBank();
    } else if (this.currentView === 'decks') {
      await this.renderDecks();
    }
    await this.updateGlobalStats();

    const modal = document.getElementById('modal-edit-card');
    if (modal) modal.classList.remove('show');
  },

  // --- SESSION AUTO-SAVE & RESTORE ---
  saveActiveSessionState() {
    if (!this.activeSession) return;
    const s = this.activeSession;
    const state = {
      mode: s.mode,
      deckId: s.deckId,
      title: s.title,
      cardIds: s.cards.map(c => c.id),
      currentIndex: s.currentIndex,
      score: s.score || 0,
      correctCount: s.correctCount || 0,
      incorrectCount: s.incorrectCount || 0,
      blindMode: s.blindMode,
      userAnswers: s.userAnswers || {},
      savedAt: Date.now()
    };
    db.setMeta('activeSessionBackup', state);
  },

  clearActiveSessionState() {
    db.setMeta('activeSessionBackup', null);
    const banner = document.getElementById('session-restore-banner');
    if (banner) banner.style.display = 'none';
  },

  async resumeSavedSession() {
    const backup = await db.getMeta('activeSessionBackup', null);
    if (!backup || !backup.cardIds || backup.cardIds.length === 0) {
      this.clearActiveSessionState();
      return;
    }

    const cards = [];
    for (const id of backup.cardIds) {
      const c = await db.getCard(id);
      if (c) cards.push(c);
    }

    if (cards.length === 0) {
      this.clearActiveSessionState();
      this.showToast('Không tìm thấy dữ liệu câu hỏi của phiên học cũ.', 'warning');
      return;
    }

    this.activeSession = {
      mode: backup.mode || 'srs',
      deckId: backup.deckId,
      title: backup.title || 'Phiên học khôi phục',
      cards: cards,
      currentIndex: Math.min(backup.currentIndex || 0, cards.length - 1),
      score: backup.score || 0,
      correctCount: backup.correctCount || 0,
      incorrectCount: backup.incorrectCount || 0,
      blindMode: !!backup.blindMode,
      userAnswers: backup.userAnswers || {},
      answeredList: []
    };

    const banner = document.getElementById('session-restore-banner');
    if (banner) banner.style.display = 'none';

    this.navigateTo('study');
    this.renderActiveStudyCard();
    this.showToast('Đã khôi phục phiên học trước đó! 🚀', 'success');
  },

  dismissSavedSession() {
    this.clearActiveSessionState();
    this.showToast('Đã bỏ qua phiên học trước đó.', 'info');
  },

  // --- CONTRIBUTION HEATMAP & TOPIC BREAKDOWN ---
  async renderContributionHeatmap() {
    const grid = document.getElementById('stats-heatmap-grid');
    if (!grid) return;

    const todayStr = new Date().toISOString().slice(0, 10);

    try {
      let data = await db.getContributionHeatmapData(365);
      grid.innerHTML = '';

      // Defensive guard against non-array data
      if (!Array.isArray(data)) {
        console.warn('[Heatmap] db.getContributionHeatmapData không trả về mảng:', data);
        if (data && typeof data === 'object') {
          data = Object.entries(data).map(([date, count]) => {
            const cnt = typeof count === 'number' ? count : (count?.count || 0);
            let level = 0;
            if (cnt >= 10) level = 4;
            else if (cnt >= 6) level = 3;
            else if (cnt >= 3) level = 2;
            else if (cnt >= 1) level = 1;
            return { date, count: cnt, level };
          });
        } else {
          data = [];
        }
      }

      // Calculate maximum streak
      let maxStreak = 0;
      let currentConsecutive = 0;
      data.forEach(d => {
        if (d.count > 0) {
          currentConsecutive++;
          if (currentConsecutive > maxStreak) maxStreak = currentConsecutive;
        } else {
          currentConsecutive = 0;
        }
      });
      const streakEl = document.getElementById('stats-max-streak');
      if (streakEl) streakEl.textContent = maxStreak;

      // DocumentFragment for batch DOM insert (perf: 1 reflow instead of 365)
      const fragment = document.createDocumentFragment();
      let todayCell = null;
      data.forEach(day => {
        const cell = document.createElement('div');
        cell.className = `heatmap-cell level-${day.level || 0}`;
        cell.title = `Ngày ${day.date}: ${day.count} lượt ôn tập`;
        if (day.date === todayStr) {
          cell.classList.add('today');
          todayCell = cell;
        }
        fragment.appendChild(cell);
      });
      grid.appendChild(fragment);

      // Auto-scroll to today (rightmost edge) across paint & tab transition phases
      this.scrollHeatmapToToday(false);
      requestAnimationFrame(() => this.scrollHeatmapToToday(false));
      setTimeout(() => this.scrollHeatmapToToday(false), 80);
      setTimeout(() => this.scrollHeatmapToToday(false), 360);
    } catch (err) {
      console.error('[Heatmap] Lỗi khi render contribution heatmap:', err);
    }
  },

  // Scroll heatmap wrapper to show today's cell (rightmost, keeping at least 24px-32px safety right buffer)
  scrollHeatmapToToday(smooth = false) {
    const wrap = document.getElementById('heatmap-scroll-wrap');
    if (wrap) {
      // scroll to right edge; with padding-right: 32px on the wrap and grid, today cell naturally stays >= 24px-32px from right border
      const targetLeft = wrap.scrollWidth;
      if (smooth) {
        wrap.scrollTo({ left: targetLeft, behavior: 'smooth' });
      } else {
        wrap.scrollLeft = targetLeft;
      }
    }
  },

  async renderTopicPerformanceTable() {
    const tbody = document.getElementById('stats-topic-tbody');
    if (!tbody) return;

    const allCards = await db.getAllCards();
    const topicsMap = {};

    allCards.forEach(c => {
      const topic = c.topic || c.tag || 'Chung';
      if (!topicsMap[topic]) {
        topicsMap[topic] = {
          topic,
          total: 0,
          reviewed: 0,
          correct: 0,
          incorrect: 0
        };
      }
      topicsMap[topic].total++;
      if (c.stats.reviewsCount > 0) {
        topicsMap[topic].reviewed++;
      }
      topicsMap[topic].correct += (c.stats.correctCount || 0);
      topicsMap[topic].incorrect += (c.stats.incorrectCount || 0);
    });

    const list = Object.values(topicsMap);
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">Chưa có chủ đề nào.</td></tr>';
      return;
    }

    list.sort((a, b) => {
      const totA = a.correct + a.incorrect;
      const accA = totA > 0 ? (a.correct / totA) : 1;
      const totB = b.correct + b.incorrect;
      const accB = totB > 0 ? (b.correct / totB) : 1;
      return accA - accB;
    });

    let html = '';
    list.forEach(t => {
      const attempts = t.correct + t.incorrect;
      const acc = attempts > 0 ? Math.round((t.correct / attempts) * 100) : null;
      const accColor = acc === null ? 'var(--text-muted)' : acc >= 80 ? 'var(--success)' : acc >= 50 ? '#F59E0B' : 'var(--danger)';
      const accText = acc === null ? 'Chưa thi' : `${acc}%`;

      html += `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px 12px; font-weight: 600;">🏷️ ${this._escapeHtml(t.topic)}</td>
          <td style="padding: 10px 12px; text-align: center;">${t.total}</td>
          <td style="padding: 10px 12px; text-align: center;">${t.reviewed}</td>
          <td style="padding: 10px 12px; text-align: center; color: var(--success);">${t.correct}</td>
          <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: ${accColor};">${accText}</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  },

  // Helper to normalize any difficulty representation (English, Vietnamese, numeric, case-insensitive)
  normalizeDifficulty(diff) {
    if (!diff) return 'medium';
    if (typeof diff === 'object' && diff !== null) {
      diff = diff.name || diff.level || diff.value || diff.label || 'medium';
    }
    const s = String(diff).trim().toLowerCase();
    if (s === 'easy' || s === 'dễ' || s === 'de' || s === '1') return 'easy';
    if (s === 'hard' || s === 'khó' || s === 'kho' || s === '3') return 'hard';
    if (s === 'medium' || s === 'vừa' || s === 'vua' || s === 'trung bình' || s === 'normal' || s === '2') return 'medium';
    return 'medium';
  },

  // Part C: Fisher-Yates array shuffle helper
  shuffleArray(array) {
    if (!array || !Array.isArray(array)) return [];
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // Part B: Numeric answer comparison with 3-decimal rounding and comma/period support
  compareNumericAnswer(userVal, correctVal) {
    if (userVal === undefined || userVal === null || userVal === '') return false;
    if (correctVal === undefined || correctVal === null || correctVal === '') return false;

    const normalizeNum = (val) => {
      if (typeof val === 'number') return isNaN(val) ? null : val;
      const str = String(val).trim().replace(',', '.');
      const parsed = parseFloat(str);
      return isNaN(parsed) ? null : parsed;
    };

    const userNum = normalizeNum(userVal);
    const correctNum = normalizeNum(correctVal);

    if (userNum === null || correctNum === null) return false;

    const round3 = (n) => Math.round((Number(n) + Number.EPSILON) * 1000) / 1000;
    const userR3 = round3(userNum);
    const correctR3 = round3(correctNum);

    return Math.abs(userR3 - correctR3) < 0.0001;
  },

  // --- UNIFIED QUESTION BANK CONTROLLER ---
  bankFilters: {
    search: '',
    topic: '',
    difficulty: '',
    source: '',
    bookmarkOnly: false,
    flagOnly: false,
    reviewOnly: false
  },
  currentFilteredBankCards: [],

  async renderQuestionBank() {
    const allCards = await db.getAllCards();
    const decks = await db.getAllDecks();
    const decksMap = {};
    decks.forEach(d => { decksMap[d.id] = d.name; });

    // Safely extract unique string topics from allCards without placeholder or object leaks
    const topicCounts = {};
    allCards.forEach(c => {
      let t = c.topic || c.tag;
      if (typeof t === 'object' && t !== null) {
        t = t.name || t.title || t.topic || t.label || '';
      }
      const topicStr = (typeof t === 'string' && t.trim()) ? t.trim() : 'Chung';
      topicCounts[topicStr] = (topicCounts[topicStr] || 0) + 1;
    });

    const uniqueTopics = Object.keys(topicCounts).sort();

    // Populate topic dropdown & horizontal chips
    const topicSelect = document.getElementById('bank-topic-filter');
    const curTopic = this.bankFilters.topic || '';
    if (topicSelect) {
      topicSelect.innerHTML = '<option value="">Tất cả chủ đề</option>';
      uniqueTopics.forEach(topName => {
        const opt = document.createElement('option');
        opt.value = topName;
        opt.textContent = `${topName} (${topicCounts[topName]})`;
        if (topName === curTopic) opt.selected = true;
        topicSelect.appendChild(opt);
      });
    }

    // Populate Cyber Violet topic dropdown
    const topicMenu = document.getElementById('bank-topic-dropdown-menu');
    const topicLabel = document.getElementById('bank-topic-dropdown-label');
    if (topicLabel) {
      topicLabel.textContent = curTopic ? curTopic : 'Chọn chủ đề / chương';
    }
    if (topicMenu) {
      let menuHtml = `
        <button type="button" class="cyber-dropdown-item ${curTopic === '' ? 'active' : ''}" onclick="App.selectBankTopic('')">
          <span>Tất cả chủ đề</span>
          <span class="item-count">(${allCards.length})</span>
        </button>
      `;
      uniqueTopics.forEach(topName => {
        const isActive = curTopic === topName;
        menuHtml += `
          <button type="button" class="cyber-dropdown-item ${isActive ? 'active' : ''}" onclick="App.selectBankTopic('${topName.replace(/'/g, "\\'")}')">
            <span>${topName}</span>
            <span class="item-count">(${topicCounts[topName]})</span>
          </button>
        `;
      });
      topicMenu.innerHTML = menuHtml;
    }

    const chipsContainer = document.getElementById('bank-topic-chips');
    if (chipsContainer) {
      let chipsHtml = `
        <button type="button" class="topic-filter-chip ${curTopic === '' ? 'active' : ''}" onclick="App.selectBankTopic('')">
          Tất cả (${allCards.length})
        </button>
      `;
      uniqueTopics.forEach(topName => {
        const isActive = curTopic === topName;
        chipsHtml += `
          <button type="button" class="topic-filter-chip ${isActive ? 'active' : ''}" onclick="App.selectBankTopic('${topName.replace(/'/g, "\\'")}')">
            ${topName} (${topicCounts[topName]})
          </button>
        `;
      });
      chipsContainer.innerHTML = chipsHtml;
    }

    // Count cards by normalized difficulty
    const diffCounts = { easy: 0, medium: 0, hard: 0 };
    allCards.forEach(c => {
      const d = this.normalizeDifficulty(c.difficulty);
      diffCounts[d] = (diffCounts[d] || 0) + 1;
    });

    // Populate / update difficulty dropdown with exact counts for manual verification
    const diffSelect = document.getElementById('bank-difficulty-filter');
    const curDiff = this.bankFilters.difficulty || '';
    if (diffSelect) {
      diffSelect.innerHTML = `
        <option value="">Mọi độ khó (${allCards.length})</option>
        <option value="easy" ${curDiff === 'easy' ? 'selected' : ''}>Dễ (Easy) (${diffCounts.easy})</option>
        <option value="medium" ${curDiff === 'medium' ? 'selected' : ''}>Vừa (Medium) (${diffCounts.medium})</option>
        <option value="hard" ${curDiff === 'hard' ? 'selected' : ''}>Khó (Hard) (${diffCounts.hard})</option>
      `;
    }

    // Populate / update Cyber Violet difficulty dropdown
    const diffLabel = document.getElementById('bank-diff-dropdown-label');
    if (diffLabel) {
      const diffMap = {
        '': 'Mọi độ khó',
        'easy': '🟢 Dễ (Easy)',
        'medium': '🟡 Vừa (Medium)',
        'hard': '🔴 Khó (Hard)'
      };
      diffLabel.textContent = diffMap[curDiff] || 'Mọi độ khó';
    }
    const diffAllCount = document.getElementById('bank-diff-count-all');
    const diffEasyCount = document.getElementById('bank-diff-count-easy');
    const diffMedCount = document.getElementById('bank-diff-count-medium');
    const diffHardCount = document.getElementById('bank-diff-count-hard');
    if (diffAllCount) diffAllCount.textContent = `(${allCards.length})`;
    if (diffEasyCount) diffEasyCount.textContent = `(${diffCounts.easy})`;
    if (diffMedCount) diffMedCount.textContent = `(${diffCounts.medium})`;
    if (diffHardCount) diffHardCount.textContent = `(${diffCounts.hard})`;

    const diffMenu = document.getElementById('bank-diff-dropdown-menu');
    if (diffMenu) {
      const items = diffMenu.querySelectorAll('.cyber-dropdown-item');
      items.forEach(it => {
        const onclickAttr = it.getAttribute('onclick') || '';
        const isMatch = (curDiff === '' && onclickAttr.includes("('')")) ||
                        (curDiff === 'easy' && onclickAttr.includes("('easy')")) ||
                        (curDiff === 'medium' && onclickAttr.includes("('medium')")) ||
                        (curDiff === 'hard' && onclickAttr.includes("('hard')"));
        it.classList.toggle('active', isMatch);
      });
    }

    // Helper predicates for clean boolean status
    const isCardBookmarked = c => Boolean(
      (typeof c.bookmarked === 'boolean' ? c.bookmarked : false) ||
      (typeof c.isBookmarked === 'boolean' ? c.isBookmarked : false) ||
      (typeof c.bookmarked === 'object' && c.bookmarked !== null ? (c.bookmarked.isBookmarked ?? c.bookmarked.bookmarked ?? false) : false)
    );
    const isCardFlagged = c => Boolean(
      (typeof c.flagged === 'boolean' ? c.flagged : false) ||
      (typeof c.isFlagged === 'boolean' ? c.isFlagged : false) ||
      (typeof c.flagged === 'object' && c.flagged !== null ? (c.flagged.isFlagged ?? c.flagged.flagged ?? false) : false)
    );

    // Update count labels
    const bookmarkCount = allCards.filter(isCardBookmarked).length;
    const flagCount = allCards.filter(isCardFlagged).length;
    const reviewCount = allCards.filter(c => c.needsReview).length;
    const bCountEl = document.getElementById('bank-count-bookmark');
    const fCountEl = document.getElementById('bank-count-flag');
    const rCountEl = document.getElementById('bank-count-review');
    if (bCountEl) bCountEl.textContent = bookmarkCount;
    if (fCountEl) fCountEl.textContent = flagCount;
    if (rCountEl) rCountEl.textContent = reviewCount;

    // Filter
    const q = this.bankFilters.search.toLowerCase().trim();
    const selectedTopic = this.bankFilters.topic;
    const selectedDiff = this.bankFilters.difficulty;
    const selectedSource = this.bankFilters.source;

    // Sync Cyber Violet source dropdown
    const srcLabel = document.getElementById('bank-source-dropdown-label');
    const srcMap = {
      '': 'Tất cả nguồn',
      'lms': '🎓 Nguồn: LMS',
      'ai': '✨ Nguồn: AI',
      'manual': '✍️ Nguồn: Thủ công'
    };
    if (srcLabel) srcLabel.textContent = srcMap[selectedSource || ''] || 'Tất cả nguồn';
    const srcMenu = document.getElementById('bank-source-dropdown-menu');
    if (srcMenu) {
      srcMenu.querySelectorAll('.cyber-dropdown-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', (!selectedSource && onclickAttr.includes("('')")) || (selectedSource && onclickAttr.includes(`'${selectedSource}'`)));
      });
    }

    const filtered = allCards.filter(c => {
      if (this.bankFilters.bookmarkOnly && !isCardBookmarked(c)) return false;
      if (this.bankFilters.flagOnly && !isCardFlagged(c)) return false;
      if (this.bankFilters.reviewOnly && !c.needsReview) return false;

      if (selectedSource) {
        const cSource = c.source || 'manual';
        if (selectedSource === 'manual') {
          if (c.source && c.source !== 'manual') return false;
        } else if (cSource !== selectedSource) {
          return false;
        }
      }

      if (selectedTopic) {
        let t = c.topic || c.tag;
        if (typeof t === 'object' && t !== null) {
          t = t.name || t.title || t.topic || t.label || '';
        }
        const cardTopicStr = (typeof t === 'string' && t.trim()) ? t.trim() : 'Chung';
        if (cardTopicStr !== selectedTopic) return false;
      }

      if (selectedDiff) {
        const normSelected = this.normalizeDifficulty(selectedDiff);
        const normCard = this.normalizeDifficulty(c.difficulty);
        if (normSelected !== normCard) return false;
      }

      if (q) {
        const inQ = (c.question || '').toLowerCase().includes(q);
        const inExp = (c.explanation || '').toLowerCase().includes(q);
        const inNum = c.type === 'numeric' && String(c.correct_answer || '').toLowerCase().includes(q);
        const inOpts = (c.options || []).some(opt => {
          const optText = typeof opt === 'string' ? opt : (opt?.text || '');
          return optText.toLowerCase().includes(q);
        });
        if (!inQ && !inExp && !inOpts && !inNum) return false;
      }
      return true;
    });

    this.currentFilteredBankCards = filtered;

    const listContainer = document.getElementById('bank-cards-list');
    if (!listContainer) return;

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 48px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
          <h3 style="margin-bottom: 8px;">Không tìm thấy câu hỏi nào phù hợp</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Hãy thử nới lỏng bộ lọc hoặc thêm câu hỏi mới từ AI / LMS.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(card => {
      const deckName = decksMap[card.deckId] || 'Bộ thẻ';
      const diff = this.normalizeDifficulty(card.difficulty);
      const diffLabel = diff === 'easy' ? 'Dễ' : diff === 'hard' ? 'Khó' : 'Vừa';
      const ansIdx = card.answerIndex || 0;

      let cardTopic = card.topic || card.tag;
      if (typeof cardTopic === 'object' && cardTopic !== null) {
        cardTopic = cardTopic.name || cardTopic.title || cardTopic.topic || 'Chung';
      }
      const displayTopic = (typeof cardTopic === 'string' && cardTopic.trim()) ? cardTopic.trim() : 'Chung';
      const isBookmarked = isCardBookmarked(card);
      const isFlagged = isCardFlagged(card);

      const sourceBadge = card.source === 'lms'
        ? '<span class="source-badge source-badge-lms">Nguồn: LMS</span>'
        : card.source === 'ai'
        ? '<span class="source-badge source-badge-ai">Nguồn: AI</span>'
        : '<span class="source-badge source-badge-manual">Nguồn: Thủ công</span>';

      const reviewBadge = card.needsReview
        ? `<span class="badge-review-flag" title="${this._escapeHtml(card.reviewReason || 'Cần kiểm tra lại')}">⚠️ Cần kiểm tra</span>`
        : '';

      // Calculate days until SRS due
      let srsCountdown = '';
      if (card.srs?.dueDate) {
        const diffMs = card.srs.dueDate - Date.now();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) {
          srsCountdown = '<span style="color: #F59E0B; font-weight: 600;">⏰ Cần ôn hôm nay</span>';
        } else {
          srsCountdown = `<span style="color: var(--text-muted);">⏳ Còn ${diffDays} ngày nữa cần ôn</span>`;
        }
      }

      html += `
        <div class="bank-card-item" id="bank-item-${card.id}">
          <div class="bank-card-header">
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              ${sourceBadge}
              ${reviewBadge}
              <span class="topic-badge">🏷️ ${this._escapeHtml(displayTopic)}</span>
              <span class="difficulty-badge difficulty-${diff}">● ${diffLabel}</span>
              <span style="font-size: 0.78rem; color: var(--text-muted); background: var(--bg-surface-elevated); padding: 3px 8px; border-radius: var(--radius-full);">📁 ${this._escapeHtml(deckName)}</span>
              <span style="font-size: 0.78rem;">${srsCountdown}</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn-card-action ${isBookmarked ? 'active-bookmark' : ''}" title="${isBookmarked ? 'Bỏ lưu câu hỏi (⭐)' : 'Lưu câu hỏi (⭐)'}" onclick="App.toggleBankCardBookmark('${card.id}')">
                ${isBookmarked ? '⭐' : '☆'}
              </button>
              <button class="btn-card-action ${isFlagged ? 'active-flag' : ''}" title="${isFlagged ? 'Bỏ cờ diễn đạt chưa rõ (🚩)' : 'Gắn cờ diễn đạt chưa rõ (🚩)'}" onclick="App.toggleBankCardFlag('${card.id}')">
                ${isFlagged ? '🚩' : '⚑'}
              </button>
              <button class="btn-card-action" title="Sửa nhanh nội dung ✏️" onclick="App.openEditCardById('${card.id}')">
                ✏️
              </button>
            </div>
          </div>

          <div style="font-size: 1.05rem; font-weight: 700; margin-bottom: 12px; line-height: 1.4;">
            ${this.renderLatexText(card.question)}
          </div>

          ${card.type === 'numeric' ? `
            <div style="padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.9rem; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); color: var(--accent); font-weight: 600; margin-bottom: 12px;">
              🔢 <b>Đáp án số chính xác:</b> ${this._escapeHtml(card.correct_answer !== null && card.correct_answer !== undefined ? String(card.correct_answer) : '')}
            </div>
          ` : `
            <div class="bank-card-options-grid">
              ${(card.options || []).map((opt, i) => {
                const defaultLetter = String.fromCharCode(65 + i);
                let cleanOptText = typeof opt === 'string' ? opt.trim() : (opt?.text?.trim() || '');
                let letter = defaultLetter;
                while (true) {
                  const m = cleanOptText.match(/^([A-Za-z])[\s.):\-]+(.*)$/s);
                  if (!m) break;
                  letter = m[1].toUpperCase();
                  cleanOptText = m[2].trim();
                }
                return `
                <div style="padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.88rem; background: ${i === ansIdx ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-elevated)'}; border: 1px solid ${i === ansIdx ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}; color: ${i === ansIdx ? 'var(--success)' : 'var(--text-primary)'}; font-weight: ${i === ansIdx ? '600' : '400'};">
                  <b>${letter}.</b> ${this.renderLatexText(cleanOptText)} ${i === ansIdx ? '✓' : ''}
                </div>
              `;
              }).join('')}
            </div>
          `}

          ${card.explanation ? `
            <div style="font-size: 0.85rem; color: var(--text-secondary); background: var(--bg-surface-elevated); padding: 10px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent);">
              💡 <b>Giải thích:</b> ${this.renderLatexText(card.explanation)}
            </div>
          ` : ''}
        </div>
      `;
    });

    listContainer.innerHTML = html;
    this.renderMath(listContainer);
  },

  toggleBankTopicDropdown(e) {
    if (e) e.stopPropagation();
    const topicWrap = document.getElementById('bank-topic-dropdown-wrap');
    const diffWrap = document.getElementById('bank-diff-dropdown-wrap');
    if (diffWrap) diffWrap.classList.remove('open');
    if (topicWrap) topicWrap.classList.toggle('open');
  },

  toggleBankDiffDropdown(e) {
    if (e) e.stopPropagation();
    const topicWrap = document.getElementById('bank-topic-dropdown-wrap');
    const diffWrap = document.getElementById('bank-diff-dropdown-wrap');
    if (topicWrap) topicWrap.classList.remove('open');
    if (diffWrap) diffWrap.classList.toggle('open');
  },

  closeAllCyberDropdowns() {
    document.querySelectorAll('.cyber-dropdown.open').forEach(el => el.classList.remove('open'));
  },

  toggleBankSourceDropdown(e) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById('bank-source-dropdown-wrap');
    const wasOpen = wrap?.classList.contains('open');
    this.closeAllCyberDropdowns();
    if (wrap && !wasOpen) wrap.classList.add('open');
  },

  selectBankSource(src) {
    this.bankFilters.source = src || '';
    const srcSelect = document.getElementById('bank-source-filter');
    if (srcSelect) srcSelect.value = this.bankFilters.source;
    const label = document.getElementById('bank-source-dropdown-label');
    const srcMap = {
      '': 'Tất cả nguồn',
      'lms': '🎓 Nguồn: LMS',
      'ai': '✨ Nguồn: AI',
      'manual': '✍️ Nguồn: Thủ công'
    };
    if (label) label.textContent = srcMap[src] || 'Tất cả nguồn';
    const menu = document.getElementById('bank-source-dropdown-menu');
    if (menu) {
      menu.querySelectorAll('.cyber-dropdown-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick') || '';
        item.classList.toggle('active', (src === '' && onclickAttr.includes("('')")) || (src && onclickAttr.includes(`'${src}'`)));
      });
    }
    this.closeAllCyberDropdowns();
    this.renderQuestionBank();
  },

  selectBankTopic(topicName) {
    this.bankFilters.topic = topicName || '';
    const topicSelect = document.getElementById('bank-topic-filter');
    if (topicSelect) topicSelect.value = this.bankFilters.topic;
    this.closeAllCyberDropdowns();
    this.renderQuestionBank();
  },

  selectBankDifficulty(diff) {
    this.bankFilters.difficulty = diff || '';
    const diffSelect = document.getElementById('bank-difficulty-filter');
    if (diffSelect) diffSelect.value = this.bankFilters.difficulty;
    this.closeAllCyberDropdowns();
    this.renderQuestionBank();
  },

  onBankFilterChange() {
    const searchInput = document.getElementById('bank-search-input');
    const topicSelect = document.getElementById('bank-topic-filter');
    const diffSelect = document.getElementById('bank-difficulty-filter');
    const sourceSelect = document.getElementById('bank-source-filter');

    this.bankFilters.search = searchInput?.value || '';
    this.bankFilters.topic = topicSelect?.value || '';
    this.bankFilters.difficulty = diffSelect?.value || '';
    this.bankFilters.source = sourceSelect?.value || '';

    this.renderQuestionBank();
  },

  toggleBankFilter(type) {
    if (type === 'bookmark') {
      this.bankFilters.bookmarkOnly = !this.bankFilters.bookmarkOnly;
      const btn = document.getElementById('bank-filter-bookmark');
      if (btn) btn.classList.toggle('btn-primary', this.bankFilters.bookmarkOnly);
    } else if (type === 'flag') {
      this.bankFilters.flagOnly = !this.bankFilters.flagOnly;
      const btn = document.getElementById('bank-filter-flag');
      if (btn) btn.classList.toggle('btn-primary', this.bankFilters.flagOnly);
    } else if (type === 'review') {
      this.bankFilters.reviewOnly = !this.bankFilters.reviewOnly;
      const btn = document.getElementById('bank-filter-review');
      if (btn) {
        btn.classList.toggle('active', this.bankFilters.reviewOnly);
        btn.classList.toggle('btn-primary', this.bankFilters.reviewOnly);
      }
    }
    this.renderQuestionBank();
  },

  async toggleBankCardBookmark(cardId) {
    const updated = await db.toggleBookmark(cardId);
    const nextState = Boolean(updated?.isBookmarked ?? updated?.bookmarked ?? false);
    this.showToast(nextState ? 'Đã lưu câu hỏi ⭐' : 'Đã bỏ lưu câu hỏi', 'info');
    await this.renderQuestionBank();
  },

  async toggleBankCardFlag(cardId) {
    const updated = await db.toggleFlag(cardId);
    const nextState = Boolean(updated?.isFlagged ?? updated?.flagged ?? false);
    this.showToast(nextState ? 'Đã gắn cờ "Diễn đạt chưa rõ" 🚩' : 'Đã bỏ gắn cờ', 'info');
    await this.renderQuestionBank();
  },

  async copyFlaggedAIPrompt() {
    const allCards = await db.getAllCards();
    const flagged = allCards.filter(c => c.flagged);

    if (flagged.length === 0) {
      this.showToast('Bạn chưa gắn cờ 🚩 câu hỏi nào là "Diễn đạt chưa rõ"!', 'info');
      return;
    }

    const payload = {
      role_instruction: "Bạn là chuyên gia giáo dục. Các câu hỏi trắc nghiệm sau đây do người học đánh dấu vì 'diễn đạt chưa rõ ràng, tối nghĩa hoặc gây hiểu nhầm'. Hãy viết lại câu hỏi, các phương án lựa chọn và lời giải thích cho thật mạch lạc, chính xác sư phạm, giữ nguyên công thức LaTeX trong dấu $...$ hoặc $$...$$.",
      output_format: "Trả về JSON chuẩn MindSparks có cấu trúc { quiz_title, questions: [...] } để dán trực tiếp vào app.",
      questions_to_improve: flagged.map(c => ({
        id: c.id,
        topic: c.topic || c.tag,
        difficulty: c.difficulty,
        question: c.question,
        options: (c.options || []).map((opt, idx) => ({ id: ['a','b','c','d'][idx], text: opt })),
        correct_option_id: ['a','b','c','d'][c.answerIndex] || 'a',
        explanation: c.explanation
      }))
    };

    const promptText = `Hãy giúp tôi viết lại các câu hỏi trắc nghiệm sau đây cho thật chuẩn xác, sư phạm và mạch lạc:\n\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``;

    navigator.clipboard.writeText(promptText).then(() => {
      this.showToast(`Đã sao chép Prompt AI viết lại cho ${flagged.length} câu hỏi gắn cờ 🚩!`, 'success');
    }).catch(err => {
      alert('Không thể sao chép: ' + err.message);
    });
  },

  startSessionFromBank() {
    const cards = this.currentFilteredBankCards;
    if (!cards || cards.length === 0) {
      this.showToast('Không có câu hỏi nào trong danh sách lọc để luyện tập!', 'warning');
      return;
    }

    this._shuffleArray(cards);
    this.activeSession = {
      mode: 'free',
      deckId: null,
      title: `Luyện Tập Ngân Hàng (${cards.length} câu)`,
      cards: [...cards],
      currentIndex: 0,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      blindMode: false,
      blindRevealed: false,
      userAnswers: {},
      answeredList: []
    };

    this.navigateTo('study');
    this.renderActiveStudyCard();
  },

  // --- SETTINGS & BACKUP ---
  renderSettingsView() {
    //
  },

  async exportBackup() {
    try {
      const data = await db.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `mindsparks-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast('Đã tải xuống file backup JSON thành công!', 'success');
    } catch (err) {
      alert('Lỗi xuất dữ liệu: ' + err.message);
    }
  },

  triggerImportBackup(mode = 'merge') {
    const input = document.getElementById('backup-file-input');
    if (input) {
      input.dataset.mode = mode;
      input.click();
    }
  },

  async handleBackupFileChosen(e) {
    const file = e.target.files[0];
    if (!file) return;
    const mode = e.target.dataset.mode || 'merge';

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const res = await db.importAll(json, mode);
        this.showToast(`Khôi phục thành công ${res.decksCount} bộ thẻ và ${res.cardsCount} câu hỏi!`, 'success');
        this.updateGlobalStats();
        this.renderDashboard();
      } catch (err) {
        alert('Lỗi đọc file backup: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  },

  // --- TOAST NOTIFICATIONS ---
  showToast(message, type = 'info') {
    let container = document.getElementById('app-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'app-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '❌';

    toast.innerHTML = `<span>${icon}</span><span>${this._escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  // --- HELPERS ---
  _shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  _escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => App.init());
