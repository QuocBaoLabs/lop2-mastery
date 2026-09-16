# AUDIT REPORT — Báo cáo kiểm tra chất lượng dữ liệu

Ngày sinh báo cáo: 2026-09-16 · Phạm vi: toàn bộ dataset `lop2-mastery-data` (4 SGK, 576 trang PDF scan).

## 1. Độ bao phủ đọc sách — ĐẠT 100%

| Sách | Trang PDF | OCR | Trang nội dung | Map bài |
|---|---|---|---|---|
| Toán 2 · Tập 1 | 142 | ✔ đủ (Latin + PaddleOCR) | 7–138 | 36 bài, đã đối chiếu header từng trang |
| Toán 2 · Tập 2 | 142 | ✔ đủ | 5–139 | 39 bài (37–75), đã đối chiếu header từng trang |
| Tiếng Việt 2 · Tập 1 | 146 | ✔ đủ | 11–143 | 32 bài + GK1 + CK1, theo chân trang + tiêu đề bài đọc |
| Tiếng Việt 2 · Tập 2 | 146 | ✔ đủ | 10–143 | 30 bài + GK2 + CK2, theo chân trang + tiêu đề bài đọc |

`source_map/*.json` map đủ 576 trang (284 Toán + 292 Tiếng Việt), **0 trang NEEDS_REVIEW**. PDF là bản scan không có text layer — mọi dữ liệu trích qua OCR, kèm đối chiếu chéo với nguồn web chính thống (vietjack, hoc247, loigiaihay...) khi OCR nhiễu.

## 2. Lỗi đã phát hiện và sửa trong quá trình audit

| # | Phát hiện | Xử lý |
|---|---|---|
| 1 | Bản nháp Toán T1 ghi sai trang ở các bài cuối (vd Bài 34 ghi PDF 86–87, thực tế 130–132) | Quét lại header toàn bộ 142 trang, dựng lại bảng trang đúng, đối chiếu số trang in ở chân trang (117→116, 125→124, 136→135) |
| 2 | Bản nháp Toán T2 đảo tên Bài 60 (ghi "trừ không nhớ", thực tế "Phép cộng (có nhớ)") và Bài 61 | Sửa theo header trang PDF 84, 88 + xác minh vietjack/hoc247; cập nhật kèm skill tương ứng |
| 3 | Tên 4 bài Ôn tập cuối năm (69, 70, 73, 74) sai so với header sách | Sửa đúng: 69 cộng trừ phạm vi 100; 70 phạm vi 1000; 74 kiểm đếm số liệu và lựa chọn khả năng |
| 4 | 5 skill Toán được curriculum tham chiếu nhưng chưa tồn tại trong file skill | Bổ sung đủ 5 skill (2 cộng/trừ qua 10 nâng cao, ngày–giờ, nhân từ hình ảnh, viết số thành tổng) — tổng 64 |
| 5 | Prerequisite typo `MATH_NUM_READ_WRITE_100_001` (không tồn tại) | Sửa thành `MATH_NUM_READ_WRITE_001` |
| 6 | Đề xuất 2 skill TV "từ so sánh", "viết thư" không tìm thấy nội dung dạy tương ứng trong OCR | **Loại khỏi dataset** (tuân thủ "chỉ tạo kỹ năng thực sự có trong sách") — TV còn 54 skill |
| 7 | Core 20% tính gộp 2 môn làm Toán áp đảo (23/24) | Tính lại theo từng môn: 13 Toán + 11 TV = 24 |

## 3. Kiểm tra ràng buộc dữ liệu (đã chạy tự động)

- ✔ Mọi JSON parse hợp lệ (`json.load`).
- ✔ 118 skill ID duy nhất, không trùng.
- ✔ 0 prerequisite trỏ vào skill không tồn tại; đồ thị tiên quyết không vòng (sinh từ `prerequisites` hai chiều).
- ✔ Mọi skill A/GRADE_3_FOUNDATION đều có `mastery_check_rule` (cơ sở sinh mastery check).
- ✔ Mọi exercise type đều gắn đúng 1 `skill_id` tồn tại.
- ✔ Mọi `source_refs` trỏ về bài học tồn tại trong `curriculum/*.json`.
- ✔ Mọi bài tập generated và đề kiểm tra ghi rõ nhãn **“AI đề xuất – không phải nội dung nguyên bản SGK”**; không sao chép nguyên văn văn bản đọc nào.
- ✔ Không trang nào bị bỏ qua: 576/576 trang được OCR và map.

## 4. Các điểm cần lưu ý (hạn chế đã biết)

1. **OCR nhiễu ở chi tiết nhỏ**: số trang mục lục, một số từ chuyên môn có thể lệch 1–2 ký tự. Các số liệu quan trọng (trang, tên bài, tên chủ điểm) đã được xác minh chéo bằng footer/header + nguồn web; chi tiết nhỏ không đưa vào dataset.
2. **TV1 là bản tái bản lần thứ hai**: số trang in = PDF + 10, lệch so với bản in đầu và các trang web giải bài tập. Mọi tham chiếu dùng số trang in của chính file PDF.
3. **Bài 14–16 TV2** (Cỏ non cười rồi, Những con sao biển, Tạm biệt cánh cam): phần "Luyện tập" chi tiết không đọc chắc từ OCR nên curriculum chỉ gán nhóm kỹ năng nền + nói-nghe ở mức an toàn; nếu cần chính xác từng hoạt động → mở lại trang 58–68 tập 2.
4. **Skill "nói và nghe" chi tiết từng bài**: chỉ gán khi thấy rõ trong mục lục (kể chuyện/nói theo chủ đề); bài nào không rõ thì giữ nhóm kỹ năng chung, không đoán.
5. Phân loại A/B/C/D và điểm 80/20 là đánh giá sư phạm của hệ thống (AI đề xuất) dựa trên dữ liệu SGK — có thể chỉnh theo kinh nghiệm giáo viên.

## 5. Kết luận

Dataset đủ điều kiện bàn giao cho Codex xây dashboard: đọc đủ 4 sách, 118 kỹ năng có nguồn truy vết, knowledge graph hai chiều, top 20%, MUST MASTER (60 kỹ năng), 118 dạng bài tập, 47 bài mẫu generated, 80 câu kiểm tra (đầu vào + cuối), 576 trang source map, và bộ quy tắc vận hành đầy đủ.
