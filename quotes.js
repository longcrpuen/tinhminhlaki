/**
 * ==============================================================================
 * DANH SÁCH QUOTE TRUYỀN CẢM HỨNG CHO TRANG TỔNG QUAN (HERO SECTION)
 * ==============================================================================
 * 
 * HƯỚNG DẪN THÊM / SỬA / XÓA CÂU QUOTE:
 * 1. Bạn có thể tự do thêm, sửa hoặc xóa các dòng trong mảng QUOTES bên dưới.
 *    Mỗi câu được đặt trong dấu ngoặc kép "..." và ngăn cách nhau bằng dấu phẩy (,).
 * 
 * 2. CÚ PHÁP ĐỔI MÀU NHẤN:
 *    - Đặt từ hoặc cụm từ bạn muốn làm nổi bật giữa 2 cặp dấu sao **...**
 *      (tương tự cú pháp in đậm của Markdown).
 *    - Ví dụ: "if the enemy can predict your next move then **dont move**"
 *      -> Cụm "dont move" sẽ đổi sang màu nhấn tím/hồng nổi bật,
 *         các từ còn lại sẽ hiển thị màu trắng.
 * 
 * 3. LƯU Ý VỀ CHỮ HOA / CHỮ THƯỜNG:
 *    - Bạn cứ gõ chữ thường bình thường trong file cho dễ đọc và chỉnh sửa.
 *    - Giao diện sẽ tự động chuyển toàn bộ thành CHỮ IN HOA (UPPERCASE)
 *      theo phong cách Poster Typography hiện đại của ứng dụng.
 * ==============================================================================
 */

export const QUOTES = [
  "If the enemy can **predict** your next move then **don't move**",
  "A man with **no pants** fears no **pickpockets**",
  "Don't  face your **fears**, fear your **face**",
  "Don't ask the **time**, **time** your farts",
  "Don't give up on your dream, just **keep sleeping**",
  "Don't do work because it is for **servants**",
  "No one can **use** you if you are **useless**",
  "The longer you don't **pee**, the longer you **pee**",
  "Life is like a **dick**, sometimes it's **up**, sometimes it's **down**, but never hard forever and it's also **short**",
  "Always **cum** hard",
  "It's better to **shit** in a **sink** than to **sink** in **shit**",
  "My dick has **no limits**",
  "If you can't **please** her, **please** yourself",
  "When you have heart attack, just **attack** back",
  "The surest way to win is to not **lose**",
  "The wise man stays **silent**, mostly because he **forgot** what he was about to say"
];

// Tương thích môi trường Browser toàn cục (window) và Node.js test runner (module.exports)
if (typeof window !== 'undefined') {
  window.QUOTES = QUOTES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUOTES };
}
