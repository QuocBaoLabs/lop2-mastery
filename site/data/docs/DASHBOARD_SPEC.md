# Dashboard Spec — Lớp 2 Mastery

Đặc tả 14 màn hình. Trang trẻ tối giản; trang phụ huynh chi tiết.

## 1. Tổng quan (phụ huynh)

- Thẻ: trình độ tổng, % MUST MASTER đạt, số skill đỏ/vàng/xanh, streak ngày học.
- Biểu đồ tiến độ mastery theo tuần (M0–M4).
- Danh sách 3 việc ưu tiên hôm nay (điểm risk cao nhất).
- Nút bắt đầu buổi học cho trẻ.

## 2. Hôm nay nên học gì (trẻ + phụ huynh)

- 1–2 skill mới + 1–3 skill ôn + 0–1 mastery check (theo recommendation_rules.json).
- Mỗi thẻ: tên hoạt động thân thiện, lý do 1 câu, thời lượng ước tính.
- Phụ huynh thấy thêm: PriorityScore và lý do kỹ thuật.

## 3. Toán / 4. Tiếng Việt

- Danh sách chủ đề → mở ra lưới skill với trạng thái mastery + risk.
- Lọc theo mức quan trọng (A/B/C/D), nền lớp 3, trạng thái.
- Bấm skill → panel chi tiết: định nghĩa mastery, nguồn SGK, bài đã làm, nút "Luyện ngay"/"Kiểm tra".

## 5. Bản đồ kiến thức

- Đồ thị tiên quyết (prerequisites.json), chia lớp theo độ sâu.
- Màu node theo mastery; viền đỏ = risk ≥ 80; viền tím đứt = nền lớp 3.
- Bấm node → chi tiết skill + danh sách skill phụ thuộc bị chặn.

## 6. Mastery

- Bảng tất cả skill: cột = mức M0–M4; hàng = skill; sắp xếp theo importance.
- Bộ lọc: môn, chủ đề, trạng thái "cần học", "đang học", "thành thạo".

## 7. Bài tập

- Chọn skill → chọn dạng bài (exercise_type) → sinh bài GENERATED_PRACTICE.
- Ngân hàng bài không lặp câu đã làm; ưu tiên dạng yếu.
- Hiển thị nguồn dạng (trang SGK) cho phụ huynh.

## 8. Bài kiểm tra

- **Đầu vào:** diagnostic_math / diagnostic_vietnamese (≤ 20–25 câu, phủ kỹ năng nền).
- **Mastery check:** 5 câu/skill, bài mới, không trùng câu luyện.
- **Cuối chương trình:** final_math / final_vietnamese bao phủ MUST MASTER.
- Kết quả: báo 🟢🟡🔴 + cập nhật mastery tự động.

## 9. Lịch ôn

- Danh sách skill đến hạn hôm nay/ngày mai, nhóm theo interval (1/3/7/14/30).
- Lịch tuần tối giản; không quá 3 skill ôn/ngày.

## 10. Phân tích lỗi

- Biểu đồ lỗi theo error_id (24 mã), theo tuần.
- Mỗi mã: mô tả + gợi ý can thiệp (error_taxonomy.json).
- "Lỗi lặp lại" tự động nổi bật khi ≥ 3 lần cùng mã.

## 11. MUST MASTER

- 2 danh sách ngắn: MATH_MUST_MASTER, VIETNAMESE_MUST_MASTER.
- Mỗi mục: trạng thái (chưa đạt / M3+ / M4), nguồn SGK, nút luyện.
- Banner "Sẵn sàng lên lớp 3" chỉ sáng khi đủ điều kiện (xem MUST_MASTER.md).

## 12. Báo cáo phụ huynh

- Tuần: phút học, skill mới đạt, lỗi nổi bật, việc đề xuất tuần sau.
- Tháng: tiến độ mastery, xu hướng risk, so với mục tiêu.
- Ngôn ngữ đơn giản, không thuật ngữ; có nút chia sẻ/xuất PDF.

## 13. Tiến độ theo tuần

- Đường tiến độ: số skill đạt M3+ theo tuần, so với đường mục tiêu.
- Nhiệt đồ ngày học (giống GitHub contribution graph phiên bản trẻ em).

## 14. Cài đặt học tập

- Thời lượng buổi học (15/20/30 phút), số ngày học/tuần.
- Ưu tiên môn, bật/tắt giọng đọc, tên gọi thân mật.
- Reset tiến độ, xuất/nhập dữ liệu học sinh (JSON).

## Luồng "HỌC NGAY" (màn hình chính của trẻ)

1. **ÔN NHANH** (2–3 câu skill đã học, 2 phút).
2. **KIẾN THỨC MỚI** — giải thích ngắn + 2–3 ví dụ (to: hình ảnh/que tính/tranh).
3. **TRẺ TỰ LÀM** — 3–5 câu theo dạng.
4. **CHECK HIỂU BẢN CHẤT** — câu "Tại sao?"/"Vì sao con nghĩ vậy?".
5. **MASTERY CHECK** — 5 câu mới nếu đủ điều kiện.
6. **CẬP NHẬT MASTERY** — thăng cấp theo quy tắc.
7. **XẾP LỊCH ÔN** — interval kế tiếp vào lịch.

## Trạng thái kỹ thuật

- Schema: `database_schema.md`.
- Mọi màn hình đọc dữ liệu từ `curriculum/`, `skills/`, `exercises/`, `assessment/`, `rules/`.
- Không màn hình nào cần phân tích lại SGK — mọi thứ đã được ánh xạ sẵn trong dataset.
