---
name: liquid-glass-refraction
description: 3D Convex Meniscus Liquid Glass optical refraction using SVG feDisplacementMap normal map and multi-layer specular rim reflection for modals and sidebars.
---

# 3D Convex Meniscus Liquid Glass Refraction Skill

This skill standardizes the creation of **3D Convex Meniscus Liquid Glass** interfaces (inspired by visionOS and modern spatial interfaces), replacing flat glass blurs with realistic, physically grounded optical refraction and lens distortion.

---

## 1. Physical Optics & Principles

Standard glassmorphism uses a flat, uniform `backdrop-filter: blur(...)`. In physical glass optics:
1. **Bezel Curvature (Vành cong mép viền)**: Toward the outer 24–28% perimeter of a thick glass slab or squircle lens, light refracts outwards along the surface normal vector.
2. **Neutral Reading Core (Vùng đọc lõi phẳng)**: The center 72% of the viewport maintains zero distortion ($R=128, G=128$), ensuring text, buttons, and form inputs remain 100% crisp and readable.
3. **Specular Refraction Rim (Vành phản xạ gương nội tâm)**: A multi-tier inset shadow and a sub-surface meniscus rim ring (`::before` with `mask-composite: exclude`) produce high-angle edge glints and depth.

---

## 2. Optical Vector Field & SVG Filter Setup

### Canvas Radial Normal Map Generator
A 256x256 normal map is computed on an offscreen `<canvas>` where:
- Central pixels (distance $\le 1 - \text{rimWidth}$) are neutral gray `rgb(128, 128, 128)`.
- Rim pixels refract outwards according to a squircle distance function: $\text{dist} = (x^4 + y^4)^{0.25}$, with cubic power curve $\text{curve} = t^{2.6}$.
- Normalized RGB channels are converted to a Data URL and injected into an inline SVG `<filter id="liquid-convex-lens">`.

```javascript
initLiquidGlassLensFilter() {
  if (document.getElementById('liquid-glass-svg-defs')) return;
  try {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    const rimWidth = 0.24; // 24% outer rim produces convex refraction
    for (let y = 0; y < size; y++) {
      const ny = (y / (size - 1)) * 2 - 1; // -1 .. 1
      for (let x = 0; x < size; x++) {
        const nx = (x / (size - 1)) * 2 - 1; // -1 .. 1
        const ax = Math.abs(nx);
        const ay = Math.abs(ny);
        const dist = Math.pow(Math.pow(ax, 4) + Math.pow(ay, 4), 0.25);

        let r = 128;
        let g = 128;
        if (dist > 1 - rimWidth) {
          const t = Math.min(1, (dist - (1 - rimWidth)) / rimWidth);
          const curve = Math.pow(t, 2.6);
          r = Math.round(128 + nx * curve * 120);
          g = Math.round(128 + ny * curve * 120);
        }
        const idx = (y * size + x) * 4;
        data[idx] = Math.max(0, Math.min(255, r));
        data[idx + 1] = Math.max(0, Math.min(255, g));
        data[idx + 2] = 128;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const mapUrl = canvas.toDataURL('image/png');

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.id = 'liquid-glass-svg-defs';
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none;z-index:-1;';
    svg.innerHTML = `
      <defs>
        <filter id="liquid-convex-lens" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
          <feImage href="${mapUrl}" result="lensMap" preserveAspectRatio="none" />
          <feDisplacementMap in="SourceGraphic" in2="lensMap" scale="32" xChannelSelector="R" yChannelSelector="G" result="refracted" />
          <feGaussianBlur in="refracted" stdDeviation="16" result="blurred" />
          <feColorMatrix in="blurred" type="saturate" values="1.85" result="saturated" />
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
  } catch (e) {
    console.warn('Liquid glass SVG filter fallback to CSS blur:', e);
  }
}
```

---

## 3. CSS Specifications & Layer Composition

### Modal Box (.modal-box)
```css
.modal-box {
  position: relative !important;
  background: var(--modal-convex-bg) !important;
  backdrop-filter: url(#liquid-convex-lens) blur(32px) saturate(190%) !important;
  -webkit-backdrop-filter: url(#liquid-convex-lens) blur(32px) saturate(190%) !important;
  border-radius: 32px !important;
  border: 1.5px solid var(--modal-convex-border) !important;
  box-shadow:
    inset 0 2.5px 4px rgba(255, 255, 255, 0.88),
    inset 2px 0 3px rgba(255, 255, 255, 0.55),
    inset 0 -2.5px 5px rgba(255, 255, 255, 0.28),
    inset 0 0 28px rgba(255, 255, 255, 0.22),
    0 28px 64px -12px rgba(0, 0, 0, 0.45) !important;
}

/* Meniscus Rim Ring: Excluded interior content box */
.modal-box::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  border-radius: inherit !important;
  padding: 12px !important;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(255, 255, 255, 0.12) 35%,
    rgba(255, 255, 255, 0.04) 65%,
    rgba(255, 255, 255, 0.38) 100%
  ) !important;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) !important;
  -webkit-mask-composite: xor !important;
  mask-composite: exclude !important;
  pointer-events: none !important;
  z-index: 0 !important;
}
```

### Translucent Sidebar (.app-sidebar)
```css
.app-sidebar {
  background: var(--sidebar-glass-bg) !important;
  backdrop-filter: blur(38px) saturate(190%) !important;
  -webkit-backdrop-filter: blur(38px) saturate(190%) !important;
  border: 1.5px solid var(--sidebar-glass-border) !important;
  box-shadow:
    inset 0 2px 3px rgba(255, 255, 255, 0.60),
    inset -1.5px 0 2px rgba(255, 255, 255, 0.30),
    0 18px 42px -10px rgba(0, 0, 0, 0.28) !important;
}
```

---

## 4. Theme Token Palette Mapping

- **purple-pink**:
  - `--sidebar-glass-bg: linear-gradient(160deg, rgba(42, 32, 68, 0.54) 0%, rgba(24, 18, 42, 0.46) 100%);`
  - `--sidebar-glass-border: rgba(192, 132, 252, 0.22);`
  - `--modal-convex-bg: linear-gradient(145deg, rgba(44, 34, 72, 0.72) 0%, rgba(24, 18, 42, 0.64) 100%);`
  - `--modal-convex-border: rgba(192, 132, 252, 0.32);`
- **monochrome**:
  - `--sidebar-glass-bg: linear-gradient(160deg, rgba(38, 38, 44, 0.54) 0%, rgba(20, 20, 24, 0.46) 100%);`
  - `--sidebar-glass-border: rgba(255, 255, 255, 0.18);`
  - `--modal-convex-bg: linear-gradient(145deg, rgba(40, 40, 46, 0.72) 0%, rgba(20, 20, 24, 0.64) 100%);`
  - `--modal-convex-border: rgba(255, 255, 255, 0.26);`
- **white-orange**:
  - `--sidebar-glass-bg: linear-gradient(160deg, rgba(255, 252, 248, 0.58) 0%, rgba(255, 237, 213, 0.46) 100%);`
  - `--sidebar-glass-border: rgba(255, 255, 255, 0.88);`
  - `--modal-convex-bg: linear-gradient(145deg, rgba(255, 253, 250, 0.76) 0%, rgba(254, 243, 231, 0.66) 100%);`
  - `--modal-convex-border: rgba(255, 255, 255, 0.95);`
