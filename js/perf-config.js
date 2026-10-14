/**
 * MindSparks Performance Engine Configuration (Part B)
 * Central switches for all GPU & CPU optimizations.
 * Graceful fallback: toggling any flag false reverts seamlessly to standard main-thread logic.
 */
const PERF_CONFIG = {
  USE_WEB_WORKER: true,         // Offload LMS parser, SM-2, stats & bulk JSON to Web Worker
  KATEX_CACHE: true,            // LRU Map cache for KaTeX renderToString (up to 2000 items)
  PRE_BLURRED_BG: true,         // Single pre-blurred background layer instead of per-pixel backdrop-filter
  CONTENT_VISIBILITY: true,     // content-visibility: auto + containment for offscreen bank cards
  COMPOSITOR_ONLY_ANIM: true,   // Restrict all animations to transform & opacity (GPU compositor)
  IDLE_PAUSE: true,             // Pause background animations & timers on 30s idle or hidden tab
};

if (typeof window !== 'undefined') {
  window.PERF_CONFIG = PERF_CONFIG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PERF_CONFIG;
}
