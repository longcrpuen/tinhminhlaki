# ĐẶC TẢ YÊU CẦU ĐỢT 2J (`docs/promt/promt2j.md`)
> **Nhánh thực hiện**: `feat/ascii-tree` (tách từ `main`)  
> **Mục tiêu**:
> 1. Viết lại hàm render Hố đen Gargantua trong `js/ascii-bg.js` bám sát 100% thuật toán `py art.py` từ video gốc (không tự chế công thức ellipse mỏng, không dùng vòng tròn đen xóa đè lên nửa trước của đĩa bồi tụ).
> 2. Cài đặt chính xác các hàm toán học của `art.py`: `gas(phi, rho, t, w)`, `accretion_disk(X, Y, t, w, inc)`, `lensed_halo(r, ang, t, w)`.
> 3. Cài đặt các pha chuyển động camera `cam`, `zoom`, `inc`, `flash` tại `FLASH = 8.2s`, hòa trộn Screen Blend và che khuất 3D chuẩn (`front_side = v > 0` đè cắt ngang qua bóng đen chân trời sự kiện).
> 4. Ký tự xoáy theo 4 level (`..::--~~,,;;`, `--==++//\\||`, `++**##%%xxoo`, `##%%@@$$&&88`) và bảng màu nhiệt ấm dịu (`rgb(115, 48, 24)` → `rgb(175, 88, 42)` → `rgb(225, 148, 78)` → `rgb(250, 215, 155)`).
> 5. Pha kết thúc Galaxy Impact (Supernova Burst) tại `t = 16.5 .. 19.5s` với lực hút xoáy co tụ vào tâm và phát nổ sóng xung kích trước khi tắt hẳn về `#000000` và chuyển cảnh Slideshow.

---

## 1. Chi Tiết Thuật Toán Toán Học `art.py`

### 1.1. Hằng số & Hệ tọa độ chuẩn hóa
- Tâm hố đen: `cx = cols * 0.70`, `cy = rows * 0.48`.
- Quy đổi ô `(col, row)` sang `(X, Y)` chuẩn hóa theo tỷ lệ `cellW / cellH` và `rows * 0.5`.
- Hằng số: `R0 = 0.24`, `R_IN = 1.0 * R0`, `R_OUT = 3.8 * R0`, `TILT = -0.23`, `INC = 0.22`, `FLASH = 8.2`, `GARG_DURATION = 19.5`.
- Chuyển động camera quanh thời điểm `FLASH`:
  ```js
  const cam = smooth(smooth((t - FLASH + 0.3) / 2.6));
  const zoom = 1 + 0.28 * cam;
  const inc = INC + 0.09 * cam;
  const Xc = X / zoom;
  const Yc = (Y + 0.02 * cam) / zoom;
  const r = Math.hypot(Xc, Yc);
  const ang = Math.atan2(Yc, Xc);
  const flash = Math.exp(-Math.pow((t - FLASH) / 0.22, 2));
  ```

### 1.2. Hàm vân khí xoáy `gas(phi, rho, t, w)`
```js
const lr = Math.log(Math.max(rho, 1e-4) / R_IN);
const phase = phi + 2.6 * lr - w * 1.8;
const rings = 0.55 + 0.45 * Math.sin(lr * 14.0 - w * 0.8);
const spiral = 0.6 + 0.4 * Math.sin(phase * 2.0 + Math.sin(lr * 8.0 + w));
const fine = 0.7 + 0.3 * Math.cos(phi * 5.0 - lr * 18.0 + w * 2.2);
const streak = Math.pow(rings * spiral * fine, 0.85);
return { streak, phase, lr };
```

### 1.3. Hàm đĩa bồi tụ `accretion_disk(X, Y, t, w, inc)`
```js
const u = X * Math.cos(TILT) + Y * Math.sin(TILT);
const v = -X * Math.sin(TILT) + Y * Math.cos(TILT);
const rho = Math.hypot(u, v / inc);
const phi = Math.atan2(v / inc, u);
const { streak, phase, lr } = gas(phi, rho, t, w);
const edge = smooth((rho - R_IN) / (0.25 * R0)) * smooth((R_OUT - rho) / (0.45 * R_OUT));
let heat = 1.5 * edge * streak * (R_IN / Math.max(rho, 1e-4));
heat *= 1 - 0.25 * (u / Math.max(rho, 1e-6));
return { heat, u, v, rho, phi, phase, lr };
```

### 1.4. Hàm thấu kính hấp dẫn `lensed_halo(r, ang, t, w)`
```js
const top = 0.5 - 0.5 * Math.sin(ang - TILT);
const side = Math.pow(Math.abs(Math.cos(ang - TILT)), 10);
const out = Math.max(r - 1.1 * R0, 0);
const band = Math.exp(-Math.pow(out / (0.2 * R0 + 0.24 * R0 * top + 0.45 * R0 * side), 2));
const rhoHalo = (1 - side) * (R_IN + Math.max(r - 1.0 * R0, 0) * 2.6) + side * r;
const { streak: flow } = gas(ang - TILT, rhoHalo, t, w);
const halo = 1.2 * band * flow * (0.5 + 0.8 * top) * (1 - 0.25 * Math.cos(ang - TILT));
return halo;
```

### 1.5. Screen Blend & Che khuất 3D chuẩn
```js
let soft = 1 - (1 - clamp(aura * 0.55, 0, 1)) * (1 - clamp(haloScaled, 0, 1));
soft = Math.max(soft, disk, haloScaled);
let heat = Math.max(ring * (0.9 + 0.3 * smooth((t - 5) / 2)), soft, shock * 0.9);
heat *= (1 + 1.4 * flash);

const inside = r < R0 * 0.97;
const front_side = v > 0; // nửa trước của đĩa nghiêng băng qua trước mặt lỗ đen
if (inside && !front_side) {
  heat = 0.0; // bóng đen chỉ che nửa đĩa phía sau
} else if (inside && front_side) {
  heat = disk > 0.2 ? disk : 0.0; // dải đĩa phía trước đè cắt ngang qua bóng đen!
}
```

---

## 2. Tiêu Chuẩn Nghiệm Thu
1. `node tests/test-runner.js`: Toàn bộ 1,215 test pass 100%, 0 failed.
2. `node scripts/build.js`: Đóng gói thành công 100% PWA Offline.
3. Đo đạc thực tế số lượng `letters` trung bình và `frame time (ms)`.
