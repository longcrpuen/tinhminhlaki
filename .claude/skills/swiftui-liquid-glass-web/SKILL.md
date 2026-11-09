---
name: swiftui-liquid-glass-web
description: iOS 26+ Liquid Glass Optical Physics & Low-End Device Performance Patterns translated from SwiftUI Expert Skill for Modern Web & Offline-First PWAs.
---

# SwiftUI Liquid Glass & Performance Patterns for Web (iOS 26+ Specification)

This skill synthesizes Apple's visionOS / iOS 26+ Liquid Glass optical physics and SwiftUI high-performance execution patterns (adapted from `swiftui-expert-skill`) into production web standards (HTML5/CSS3/Vanilla JS).

---

## 1. LIQUID GLASS OPTICAL PHYSICS FOR WEB

### 1.1 Continuous Curved Glass Volume (Thể Tích Kính Cong Đồng Nhất)
- **Anti-Pattern:** Never create a separate 15–24px bezel/inner mask (`mask-composite: exclude` or heavy padding) that frames an opaque inner core. Real glass is a **single continuous physical volume** from edge to edge.
- **Rule:** The `.modal-box` or `.glass-surface` is styled as one unified volume with `border-radius: 36px`, `backdrop-filter: blur(28px) saturate(210%) brightness(1.06)`, and an ultra-thin 1.5px specular rim.

### 1.2 Concentric Squircle Geometry
- Inner element radius must follow concentric curvature:
  $$R_{inner} = \max(8\text{px}, R_{outer} - \text{padding})$$
- Prevents corner clipping, gap inconsistencies, or optical bulging at intersections.

### 1.3 Specular Rim & Soft Fresnel Illumination
- Mép kính ngoài cùng dày `1.5px` phản xạ ánh sáng môi trường (cạnh trên và trái sáng hơn).
- Lớp ánh sáng Fresnel mềm (`radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0.22) 0%, transparent 75%)`) phủ nhẹ trên bề mặt để mô phỏng sự tán xạ ánh sáng tự nhiên.

### 1.4 GlassEffectContainer & Selective Interactivity
- **Grouped Context:** Adjacent glass elements share one sampling background rather than stacking multiple heavy filters.
- **Frosted-to-Clear Interactivity:**
  - **Resting State:** Frosted blur (`blur(18px–20px)`, `alpha 0.55–0.78`) to ensure high text legibility.
  - **Hover / Active State:** Becomes crystal clear (`blur(4px–8px)`, `alpha 0.03–0.16`), allowing the background textures and colors to shine through distinctly.

---

## 2. LOW-END DEVICE PERFORMANCE PATTERNS

### 2.1 Viewport-Gated Blur Culling (IntersectionObserver)
GPU shader cost for Gaussian blur scales quadratically with pixel area. If 25+ cards each apply `backdrop-filter: blur(24px)`, low-end GPUs drop below 30 FPS.
- **Solution:** Elements outside the viewport have `backdrop-filter: none`. When entering viewport (`threshold: 0.05`), restore the glass blur filter.

### 2.2 Time-Sliced Incremental DOM Chunking
- Render the first visible chunk (Above-The-Fold) synchronously at 0ms.
- Render subsequent chunks in requestAnimationFrame / MessageChannel slices to guarantee zero Long Tasks (> 50ms) on main thread.

### 2.3 Passive Event Delegation
- Avoid attaching discrete event listeners to hundreds of list items. Use single container event delegation (`e.target.closest(...)`).

### 2.4 GPU Texture Promotion Culling
- Never place static `will-change: transform` or `will-change: opacity` on resting elements. Only activate during active transitions.
