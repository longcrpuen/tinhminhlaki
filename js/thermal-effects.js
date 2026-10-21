/**
 * ==========================================================================
 * MINDSPARKS / TINHMINHLAKEY — THERMAL & SPOTLIGHT EFFECTS ENGINE (PHASE 3)
 * Module: js/thermal-effects.js
 * Author: Sub-Agent A (Phase 3 Parallel Execution Workflow)
 * Specification: docs/promt/p2.md (Section 3.2)
 * ==========================================================================
 */

(function () {
  'use strict';

  /**
   * Attach Datamosh Quote Trigger to App namespace and bind soft spotlight coordinates
   */
  function attachThermalMethods() {
    if (typeof window === 'undefined') return;

    if (!window.App) {
      setTimeout(attachThermalMethods, 40);
      return;
    }

    // Attach triggerDatamoshQuote method to App
    window.App.triggerDatamoshQuote = function () {
      const heroTitle = document.getElementById('hero-title') || document.querySelector('.hero-title');
      const heroCard = document.getElementById('thermal-hero-card') ||
                       document.querySelector('.hero-card') ||
                       document.querySelector('.thermal-poster-card');

      if (heroTitle) {
        heroTitle.classList.remove('datamosh-active');
        void heroTitle.offsetWidth; // Force reflow to retrigger CSS animation
        heroTitle.classList.add('datamosh-active');
      }

      if (heroCard) {
        heroCard.classList.remove('datamosh-active');
        void heroCard.offsetWidth; // Force reflow
        heroCard.classList.add('datamosh-active');
      }

      // Audio haptic feedback if sound module is initialized
      if (typeof sounds !== 'undefined' && typeof sounds.playFlip === 'function') {
        try {
          sounds.playFlip();
        } catch (_) {
          // Silent fallback if audio context is blocked
        }
      }

      // Update quote content during the glitch frame
      setTimeout(() => {
        if (typeof window.App.updateHeroQuote === 'function') {
          window.App.updateHeroQuote();
        }
      }, 100);

      // Clean up glitch state after animation completes
      setTimeout(() => {
        if (heroTitle) heroTitle.classList.remove('datamosh-active');
        if (heroCard) heroCard.classList.remove('datamosh-active');
      }, 340);
    };

    // Initialize Soft Orchid Rose Spotlight Tracking (--mx, --my, --mouse-x, --mouse-y)
    initSpotlightTracker();
  }

  /**
   * Tracks pointer coordinates with requestAnimationFrame for smooth 120 FPS
   * Soft Violet-Rose Spotlight on cards and buttons.
   */
  function initSpotlightTracker() {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const targetSelector = [
      '.stat-card',
      '.study-mode-card',
      '.deck-card',
      '.subject-group',
      '.quiz-card',
      '.bank-card-item',
      '.hero-card',
      '.thermal-poster-card',
      '.btn-primary',
      '.btn-secondary',
      '.sm2-status-banner'
    ].join(', ');

    let activeCard = null;
    let pendingRaf = null;
    let pointerX = 0;
    let pointerY = 0;

    const updateVars = () => {
      pendingRaf = null;
      if (!activeCard) return;

      const rect = activeCard.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const xPx = pointerX - rect.left;
      const yPx = pointerY - rect.top;
      const xPct = Math.max(0, Math.min(100, (xPx / rect.width) * 100));
      const yPct = Math.max(0, Math.min(100, (yPx / rect.height) * 100));

      activeCard.style.setProperty('--mx', `${xPx.toFixed(1)}px`);
      activeCard.style.setProperty('--my', `${yPx.toFixed(1)}px`);
      activeCard.style.setProperty('--mouse-x', `${xPct.toFixed(2)}%`);
      activeCard.style.setProperty('--mouse-y', `${yPct.toFixed(2)}%`);
    };

    document.addEventListener('pointermove', (e) => {
      const match = e.target.closest(targetSelector);
      if (!match) {
        activeCard = null;
        return;
      }

      activeCard = match;
      pointerX = e.clientX;
      pointerY = e.clientY;

      if (!pendingRaf) {
        pendingRaf = requestAnimationFrame(updateVars);
      }
    }, { passive: true });

    document.addEventListener('pointerleave', (e) => {
      if (e.target && e.target.closest && e.target.closest(targetSelector)) {
        const el = e.target.closest(targetSelector);
        el.style.setProperty('--mouse-x', '50%');
        el.style.setProperty('--mouse-y', '50%');
      }
    }, { passive: true, capture: true });
  }

  // Hook into DOM ready cycle
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachThermalMethods);
  } else {
    attachThermalMethods();
  }

  // Also re-check when navigation occurs (PWA single-page view transitions)
  window.addEventListener('popstate', attachThermalMethods);
})();
