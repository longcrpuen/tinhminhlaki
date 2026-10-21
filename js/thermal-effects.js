/**
 * ==========================================================================
 * MINDSPARKS / TINHMINHLAKEY — THERMAL EFFECTS & DATAMOSH ENGINE
 * Module: js/thermal-effects.js
 * Author: Sub-Agent A (Parallel Execution Workflow)
 * Specification: docs/promt/p1.md (Section 4.1)
 * ==========================================================================
 */

(function () {
  'use strict';

  /**
   * Attach Datamosh Quote Trigger to App namespace and bind thermal interactive cursor
   */
  function attachThermalMethods() {
    if (typeof window === 'undefined') return;

    if (!window.App) {
      // Retry in 40ms if window.App is still being initialized
      setTimeout(attachThermalMethods, 40);
      return;
    }

    // Attach triggerDatamoshQuote method to App
    window.App.triggerDatamoshQuote = function () {
      const heroTitle = document.getElementById('hero-title');
      const heroCard = document.getElementById('thermal-hero-card') ||
                       document.querySelector('.thermal-poster-card') ||
                       document.querySelector('.hero-card');

      if (heroTitle) {
        heroTitle.classList.remove('datamosh-active');
        void heroTitle.offsetWidth; // Force CSS reflow to retrigger animation
        heroTitle.classList.add('datamosh-active');
      }

      if (heroCard) {
        heroCard.classList.remove('datamosh-active');
        void heroCard.offsetWidth; // Force CSS reflow
        heroCard.classList.add('datamosh-active');
      }

      // Audio haptic feedback
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
      }, 110);

      // Clean up glitch state after glitch transition window
      setTimeout(() => {
        if (heroTitle) heroTitle.classList.remove('datamosh-active');
        if (heroCard) heroCard.classList.remove('datamosh-active');
      }, 340);
    };

    // Initialize FLIR Thermal pointer hotspot
    initThermalCursor();
  }

  /**
   * Tracks pointer coordinates across the Hero stage to generate a realistic
   * infrared thermal dissipation hotspot (Aura)
   */
  function initThermalCursor() {
    const targets = document.querySelectorAll('.thermal-hero-stage, .thermal-poster-card, #thermal-hero-card, .hero-card');
    if (!targets || targets.length === 0) return;

    targets.forEach((target) => {
      // Avoid duplicate listener registration
      if (target.dataset.thermalCursorBound === 'true') return;
      target.dataset.thermalCursorBound = 'true';

      const updateCoordinates = (e) => {
        const rect = target.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        const xPx = e.clientX - rect.left;
        const yPx = e.clientY - rect.top;

        target.style.setProperty('--mouse-x', `${xPct.toFixed(2)}%`);
        target.style.setProperty('--mouse-y', `${yPct.toFixed(2)}%`);
        target.style.setProperty('--mouse-px', `${xPx.toFixed(1)}px`);
        target.style.setProperty('--mouse-py', `${yPx.toFixed(1)}px`);
      };

      target.addEventListener('pointermove', updateCoordinates, { passive: true });
      target.addEventListener('pointerdown', updateCoordinates, { passive: true });

      target.addEventListener('pointerleave', () => {
        // Smoothly settle back to center when pointer exits
        target.style.setProperty('--mouse-x', '50%');
        target.style.setProperty('--mouse-y', '50%');
      }, { passive: true });
    });
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
