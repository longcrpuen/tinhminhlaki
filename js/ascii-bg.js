/**
 * MindSparks Theme 4: Multi-Scene 3D ASCII Background Engine
 * - Scene 1: 3D Procedural Christmas Tree (agac.py / ok.mp4) with 20° pitch, domino LEDs,
 *            gentle stardust dissolve, and lightweight wind-drifted ASCII snowfall layer.
 * - Scene 2: Gargantua Black Hole (art.py / Video by jin_22ee) with drawing photon ring,
 *            breathing corona, Keplerian shear disk, relativistic Doppler beaming,
 *            upper/lower gravitational-lensed halo arches, and front disk crossing event horizon shadow.
 * - Multi-Scene Manager & 2 Playback Modes: 'slideshow' (auto seamless cycle transition) & 'single' (lock scene).
 * - DPR = 1, 28 FPS deferred Z-buffer blitter, 0 GC per frame, WCAG 2.3.1 flash safe.
 */
(function (root) {
  'use strict';

  const TAU = Math.PI * 2;
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

  const CONFIG = Object.freeze({
    DPR: 1,
    FPS_LIMIT: 30,
    TARGET_FPS: 30,
    FRAME_INTERVAL_MS: 1000 / 30,
    CAMERA_PITCH_DEG: 20,
    Y0: 0.42,
    Y1: 2.55,
    Y_CENTER: 1.25,
    CAM_DIST: 5.5,
    ROT_SPEED_DEG: 18,
    CYCLE_DURATION: 26.0,
    DISSOLVE_START: 21.2,
    DISSOLVE_WINDOW: 1.15,
    SHOWCASE_STATIC_T: 12.5,
    TIERS: 26,
    LIGHT_COUNT: 170,
    BAUBLE_COUNT: 44,
    STAR_COUNT: 160,
    SNOW_COUNT: 220,
    BG_R: 0,
    BG_G: 0,
    BG_B: 0
  });

  const KIND = Object.freeze({
    GROUND: 1,
    TRUNK: 2,
    NEEDLE: 3,
    SNOWCAP: 4,
    GARLAND: 5,
    BALL: 6,
    LIGHT: 7,
    STAR: 8,
    GIFT: 9,
    RIBBON: 10
  });

  const RAMP_MAIN = [' ', '.', '\u00B7', ':', '-', '=', '+', '*', '#', '%', '@'];
  const RAMP_GROUND = [' ', '.', '\u00B7', ':', '\u00B7', ':', '=', '+', '*', '#', '@'];
  const ALL_GLYPHS = [
    ' ', '.', '\u00B7', ':', '-', '=', '+', '*', '#', '%', '@', '/', '|', '\\',
    '~', ',', ';', 'x', 'o', '$', '&', '8'
  ];

  // Endianness check for fast Uint32Array RGBA writes
  const IS_LITTLE_ENDIAN = (function () {
    const buf = new ArrayBuffer(4);
    const u8 = new Uint8Array(buf);
    const u32 = new Uint32Array(buf);
    u8[0] = 0x11;
    u8[1] = 0x22;
    u8[2] = 0x33;
    u8[3] = 0x44;
    return u32[0] === 0x44332211;
  })();

  function packRGBA(r, g, b) {
    if (IS_LITTLE_ENDIAN) {
      return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
    }
    return ((r << 24) | (g << 16) | (b << 8) | 255) >>> 0;
  }

  const BG_PACKED = packRGBA(CONFIG.BG_R, CONFIG.BG_G, CONFIG.BG_B);

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function createRng(seed) {
    let a = (seed >>> 0) || 7;
    function rng() {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    function randUniform(lo, hi) {
      return lo + (hi - lo) * rng();
    }
    function randNorm() {
      let u1 = rng();
      if (u1 < 1e-7) u1 = 1e-7;
      const u2 = rng();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(TAU * u2);
    }
    return { rng, randUniform, randNorm };
  }

  // Cone silhouette envelope matching agac.py
  function envelope(y) {
    const f = clamp((y - CONFIG.Y0) / (CONFIG.Y1 - CONFIG.Y0), 0, 1);
    return 0.03 + 0.84 * Math.pow(1 - f, 1.08);
  }

  // Fibonacci unit sphere point array (flat Float32Array of length n * 3)
  function fib(n) {
    const out = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) {
      const i = k + 0.5;
      const y = 1 - (2 * i) / n;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = GOLDEN_ANGLE * i;
      const idx = k * 3;
      out[idx] = r * Math.cos(th);
      out[idx + 1] = y;
      out[idx + 2] = r * Math.sin(th);
    }
    return out;
  }

  // Exact 5-pointed star polar radius at angle theta
  function starMaxRadius(theta, rOut, rIn) {
    const sector = TAU / 5;
    const halfSector = sector * 0.5;
    let phi = ((theta - Math.PI * 0.5) % sector + sector) % sector;
    if (phi > halfSector) phi = sector - phi;
    const sinAlpha = Math.sin(halfSector);
    const denom = rOut * Math.sin(phi) + rIn * Math.sin(halfSector - phi);
    return denom > 1e-6 ? (rOut * rIn * sinAlpha) / denom : rIn;
  }

  function computeDominoIntensity(ph, t) {
    const beadPos = Math.floor(clamp(ph, 0, 0.9999) * 42) / 42;
    const wave1 = (t * 0.38) % 1.0;
    const wave2 = (wave1 + 0.5) % 1.0;
    let d1 = Math.abs(((beadPos - wave1 + 1.5) % 1.0) - 0.5);
    let d2 = Math.abs(((beadPos - wave2 + 1.5) % 1.0) - 0.5);
    return Math.exp(-(d1 * d1) / 0.0055) + 0.65 * Math.exp(-(d2 * d2) / 0.0045);
  }

  function computeDissolveState(py, idx, t) {
    if (t <= CONFIG.DISSOLVE_START) {
      return { active: true, u: 0 };
    }
    const hNorm = clamp(py / 2.75, 0, 1);
    const jitter = (idx * 0.61803398875) % 1.0;
    const td = CONFIG.DISSOLVE_START + 1.55 * (1 - hNorm) + 1.10 * jitter;
    if (t <= td) {
      return { active: true, u: 0 };
    }
    const u = (t - td) / CONFIG.DISSOLVE_WINDOW;
    if (u >= 1.0) {
      return { active: false, u: 1.0 };
    }
    return { active: true, u };
  }

  function buildSceneData(seed) {
    const { rng, randUniform, randNorm } = createRng(seed === undefined ? 7 : seed);

    const tmpPx = [];
    const tmpPy = [];
    const tmpPz = [];
    const tmpNx = [];
    const tmpNy = [];
    const tmpNz = [];
    const tmpCr = [];
    const tmpCg = [];
    const tmpCb = [];
    const tmpT0 = [];
    const tmpPh = [];
    const tmpSh = [];
    const tmpKind = [];
    const countsByKind = new Int32Array(11);

    function pushPoint(x, y, z, nx, ny, nz, r, g, b, t0Val, kindVal, phVal, shVal) {
      const len = Math.hypot(nx, ny, nz) || 1;
      tmpPx.push(x);
      tmpPy.push(y);
      tmpPz.push(z);
      tmpNx.push(nx / len);
      tmpNy.push(ny / len);
      tmpNz.push(nz / len);
      tmpCr.push(r);
      tmpCg.push(g);
      tmpCb.push(b);
      tmpT0.push(t0Val);
      tmpKind.push(kindVal);
      tmpPh.push(phVal);
      tmpSh.push(shVal);
      countsByKind[kindVal]++;
    }

    // 1. GROUND (concentric dotted circular floor on y = 0)
    const rMaxFloor = 1.80;
    const drFloor = 0.029;
    for (let r = 0.04; r <= rMaxFloor + 1e-6; r += drFloor) {
      const m = Math.max(12, Math.round((TAU * r) / drFloor));
      const aoTrunk = 0.24 + 0.76 * smoothstep(0.08, 0.34, r);
      const lpDiff = (r - 0.52) / 0.74;
      const lightPool = Math.exp(-(lpDiff * lpDiff));
      const outerFade = Math.pow(1 - clamp((r - 0.95) / 0.95, 0, 1), 1.35);
      const ripple = 0.90 + 0.10 * Math.cos(r * 22.0);
      const shade = aoTrunk * (0.14 + 0.82 * lightPool) * outerFade * ripple;
      const t0Floor = 0.05 + 1.45 * (r / rMaxFloor);
      const cr = 0.80 * shade;
      const cg = 0.83 * shade;
      const cb = 0.89 * shade;
      for (let j = 0; j < m; j++) {
        const th = (TAU * j) / m + (r * 0.7);
        pushPoint(
          r * Math.cos(th),
          0,
          r * Math.sin(th),
          0,
          1,
          0,
          cr,
          cg,
          cb,
          t0Floor,
          KIND.GROUND,
          (j / m),
          0.08
        );
      }
    }

    // 2. TRUNK (textured bark cylinder + slender inner stem, synchronized with foliage height y)
    const ySpanTrunk = CONFIG.Y1 - CONFIG.Y0;
    const hSteps = 44;
    const aSteps = 28;
    for (let hi = 0; hi < hSteps; hi++) {
      const h = -0.04 + (0.66 * hi) / (hSteps - 1);
      // Base below foliage rises 1.20s -> 1.95s; inside foliage stays 0.25s ahead of needles at same height y
      const t0Trunk = h <= CONFIG.Y0
        ? 1.20 + 0.75 * clamp((h + 0.04) / (CONFIG.Y0 + 0.04), 0, 1)
        : 1.95 + 4.00 * clamp((h - CONFIG.Y0) / ySpanTrunk, 0, 1);
      for (let ai = 0; ai < aSteps; ai++) {
        const a = (TAU * ai) / aSteps;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const bark = 0.75 + 0.25 * Math.sin(h * 90 + a * 3);
        pushPoint(
          0.086 * ca,
          h,
          0.086 * sa,
          ca,
          0,
          sa,
          0.44 * bark,
          0.27 * bark,
          0.14 * bark,
          t0Trunk,
          KIND.TRUNK,
          0,
          0.06
        );
      }
    }
    const stemHSteps = 36;
    const stemASteps = 10;
    for (let hi = 0; hi < stemHSteps; hi++) {
      const h = 0.62 + (1.73 * hi) / (stemHSteps - 1);
      const rad = Math.max(0.012, 0.065 * (1 - (h - 0.42) / 2.13));
      // Synchronized with needles (t0Needle = 2.20 + 4.00 * tierF + 0.60 * s): leads by 0.25s, never exposes bare pole
      const t0Stem = 1.95 + 4.00 * clamp((h - CONFIG.Y0) / ySpanTrunk, 0, 1);
      for (let ai = 0; ai < stemASteps; ai++) {
        const a = (TAU * ai) / stemASteps;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const bark = 0.75 + 0.25 * Math.sin(h * 90 + a * 3);
        pushPoint(
          rad * ca,
          h,
          rad * sa,
          ca,
          0,
          sa,
          0.42 * bark,
          0.26 * bark,
          0.14 * bark,
          t0Stem,
          KIND.TRUNK,
          0,
          0.05
        );
      }
    }

    // 3. NEEDLE & SNOWCAP (24 whorls of drooping branches, glowing upward + outward frontier)
    const tips = [];
    const branchCandidates = [];
    const yStart = CONFIG.Y0 + 0.02;
    const yEnd = CONFIG.Y1 - 0.04;
    const ySpan = CONFIG.Y1 - CONFIG.Y0;

    for (let i = 0; i < CONFIG.TIERS; i++) {
      const y = yStart + ((yEnd - yStart) * i) / (CONFIG.TIERS - 1);
      const tierF = (y - CONFIG.Y0) / ySpan;
      const R = envelope(y);
      const nb = Math.floor(7 + 11 * (1 - tierF));

      for (let b = 0; b < nb; b++) {
        const a = (TAU * b) / nb + i * 0.618034 * TAU + randNorm() * 0.08;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const L = R * randUniform(0.82, 1.06);
        const n = Math.floor(175 + 920 * L);

        for (let pIdx = 0; pIdx < n; pIdx++) {
          const s = Math.pow(rng(), 0.65);
          const sL = s * L;
          const taper = clamp(L * 1.55, 0.16, 1.0);
          const spread = (0.022 + 0.095 * s) * taper * randNorm();
          const yy = y + 0.07 * sL - 0.22 * sL * sL + 0.024 * taper * randNorm();
          const px = ca * sL - sa * spread;
          const pz = sa * sL + ca * spread;

          const nx = ca * 0.75 + randNorm() * 0.25;
          const ny = 0.55 + randNorm() * 0.25;
          const nz = sa * 0.75 + randNorm() * 0.25;
          const nLen = Math.hypot(nx, ny, nz) || 1;
          const nrmY = ny / nLen;

          const ao = 0.35 + 0.65 * Math.pow(s, 1.3);
          const tone = ao * randUniform(0.76, 1.12);
          const cLerp = Math.pow(s, 1.15);
          const nr = (0.06 + (0.25 - 0.06) * cLerp) * tone;
          const ng = (0.29 + (0.62 - 0.29) * cLerp) * tone;
          const nbCol = (0.10 + (0.20 - 0.10) * cLerp) * tone;
          const t0Needle = 2.20 + 4.00 * tierF + 0.60 * s;

          if (s > 0.45 && rng() < 0.052 && nrmY > 0.32) {
            pushPoint(px, yy, pz, 0, 1, 0, 0.92, 0.95, 1.0, t0Needle, KIND.SNOWCAP, 0, 0.25);
          } else {
            pushPoint(px, yy, pz, nx / nLen, nrmY, nz / nLen, nr, ng, nbCol, t0Needle, KIND.NEEDLE, 0, 0.12);
          }
        }

        const tipSL = L * 0.96;
        tips.push({
          x: ca * tipSL,
          y: y + 0.07 * tipSL - 0.22 * tipSL * tipSL,
          z: sa * tipSL,
          tierF,
          angle: a,
          L
        });

        branchCandidates.push({
          ca,
          sa,
          y,
          L,
          tierF,
          angle: a
        });
      }
    }

    // 4. GARLAND (3.6 turns scalloped golden spiral with tube thickness & domino phase)
    const garlandSteps = 2600;
    const garlandStrands = 5;
    const turns = 3.6;
    const rTube = 0.019;
    for (let gi = 0; gi < garlandSteps; gi++) {
      const u = gi / (garlandSteps - 1);
      const yg = CONFIG.Y0 + 0.15 + (CONFIG.Y1 - CONFIG.Y0 - 0.42) * u;
      const ag = TAU * turns * u + 0.9;
      const swag = -0.06 * Math.abs(Math.sin(ag * 2.5));
      const rg = envelope(yg) * 1.04 + 0.028;
      const ca = Math.cos(ag);
      const sa = Math.sin(ag);
      const bx = rg * ca;
      const by = yg + swag;
      const bz = rg * sa;
      const t0Garland = 6.50 + 1.20 * u;

      for (let k = 0; k < garlandStrands; k++) {
        const angK = (TAU * k) / garlandStrands + u * 28.0;
        const cK = Math.cos(angK);
        const sK = Math.sin(angK);
        const ox = ca * cK;
        const oy = sK;
        const oz = sa * cK;
        pushPoint(
          bx + rTube * ox,
          by + rTube * oy,
          bz + rTube * oz,
          ox,
          oy,
          oz,
          1.00,
          0.843,
          0.373,
          t0Garland,
          KIND.GARLAND,
          u,
          0.70
        );
      }
    }

    // 5. BALL (44 glossy Fibonacci-sphere baubles hung from branch tips)
    const shuffledTips = tips.slice();
    for (let i = shuffledTips.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = shuffledTips[i];
      shuffledTips[i] = shuffledTips[j];
      shuffledTips[j] = tmp;
    }

    const chosenBaubles = [];
    const minDistThresholds = [0.23, 0.18, 0.12];
    for (let pass = 0; pass < minDistThresholds.length && chosenBaubles.length < CONFIG.BAUBLE_COUNT; pass++) {
      const minSq = minDistThresholds[pass] * minDistThresholds[pass];
      for (let idx = 0; idx < shuffledTips.length && chosenBaubles.length < CONFIG.BAUBLE_COUNT; idx++) {
        const cand = shuffledTips[idx];
        if (cand._used) continue;
        let ok = true;
        for (let k = 0; k < chosenBaubles.length; k++) {
          const prev = chosenBaubles[k];
          const dx = cand.x - prev.x;
          const dy = cand.y - prev.y;
          const dz = cand.z - prev.z;
          if (dx * dx + dy * dy + dz * dz < minSq) {
            ok = false;
            break;
          }
        }
        if (ok) {
          cand._used = true;
          chosenBaubles.push(cand);
        }
      }
    }

    const baubleFib = fib(144);
    const baubleColors = [
      [0.94, 0.13, 0.17], // Crimson Red
      [0.97, 0.76, 0.16], // Metallic Gold
      [0.18, 0.48, 0.96], // Sapphire Blue
      [0.88, 0.91, 0.96], // Pearl Silver
      [0.92, 0.24, 0.60]  // Rose Magenta
    ];
    for (let bi = 0; bi < chosenBaubles.length; bi++) {
      const tip = chosenBaubles[bi];
      const rBall = 0.072 + 0.022 * (1 - tip.tierF);
      const cx = tip.x * 1.04;
      const cy = tip.y - rBall * 0.45;
      const cz = tip.z * 1.04;
      const pRoll = rng();
      const col =
        pRoll < 0.40 ? baubleColors[0] :
        pRoll < 0.70 ? baubleColors[1] :
        pRoll < 0.85 ? baubleColors[2] :
        pRoll < 0.95 ? baubleColors[3] :
        baubleColors[4];
      const t0Ball = 6.80 + 1.00 * tip.tierF + 0.20 * rng();

      for (let k = 0; k < 144; k++) {
        const fIdx = k * 3;
        const fx = baubleFib[fIdx];
        const fy = baubleFib[fIdx + 1];
        const fz = baubleFib[fIdx + 2];
        pushPoint(
          cx + rBall * fx,
          cy + rBall * fy,
          cz + rBall * fz,
          fx,
          fy,
          fz,
          col[0],
          col[1],
          col[2],
          t0Ball,
          KIND.BALL,
          (bi / chosenBaubles.length),
          0.95
        );
      }
    }

    // 6. LIGHT (exactly 170 fairy light bulbs distributed across outer branches)
    const lightFib = fib(22);
    const lightPalette = [
      [1.00, 0.93, 0.68], // Warm Incandescent
      [1.00, 0.78, 0.22], // Golden Amber
      [1.00, 0.30, 0.26], // Festive Red
      [0.42, 0.92, 1.00], // Ice Cyan
      [0.32, 1.00, 0.54]  // Mint Emerald
    ];
    const rLight = 0.028;
    for (let li = 0; li < CONFIG.LIGHT_COUNT; li++) {
      const br = branchCandidates[Math.floor((li * branchCandidates.length) / CONFIG.LIGHT_COUNT)];
      const sLight = randUniform(0.76, 1.03);
      const sL = sLight * br.L;
      const spread = 0.03 * clamp(br.L * 1.5, 0.2, 1.0) * randNorm();
      const lx = br.ca * sL - br.sa * spread;
      const lz = br.sa * sL + br.ca * spread;
      const ly = br.y + 0.07 * sL - 0.22 * sL * sL + 0.022;
      const col = lightPalette[li % lightPalette.length];
      const angleNorm = ((br.angle / TAU) % 1 + 1) % 1;
      const phLight = (angleNorm + br.tierF * 3.6) % 1.0;
      const t0Light = 6.60 + 1.30 * br.tierF + 0.10 * rng();

      for (let k = 0; k < 22; k++) {
        const fIdx = k * 3;
        const fx = lightFib[fIdx];
        const fy = lightFib[fIdx + 1];
        const fz = lightFib[fIdx + 2];
        pushPoint(
          lx + rLight * fx,
          ly + rLight * fy,
          lz + rLight * fz,
          fx,
          fy,
          fz,
          col[0],
          col[1],
          col[2],
          t0Light,
          KIND.LIGHT,
          phLight,
          0.50
        );
      }
    }

    // 7. STAR (3D beveled 5-pointed golden star at apex + delicate starlight halo, triggered by spiral pulse at t=9.35s)
    const starY = CONFIG.Y1 + 0.13;
    const starOut = 0.190;
    const starIn = 0.075;
    const starThick = 0.056;
    const radialRings = 24;
    const angSamples = 64;
    for (let ri = 0; ri < radialRings; ri++) {
      const rf = (ri + 0.5) / radialRings;
      const samplesInRing = Math.max(10, Math.round(angSamples * (0.35 + 0.65 * rf)));
      const t0Star = 9.35 + 0.40 * rf;
      for (let ai = 0; ai < samplesInRing; ai++) {
        const th = (TAU * ai) / samplesInRing;
        const rMax = starMaxRadius(th, starOut, starIn);
        const r = rf * rMax;
        const sx = r * Math.cos(th);
        const sy = starY + r * Math.sin(th);
        const bevel = starThick * (1 - rf);
        const centerMix = 1 - rf;
        const sr = 1.0;
        const sg = 0.843 + (0.98 - 0.843) * centerMix;
        const sb = 0.373 + (0.75 - 0.373) * centerMix;

        pushPoint(sx, sy, bevel, sx * 0.6, (sy - starY) * 0.6, 0.85, sr, sg, sb, t0Star, KIND.STAR, 0, 1.0);
        pushPoint(sx, sy, -bevel, sx * 0.6, (sy - starY) * 0.6, -0.85, sr, sg, sb, t0Star, KIND.STAR, 0, 1.0);
      }
    }
    for (let hi = 0; hi < 64; hi++) {
      const th = (TAU * hi) / 64;
      const ringLayer = hi % 2;
      const rHalo = 0.21 + 0.065 * ringLayer + (hi % 4 === 0 ? 0.035 : 0);
      const t0Halo = 9.50 + 0.45 * (ringLayer * 0.55 + (hi / 64) * 0.45);
      pushPoint(rHalo * Math.cos(th), starY + rHalo * Math.sin(th), 0, 0, 0, 1, 1.00, 0.843, 0.373, t0Halo, KIND.STAR, 0, 0.85);
    }

    // 8. GIFT & RIBBON (8 3D gift boxes on y = 0 spread around tree skirt, r: 0.55 .. 1.15)
    const giftSpecs = [
      { r: 0.68, ang: 0.35, w: 0.26, h: 0.22, d: 0.24, yaw: 0.25, col: [0.88, 0.14, 0.18], rib: [1.00, 0.84, 0.35], t0: 7.80 },
      { r: 0.95, ang: 1.10, w: 0.32, h: 0.28, d: 0.30, yaw: -0.40, col: [0.14, 0.42, 0.92], rib: [1.00, 0.88, 0.40], t0: 8.00 },
      { r: 0.60, ang: 1.85, w: 0.22, h: 0.18, d: 0.22, yaw: 0.55, col: [0.10, 0.58, 0.26], rib: [0.95, 0.20, 0.24], t0: 8.20 },
      { r: 1.10, ang: 2.65, w: 0.30, h: 0.26, d: 0.28, yaw: 0.15, col: [0.92, 0.68, 0.12], rib: [0.88, 0.12, 0.18], t0: 8.40 },
      { r: 0.75, ang: 3.45, w: 0.25, h: 0.20, d: 0.24, yaw: -0.30, col: [0.72, 0.20, 0.65], rib: [0.96, 0.96, 1.00], t0: 8.60 },
      { r: 1.05, ang: 4.25, w: 0.28, h: 0.24, d: 0.26, yaw: 0.45, col: [0.18, 0.72, 0.82], rib: [1.00, 0.84, 0.35], t0: 8.80 },
      { r: 0.58, ang: 5.05, w: 0.20, h: 0.17, d: 0.20, yaw: -0.20, col: [0.85, 0.25, 0.35], rib: [0.25, 0.75, 0.35], t0: 9.00 },
      { r: 0.88, ang: 5.85, w: 0.27, h: 0.23, d: 0.25, yaw: 0.35, col: [0.95, 0.85, 0.40], rib: [0.88, 0.14, 0.18], t0: 9.20 }
    ];
    const stepGift = 0.013;

    for (let gi = 0; gi < giftSpecs.length; gi++) {
      const box = giftSpecs[gi];
      const bx = box.r * Math.cos(box.ang);
      const bz = box.r * Math.sin(box.ang);
      const cyRot = Math.cos(box.yaw);
      const syRot = Math.sin(box.yaw);
      const hw = box.w * 0.5;
      const hd = box.d * 0.5;

      function emitGiftPt(lx, ly, lz, lnx, lny, lnz, forceRibbon) {
        const isRib = forceRibbon || Math.abs(lx) < 0.030 || Math.abs(lz) < 0.030;
        const wx = bx + lx * cyRot + lz * syRot;
        const wz = bz - lx * syRot + lz * cyRot;
        const wnx = lnx * cyRot + lnz * syRot;
        const wnz = -lnx * syRot + lnz * cyRot;
        const col = isRib ? box.rib : box.col;
        pushPoint(
          wx,
          ly,
          wz,
          wnx,
          lny,
          wnz,
          col[0],
          col[1],
          col[2],
          box.t0,
          isRib ? KIND.RIBBON : KIND.GIFT,
          0,
          isRib ? 0.65 : 0.22
        );
      }

      const nxSteps = Math.max(4, Math.round(box.w / stepGift));
      const nySteps = Math.max(4, Math.round(box.h / stepGift));
      const nzSteps = Math.max(4, Math.round(box.d / stepGift));

      // Top face
      for (let ix = 0; ix <= nxSteps; ix++) {
        const lx = -hw + (box.w * ix) / nxSteps;
        for (let iz = 0; iz <= nzSteps; iz++) {
          const lz = -hd + (box.d * iz) / nzSteps;
          emitGiftPt(lx, box.h, lz, 0, 1, 0, false);
        }
      }
      // Front & Back Z faces
      for (let ix = 0; ix <= nxSteps; ix++) {
        const lx = -hw + (box.w * ix) / nxSteps;
        for (let iy = 0; iy <= nySteps; iy++) {
          const ly = (box.h * iy) / nySteps;
          emitGiftPt(lx, ly, hd, 0, 0, 1, false);
          emitGiftPt(lx, ly, -hd, 0, 0, -1, false);
        }
      }
      // Left & Right X faces
      for (let iz = 0; iz <= nzSteps; iz++) {
        const lz = -hd + (box.d * iz) / nzSteps;
        for (let iy = 0; iy <= nySteps; iy++) {
          const ly = (box.h * iy) / nySteps;
          emitGiftPt(hw, ly, lz, 1, 0, 0, false);
          emitGiftPt(-hw, ly, lz, -1, 0, 0, false);
        }
      }
      // Ribbon bow atop gift
      for (let bi = 0; bi < 84; bi++) {
        const tBow = (TAU * bi) / 84;
        const loopX = 0.055 * Math.sin(tBow);
        const loopZ = 0.028 * Math.sin(2 * tBow);
        const loopY = box.h + 0.025 + 0.015 * Math.abs(Math.sin(tBow));
        emitGiftPt(loopX, loopY, loopZ, Math.sin(tBow) * 0.4, 0.88, Math.cos(tBow) * 0.3, true);
      }
    }

    return {
      count: tmpPx.length,
      px: new Float32Array(tmpPx),
      py: new Float32Array(tmpPy),
      pz: new Float32Array(tmpPz),
      nx: new Float32Array(tmpNx),
      ny: new Float32Array(tmpNy),
      nz: new Float32Array(tmpNz),
      cr: new Float32Array(tmpCr),
      cg: new Float32Array(tmpCg),
      cb: new Float32Array(tmpCb),
      t0: new Float32Array(tmpT0),
      ph: new Float32Array(tmpPh),
      sh: new Float32Array(tmpSh),
      kind: new Uint8Array(tmpKind),
      meta: {
        seed: seed === undefined ? 7 : seed,
        lightCount: CONFIG.LIGHT_COUNT,
        baubleCount: chosenBaubles.length,
        giftCount: giftSpecs.length,
        countsByKind
      }
    };
  }

  function buildStars(count, seed) {
    const { rng } = createRng(seed || 1337);
    const stars = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const idx = i * 4;
      stars[idx] = rng();           // x normalized [0,1]
      stars[idx + 1] = rng() * 0.84; // y normalized [0,0.84]
      stars[idx + 2] = 0.35 + 0.65 * rng(); // brightness
      stars[idx + 3] = rng() * TAU;  // twinkle phase
    }
    return stars;
  }

  // Ultra-lightweight deterministic snowfall layer
  function buildSnow(count, seed) {
    const { rng, randUniform } = createRng(seed || 2026);
    const countReal = count || CONFIG.SNOW_COUNT;
    const pos = new Float32Array(countReal * 7);
    const col = new Uint8Array(countReal * 4);

    for (let i = 0; i < countReal; i++) {
      const pIdx = i * 7;
      pos[pIdx] = rng();                              // x0 [0, 1]
      pos[pIdx + 1] = rng();                          // y0 [0, 1]
      pos[pIdx + 2] = randUniform(0.040, 0.090);      // vy (fall speed)
      pos[pIdx + 3] = randUniform(0.016, 0.038);      // wind (diagonal drift to right)
      pos[pIdx + 4] = randUniform(0.006, 0.016);      // sway amplitude
      pos[pIdx + 5] = randUniform(1.2, 2.5);          // sway frequency
      pos[pIdx + 6] = randUniform(0, TAU);            // sway phase

      const cIdx = i * 4;
      const gRoll = rng();
      const gId = gRoll < 0.40 ? 1 : gRoll < 0.70 ? 2 : gRoll < 0.85 ? 6 : gRoll < 0.95 ? 7 : 3;
      col[cIdx] = gId;
      const bright = randUniform(0.75, 1.0);
      col[cIdx + 1] = Math.round(210 * bright + 45);  // r
      col[cIdx + 2] = Math.round(225 * bright + 30);  // g
      col[cIdx + 3] = 255;                            // b (crisp cool-white / ice blue)
    }

    return { count: countReal, pos, col };
  }

  function renderSnowToBuffer(params) {
    const { snow, t, width, height, cellW, cellH, cols, rows, buf32, atlas, prefersReduced } = params;
    if (!snow || !snow.count) return;
    const count = snow.count;
    const pos = snow.pos;
    const col = snow.col;
    const time = prefersReduced ? 0 : t;

    for (let i = 0; i < count; i++) {
      const pIdx = i * 7;
      const cIdx = i * 4;

      const yNorm = (pos[pIdx + 1] + pos[pIdx + 2] * time) % 1.0;
      const sway = pos[pIdx + 4] * Math.sin(time * pos[pIdx + 5] + pos[pIdx + 6]);
      let xNorm = (pos[pIdx] + pos[pIdx + 3] * time + sway) % 1.0;
      if (xNorm < 0) xNorm += 1.0;

      const gx = (xNorm * cols) | 0;
      const gy = (yNorm * rows) | 0;
      if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;

      const gId = col[cIdx];
      const r = col[cIdx + 1];
      const g = col[cIdx + 2];
      const b = col[cIdx + 3];

      blitGlyph(buf32, width, height, gx * cellW, gy * cellH, cellW, cellH, atlas[gId], r, g, b);
    }
  }

  // Global continuous ambient particles (Snow <-> Stars smooth blend)
  function buildAmbientParticles(count, seed) {
    const { rng, randUniform } = createRng(seed || 2026);
    const countReal = count || CONFIG.SNOW_COUNT || 240;
    const pos = new Float32Array(countReal * 8);
    const col = new Uint8Array(countReal * 4);

    const snowGlyphs = [1, 2, 6, 7, 3];
    const starGlyphs = [1, 2, 6, 7];

    for (let i = 0; i < countReal; i++) {
      const pIdx = i * 8;
      pos[pIdx] = rng();                          // x0 [0, 1]
      pos[pIdx + 1] = rng();                      // y0 [0, 1]
      pos[pIdx + 2] = randUniform(0.040, 0.088);  // vy (fall speed)
      pos[pIdx + 3] = randUniform(0.016, 0.038);  // wind drift
      pos[pIdx + 4] = randUniform(0.006, 0.016);  // sway amplitude
      pos[pIdx + 5] = randUniform(1.2, 2.5);      // sway frequency
      pos[pIdx + 6] = randUniform(0, TAU);        // sway phase
      pos[pIdx + 7] = randUniform(0.40, 1.0);     // star base brightness

      const cIdx = i * 4;
      col[cIdx] = snowGlyphs[Math.floor(rng() * snowGlyphs.length)];
      col[cIdx + 1] = starGlyphs[Math.floor(rng() * starGlyphs.length)];
      col[cIdx + 2] = Math.round(randUniform(1.0, 3.0) * 10);
      col[cIdx + 3] = Math.round(randUniform(0, TAU) * 10);
    }

    return { count: countReal, pos, col };
  }

  function renderAmbientParticlesToBuffer(params) {
    const {
      particles,
      snowDistance,
      globalTime,
      snowBlend,
      width,
      height,
      cellW,
      cellH,
      cols,
      rows,
      buf32,
      atlas,
      prefersReduced
    } = params;
    if (!particles || !particles.count) return;
    const count = particles.count;
    const pos = particles.pos;
    const col = particles.col;
    const time = prefersReduced ? 0 : (globalTime || 0);
    const dist = prefersReduced ? 0 : (snowDistance || 0);
    const blend = clamp(snowBlend !== undefined ? snowBlend : 1.0, 0, 1);

    for (let i = 0; i < count; i++) {
      const pIdx = i * 8;
      const cIdx = i * 4;

      const vy = pos[pIdx + 2];
      const wind = pos[pIdx + 3];
      const swayAmp = pos[pIdx + 4];
      const swayFreq = pos[pIdx + 5];
      const swayPhase = pos[pIdx + 6];
      const starBase = pos[pIdx + 7];

      // Vertical position driven by continuous monotonically advancing snowDistance
      const yNorm = ((pos[pIdx + 1] + vy * dist) % 1.0 + 1.0) % 1.0;

      // Horizontal wind + sway (sway gently dampens as blend -> 0)
      const sway = swayAmp * Math.sin(time * swayFreq + swayPhase) * blend;
      const xNorm = ((pos[pIdx] + wind * dist + sway) % 1.0 + 1.0) % 1.0;

      const gx = (xNorm * cols) | 0;
      const gy = (yNorm * rows) | 0;
      if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;

      // Glyph selection based on snowBlend
      const gId = blend > 0.5 ? col[cIdx] : col[cIdx + 1];

      // Snow color: crisp cool-white / ice-blue
      const snowR = 220;
      const snowG = 235;
      const snowB = 255;

      // Star color: gentle twinkling star in deep cosmic space
      const twFreq = col[cIdx + 2] / 10;
      const twPhase = col[cIdx + 3] / 10;
      const twinkle = 0.60 + 0.40 * Math.sin(time * twFreq + twPhase);
      const starBr = starBase * twinkle;
      const starLum = Math.round(75 + 175 * starBr);
      const starR = starLum;
      const starG = starLum;
      const starB = Math.min(255, starLum + 25);

      // Smooth interpolation of color based on snowBlend
      const outR = Math.round(starR * (1 - blend) + snowR * blend);
      const outG = Math.round(starG * (1 - blend) + snowG * blend);
      const outB = Math.round(starB * (1 - blend) + snowB * blend);

      blitGlyph(buf32, width, height, gx * cellW, gy * cellH, cellW, cellH, atlas[gId], outR, outG, outB);
    }
  }

  // Fallback procedural glyph masks when headless/mock canvas yields empty pixels
  function buildFallbackGlyphPixels(ch, cellW, cellH) {
    const w = Math.max(1, Math.round(cellW));
    const h = Math.max(1, Math.round(cellH));
    const midX = (w * 0.5) | 0;
    const midY = (h * 0.5) | 0;
    const pts = [];
    const add = (x, y, cov) => {
      if (x >= 0 && x < w && y >= 0 && y < h) {
        pts.push(x, y, cov);
      }
    };
    if (ch === '.') {
      add(midX, h - 2, 220);
    } else if (ch === '\u00B7') {
      add(midX, midY, 225);
    } else if (ch === ':') {
      add(midX, midY - 2, 220);
      add(midX, midY + 2, 220);
    } else if (ch === '-') {
      for (let x = 1; x < w - 1; x++) add(x, midY, 220);
    } else if (ch === '=') {
      for (let x = 1; x < w - 1; x++) {
        add(x, midY - 1, 220);
        add(x, midY + 1, 220);
      }
    } else if (ch === '+') {
      for (let x = 1; x < w - 1; x++) add(x, midY, 225);
      for (let y = 2; y < h - 2; y++) add(midX, y, 225);
    } else if (ch === '*') {
      add(midX, midY, 245);
      add(midX - 1, midY - 1, 200);
      add(midX + 1, midY - 1, 200);
      add(midX - 1, midY + 1, 200);
      add(midX + 1, midY + 1, 200);
      add(midX, midY - 2, 210);
      add(midX, midY + 2, 210);
    } else if (ch === '#' || ch === '%' || ch === '@') {
      const top = 1;
      const bot = h - 2;
      for (let y = top; y <= bot; y++) {
        for (let x = 1; x < w - 1; x++) {
          const edge = x === 1 || x === w - 2 || y === top || y === bot || x === midX || y === midY;
          if (ch === '@' || edge) {
            add(x, y, ch === '@' ? 245 : 225);
          }
        }
      }
    } else if (ch === '/') {
      for (let y = 1; y < h - 1; y++) {
        const x = Math.round((w - 2) * (1 - (y - 1) / Math.max(1, h - 3))) + 1;
        add(x, y, 230);
      }
    } else if (ch === '|') {
      for (let y = 1; y < h - 1; y++) {
        add(midX, y, 235);
      }
    } else if (ch === '\\') {
      for (let y = 1; y < h - 1; y++) {
        const x = Math.round((w - 2) * ((y - 1) / Math.max(1, h - 3))) + 1;
        add(x, y, 230);
      }
    } else if (ch === '~') {
      add(midX - 1, midY - 1, 220);
      add(midX, midY, 220);
      add(midX + 1, midY + 1, 220);
    } else if (ch === ',') {
      add(midX, h - 3, 220);
      add(midX - 1, h - 2, 200);
    } else if (ch === ';') {
      add(midX, midY - 2, 220);
      add(midX, h - 3, 220);
      add(midX - 1, h - 2, 200);
    } else if (ch === 'x') {
      add(1, midY - 1, 220); add(w - 2, midY - 1, 220);
      add(midX, midY, 230);
      add(1, midY + 1, 220); add(w - 2, midY + 1, 220);
    } else if (ch === 'o' || ch === '8' || ch === '$' || ch === '&') {
      const top = 1;
      const bot = h - 2;
      for (let y = top; y <= bot; y++) {
        for (let x = 1; x < w - 1; x++) {
          const edge = x === 1 || x === w - 2 || y === top || y === bot || (ch !== 'o' && (y === midY || x === midX));
          if (edge) add(x, y, 230);
        }
      }
    }
    return new Uint8Array(pts);
  }

  // Pre-bake sparse pixel offsets (dx, dy, coverage255) for all ASCII glyphs
  function buildGlyphAtlas(cellW, cellH, fontStr) {
    const atlasW = Math.max(1, Math.round(cellW));
    const atlasH = Math.max(1, Math.round(cellH));
    const atlas = new Array(ALL_GLYPHS.length);
    let tmpCtx = null;
    let tmpCanvas = null;

    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      try {
        tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = atlasW;
        tmpCanvas.height = atlasH;
        tmpCtx = tmpCanvas.getContext('2d', { willReadFrequently: true }) || tmpCanvas.getContext('2d');
      } catch (_) {
        tmpCtx = null;
      }
    }

    for (let gi = 0; gi < ALL_GLYPHS.length; gi++) {
      const ch = ALL_GLYPHS[gi];
      if (ch === ' ') {
        atlas[gi] = new Uint8Array(0);
        continue;
      }

      let extracted = null;
      if (tmpCtx && typeof tmpCtx.fillText === 'function' && typeof tmpCtx.getImageData === 'function') {
        tmpCtx.clearRect(0, 0, atlasW, atlasH);
        tmpCtx.fillStyle = '#ffffff';
        tmpCtx.font = fontStr || '700 7px "JetBrains Mono", Consolas, monospace';
        tmpCtx.textBaseline = 'middle';
        tmpCtx.textAlign = 'center';
        tmpCtx.fillText(ch, atlasW * 0.5, atlasH * 0.52);

        const img = tmpCtx.getImageData(0, 0, atlasW, atlasH);
        const data = img && img.data;
        if (data && data.length === atlasW * atlasH * 4) {
          const sparse = [];
          for (let y = 0; y < atlasH; y++) {
            for (let x = 0; x < atlasW; x++) {
              const a = data[(y * atlasW + x) * 4 + 3];
              if (a > 24) {
                sparse.push(x, y, a);
              }
            }
          }
          if (sparse.length > 0) {
            extracted = new Uint8Array(sparse);
          }
        }
      }

      atlas[gi] = extracted || buildFallbackGlyphPixels(ch, atlasW, atlasH);
    }

    return atlas;
  }

  // Map RAMP_GROUND index -> RAMP_MAIN glyph index
  const GROUND_TO_MAIN_IDX = [0, 1, 2, 3, 2, 3, 5, 6, 7, 8, 10];

  function blitGlyph(buf32, canvasW, canvasH, cellX, cellY, cellW, cellH, sparseGlyph, r, g, b) {
    if (!sparseGlyph || sparseGlyph.length === 0) return;
    const baseX = Math.round(cellX);
    const baseY = Math.round(cellY);
    const spanW = Math.round(cellW);
    const spanH = Math.round(cellH);
    const dr = r - CONFIG.BG_R;
    const dg = g - CONFIG.BG_G;
    const db = b - CONFIG.BG_B;

    if (baseX >= 0 && baseX + spanW <= canvasW && baseY >= 0 && baseY + spanH <= canvasH) {
      if (IS_LITTLE_ENDIAN) {
        for (let k = 0; k < sparseGlyph.length; k += 3) {
          const px = baseX + sparseGlyph[k];
          const py = baseY + sparseGlyph[k + 1];
          const cov = sparseGlyph[k + 2];
          const outR = (CONFIG.BG_R + ((dr * cov) >> 8)) & 255;
          const outG = (CONFIG.BG_G + ((dg * cov) >> 8)) & 255;
          const outB = (CONFIG.BG_B + ((db * cov) >> 8)) & 255;
          buf32[py * canvasW + px] = ((255 << 24) | (outB << 16) | (outG << 8) | outR) >>> 0;
        }
      } else {
        for (let k = 0; k < sparseGlyph.length; k += 3) {
          const px = baseX + sparseGlyph[k];
          const py = baseY + sparseGlyph[k + 1];
          const cov = sparseGlyph[k + 2];
          const outR = (CONFIG.BG_R + ((dr * cov) >> 8)) & 255;
          const outG = (CONFIG.BG_G + ((dg * cov) >> 8)) & 255;
          const outB = (CONFIG.BG_B + ((db * cov) >> 8)) & 255;
          buf32[py * canvasW + px] = ((outR << 24) | (outG << 16) | (outB << 8) | 255) >>> 0;
        }
      }
      return;
    }

    for (let k = 0; k < sparseGlyph.length; k += 3) {
      const px = baseX + sparseGlyph[k];
      const py = baseY + sparseGlyph[k + 1];
      if (px >= 0 && px < canvasW && py >= 0 && py < canvasH) {
        const cov = sparseGlyph[k + 2];
        const outR = (CONFIG.BG_R + ((dr * cov) >> 8)) & 255;
        const outG = (CONFIG.BG_G + ((dg * cov) >> 8)) & 255;
        const outB = (CONFIG.BG_B + ((db * cov) >> 8)) & 255;
        if (IS_LITTLE_ENDIAN) {
          buf32[py * canvasW + px] = ((255 << 24) | (outB << 16) | (outG << 8) | outR) >>> 0;
        } else {
          buf32[py * canvasW + px] = ((outR << 24) | (outG << 16) | (outB << 8) | 255) >>> 0;
        }
      }
    }
  }

  // Precomputed camera & key light vectors (camera-space, front faces toward -Z)
  const PITCH_RAD = (CONFIG.CAMERA_PITCH_DEG * Math.PI) / 180;
  const COS_P = Math.cos(PITCH_RAD);
  const SIN_P = Math.sin(PITCH_RAD);
  const ROT_SPEED_RAD = (CONFIG.ROT_SPEED_DEG * Math.PI) / 180;

  const L_RAW_X = -0.36;
  const L_RAW_Y = 0.48;
  const L_RAW_Z = -0.80;
  const L_LEN = Math.hypot(L_RAW_X, L_RAW_Y, L_RAW_Z);
  const LX = L_RAW_X / L_LEN;
  const LY = L_RAW_Y / L_LEN;
  const LZ = L_RAW_Z / L_LEN;

  // Halfway vector H = normalize(L + V), V = (0, 0, -1)
  const H_RAW_X = LX;
  const H_RAW_Y = LY;
  const H_RAW_Z = LZ - 1.0;
  const H_LEN = Math.hypot(H_RAW_X, H_RAW_Y, H_RAW_Z);
  const HX = H_RAW_X / H_LEN;
  const HY = H_RAW_Y / H_LEN;
  const HZ = H_RAW_Z / H_LEN;

  // =========================================================================
  // SCENE 1: 3D CHRISTMAS TREE (agac.py) + SNOWFALL
  // =========================================================================
  function renderTreeScene(params) {
    const {
      t,
      width,
      height,
      cellW,
      cellH,
      cols,
      rows,
      buf32,
      atlas,
      stars,
      snow,
      scene,
      prefersReduced
    } = params;

    const zBuf = params.zBuf || new Float32Array(cols * rows).fill(1e9);
    const winIdx = params.winIdx || new Int32Array(cols * rows);
    const activeCells = params.activeCells || new Int32Array(cols * rows);

    buf32.fill(BG_PACKED);

    // Unified Ambient Particles (Snow <-> Stars seamless transition, never resets on loop)
    if (params && params.particles) {
      renderAmbientParticlesToBuffer({
        particles: params.particles,
        snowDistance: params.snowDistance !== undefined ? params.snowDistance : t,
        globalTime: params.globalTime !== undefined ? params.globalTime : t,
        snowBlend: params.snowBlend !== undefined ? params.snowBlend : 1.0,
        width,
        height,
        cellW,
        cellH,
        cols,
        rows,
        buf32,
        atlas,
        prefersReduced
      });
    } else {
      const starCount = stars ? (stars.length / 4) | 0 : 0;
      for (let s = 0; s < starCount; s++) {
        const sIdx = s * 4;
        const gx = (stars[sIdx] * cols) | 0;
        const gy = (stars[sIdx + 1] * rows) | 0;
        if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
        const tw = 0.65 + 0.35 * Math.sin(t * 1.8 + stars[sIdx + 3]);
        const br = stars[sIdx + 2] * tw;
        const gId = br > 0.88 ? 6 : br > 0.56 ? 2 : 1;
        const lum = Math.round(70 + 175 * br);
        blitGlyph(buf32, width, height, gx * cellW, gy * cellH, cellW, cellH, atlas[gId], lum, lum, Math.min(255, lum + 18));
      }

      if (snow) {
        renderSnowToBuffer({
          snow,
          t,
          width,
          height,
          cellW,
          cellH,
          cols,
          rows,
          buf32,
          atlas,
          prefersReduced
        });
      }
    }

    const cycleT = ((t % CONFIG.CYCLE_DURATION) + CONFIG.CYCLE_DURATION) % CONFIG.CYCLE_DURATION;
    const rotY = cycleT * ROT_SPEED_RAD;
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    const isDesktop = width > 840;
    const focal = isDesktop ? Math.min(height * 1.13, width * 0.82) : Math.min(height * 1.04, width * 1.18);
    const cx = isDesktop ? width * 0.74 : width * 0.50;
    const cy = isDesktop ? Math.max(height * 0.435, 68 + 0.31 * focal) : height * 0.47;
    const invCellW = 1 / cellW;
    const invCellH = 1 / cellH;

    const pxArr = scene.px;
    const pyArr = scene.py;
    const pzArr = scene.pz;
    const t0Arr = scene.t0;
    const kindArr = scene.kind;
    const nPts = scene.count;

    const allBorn = cycleT >= 10.0;
    const inDissolve = cycleT > CONFIG.DISSOLVE_START;
    let activeCount = 0;

    // Pass 1: Geometry transform + Z-buffer culling (0 allocations)
    if (allBorn && !inDissolve) {
      for (let i = 0; i < nPts; i++) {
        const x = pxArr[i];
        const y = pyArr[i];
        const z = pzArr[i];

        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const dy = y - CONFIG.Y_CENTER;

        const yCam = dy * COS_P + z1 * SIN_P;
        const zCam = -dy * SIN_P + z1 * COS_P + CONFIG.CAM_DIST;
        if (zCam <= 0.35) continue;

        const invZ = focal / zCam;
        const sx = cx + x1 * invZ;
        const sy = cy - yCam * invZ;
        const gx = (sx * invCellW) | 0;
        const gy = (sy * invCellH) | 0;

        if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;

        const cellIdx = gy * cols + gx;
        const prevZ = zBuf[cellIdx];
        if (zCam < prevZ) {
          if (prevZ > 1e8) {
            activeCells[activeCount++] = cellIdx;
          }
          zBuf[cellIdx] = zCam;
          winIdx[cellIdx] = i;
        }
      }
    } else {
      for (let i = 0; i < nPts; i++) {
        if (!allBorn && cycleT < t0Arr[i]) continue;

        let x = pxArr[i];
        let y = pyArr[i];
        let z = pzArr[i];

        if (inDissolve) {
          const dis = computeDissolveState(y, i, cycleT);
          if (!dis.active) continue;
          if (dis.u > 0) {
            const u = dis.u;
            const expand = 1 + 0.15 * u;
            x *= expand;
            z *= expand;
            y += 0.24 * u * u;
          }
        }

        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const dy = y - CONFIG.Y_CENTER;

        const yCam = dy * COS_P + z1 * SIN_P;
        const zCam = -dy * SIN_P + z1 * COS_P + CONFIG.CAM_DIST;
        if (zCam <= 0.35) continue;

        const invZ = focal / zCam;
        const sx = cx + x1 * invZ;
        const sy = cy - yCam * invZ;
        const gx = (sx * invCellW) | 0;
        const gy = (sy * invCellH) | 0;

        if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;

        const cellIdx = gy * cols + gx;
        const prevZ = zBuf[cellIdx];
        if (zCam < prevZ) {
          if (prevZ > 1e8) {
            activeCells[activeCount++] = cellIdx;
          }
          zBuf[cellIdx] = zCam;
          winIdx[cellIdx] = i;
        }
      }
    }

    // Pass 2: Deferred shading ONLY on winning visible cells + O(activeCount) Z-buffer reset
    const nxArr = scene.nx;
    const nyArr = scene.ny;
    const nzArr = scene.nz;
    const crArr = scene.cr;
    const cgArr = scene.cg;
    const cbArr = scene.cb;
    const phArr = scene.ph;
    const shArr = scene.sh;
    const maxGlyphIdx = RAMP_MAIN.length - 1;
    let renderedLetters = 0;

    // Spiral golden energy pulse chasing from base to apex (8.00s -> 9.35s, triggers apex star burst)
    const PULSE_START = 8.00;
    const PULSE_END = 9.35;
    const PULSE_DUR = PULSE_END - PULSE_START;
    const inPulse = cycleT >= PULSE_START && cycleT <= PULSE_END + 0.45;
    const pulseHead = (cycleT - PULSE_START) / PULSE_DUR;
    const starYApex = CONFIG.Y1 + 0.13;

    for (let a = 0; a < activeCount; a++) {
      const cellIdx = activeCells[a];
      const i = winIdx[cellIdx];
      zBuf[cellIdx] = 1e9;

      const gx = cellIdx % cols;
      const gy = (cellIdx / cols) | 0;
      const k = kindArr[i];

      const nx = nxArr[i];
      const ny = nyArr[i];
      const nz = nzArr[i];
      const nx1 = nx * cosY + nz * sinY;
      const nz1 = -nx * sinY + nz * cosY;
      const nyCam = ny * COS_P + nz1 * SIN_P;
      const nzCam = -ny * SIN_P + nz1 * COS_P;

      const ndotl = Math.max(0, nx1 * LX + nyCam * LY + nzCam * LZ);
      const ndoth = Math.max(0, nx1 * HX + nyCam * HY + nzCam * HZ);

      let rCol = crArr[i];
      let gCol = cgArr[i];
      let bCol = cbArr[i];
      let lum;

      if (k === KIND.GROUND) {
        lum = 0.85 + 0.15 * ndotl;
      } else {
        const diff = 0.36 + 0.78 * ndotl;
        const spec = Math.pow(ndoth, 18) * shArr[i] * 1.35;
        lum = diff + spec;

        if (k === KIND.GARLAND) {
          const dom = computeDominoIntensity(phArr[i], cycleT);
          const boost = 0.80 + 1.35 * dom;
          const whiteMix = clamp(dom * 0.45, 0, 0.75);
          rCol = 1.00;
          gCol = 0.843 + (1.0 - 0.843) * whiteMix;
          bCol = 0.373 + (0.90 - 0.373) * whiteMix;
          lum = lum * boost + spec * 0.45;

          // Energy pulse blazing upward along spiral garland toward apex
          if (inPulse) {
            const uMapped = phArr[i] * 0.88;
            const distBehind = pulseHead - uMapped;
            if (distBehind >= -0.05 && distBehind <= 0.30) {
              const headGlow = Math.exp(-Math.pow(distBehind / 0.045, 2));
              const tailGlow = distBehind > 0 ? Math.exp(-distBehind / 0.11) : 0;
              const chaseBoost = Math.max(headGlow, 0.72 * tailGlow);
              rCol = 1.00;
              gCol = Math.min(1.0, gCol + (0.98 - gCol) * chaseBoost);
              bCol = Math.min(1.0, bCol + (0.85 - bCol) * chaseBoost);
              lum += 1.55 * chaseBoost;
            }
          }
        } else if (k === KIND.LIGHT) {
          const dom = computeDominoIntensity(phArr[i], cycleT);
          const twinkle = 0.80 + 0.20 * Math.sin(cycleT * 5.2 + i * 0.37);
          lum = (0.70 + 0.55 * ndotl) * (0.65 + 1.15 * dom) * twinkle;
        } else if (k === KIND.STAR) {
          rCol = 1.00;
          gCol = 0.843;
          bCol = 0.373;
          lum = Math.max(0.85, lum * 1.25);
          // Ignition burst flare when spiral energy pulse hits apex at t = 9.35s
          if (cycleT >= PULSE_END && cycleT < PULSE_END + 1.2) {
            const burstAge = cycleT - PULSE_END;
            const flare = Math.exp(-Math.pow(burstAge / 0.55, 2));
            gCol = 0.843 + (0.99 - 0.843) * flare;
            bCol = 0.373 + (0.88 - 0.373) * flare;
            lum += 0.95 * flare;
          }
        }
      }

      // Warm Golden Ambient Glow (ngôi sao đỉnh & dải LED đuổi màu vàng kim rực rỡ rgb(255, 215, 95))
      if (k !== KIND.GROUND && k !== KIND.STAR) {
        const py = pyArr[i];
        const px = pxArr[i];
        const pz = pzArr[i];
        const distStar = Math.hypot(px, py - starYApex, pz);
        const starInfluence = clamp(1.0 - distStar / 2.6, 0, 1);
        const isFoliageOrGift = (k === KIND.NEEDLE || k === KIND.SNOWCAP || k === KIND.BALL || k === KIND.GIFT || k === KIND.RIBBON);
        const garlandInfluence = isFoliageOrGift ? 0.08 : 0.0;
        const goldMix = clamp(0.25 + 0.10 * starInfluence + garlandInfluence, 0.22, 0.35);
        const GOLD_R = 1.00;
        const GOLD_G = 0.843;
        const GOLD_B = 0.373;
        rCol = rCol * (1.0 - goldMix) + GOLD_R * goldMix;
        gCol = gCol * (1.0 - goldMix) + GOLD_G * goldMix;
        bCol = bCol * (1.0 - goldMix) + GOLD_B * goldMix;
      }

      // Growth ignition frontier flash (0..0.48s after birth)
      const age = cycleT - t0Arr[i];
      if (age >= 0 && age < 0.48 && k !== KIND.GROUND) {
        const flash = Math.pow(1 - age / 0.48, 2.2);
        rCol = rCol + (1.0 - rCol) * flash;
        gCol = gCol + (1.0 - gCol) * flash;
        bCol = bCol + (1.0 - bCol) * flash;
        lum += 0.65 * flash;
      }

      // Dissolve fade & gentle step-down
      let disMask = 1.0;
      if (inDissolve) {
        const dis = computeDissolveState(pyArr[i], i, cycleT);
        if (dis.u > 0) {
          disMask = 1 - dis.u;
          lum *= disMask * disMask;
        }
      }

      const shadeFactor = clamp(lum, 0, 1.35);
      let intensity;
      if (k === KIND.GROUND) {
        const maxCh = Math.max(rCol, gCol, bCol);
        intensity = clamp(maxCh * lum, 0, 1);
      } else {
        intensity = clamp((0.14 + 0.78 * shadeFactor) * disMask, 0, 1);
      }

      let gId = Math.round(intensity * maxGlyphIdx);
      if (gId < 1 && intensity > 0.02) gId = 1;
      if (gId > maxGlyphIdx) gId = maxGlyphIdx;
      if (k === KIND.GROUND) {
        gId = GROUND_TO_MAIN_IDX[gId] || 1;
      }
      if (gId === 0) continue;

      const outR = Math.min(255, Math.max(0, Math.round(rCol * shadeFactor * 255)));
      const outG = Math.min(255, Math.max(0, Math.round(gCol * shadeFactor * 255)));
      const outB = Math.min(255, Math.max(0, Math.round(bCol * shadeFactor * 255)));

      renderedLetters++;
      blitGlyph(buf32, width, height, gx * cellW, gy * cellH, cellW, cellH, atlas[gId], outR, outG, outB);
    }

    // Pass 3a: 3D Glowing Spiral Energy Comet climbing to apex (8.00s -> 9.52s)
    if (cycleT >= PULSE_START && cycleT <= PULSE_END + 0.18) {
      const turns = 3.6;
      const yGarlandTop = CONFIG.Y0 + 0.15 + (CONFIG.Y1 - CONFIG.Y0 - 0.42);
      const rGarlandTop = envelope(yGarlandTop) * 1.04 + 0.028;
      const aGarlandTop = TAU * turns + 0.9;

      for (let ti = 0; ti < 22; ti++) {
        const sPos = pulseHead - ti * 0.0085;
        if (sPos < 0 || sPos > 1.02) continue;

        let cx3, cy3, cz3;
        if (sPos <= 0.88) {
          const u = sPos / 0.88;
          const yg = CONFIG.Y0 + 0.15 + (CONFIG.Y1 - CONFIG.Y0 - 0.42) * u;
          const ag = TAU * turns * u + 0.9;
          const swag = -0.06 * Math.abs(Math.sin(ag * 2.5));
          const rg = envelope(yg) * 1.04 + 0.036;
          cx3 = rg * Math.cos(ag);
          cy3 = yg + swag;
          cz3 = rg * Math.sin(ag);
        } else {
          // Final tight spiral sprint from garland top straight into apex star center
          const f = clamp((sPos - 0.88) / 0.12, 0, 1);
          const ag = aGarlandTop + f * TAU * 0.85;
          const rg = rGarlandTop * (1 - f);
          cx3 = rg * Math.cos(ag);
          cy3 = yGarlandTop + (starYApex - yGarlandTop) * f;
          cz3 = rg * Math.sin(ag);
        }

        const x1 = cx3 * cosY + cz3 * sinY;
        const z1 = -cx3 * sinY + cz3 * cosY;
        const dy = cy3 - CONFIG.Y_CENTER;
        const yCam = dy * COS_P + z1 * SIN_P;
        const zCam = -dy * SIN_P + z1 * COS_P + CONFIG.CAM_DIST;
        if (zCam <= 0.35) continue;

        const invZ = focal / zCam;
        const gx = ((cx + x1 * invZ) * invCellW) | 0;
        const gy = ((cy - yCam * invZ) * invCellH) | 0;
        if (gx < 1 || gx >= cols - 1 || gy < 1 || gy >= rows - 1) continue;

        const tailDecay = Math.pow(1 - ti / 22, 1.45);
        const endFade = sPos > 0.96 ? clamp(1 - (cycleT - PULSE_END) / 0.18, 0, 1) : 1.0;
        const bright = tailDecay * endFade;
        if (bright <= 0.05) continue;

        const gId = ti === 0 ? 10 : ti < 4 ? 7 : ti < 10 ? 6 : 2;
        const oR = Math.min(255, Math.round(255 * bright));
        const oG = Math.min(255, Math.round((215 + 38 * tailDecay) * bright));
        const oB = Math.min(255, Math.round((95 + 140 * tailDecay * tailDecay) * bright));
        renderedLetters++;
        blitGlyph(buf32, width, height, gx * cellW, gy * cellH, cellW, cellH, atlas[gId], oR, oG, oB);

        // Soft 4-neighbor sparkle halo around leading comet head
        if (ti < 3) {
          const haloLum = 0.58 * bright;
          const hR = Math.round(255 * haloLum);
          const hG = Math.round(215 * haloLum);
          const hB = Math.round(95 * haloLum);
          blitGlyph(buf32, width, height, (gx + 1) * cellW, gy * cellH, cellW, cellH, atlas[2], hR, hG, hB);
          blitGlyph(buf32, width, height, (gx - 1) * cellW, gy * cellH, cellW, cellH, atlas[2], hR, hG, hB);
          blitGlyph(buf32, width, height, gx * cellW, (gy - 1) * cellH, cellW, cellH, atlas[2], hR, hG, hB);
          blitGlyph(buf32, width, height, gx * cellW, (gy + 1) * cellH, cellW, cellH, atlas[2], hR, hG, hB);
        }
      }
    }

    // Pass 3b: Warm Golden Expanding Aura Halo when Apex Star ignites (9.35s -> 11.20s)
    if (cycleT >= PULSE_END && cycleT < PULSE_END + 1.85) {
      const burstT = (cycleT - PULSE_END) / 1.85;
      const dyA = starYApex - CONFIG.Y_CENTER;
      const yCamA = dyA * COS_P;
      const zCamA = -dyA * SIN_P + CONFIG.CAM_DIST;
      if (zCamA > 0.35) {
        const invZA = focal / zCamA;
        const starGx = (cx * invCellW) | 0;
        const starGy = ((cy - yCamA * invZA) * invCellH) | 0;
        const aspectRatio = cellH / cellW;
        const expandR = 2.5 + 10.5 * Math.pow(burstT, 0.72);
        const auraFade = Math.sin(Math.min(1, burstT / 0.20) * (Math.PI * 0.5)) * Math.pow(1 - burstT, 1.35);

        if (auraFade > 0.04) {
          const rayCount = 28;
          for (let ri = 0; ri < rayCount; ri++) {
            const angR = (TAU * ri) / rayCount + burstT * 0.45;
            const rr = expandR * (0.82 + 0.18 * (ri % 2));
            const gx = Math.round(starGx + Math.cos(angR) * rr * aspectRatio);
            const gy = Math.round(starGy + Math.sin(angR) * rr);
            if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
            const gId = auraFade > 0.55 ? 6 : auraFade > 0.28 ? 2 : 1;
            const oR = Math.round(255 * auraFade * 0.85);
            const oG = Math.round(215 * auraFade * 0.85);
            const oB = Math.round(95 * auraFade * 0.85);
            renderedLetters++;
            blitGlyph(buf32, width, height, gx * cellW, gy * cellH, cellW, cellH, atlas[gId], oR, oG, oB);
          }
        }
      }
    }

    const isDone = cycleT >= 25.0;
    return { activeCount, renderedLetters, cycleT, isDone };
  }

  // =========================================================================
  // =========================================================================
  // SCENE 2: GARGANTUA BLACK HOLE (High-Density Lensed Accretion Field)
  // =========================================================================
  const R0 = 0.21;
  const R_IN = 1.0 * R0;
  const R_OUT = 4.8 * R0;
  const TILT = -0.23;
  const INC = 0.17;
  const GARG_DURATION = 20.0;
  const COS_TILT = Math.cos(TILT);
  const SIN_TILT = Math.sin(TILT);
  const INV_INC = 1 / INC;
  const INV_R_IN = 1 / R_IN;

  function smooth(x) {
    const c = clamp(x, 0, 1);
    return c * c * (3 - 2 * c);
  }

  function gas(phi, rho, t, w) {
    const lr = Math.log(Math.max(rho, 1e-4) * INV_R_IN);
    const phase = phi + 2.6 * lr - w * 1.8;
    const rings = 0.55 + 0.45 * Math.sin(lr * 14.0 - w * 0.8);
    const spiral = 0.6 + 0.4 * Math.sin(phase * 2.0 + Math.sin(lr * 8.0 + w));
    const fine = 0.7 + 0.3 * Math.cos(phi * 5.0 - lr * 18.0 + w * 2.2);
    const streak = Math.pow(rings * spiral * fine, 0.85);
    return { streak, phase, lr };
  }

  function accretion_disk(X, Y, t, w, inc, effR_OUT, diskFade) {
    const u = X * COS_TILT + Y * SIN_TILT;
    const v = -X * SIN_TILT + Y * COS_TILT;
    const v_inc = v * (inc === INC ? INV_INC : (1 / inc));
    const rho = Math.sqrt(u * u + v_inc * v_inc);
    const phi = Math.atan2(v_inc, u);
    const { streak, phase, lr } = gas(phi, rho, t, w);
    const curROut = effR_OUT || R_OUT;
    const edge = smooth((rho - R_IN) / (0.15 * R0)) * smooth((curROut * 1.28 - rho) / (0.38 * curROut));

    // Stronger outer wing filaments (R0 * 1.4 -> R_OUT) & reduced radial attenuation pow(..., 0.62)
    const wingMask = smooth((rho - 1.4 * R0) / (0.65 * R0));
    const streakAmp = (0.34 + 0.78 * streak) + wingMask * (0.24 + 0.42 * streak);
    const frontBoost = v > 0 ? 1.25 : 1.0;

    let heat = 1.92 * edge * streakAmp * Math.pow(R_IN / Math.max(rho, 1e-4), 0.62) * frontBoost * (diskFade !== undefined ? diskFade : 1);
    heat *= 1 - 0.20 * (u / Math.max(rho, 1e-6)); // Doppler beaming: bên tiến về phía quan sát sáng hơn

    // Thicker vertical belt especially on front crossing band (front_side = v > 0) for bold 3D depth
    const thickness = inc * (v > 0 ? 0.76 : 0.64) * R0 + 0.052 * Math.abs(u);
    const vert = Math.exp(-Math.pow(Math.abs(v) / thickness, 2));
    heat *= (0.48 + 0.52 * vert);
    return { heat, u, v, rho, phi, phase, lr };
  }

  function lensed_halo(r, ang, t, w, curR0, haloFade) {
    const baseR = curR0 || R0;
    const top = 0.5 - 0.5 * Math.sin(ang - TILT);
    const side = Math.pow(Math.abs(Math.cos(ang - TILT)), 6);
    const out = Math.max(r - 1.02 * baseR, 0);
    const bandW = 0.32 * baseR + 0.35 * baseR * top + 0.55 * baseR * side;
    const band = Math.exp(-Math.pow(out / bandW, 1.45));
    if (band < 0.02) return 0;
    const rhoHalo = (1 - side) * (R_IN + Math.max(r - 1.0 * baseR, 0) * 2.2) + side * r;
    const { streak: flow } = gas(ang - TILT, rhoHalo, t, w);
    const halo = 1.55 * band * (0.30 + 0.70 * flow) * (0.65 + 0.85 * top) * (1 - 0.20 * Math.cos(ang - TILT)) * (haloFade !== undefined ? haloFade : 1);
    return halo;
  }

  // Opening Phase (0s -> 3.8s): 54 deterministic outer star-matter packets stretched into curved spiral tidal streaks sucked into R0
  const GARG_TIDAL_STREAMS = (function () {
    const { rng, randUniform } = createRng(707);
    const count = 54;
    const data = new Float32Array(count * 5); // [ang0, rStart, delay, speed, bright]
    for (let i = 0; i < count; i++) {
      const idx = i * 5;
      data[idx] = (TAU * i) / count + randUniform(-0.18, 0.18);
      data[idx + 1] = randUniform(0.68, 1.18); // outer ring radius (3.2*R0 .. 5.6*R0)
      data[idx + 2] = randUniform(0.0, 1.15);  // staggered capture start delay
      data[idx + 3] = randUniform(1.55, 2.35); // infall duration
      data[idx + 4] = randUniform(0.62, 1.00); // brightness
    }
    return { count, data };
  })();

  // Helper: evaluate curved gravitational spiral position of an infalling tidal stream packet
  function tidal_capture(ang0, rStart, prog) {
    const pClamped = clamp(prog, 0, 1);
    // Accelerating gravitational infall toward R0 * 1.03
    const easeIn = Math.pow(pClamped, 1.75);
    const r = rStart + (R0 * 1.03 - rStart) * easeIn;
    // Angular velocity speeds up sharply as r decreases (conservation of angular momentum)
    const wind = 1.65 * Math.pow(pClamped, 1.45) + 0.95 * easeIn * (rStart / Math.max(r, R0));
    const ang = ang0 - wind;
    // Slightly flatten spiral toward disk tilt plane as matter nears R0
    const rawX = r * Math.cos(ang);
    const rawY = r * Math.sin(ang);
    const flatten = 1.0 - 0.38 * easeIn;
    const u = rawX;
    const v = rawY * flatten;
    // Rotate by TILT so streams feed naturally into the tilted accretion plane
    const X = u * COS_TILT - v * SIN_TILT;
    const Y = u * SIN_TILT + v * COS_TILT;
    return { X, Y, r };
  }

  // Deterministic scattered star ember trails for Quasar Impact finale (48 sparks)
  const GARG_EMBERS = (function () {
    const { rng, randUniform } = createRng(909);
    const count = 48;
    const data = new Float32Array(count * 4); // [ang, speed, curve, bright]
    for (let i = 0; i < count; i++) {
      const idx = i * 4;
      data[idx] = (TAU * i) / count + randUniform(-0.09, 0.09);
      data[idx + 1] = randUniform(0.82, 1.38);
      data[idx + 2] = randUniform(-0.22, 0.22);
      data[idx + 3] = randUniform(0.55, 1.00);
    }
    return { count, data };
  })();

  const GARG_LEVEL_STRS = [
    '..::--~~,,;;',
    '--==++//\\\\||',
    '++**##%%xxoo',
    '##%%@@$$&&88'
  ];

  const GARG_LEVEL_GLYPHS = GARG_LEVEL_STRS.map(str => {
    const ids = [];
    for (let i = 0; i < str.length; i++) {
      const idx = ALL_GLYPHS.indexOf(str[i]);
      ids.push(idx >= 0 ? idx : 1);
    }
    return ids;
  });

  const GLYPH_MINUS = ALL_GLYPHS.indexOf('-');
  const GLYPH_SLASH = ALL_GLYPHS.indexOf('/');
  const GLYPH_PIPE = ALL_GLYPHS.indexOf('|');
  const GLYPH_BACKSLASH = ALL_GLYPHS.indexOf('\\');

  function renderGargantuaToBuffer(params) {
    const {
      t,
      width,
      height,
      cellW,
      cellH,
      cols,
      rows,
      buf32,
      atlas,
      stars
    } = params;

    buf32.fill(BG_PACKED);
    if (params.zBuf) params.zBuf.fill(1e9);
    if (params.activeCells) params.activeCells.fill(0);
    if (params.winIdx) params.winIdx.fill(0);

    // 1. Cosmic background stars (< 0.35 Hz gentle twinkle) / ambient particles
    if (params && params.particles) {
      renderAmbientParticlesToBuffer({
        particles: params.particles,
        snowDistance: params.snowDistance !== undefined ? params.snowDistance : 0,
        globalTime: params.globalTime !== undefined ? params.globalTime : t,
        snowBlend: params.snowBlend !== undefined ? params.snowBlend : 0.0,
        width,
        height,
        cellW,
        cellH,
        cols,
        rows,
        buf32,
        atlas,
        prefersReduced: params.prefersReduced
      });
    } else {
      const starCount = stars ? (stars.length / 4) | 0 : 0;
      for (let s = 0; s < starCount; s++) {
        const sIdx = s * 4;
        const gx = (stars[sIdx] * cols) | 0;
        const gy = (stars[sIdx + 1] * rows) | 0;
        if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
        const tw = 0.65 + 0.35 * Math.sin(t * 1.8 + stars[sIdx + 3]);
        const br = stars[sIdx + 2] * tw;
        const gId = br > 0.88 ? 6 : br > 0.56 ? 2 : 1;
        const lum = Math.round(65 + 180 * br);
        blitGlyph(buf32, width, height, gx * cellW, gy * cellH, cellW, cellH, atlas[gId], lum, lum, Math.min(255, lum + 20));
      }
    }

    // 2. Black Hole Geometry & Normalized Coordinates
    const cycleT = ((t % GARG_DURATION) + GARG_DURATION) % GARG_DURATION;

    const isDesktop = width > 840;
    const cx = isDesktop ? cols * 0.70 : cols * 0.50;
    const cy = rows * 0.48;

    // Stage 1 (0s -> 3.5s): Tidal Disruption / Accretion Capture -> Photon Ring Ignition
    const isTidal = cycleT < 3.85;
    const ringIgnite = smooth((cycleT - 1.35) / 1.15);
    const ringFlare = 0.62 * Math.exp(-Math.pow((cycleT - 2.55) / 0.55, 2));

    // Stage 2 & 3 (2.3s -> 17.0s): Accretion Disk Wings & Lensed Halo unfurl to full glory
    const disk_on = smooth((cycleT - 2.3) / 2.2);
    const diskGrow = smooth((cycleT - 2.3) / 2.8);
    const haloScale = smooth((cycleT - 2.4) / 2.1);

    // Stage 5 (17.0s -> 20.0s): Eye-Comfort Galaxy Impact (Compression -> 0.5s Core Charge -> Quasar Relativistic Jets + Thin Hollow Shockwave)
    const isCollapse = cycleT >= 17.0;
    const p = isCollapse ? clamp((cycleT - 17.0) / 3.0, 0, 1) : 0;
    const compressP = isCollapse ? smooth(p / 0.36) : 0;

    // Effective outer radius: grows outward on emergence, compresses rapidly inward on collapse
    const baseOut = cycleT < 5.5 ? (R_IN + (R_OUT - R_IN) * diskGrow) : R_OUT;
    const effR_OUT = isCollapse ? R_OUT * (1 - 0.84 * compressP) : baseOut;
    const effW = cycleT * (1 + 2.8 * p);
    const haloFade = isCollapse ? Math.max(0, 1 - smooth(p / 0.36)) : 1.0;
    const diskFade = isCollapse ? Math.max(0, 1 - smooth((p - 0.04) / 0.34)) : 1.0;

    // 0.5s Core Energy Concentration (17.40s -> 17.90s) before jets fire
    const coreCharge = isCollapse ? Math.sin(clamp((cycleT - 17.40) / 0.50, 0, 1) * Math.PI) : 0;
    const ringCollapse = isCollapse ? smooth((p - 0.24) / 0.22) : 0;
    const curR0 = R0 * (1 - ringCollapse);
    const ringLum = isCollapse
      ? (1 - smooth((p - 0.28) / 0.16)) * (1 + 0.55 * coreCharge)
      : ringIgnite * (1.0 + ringFlare);

    // Quasar Relativistic Jets + Thin Hollow Shockwave (17.90s -> 19.80s)
    const isImpact = cycleT >= 17.90 && cycleT < 19.82;
    const q = isImpact ? clamp((cycleT - 17.90) / 1.90, 0, 1) : 0;
    const jetHead = isImpact ? 1.48 * Math.pow(smooth(q / 0.45), 0.72) : 0;
    const jetTail = isImpact ? 1.48 * Math.pow(smooth((q - 0.32) / 0.56), 1.25) : 0;
    const jetFade = isImpact ? (1 - smooth((q - 0.52) / 0.44)) : 0;

    // Strictly thin hollow shockwave ring (thickness 0.025 .. 0.033, within 0.025-0.04 anti-glare limit)
    const shockR = isImpact ? (0.14 + 1.24 * Math.pow(q, 0.78)) : 0;
    const shockW = 0.025 + 0.008 * (1 - q);
    const shockFade = isImpact ? (smooth(q / 0.06) * (1 - smooth((q - 0.40) / 0.55))) : 0;

    const aspect = cellW / cellH;
    const invHalfRows = 1 / (rows * 0.5);

    let renderedLetters = 0;

    // 2a. Opening Tidal Disruption / Accretion Capture streams (0s -> 3.85s, O(72 * 16) ultra-fast curved trails)
    if (isTidal) {
      const halfRows = rows * 0.5;
      const invAspect = 1 / aspect;
      const tData = GARG_TIDAL_STREAMS.data;
      const tCount = GARG_TIDAL_STREAMS.count;
      const globalFade = 1 - smooth((cycleT - 2.65) / 1.15);

      if (globalFade > 0.02) {
        for (let si = 0; si < tCount; si++) {
          const sIdx = si * 5;
          const ang0 = tData[sIdx];
          const rStart = tData[sIdx + 1];
          const delay = tData[sIdx + 2];
          const dur = tData[sIdx + 3];
          const br = tData[sIdx + 4];

          const localT = cycleT - delay;
          if (localT <= 0) continue;

          // Stretch each stellar packet into a 12-segment curved spiraling tidal streak (deduplicating repeated cells)
          let prevGx = -1;
          let prevGy = -1;
          for (let ti = 0; ti < 12; ti++) {
            const prog = (localT - ti * 0.040) / dur;
            if (prog <= 0 || prog > 1.05) continue;

            const pt = tidal_capture(ang0, rStart, Math.min(1.0, prog));
            const gx = Math.round(cx + pt.X * halfRows * invAspect);
            const gy = Math.round(cy + pt.Y * halfRows);
            if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
            if (gx === prevGx && gy === prevGy) continue;
            prevGx = gx;
            prevGy = gy;

            const tailDecay = Math.pow(1 - ti / 12, 1.30);
            const entryFade = smooth(prog / 0.12);
            const captureFade = prog > 0.92 ? clamp(1 - (prog - 0.92) / 0.13, 0, 1) : 1.0;
            // Brighten as matter compresses near R0
            const compressBoost = 0.72 + 0.55 * Math.pow(prog, 1.5);
            let sLum = br * tailDecay * entryFade * captureFade * globalFade * compressBoost;

            const px = (gx + 0.5) * cellW;
            if (isDesktop && px < width * 0.52) {
              const fadeEdge = smooth((px - width * 0.18) / (width * 0.34));
              sLum *= (0.55 + 0.45 * fadeEdge);
            }
            if (sLum <= 0.05) continue;

            // Warm golden-amber -> white-hot cream near R0
            const hot = clamp(prog * prog * tailDecay, 0, 1);
            const oR = clamp(Math.round((215 + 40 * hot) * sLum), 0, 255);
            const oG = clamp(Math.round((118 + 118 * hot) * sLum), 0, 255);
            const oB = clamp(Math.round((48 + 150 * hot) * sLum), 0, 255);
            const gId = ti === 0 ? 7 : ti < 3 ? 6 : ti < 7 ? 3 : ti < 12 ? 2 : 1;

            renderedLetters++;
            blitGlyph(buf32, width, height, gx * cellW, gy * cellH, cellW, cellH, atlas[gId], oR, oG, oB);
          }
        }
      }
    }

    // Bounding box for main Black Hole / Disk / Halo / Quasar Impact evaluation
    const runMainShader = ringLum > 0.01 || disk_on > 0.01 || haloScale > 0.01 || isImpact || coreCharge > 0.01;
    const maxR = Math.max(
      effR_OUT * 1.32,
      curR0 * 3.55,
      isImpact ? Math.max(jetHead + 0.08, shockR + shockW * 3.5) : 0
    );
    const minGy = runMainShader ? Math.max(0, Math.floor(cy - maxR * rows * 0.5)) : 1;
    const maxGy = runMainShader ? Math.min(rows - 1, Math.ceil(cy + maxR * rows * 0.5)) : 0;
    const minGx = runMainShader ? Math.max(0, Math.floor(cx - maxR * (rows * 0.5) / aspect)) : 1;
    const maxGx = runMainShader ? Math.min(cols - 1, Math.ceil(cx + maxR * (rows * 0.5) / aspect)) : 0;

    for (let gy = minGy; gy <= maxGy; gy++) {
      const Y = (gy - cy) * invHalfRows;

      for (let gx = minGx; gx <= maxGx; gx++) {
        const X = (gx - cx) * aspect * invHalfRows;
        const px = (gx + 0.5) * cellW;

        const r2 = X * X + Y * Y;
        if (r2 > maxR * maxR) continue;
        const r = Math.sqrt(r2);

        const u = X * COS_TILT + Y * SIN_TILT;
        const v = -X * SIN_TILT + Y * COS_TILT;
        const absU = Math.abs(u);
        const absV = Math.abs(v);

        // Fast early skip during Quasar Impact when disk & halo have already collapsed
        const nearJet = isImpact && jetFade > 0.01 && absU < 0.12 && absV >= jetTail * 0.85 && absV <= jetHead * 1.05;
        const nearShock = isImpact && shockFade > 0.01 && Math.abs(r - shockR) < shockW * 3.0;
        if (isImpact && diskFade <= 0.01 && haloFade <= 0.01 && ringLum <= 0.01 && !nearJet && !nearShock) {
          continue;
        }

        const ang = Math.atan2(Y, X);
        const inside = curR0 > 0.005 && r < curR0 * 0.97;
        const front_side = v > 0;

        if (inside && !front_side && !nearJet && !nearShock) {
          const startX = Math.round(gx * cellW);
          const startY = Math.round(gy * cellH);
          const cW = Math.round(cellW);
          const cH = Math.round(cellH);
          for (let dy = 0; dy < cH; dy++) {
            const rowOffset = (startY + dy) * width + startX;
            buf32.fill(BG_PACKED, rowOffset, rowOffset + cW);
          }
          continue;
        }

        const v_inc = v * INV_INC;
        const rho2 = u * u + v_inc * v_inc;

        const inDiskRange = (disk_on > 0 || isCollapse) && diskFade > 0.01 &&
          rho2 >= (R_IN * 0.85) * (R_IN * 0.85) && rho2 <= (effR_OUT * 1.35) * (effR_OUT * 1.35);
        const inHaloRange = haloScale > 0 && haloFade > 0.01 && curR0 > 0.005 &&
          r >= curR0 * 0.95 && r <= curR0 * 3.5;

        // 1. Thin luminous photon ring hugging shadow rim r = 1.03 * curR0
        let photon_ring = 0;
        if (curR0 > 0.005 && ringLum > 0.01 && Math.abs(r - 1.03 * curR0) < 0.08 * curR0 + 0.01) {
          photon_ring = Math.exp(-Math.pow((r - 1.03 * curR0) / (0.028 * curR0), 2)) * 1.65 * ringLum;
        }

        // Compact core charge right before relativistic jets ignite (17.4s -> 17.9s, strictly small & anti-glare)
        let coreGlow = 0;
        if (coreCharge > 0.02 && r < 0.085) {
          coreGlow = 1.25 * coreCharge * Math.exp(-Math.pow(r / 0.036, 2));
        }

        // 2. Halo arching above and below
        let halo = 0;
        if (inHaloRange) {
          halo = lensed_halo(r, ang, cycleT, effW, curR0, haloFade) * haloScale;
        }

        // 3. Accretion disk (thicker wings, reduced attenuation pow(..., 0.62), bold front crossing)
        let disk_heat = 0;
        let phase = 0;
        if (inDiskRange) {
          const dRes = accretion_disk(X, Y, cycleT, effW, INC, effR_OUT, diskFade);
          phase = dRes.phase;
          disk_heat = dRes.heat * disk_on;
        }

        // 4. Quasar Relativistic Jets shooting along tilted polar axis (+v and -v)
        let jetHeat = 0;
        if (nearJet) {
          const jetW = 0.017 + 0.022 * absV * (0.55 + 0.45 * q);
          const jetCore = Math.exp(-Math.pow(u / jetW, 2));
          const jetAxial = smooth((absV - jetTail) / 0.14) * smooth((jetHead - absV) / 0.18);
          const jetKnots = 0.72 + 0.28 * Math.sin(absV * 28.0 - q * 24.0);
          jetHeat = 1.32 * jetCore * jetAxial * jetKnots * jetFade;
          if (jetHeat > 0.04) phase = absV * 12.0 - q * 16.0;
        }

        // 5. Thin Hollow Shockwave Ring (0.025..0.033 width, strictly hollow inside)
        let shockHeat = 0;
        if (nearShock) {
          const ringDist = Math.abs(r - shockR);
          const rippleMod = 0.68 + 0.32 * Math.sin(ang * 9.0 + q * 5.0) * Math.cos(ang * 4.0 - q * 3.5);
          shockHeat = 0.98 * Math.exp(-Math.pow(ringDist / shockW, 2)) * rippleMod * shockFade;
          if (shockHeat > 0.04) phase = ang * 6.0 + q * 8.0;
        }

        // Combined heat
        let heat = Math.max(photon_ring, coreGlow, halo, disk_heat, jetHeat, shockHeat);

        // 3D Shadow Occlusion: front_side = v > 0 cuts boldly across the black event horizon shadow
        if (inside && front_side && !nearJet && !nearShock && coreGlow <= 0.05) {
          heat = disk_heat > 0.09 ? disk_heat * 1.12 : 0.0;
          if (heat <= 0.0) {
            const startX = Math.round(gx * cellW);
            const startY = Math.round(gy * cellH);
            const cW = Math.round(cellW);
            const cH = Math.round(cellH);
            for (let dy = 0; dy < cH; dy++) {
              const rowOffset = (startY + dy) * width + startX;
              buf32.fill(BG_PACKED, rowOffset, rowOffset + cW);
            }
          }
        }

        if (heat <= 0.048) continue;

        // Ký tự xoáy theo 4 level (và tia dọc mảnh cho Relativistic Jets)
        let gId;
        const isJetDominant = jetHeat >= heat * 0.85 && jetHeat > 0.15;
        if (isJetDominant) {
          gId = jetHeat > 0.85 ? 10 : jetHeat > 0.55 ? GLYPH_PIPE : jetHeat > 0.28 ? 6 : 2;
        } else {
          const level = clamp(Math.floor(heat * 3.6), 0, 3);
          const chars = GARG_LEVEL_GLYPHS[level];
          const charIdx = Math.abs((gx * 3 + gy * 5 + Math.floor(phase * 4.0)) | 0) % chars.length;
          gId = chars[charIdx];
        }

        // Bảng màu theo heat & Doppler shift (hổ phách / vàng kem dịu mắt)
        let baseR, baseG, baseB;
        if (heat < 0.20) {
          const f = Math.max(0, (heat - 0.05) / 0.15);
          baseR = 120 * f;
          baseG = 45 * f;
          baseB = 16 * f;
        } else if (heat < 0.50) {
          const f = (heat - 0.20) / 0.30;
          baseR = 120 + 95 * f;
          baseG = 45 + 55 * f;
          baseB = 16 + 18 * f;
        } else if (heat < 0.82) {
          const f = (heat - 0.50) / 0.32;
          baseR = 215 + 38 * f;
          baseG = 100 + 85 * f;
          baseB = 34 + 50 * f;
        } else {
          // Hot inner rim / photon ring / front crossing / jet core: warm incandescent cream-gold
          const f = Math.min(1.0, (heat - 0.82) / 0.38);
          baseR = 253 + 2 * f;
          baseG = 185 + 62 * f;
          baseB = 84 + 138 * f;
        }

        // Relativistic Doppler tint:
        // approaching side (u < 0) has cooler white-cyan shift,
        // receding side (u > 0) has warm amber-red tint
        if (!isImpact) {
          if (u < 0) {
            const dop = Math.min(0.25, -u / (effR_OUT || R_OUT));
            baseR = Math.max(0, baseR - 8 * dop);
            baseG = Math.min(255, baseG + 12 * dop);
            baseB = Math.min(255, baseB + 28 * dop);
          } else {
            const dop = Math.min(0.25, u / (effR_OUT || R_OUT));
            baseR = Math.min(255, baseR + 10 * dop);
            baseG = Math.max(0, baseG - 5 * dop);
            baseB = Math.max(0, baseB - 14 * dop);
          }
        }

        let lum = clamp(0.42 + 0.85 * heat, 0, 1.15);
        // Eye-comfort left-half UI damping (stronger gentleness for expanding shockwave on text area)
        if (isDesktop && px < width * 0.52) {
          const fadeEdge = smooth((px - width * 0.18) / (width * 0.34));
          const leftFloor = (shockHeat > 0.05 && shockHeat >= disk_heat) ? 0.34 : 0.76;
          lum *= (leftFloor + (1 - leftFloor) * fadeEdge);
        }

        const outR = clamp(Math.round(baseR * lum), 0, 255);
        const outG = clamp(Math.round(baseG * lum), 0, 255);
        const outB = clamp(Math.round(baseB * lum), 0, 255);

        renderedLetters++;
        blitGlyph(buf32, width, height, gx * cellW, gy * cellH, cellW, cellH, atlas[gId], outR, outG, outB);
      }
    }

    // 6. Scattered Star Ember Trails during Quasar Impact (17.90s -> 19.75s, zero allocation)
    if (isImpact && q > 0.02 && q < 0.96) {
      const emberFade = smooth(q / 0.08) * (1 - smooth((q - 0.45) / 0.50));
      if (emberFade > 0.04) {
        const halfRows = rows * 0.5;
        const invAspect = 1 / aspect;
        const eData = GARG_EMBERS.data;
        const eCount = GARG_EMBERS.count;

        for (let ei = 0; ei < eCount; ei++) {
          const eIdx = ei * 4;
          const baseAng = eData[eIdx];
          const spd = eData[eIdx + 1];
          const curve = eData[eIdx + 2];
          const br = eData[eIdx + 3];

          for (let ti = 0; ti < 4; ti++) {
            const qLag = q - ti * 0.028;
            if (qLag <= 0) continue;
            const eR = 0.10 + spd * Math.pow(qLag, 0.74);
            const eAng = baseAng + curve * qLag;
            const eX = eR * Math.cos(eAng);
            const eY = eR * Math.sin(eAng);

            const gx = Math.round(cx + eX * halfRows * invAspect);
            const gy = Math.round(cy + eY * halfRows);
            if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;

            const px = (gx + 0.5) * cellW;
            let eLum = emberFade * br * (1 - ti * 0.22);
            if (isDesktop && px < width * 0.52) {
              const fadeEdge = smooth((px - width * 0.18) / (width * 0.34));
              eLum *= (0.34 + 0.66 * fadeEdge);
            }
            if (eLum <= 0.05) continue;

            const gId = ti === 0 ? 7 : ti === 1 ? 6 : ti === 2 ? 2 : 1;
            const oR = clamp(Math.round(252 * eLum), 0, 255);
            const oG = clamp(Math.round((196 - ti * 22) * eLum), 0, 255);
            const oB = clamp(Math.round((112 - ti * 20) * eLum), 0, 255);
            renderedLetters++;
            blitGlyph(buf32, width, height, gx * cellW, gy * cellH, cellW, cellH, atlas[gId], oR, oG, oB);
          }
        }
      }
    }

    const isDone = cycleT >= 19.85;
    return { activeCount: renderedLetters, renderedLetters, cycleT, isDone };
  }

  // =========================================================================
  // SCENE 3: CAT KNIGHT WITH BILLOWING CAPE (High-Res Image-Sampled ASCII)
  // =========================================================================
  const CAT_W = 140;
  const CAT_H = 182;
  const CAT_DURATION = 20.0;
  const CAT_IMAGE_URL = 'assets/cat-knight.jpg';
  const CAT_MASK = Object.freeze({
    NONE: 0,
    BODY: 1,
    SWORD: 2,
    CAPE: 3,
    GRASS: 4,
    EYE: 5
  });

  // Extract foreground knight, upright sword, billowing cape, eyes, and grass tuft from RGBA pixels (1-time init)
  function buildCatKnightFromRGBA(rgba, w, h) {
    const total = w * h;
    const rArr = new Uint8Array(total);
    const gArr = new Uint8Array(total);
    const bArr = new Uint8Array(total);
    const lumArr = new Float32Array(total);
    const maskArr = new Uint8Array(total);
    const reachArr = new Float32Array(total);

    for (let y = 0; y < h; y++) {
      const v = (y + 0.5) / h;
      const xBlade = 0.394 + 0.024 * (v / 0.52);
      const wBlade = 0.016 + 0.015 * (v / 0.52);

      for (let x = 0; x < w; x++) {
        const u = (x + 0.5) / w;
        const idx = y * w + x;
        const pIdx = idx * 4;
        const r = rgba[pIdx];
        const g = rgba[pIdx + 1];
        const b = rgba[pIdx + 2];
        const lum255 = 0.299 * r + 0.587 * g + 0.114 * b;

        const isCoolMist = (b - r > 7 && lum255 > 145);
        const isGreenGrass = (g - b > 14 && g >= r + 2);

        // 1. Upright greatsword blade & crossguard
        const isSwordBlade = (v >= 0.012 && v <= 0.53 && Math.abs(u - xBlade) <= wBlade);
        const isCrossguard = (v >= 0.495 && v <= 0.535 && u >= 0.335 && u <= 0.495);

        // 2. Kitten head & armored body envelope
        const dxHead = (u - 0.525) / 0.165;
        const dyHead = (v - 0.415) / 0.125;
        const inHead = (dxHead * dxHead + dyHead * dyHead <= 1.0);
        const inTorso = (
          v >= 0.48 && v <= 0.925 &&
          u >= (0.31 + 0.06 * Math.max(0, (v - 0.65) / 0.27)) &&
          u <= (0.69 + 0.06 * Math.max(0, (v - 0.75) / 0.17))
        );

        // 3. Left & Right dark eyes for periodic blinking
        const dLE = ((u - 0.440) / 0.028) * ((u - 0.440) / 0.028) + ((v - 0.432) / 0.020) * ((v - 0.432) / 0.020);
        const dRE = ((u - 0.528) / 0.030) * ((u - 0.528) / 0.030) + ((v - 0.432) / 0.021) * ((v - 0.432) / 0.021);
        const isEye = (dLE <= 1.0 || dRE <= 1.0) && lum255 < 88;

        // 4. Billowing cream-white cape flying left behind knight
        const capeTop = 0.442 + 0.035 * ((u - 0.06) / 0.34);
        const capeBot = u < 0.19
          ? 0.52 + 0.12 * ((u - 0.05) / 0.14)
          : 0.64 + 0.11 * ((u - 0.19) / 0.21);
        const inCapeZone = (u >= 0.055 && u <= 0.415 && v >= capeTop && v <= capeBot);
        const inCollarBridge = (u >= 0.29 && u <= 0.415 && v >= 0.455 && v <= 0.515);

        // 5. Delicate grass tuft pedestal beneath paws
        const dxGrass = (u - 0.50) / 0.33;
        const dyGrass = (v - 0.905) / 0.075;
        const tuftWave = 0.018 * Math.sin(u * 42.0) + 0.012 * Math.cos(u * 71.0);
        const inGrassTuft = (v >= (0.835 + tuftWave) && v <= 0.975 && (dxGrass * dxGrass + dyGrass * dyGrass) <= 1.25);

        let mask = CAT_MASK.NONE;
        let reach = 0;

        if (isSwordBlade || isCrossguard) {
          if (!isCoolMist || lum255 < 174) {
            mask = CAT_MASK.SWORD;
          }
        } else if (isEye) {
          mask = CAT_MASK.EYE;
        } else if (inHead || inTorso) {
          if (v < 0.45 && isCoolMist && lum255 > 155) {
            mask = CAT_MASK.NONE;
          } else if (v > 0.77 && isGreenGrass && u < 0.38) {
            mask = CAT_MASK.NONE;
          } else if (v > 0.77 && isGreenGrass && u > 0.66 && v < 0.85) {
            mask = CAT_MASK.NONE;
          } else if (v > 0.55 && v < 0.77 && u > 0.66 && isGreenGrass) {
            mask = CAT_MASK.NONE;
          } else {
            mask = CAT_MASK.BODY;
          }
        } else if (inCapeZone && !isGreenGrass && !(v < 0.458 && isCoolMist)) {
          if (lum255 > 74 || inCollarBridge) {
            mask = CAT_MASK.CAPE;
            reach = clamp((0.395 - u) / 0.34, 0, 1);
          }
        } else if (inGrassTuft && v >= 0.84) {
          mask = CAT_MASK.GRASS;
          reach = clamp((0.975 - v) / 0.14, 0, 1);
        }

        maskArr[idx] = mask;
        reachArr[idx] = reach;
        if (mask !== CAT_MASK.NONE) {
          // Harmonize colors gently for crisp warm-silver ASCII readability on #000000
          let oR = r, oG = g, oB = b;
          if (mask === CAT_MASK.SWORD) {
            oR = clamp(Math.round(r * 1.05 + 22), 0, 255);
            oG = clamp(Math.round(g * 1.08 + 26), 0, 255);
            oB = clamp(Math.round(b * 1.14 + 34), 0, 255);
          } else if (mask === CAT_MASK.CAPE) {
            oR = clamp(Math.round(r * 1.04 + 14), 0, 255);
            oG = clamp(Math.round(g * 1.02 + 12), 0, 255);
            oB = clamp(Math.round(b * 0.98 + 8), 0, 255);
          } else if (mask === CAT_MASK.GRASS) {
            oR = clamp(Math.round(r * 0.92), 0, 255);
            oG = clamp(Math.round(g * 1.12 + 14), 0, 255);
            oB = clamp(Math.round(b * 0.88), 0, 255);
          } else if (mask === CAT_MASK.EYE) {
            oR = Math.min(62, r);
            oG = Math.min(58, g);
            oB = Math.min(68, b);
          }
          rArr[idx] = oR;
          gArr[idx] = oG;
          bArr[idx] = oB;
          const normLum = clamp((0.299 * oR + 0.587 * oG + 0.114 * oB) / 255, 0, 1);
          // Enhance mid-tone contrast so fur & armor plates read crisply
          lumArr[idx] = mask === CAT_MASK.EYE
            ? 0.14
            : clamp(0.18 + 0.82 * Math.pow(normLum, 0.85), 0.12, 1.0);
        }
      }
    }

    return { width: w, height: h, r: rArr, g: gArr, b: bArr, lum: lumArr, mask: maskArr, reach: reachArr, isPhoto: true };
  }

  // Deterministic procedural fallback sprite (instant zero-latency before photo decode & headless Node tests)
  function buildProceduralCatKnight(w, h) {
    const ww = w || CAT_W;
    const hh = h || CAT_H;
    const rgba = new Uint8ClampedArray(ww * hh * 4);
    for (let y = 0; y < hh; y++) {
      const v = (y + 0.5) / hh;
      const xBlade = 0.394 + 0.024 * (v / 0.52);
      const wBlade = 0.015 + 0.013 * (v / 0.52);
      for (let x = 0; x < ww; x++) {
        const u = (x + 0.5) / ww;
        const pIdx = (y * ww + x) * 4;
        // Default cool misty sky background (will be segmented out cleanly)
        let r = 188, g = 192, b = 205;

        const isSwordBlade = (v >= 0.015 && v <= 0.53 && Math.abs(u - xBlade) <= wBlade);
        const isCrossguard = (v >= 0.50 && v <= 0.53 && u >= 0.34 && u <= 0.49);
        const dxH = (u - 0.525) / 0.145;
        const dyH = (v - 0.415) / 0.105;
        const inHead = (dxH * dxH + dyH * dyH <= 1.0);
        const dLE = ((u - 0.440) / 0.026) * ((u - 0.440) / 0.026) + ((v - 0.432) / 0.018) * ((v - 0.432) / 0.018);
        const dRE = ((u - 0.528) / 0.028) * ((u - 0.528) / 0.028) + ((v - 0.432) / 0.019) * ((v - 0.432) / 0.019);
        const inTorso = (v >= 0.50 && v <= 0.90 && u >= 0.36 && u <= 0.65);
        const capeTop = 0.448 + 0.03 * ((u - 0.06) / 0.34);
        const capeBot = u < 0.19 ? 0.52 + 0.11 * ((u - 0.05) / 0.14) : 0.63 + 0.09 * ((u - 0.19) / 0.21);
        const inCape = (u >= 0.065 && u <= 0.40 && v >= capeTop && v <= capeBot);
        const dxG = (u - 0.50) / 0.32;
        const dyG = (v - 0.905) / 0.068;
        const inGrass = (v >= 0.85 && v <= 0.965 && (dxG * dxG + dyG * dyG) <= 1.15);

        if (isSwordBlade || isCrossguard) {
          const edgeShade = 1.0 - Math.abs(u - xBlade) / Math.max(wBlade, 0.01) * 0.4;
          r = Math.round(165 * edgeShade); g = Math.round(175 * edgeShade); b = Math.round(188 * edgeShade);
        } else if (dLE <= 1.0 || dRE <= 1.0) {
          r = 24; g = 22; b = 28;
        } else if (inHead) {
          const rad = Math.sqrt(dxH * dxH + dyH * dyH);
          const fur = 0.72 + 0.28 * (1 - rad) + 0.08 * Math.sin(u * 80 + v * 50);
          r = Math.round(188 * fur); g = Math.round(166 * fur); b = Math.round(145 * fur);
        } else if (inTorso) {
          const plate = 0.62 + 0.35 * Math.cos((u - 0.50) * 14.0) + 0.12 * Math.sin(v * 48.0);
          r = Math.round(155 * plate); g = Math.round(158 * plate); b = Math.round(166 * plate);
        } else if (inCape) {
          const fold = 0.75 + 0.22 * Math.sin(u * 26.0 + v * 12.0);
          r = Math.round(212 * fold); g = Math.round(204 * fold); b = Math.round(188 * fold);
        } else if (inGrass) {
          const blade = 0.72 + 0.28 * Math.sin(u * 95.0 + v * 20.0);
          r = Math.round(86 * blade); g = Math.round(118 * blade); b = Math.round(62 * blade);
        }
        rgba[pIdx] = clamp(r, 0, 255);
        rgba[pIdx + 1] = clamp(g, 0, 255);
        rgba[pIdx + 2] = clamp(b, 0, 255);
        rgba[pIdx + 3] = 255;
      }
    }
    const spr = buildCatKnightFromRGBA(rgba, ww, hh);
    spr.isPhoto = false;
    return spr;
  }

  function renderCatKnightToBuffer(params) {
    const {
      t,
      width,
      height,
      cellW,
      cellH,
      cols,
      rows,
      buf32,
      atlas,
      stars,
      catSprite,
      prefersReduced
    } = params;

    buf32.fill(BG_PACKED);
    if (params.zBuf) params.zBuf.fill(1e9);
    if (params.activeCells) params.activeCells.fill(0);
    if (params.winIdx) params.winIdx.fill(0);

    // 1. Background Ambient Particles (gentle wind-swept dust / stars)
    if (params && params.particles) {
      renderAmbientParticlesToBuffer({
        particles: params.particles,
        snowDistance: params.snowDistance !== undefined ? params.snowDistance : 0,
        globalTime: params.globalTime !== undefined ? params.globalTime : t,
        snowBlend: params.snowBlend !== undefined ? params.snowBlend : 0.25,
        width,
        height,
        cellW,
        cellH,
        cols,
        rows,
        buf32,
        atlas,
        prefersReduced
      });
    } else if (stars) {
      const starCount = (stars.length / 4) | 0;
      for (let s = 0; s < starCount; s++) {
        const sIdx = s * 4;
        const gx = (stars[sIdx] * cols) | 0;
        const gy = (stars[sIdx + 1] * rows) | 0;
        if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
        const tw = 0.65 + 0.35 * Math.sin(t * 1.6 + stars[sIdx + 3]);
        const br = stars[sIdx + 2] * tw;
        const gId = br > 0.88 ? 6 : br > 0.56 ? 2 : 1;
        const lum = Math.round(55 + 150 * br);
        blitGlyph(buf32, width, height, gx * cellW, gy * cellH, cellW, cellH, atlas[gId], lum, lum, Math.min(255, lum + 15));
      }
    }

    const sprite = catSprite || buildProceduralCatKnight(CAT_W, CAT_H);
    const sw = sprite.width;
    const sh = sprite.height;
    const sR = sprite.r;
    const sG = sprite.g;
    const sB = sprite.b;
    const sLum = sprite.lum;
    const sMask = sprite.mask;

    const cycleT = ((t % CAT_DURATION) + CAT_DURATION) % CAT_DURATION;
    const isDone = cycleT >= 19.85;
    if (isDone) {
      return { activeCount: 0, renderedLetters: 0, cycleT, isDone: true };
    }

    // 2. Cinematic Camera Zoom-Out (0.0s -> 6.5s: close-up on kitten face -> heroic full-body knight)
    const kRaw = prefersReduced ? 1.0 : smooth((cycleT - 1.0) / 5.5);
    const kEase = kRaw * kRaw * (3 - 2 * kRaw);
    const focusU = 0.50 + (0.46 - 0.50) * kEase;
    const focusV = 0.42 + (0.50 - 0.42) * kEase;
    const zoom = 2.55 + (1.00 - 2.55) * kEase;
    const revealFade = smooth(cycleT / 0.85);
    const revealRadius = 0.18 + 0.95 * smooth(cycleT / 1.15);

    // 3. Wind, Blink, Sword Glint & Dissolve State
    const animT = prefersReduced ? 8.0 : cycleT;
    const gust = 0.72 + 0.36 * Math.sin(animT * 1.45) + 0.20 * Math.sin(animT * 3.1 + 0.8);
    const breathDy = 0.0022 * Math.sin(animT * 2.1);

    // Periodic cute eye blinks every ~4.0s (duration 0.16s)
    let blink = 0;
    const blinkTimes = [2.6, 6.6, 10.6, 14.6];
    for (let bi = 0; bi < blinkTimes.length; bi++) {
      const dtB = animT - blinkTimes[bi];
      if (dtB >= 0 && dtB <= 0.16) {
        blink = Math.sin((dtB / 0.16) * Math.PI);
        break;
      }
    }

    // Periodic silver sword blade glint sweeping upward along the blade
    let glintV = -1;
    let glintStrength = 0;
    const glintTimes = [4.5, 8.7, 12.9, 16.4];
    for (let gi = 0; gi < glintTimes.length; gi++) {
      const dtG = animT - glintTimes[gi];
      if (dtG >= 0 && dtG <= 0.85) {
        const qG = dtG / 0.85;
        glintV = 0.51 - 0.49 * qG;
        glintStrength = Math.sin(qG * Math.PI);
        break;
      }
    }

    // Wind-swept dissolve finale (17.20s -> 19.85s)
    const inDissolve = cycleT >= 17.20;

    // 4. Layout & Aspect-Correct Projection (right-side open canvas on desktop ~0.72)
    const isDesktop = width > 840;
    const cx = isDesktop ? cols * 0.72 : cols * 0.50;
    const cy = isDesktop ? rows * 0.52 : rows * 0.53;
    const figRows = rows * (isDesktop ? 0.84 : 0.78);
    const spriteAspect = sw / sh; // ~0.77
    const figCols = figRows * spriteAspect * (cellH / cellW);

    const invFigCols = 1 / (figCols * zoom);
    const invFigRows = 1 / (figRows * zoom);

    // Tight bounding box in grid coordinates (avoids evaluating empty black space)
    const padCols = inDissolve ? 42 : 12;
    const minGx = Math.max(0, Math.floor(cx - (focusU + 0.08) * figCols * zoom) - padCols);
    const maxGx = Math.min(cols - 1, Math.ceil(cx + (1.08 - focusU) * figCols * zoom) + 8);
    const minGy = Math.max(0, Math.floor(cy - (focusV + 0.08) * figRows * zoom) - 8);
    const maxGy = Math.min(rows - 1, Math.ceil(cy + (1.08 - focusV) * figRows * zoom) + 8);

    const maxGlyphIdx = RAMP_MAIN.length - 1;
    let renderedLetters = 0;

    for (let gy = minGy; gy <= maxGy; gy++) {
      const vBase = focusV + (gy - cy) * invFigRows;
      if (vBase < -0.04 || vBase > 1.04) continue;

      for (let gx = minGx; gx <= maxGx; gx++) {
        const uBase = focusU + (gx - cx) * invFigCols;
        if (uBase < -0.06 || uBase > 1.06) continue;

        // Soft circular vignette reveal during first 1.15s around face
        if (cycleT < 1.15) {
          const rv = Math.hypot((uBase - 0.50) * 1.15, (vBase - 0.42) * 1.35);
          if (rv > revealRadius) continue;
        }

        // Sample sprite with layered animation displacement:
        // Priority 1: Upright Sword / Body / Eyes (foreground over cape)
        let su = uBase;
        let sv = vBase - breathDy;
        let mask = CAT_MASK.NONE;
        let sIdx = -1;
        let capeFoldShade = 1.0;

        if (su >= 0 && su < 1 && sv >= 0 && sv < 1) {
          const ix = (su * sw) | 0;
          const iy = (sv * sh) | 0;
          const idx0 = iy * sw + ix;
          const m0 = sMask[idx0];
          if (m0 === CAT_MASK.BODY || m0 === CAT_MASK.SWORD || m0 === CAT_MASK.EYE) {
            mask = m0;
            sIdx = idx0;
          }
        }

        // Priority 2: Billowing Cape behind knight (multi-frequency traveling cloth wave from collar to left tip)
        if (mask === CAT_MASK.NONE && uBase >= 0.005 && uBase <= 0.43 && vBase >= 0.38 && vBase <= 0.79) {
          const reach = clamp((0.395 - uBase) / 0.34, 0, 1);
          const amp = Math.pow(reach, 1.35) * gust;
          const wavePhase1 = animT * 6.4 - reach * 5.6 + vBase * 3.0;
          const wavePhase2 = animT * 10.6 - reach * 8.8;
          const capeDx = (-0.014 * gust - 0.012 * Math.sin(wavePhase1) - 0.006 * Math.cos(wavePhase2)) * amp;
          const capeDy = (0.022 * Math.sin(wavePhase1) + 0.010 * Math.sin(wavePhase2)) * amp;
          const cu = uBase - capeDx;
          const cv = vBase - capeDy;
          if (cu >= 0 && cu < 1 && cv >= 0 && cv < 1) {
            const cIdx = ((cv * sh) | 0) * sw + ((cu * sw) | 0);
            if (sMask[cIdx] === CAT_MASK.CAPE) {
              mask = CAT_MASK.CAPE;
              sIdx = cIdx;
              capeFoldShade = 0.88 + 0.26 * Math.cos(wavePhase1) * reach;
            }
          }
        }

        // Priority 3: Swaying grass tuft beneath paws (syncs with wind blowing right -> left)
        if (mask === CAT_MASK.NONE && vBase >= 0.82 && vBase <= 0.99 && uBase >= 0.12 && uBase <= 0.88) {
          const bladeH = clamp((0.975 - vBase) / 0.14, 0, 1);
          const grassDx = -0.015 * gust * (0.45 + 0.55 * Math.sin(animT * 3.4 + uBase * 18.0)) * bladeH;
          const gu = uBase - grassDx;
          if (gu >= 0 && gu < 1 && vBase >= 0 && vBase < 1) {
            const gIdx = ((vBase * sh) | 0) * sw + ((gu * sw) | 0);
            if (sMask[gIdx] === CAT_MASK.GRASS) {
              mask = CAT_MASK.GRASS;
              sIdx = gIdx;
            }
          }
        }

        if (mask === CAT_MASK.NONE || sIdx < 0) continue;

        let rCol = sR[sIdx];
        let gCol = sG[sIdx];
        let bCol = sB[sIdx];
        let lum = sLum[sIdx] * revealFade;

        // Apply cape dynamic fold shading
        if (mask === CAT_MASK.CAPE) {
          lum *= capeFoldShade;
        }

        // Apply periodic cute blink on kitten eyes
        if (mask === CAT_MASK.EYE && blink > 0.04) {
          rCol = Math.round(rCol * (1 - blink) + 154 * blink);
          gCol = Math.round(gCol * (1 - blink) + 138 * blink);
          bCol = Math.round(bCol * (1 - blink) + 124 * blink);
          lum = lum * (1 - blink) + 0.54 * blink;
        }

        // Apply periodic silver sword blade glint
        if (mask === CAT_MASK.SWORD && glintStrength > 0.04) {
          const gBand = Math.exp(-Math.pow((vBase - glintV) / 0.042, 2)) * glintStrength;
          if (gBand > 0.04) {
            rCol = Math.min(255, Math.round(rCol + (255 - rCol) * gBand * 0.90));
            gCol = Math.min(255, Math.round(gCol + (255 - gCol) * gBand * 0.92));
            bCol = Math.min(255, Math.round(bCol + (255 - bCol) * gBand * 0.96));
            lum = Math.min(1.28, lum + 0.65 * gBand);
          }
        }

        // Wind-Swept Dust Dissolve (17.20s -> 19.85s): particles detach & blow leftward with the wind
        let drawGx = gx;
        let drawGy = gy;
        let disFade = 1.0;
        if (inDissolve) {
          const hashVal = Math.abs(Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453) % 1.0;
          const tStart = 17.20 + clamp(uBase, 0, 1) * 0.85 + hashVal * 0.55;
          const uDis = (cycleT - tStart) / 1.15;
          if (uDis >= 1.0) continue;
          if (uDis > 0) {
            const easeDis = uDis * uDis;
            drawGx = Math.round(gx - easeDis * 30.0 * (0.7 + 0.6 * hashVal) * gust);
            drawGy = Math.round(gy - uDis * 5.5 * Math.sin(uBase * 11.0 + hashVal * 6.0));
            if (drawGx < 0 || drawGx >= cols || drawGy < 0 || drawGy >= rows) continue;
            disFade = (1 - uDis) * (1 - uDis);
            // Warm silver-gold sparkling wind dust transition
            rCol = Math.min(255, Math.round(rCol + (238 - rCol) * uDis * 0.65));
            gCol = Math.min(255, Math.round(gCol + (218 - gCol) * uDis * 0.65));
            bCol = Math.min(255, Math.round(bCol + (182 - bCol) * uDis * 0.65));
            lum *= disFade;
          }
        }

        // Eye-comfort gentle left-side fade so white hero UI text on left always pops
        const px = (drawGx + 0.5) * cellW;
        let uiShade = 0.92;
        if (isDesktop && px < width * 0.50) {
          const fadeEdge = smooth((px - width * 0.18) / (width * 0.32));
          uiShade *= (0.45 + 0.55 * fadeEdge);
        }

        const intensity = clamp(lum * uiShade, 0, 1);
        if (intensity <= 0.04) continue;

        let gId = Math.round(intensity * maxGlyphIdx);
        if (gId < 1) gId = 1;
        if (gId > maxGlyphIdx) gId = maxGlyphIdx;

        // Keep kitten eyes visually dark/expressive with subtle low-contrast dot
        if (mask === CAT_MASK.EYE && blink < 0.35) {
          gId = 2;
        }

        const outR = clamp(Math.round(rCol * uiShade * disFade), 0, 255);
        const outG = clamp(Math.round(gCol * uiShade * disFade), 0, 255);
        const outB = clamp(Math.round(bCol * uiShade * disFade), 0, 255);

        renderedLetters++;
        blitGlyph(buf32, width, height, drawGx * cellW, drawGy * cellH, cellW, cellH, atlas[gId], outR, outG, outB);
      }
    }

    return { activeCount: renderedLetters, renderedLetters, cycleT, isDone };
  }

  // Unified Frame Dispatcher
  function renderFrameToBuffer(params) {
    if (params && (params.sceneId === 'gargantua' || params.sceneId === 'blackhole')) {
      return renderGargantuaToBuffer(params);
    }
    if (params && params.sceneId === 'cat') {
      return renderCatKnightToBuffer(params);
    }
    return renderTreeScene(params);
  }

  // =========================================================================
  // SCENE MANAGER & ASCIIL ENGINE
  // =========================================================================
  const SCENES = {
    tree: {
      id: 'tree',
      title: 'Cây thông Noel 3D',
      duration: CONFIG.CYCLE_DURATION,
      hasSnow: true
    },
    gargantua: {
      id: 'gargantua',
      title: 'Hố đen Gargantua',
      duration: 20.0,
      hasSnow: false
    },
    blackhole: {
      id: 'gargantua',
      title: 'Hố đen Gargantua',
      duration: 20.0,
      hasSnow: false
    },
    cat: {
      id: 'cat',
      title: 'Hiệp sĩ Mèo',
      duration: CAT_DURATION,
      hasSnow: false
    }
  };

  const SCENE_ORDER = ['tree', 'gargantua', 'cat'];

  const AsciiBg = {
    CONFIG,
    KIND,
    CAT_MASK,
    RAMP_MAIN,
    RAMP_GROUND,
    ALL_GLYPHS,
    SCENES,
    SCENE_ORDER,
    envelope,
    fib,
    starMaxRadius,
    computeDominoIntensity,
    computeDissolveState,
    buildSceneData,
    buildStars,
    buildSnow,
    buildAmbientParticles,
    buildCatKnightFromRGBA,
    buildProceduralCatKnight,
    buildGlyphAtlas,
    renderFrameToBuffer,
    renderTreeScene,
    renderGargantuaToBuffer,
    renderCatKnightToBuffer,
    renderSnowToBuffer,
    renderAmbientParticlesToBuffer,

    _canvas: null,
    _ctx: null,
    _scene: null,
    _stars: null,
    _snow: null,
    _ambientParticles: null,
    _catSprite: null,
    _catLoadState: 'idle',
    _snowBlend: 1.0,
    _targetSnowBlend: 1.0,
    _snowDistance: 0,
    _globalElapsedSec: 0,
    _lastTickMs: 0,
    _atlas: null,
    _atlasKey: '',
    _width: 0,
    _height: 0,
    _cellW: 3.6,
    _cellH: 6.5,
    _cols: 0,
    _rows: 0,
    _lastLetters: 0,
    _imageData: null,
    _buf32: null,
    _zBuf: null,
    _winIdx: null,
    _activeCells: null,

    // Playback state
    _playbackMode: 'slideshow', // 'slideshow' | 'single'
    _activeSceneId: 'tree',     // 'tree' | 'gargantua' | 'cat' | custom
    _activeSceneIndex: 0,
    _sceneStartMs: 0,
    _pausedSceneElapsedSec: 0,

    _running: false,
    _rafId: null,
    _startMs: 0,
    _pausedElapsedSec: 0,
    _lastRenderMs: 0,
    _resizeTimer: null,
    _listenersBound: false,
    _reducedMotionQuery: null,

    _getTargetSnowBlendForScene(sceneId) {
      if (sceneId === 'gargantua' || sceneId === 'blackhole') return 0.0;
      if (sceneId === 'cat') return 0.25;
      return 1.0;
    },

    reset(now) {
      const curTime = (now !== undefined) ? now : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
      this._sceneStartMs = curTime;
      this._pausedSceneElapsedSec = 0;
      this._lastRenderMs = 0;
      if (this._zBuf) this._zBuf.fill(1e9);
      if (this._buf32) this._buf32.fill(BG_PACKED);
      if (this._activeCells) this._activeCells.fill(0);
      if (this._winIdx) this._winIdx.fill(0);
    },

    registerScene(id, sceneDef) {
      if (!id || !sceneDef) return;
      SCENES[id] = Object.assign({ id, title: id, duration: 25.0, hasSnow: false }, sceneDef);
      if (!SCENE_ORDER.includes(id) && id !== 'blackhole') {
        SCENE_ORDER.push(id);
      }
    },

    setPlaybackMode(mode) {
      this._playbackMode = mode === 'single' ? 'single' : 'slideshow';
      try {
        localStorage.setItem('tinhminhlakey_ascii_mode', this._playbackMode);
      } catch (_) {}
    },

    getPlaybackMode() {
      return this._playbackMode;
    },

    setScene(sceneId) {
      const resolvedId = (sceneId === 'blackhole' ? 'gargantua' : sceneId);
      if (SCENES[resolvedId]) {
        this._activeSceneId = resolvedId;
        this._targetSnowBlend = this._getTargetSnowBlendForScene(resolvedId);
        const idx = SCENE_ORDER.indexOf(resolvedId);
        this._activeSceneIndex = idx >= 0 ? idx : 0;
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        this.reset(now);
        try {
          localStorage.setItem('tinhminhlakey_ascii_scene', resolvedId);
        } catch (_) {}
        // Guarantee loop stays alive immediately after switching scene
        if (this._running && this._isAppActiveForRender() && !this._prefersReducedMotion()) {
          this.renderAt(0, this._activeSceneId);
          this._startLoop();
        }
      }
    },

    getScene() {
      return this._activeSceneId;
    },

    selectPreset(presetKey) {
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      if (presetKey === 'slideshow') {
        this.setPlaybackMode('slideshow');
        this.reset(now);
        if (this._running && this._isAppActiveForRender() && !this._prefersReducedMotion()) {
          this.renderAt(0, this._activeSceneId);
          this._startLoop();
        }
      } else if (presetKey === 'tree' || presetKey === 'gargantua' || presetKey === 'blackhole' || presetKey === 'cat' || SCENES[presetKey]) {
        this.setPlaybackMode('single');
        this.setScene(presetKey);
      }
    },

    getState() {
      const curScene = SCENES[this._activeSceneId] || SCENES.tree;
      return {
        mode: this._playbackMode,
        scene: this._activeSceneId,
        title: curScene.title,
        running: this._running,
        letters: this._lastLetters
      };
    },

    _loadStoredPreferences() {
      try {
        const storedMode = localStorage.getItem('tinhminhlakey_ascii_mode');
        if (storedMode === 'single' || storedMode === 'slideshow') {
          this._playbackMode = storedMode;
        }
        if (this._playbackMode === 'single') {
          const storedScene = localStorage.getItem('tinhminhlakey_ascii_scene');
          const resolvedScene = (storedScene === 'blackhole' ? 'gargantua' : storedScene);
          if (resolvedScene && SCENES[resolvedScene]) {
            this._activeSceneId = resolvedScene;
            this._targetSnowBlend = this._getTargetSnowBlendForScene(resolvedScene);
            this._snowBlend = this._targetSnowBlend;
            const idx = SCENE_ORDER.indexOf(resolvedScene);
            this._activeSceneIndex = idx >= 0 ? idx : 0;
          }
        }
      } catch (_) {}
    },

    _loadCatKnightAsset() {
      if (this._catLoadState === 'loading' || this._catLoadState === 'loaded') return;
      if (!this._catSprite) {
        this._catSprite = buildProceduralCatKnight(CAT_W, CAT_H);
      }
      if (typeof Image === 'undefined' || typeof document === 'undefined') {
        this._catLoadState = 'fallback';
        return;
      }
      this._catLoadState = 'loading';
      try {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          try {
            const off = document.createElement('canvas');
            off.width = CAT_W;
            off.height = CAT_H;
            const offCtx = off.getContext('2d', { willReadFrequently: true }) || off.getContext('2d');
            if (offCtx && typeof offCtx.drawImage === 'function' && typeof offCtx.getImageData === 'function') {
              offCtx.drawImage(img, 0, 0, CAT_W, CAT_H);
              const imgData = offCtx.getImageData(0, 0, CAT_W, CAT_H);
              if (imgData && imgData.data && imgData.data.length === CAT_W * CAT_H * 4) {
                this._catSprite = buildCatKnightFromRGBA(imgData.data, CAT_W, CAT_H);
                this._catLoadState = 'loaded';
                return;
              }
            }
          } catch (_) {}
          this._catLoadState = 'fallback';
        };
        img.onerror = () => {
          this._catLoadState = 'fallback';
        };
        img.src = CAT_IMAGE_URL;
      } catch (_) {
        this._catLoadState = 'fallback';
      }
    },

    _ensureScene() {
      if (!this._scene) {
        this._scene = buildSceneData(7);
      }
      if (!this._stars) {
        this._stars = buildStars(CONFIG.STAR_COUNT, 1337);
      }
      if (!this._snow) {
        this._snow = buildSnow(CONFIG.SNOW_COUNT, 2026);
      }
      if (!this._ambientParticles) {
        this._ambientParticles = buildAmbientParticles(CONFIG.SNOW_COUNT, 2026);
      }
      if (!this._catSprite || this._catLoadState === 'idle') {
        this._loadCatKnightAsset();
      }
    },

    _prefersReducedMotion() {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
      }
      if (!this._reducedMotionQuery) {
        this._reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      }
      return Boolean(this._reducedMotionQuery && this._reducedMotionQuery.matches);
    },

    _isAppActiveForRender() {
      if (typeof document === 'undefined') return false;
      // Only pause when browser tab is genuinely hidden (document.hidden === true).
      // Never pause due to idle timers or missing mouse clicks!
      if (document.hidden) return false;
      const theme = document.documentElement && document.documentElement.getAttribute('data-theme');
      return theme === 'ascii';
    },

    _bindListeners() {
      if (this._listenersBound || typeof window === 'undefined') return;
      this._listenersBound = true;

      this._onResize = () => {
        if (this._resizeTimer) clearTimeout(this._resizeTimer);
        this._resizeTimer = setTimeout(() => {
          this.resize();
          if (this._running || this._isAppActiveForRender()) {
            this.renderAt(this._prefersReducedMotion() ? CONFIG.SHOWCASE_STATIC_T : this._getSceneElapsedSec(), this._activeSceneId);
          }
        }, 120);
      };

      this._onVisibilityOrMotionChange = () => {
        this.syncVisibility();
      };

      window.addEventListener('resize', this._onResize, { passive: true });
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', this._onVisibilityOrMotionChange);
      }
      if (typeof window.matchMedia === 'function') {
        this._reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (typeof this._reducedMotionQuery.addEventListener === 'function') {
          this._reducedMotionQuery.addEventListener('change', this._onVisibilityOrMotionChange);
        }
      }
    },

    resize() {
      if (typeof document === 'undefined' || typeof window === 'undefined') return false;
      const canvas = this._canvas || document.getElementById('ascii-bg-canvas');
      if (!canvas) return false;
      this._canvas = canvas;

      const ctx = this._ctx || canvas.getContext('2d', { alpha: false }) || canvas.getContext('2d');
      if (!ctx) return false;
      this._ctx = ctx;

      const width = Math.max(1, Math.floor(window.innerWidth || canvas.clientWidth || 800));
      const height = Math.max(1, Math.floor(window.innerHeight || canvas.clientHeight || 600));

      const isMobile = width < 768;
      const cellW = isMobile ? 3.2 : 3.6;
      const cellH = isMobile ? 5.8 : 6.5;
      const fontStr = isMobile
        ? '700 6.5px "JetBrains Mono", Consolas, "Courier New", monospace'
        : '700 7px "JetBrains Mono", Consolas, "Courier New", monospace';
      const atlasKey = `${cellW}x${cellH}:${fontStr}`;

      if (this._atlasKey !== atlasKey || !this._atlas) {
        this._atlas = buildGlyphAtlas(cellW, cellH, fontStr);
        this._atlasKey = atlasKey;
      }

      if (this._width === width && this._height === height && this._imageData) {
        return true;
      }

      canvas.width = width;
      canvas.height = height;
      this._width = width;
      this._height = height;
      this._cellW = cellW;
      this._cellH = cellH;
      this._cols = Math.max(1, (width / cellW) | 0);
      this._rows = Math.max(1, (height / cellH) | 0);

      const cellCount = this._cols * this._rows;
      this._imageData = ctx.createImageData(width, height);
      this._buf32 = new Uint32Array(this._imageData.data.buffer);
      this._zBuf = new Float32Array(cellCount);
      this._zBuf.fill(1e9);
      this._winIdx = new Int32Array(cellCount);
      this._activeCells = new Int32Array(cellCount);

      return true;
    },

    _getElapsedSec() {
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      if (!this._startMs) this._startMs = now;
      return this._pausedElapsedSec + (now - this._startMs) / 1000;
    },

    _getSceneElapsedSec() {
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      if (!this._sceneStartMs) this._sceneStartMs = now;
      return this._pausedSceneElapsedSec + (now - this._sceneStartMs) / 1000;
    },

    renderAt(elapsedSec, sceneId) {
      this._ensureScene();
      if (!this.resize() || !this._buf32 || !this._ctx) return null;

      const targetSceneId = sceneId || this._activeSceneId || 'tree';
      const tVal = elapsedSec !== undefined ? elapsedSec : this._getSceneElapsedSec();

      const res = renderFrameToBuffer({
        sceneId: targetSceneId,
        t: tVal,
        width: this._width,
        height: this._height,
        cellW: this._cellW,
        cellH: this._cellH,
        cols: this._cols,
        rows: this._rows,
        buf32: this._buf32,
        zBuf: this._zBuf,
        winIdx: this._winIdx,
        activeCells: this._activeCells,
        atlas: this._atlas,
        stars: this._stars,
        snow: this._snow,
        particles: this._ambientParticles,
        catSprite: this._catSprite,
        snowBlend: this._snowBlend,
        snowDistance: this._snowDistance,
        globalTime: this._globalElapsedSec || tVal,
        scene: this._scene,
        prefersReduced: this._prefersReducedMotion()
      });

      this._ctx.putImageData(this._imageData, 0, 0);
      if (res) this._lastLetters = res.renderedLetters;
      return res;
    },

    _cancelLoop() {
      if (this._rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this._rafId);
      }
      this._rafId = null;
    },

    _startLoop() {
      // Always cancel any existing RAF before starting a new loop to prevent orphaned/dead loops
      this._cancelLoop();
      if (!this._running || typeof requestAnimationFrame !== 'function') return;
      this._rafId = requestAnimationFrame((now) => this._tick(now));
    },

    _scheduleTick() {
      this._startLoop();
    },

    _tick(now) {
      this._rafId = null;
      if (!this._running) return;
      if (!this._isAppActiveForRender() || this._prefersReducedMotion()) {
        this._pauseLoop();
        return;
      }

      // Schedule next RAF FIRST — strictly independent of 30 FPS throttle so loop NEVER stalls!
      if (typeof requestAnimationFrame === 'function') {
        this._rafId = requestAnimationFrame((ts) => this._tick(ts));
      }

      const elapsed = now - this._lastRenderMs;
      if (this._lastRenderMs === 0 || elapsed >= CONFIG.FRAME_INTERVAL_MS || elapsed < 0) {
        const dt = this._lastTickMs ? clamp((now - this._lastTickMs) / 1000, 0, 0.1) : 0.033;
        this._lastTickMs = now;
        this._globalElapsedSec += dt;

        // Smooth 2.0s transition of snowBlend between Tree (1.0), Cat (0.25), and Gargantua (0.0)
        const blendStep = dt / 2.0;
        if (this._snowBlend < this._targetSnowBlend) {
          this._snowBlend = Math.min(this._targetSnowBlend, this._snowBlend + blendStep);
        } else if (this._snowBlend > this._targetSnowBlend) {
          this._snowBlend = Math.max(this._targetSnowBlend, this._snowBlend - blendStep);
        }
        this._snowDistance += this._snowBlend * dt;

        this._lastRenderMs = now;

        const curScene = SCENES[this._activeSceneId] || SCENES.tree;
        const sceneElapsed = this._getSceneElapsedSec();
        const res = this.renderAt(sceneElapsed, this._activeSceneId);

        // State Machine auto-advance on isDone or cycle duration reached
        const isCycleDone = (res && res.isDone) || (sceneElapsed >= curScene.duration);
        if (isCycleDone) {
          if (this._playbackMode === 'slideshow') {
            const curIdx = SCENE_ORDER.indexOf(this._activeSceneId);
            const nextIdx = (curIdx >= 0 ? curIdx + 1 : 0) % SCENE_ORDER.length;
            this._activeSceneIndex = nextIdx;
            this._activeSceneId = SCENE_ORDER[nextIdx];
            this._targetSnowBlend = this._getTargetSnowBlendForScene(this._activeSceneId);
            this.reset(now);
            if (typeof window !== 'undefined' && window.App && typeof window.App.syncAsciiSceneUI === 'function') {
              window.App.syncAsciiSceneUI();
            }
          } else {
            // Single scene mode: loop current scene cleanly
            this.reset(now);
          }
        }
      }
    },

    _pauseLoop() {
      this._cancelLoop();
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      if (this._running && this._startMs) {
        this._pausedElapsedSec += (now - this._startMs) / 1000;
        this._startMs = 0;
      }
      if (this._running && this._sceneStartMs) {
        this._pausedSceneElapsedSec += (now - this._sceneStartMs) / 1000;
        this._sceneStartMs = 0;
      }
    },

    syncVisibility() {
      if (!this._running) return;
      if (!this._isAppActiveForRender()) {
        this._pauseLoop();
        return;
      }
      if (this._prefersReducedMotion()) {
        this._pauseLoop();
        this.renderAt(CONFIG.SHOWCASE_STATIC_T, this._activeSceneId);
        return;
      }
      if (this._rafId === null) {
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        this._startMs = now;
        this._sceneStartMs = now;
        this._lastTickMs = 0;
        this._lastRenderMs = 0;
        this._startLoop();
      }
    },

    start() {
      this._cancelLoop();
      this._loadStoredPreferences();
      this._ensureScene();
      this._bindListeners();
      if (!this.resize()) return;

      this._running = true;
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      this._startMs = now;
      this._sceneStartMs = now;
      this._lastTickMs = 0;
      this._lastRenderMs = 0;
      this._targetSnowBlend = this._getTargetSnowBlendForScene(this._activeSceneId);
      this._snowBlend = this._targetSnowBlend;

      if (this._prefersReducedMotion()) {
        this._pauseLoop();
        this.renderAt(CONFIG.SHOWCASE_STATIC_T, this._activeSceneId);
        return;
      }

      if (!this._isAppActiveForRender()) {
        this._pauseLoop();
        return;
      }

      this.renderAt(this._getSceneElapsedSec(), this._activeSceneId);
      this._startLoop();
    },

    stop() {
      this._pauseLoop();
      this._running = false;
      this._pausedElapsedSec = 0;
      this._pausedSceneElapsedSec = 0;
      this._startMs = 0;
      this._sceneStartMs = 0;
      this._lastRenderMs = 0;
    },

    destroy() {
      this.stop();
      if (this._resizeTimer) {
        clearTimeout(this._resizeTimer);
        this._resizeTimer = null;
      }
      if (this._listenersBound && typeof window !== 'undefined') {
        window.removeEventListener('resize', this._onResize);
        if (typeof document !== 'undefined') {
          document.removeEventListener('visibilitychange', this._onVisibilityOrMotionChange);
        }
        if (this._reducedMotionQuery && typeof this._reducedMotionQuery.removeEventListener === 'function') {
          this._reducedMotionQuery.removeEventListener('change', this._onVisibilityOrMotionChange);
        }
        this._listenersBound = false;
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.AsciiBg = AsciiBg;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AsciiBg;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
