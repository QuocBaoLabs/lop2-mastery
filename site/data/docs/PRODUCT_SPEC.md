# Product Spec — Lớp 2 Mastery

## 1. Tầm nhìn

Dashboard học tập thông minh cho trẻ lớp 2 (Toán + Tiếng Việt), chạy theo năng lực:

**HỌC ÍT HƠN → HIỂU SÂU HƠN → NHỚ LÂU HƠN → HOÀN THÀNH SỚM HƠN → KHÔNG TẠO LỖ HỔNG KIẾN THỨC.**

Câu hỏi trung tâm của sản phẩm không phải "Trẻ học đến trang mấy?" mà là **"Trẻ đã thực sự làm chủ bao nhiêu kỹ năng?"**

## 2. Người dùng

| Vai trò | Nhu cầu |
|---|---|
| Trẻ (6–8 tuổi) | Giao diện đơn giản, nhiều hình ảnh, khen thưởng kịp thời, buổi học ngắn. |
| Phụ huynh | Biết con đang ở đâu, yếu gì, hôm nay nên học gì; báo cáo tuần. |
| (Tương lai) Giáo viên | Nhìn toàn lớp, phát hiện lỗ hổng chung. |

## 3. Chức năng lõi (MVP)

1. **Đánh giá đầu vào** — diagnostic test ngắn phân loại 🟢 thành thạo / 🟡 chưa chắc / 🔴 chưa biết.
2. **Học theo skill** — flow HỌC NGAY (xem LEARNING_ENGINE.md).
3. **Mastery tracking** — thang M0–M4 cho từng skill.
4. **Gợi ý hôm nay** — Recommendation Engine (Priority Score).
5. **Ôn thông minh** — Spaced Repetition với ngân sách ≤ 3 skill/ngày.
6. **Phân tích lỗi** — Error Engine với 24 mã lỗi chuẩn.
7. **Bản đồ kiến thức** — đồ thị tiên quyết, tô màu theo trạng thái + risk.
8. **MUST MASTER** — danh sách ngắn điều kiện hoàn thành lớp 2.
9. **Kiểm tra cuối chương trình** — final test bao phủ MUST MASTER.
10. **Báo cáo phụ huynh** — tuần/tháng, bằng ngôn ngữ dễ hiểu.

## 4. Nguyên tắc thiết kế

- **Độ dài buổi học:** mặc định 20 phút, tối đa 30 phút, ≤ 5 hoạt động.
- **Adaptive practice:** đúng liên tục → giảm bài; sai → quay về gốc (fast_track_rules.json).
- **Không trừng phạt lỗi sai:** lỗi là tín hiệu; phản hồi luôn kèm gợi ý bước tiếp theo.
- **Interleaving:** ôn trộn 2 skill trở lên để trẻ không học vẹt.
- **Minh bạch:** mọi đề xuất có lý do 1 câu; mọi skill truy vết được về trang SGK.
- **Bản quyền:** không sao chép nguyên văn SGK; bài tập là bài mới tương đương dạng; chỉ lưu tham chiếu trang + trích ngắn cần thiết.

## 5. Trải nghiệm trẻ vs phụ huynh

| Màn hình trẻ | Màn hình phụ huynh |
|---|---|
| Hôm nay học gì (3 thẻ hoạt động lớn) | Dashboard chi tiết: mastery, risk, lịch ôn |
| Làm bài: 1 câu/1 màn hình, nút to, âm thanh khen | Báo cáo tuần: tiến độ, lỗi nổi bật, gợi ý |
| Nhận sao/huy hiệu khi đạt mastery | Cài đặt: thời lượng, lịch học, môn ưu tiên |
| Không thấy điểm số thô | Xem chi tiết từng attempt khi cần |

## 6. Kiến trúc đề xuất (cho Codex)

- **Frontend:** web responsive (mobile-first — trẻ dùng máy tính bảng), SPA đơn giản.
- **Backend:** local-first — SQLite/JSON + đồng bộ sau (không bắt buộc server ở MVP).
- **Dữ liệu:** nạp trực tiếp từ `curriculum/`, `skills/`, `exercises/`, `assessment/`, `rules/` trong repo này.
- **TTS/giọng đọc (nếu có):** ưu tiên cho bài đọc Tiếng Việt; không phải yêu cầu MVP.

## 7. Roadmap

| Giai đoạn | Nội dung |
|---|---|
| P0 | Diagnostic → học skill → mastery check → gợi ý ngày → ôn (lõi vòng lặp). |
| P1 | Báo cáo phụ huynh, bản đồ kiến thức, MUST MASTER view, risk engine UI. |
| P2 | Multi-student, giáo viên, đồng bộ đám mây, gamification mở rộng. |

## 8. Chỉ số thành công

- Trẻ đạt M3+ với **toàn bộ MUST MASTER** và **mọi GRADE_3_FOUNDATION**.
- Giảm ≥ 30% số bài luyện lặp so với học tuần tự theo sách (nhờ fast-track).
- Phụ huynh trả lời được "con đang yếu gì, hôm nay học gì" trong < 30 giây khi mở app.
