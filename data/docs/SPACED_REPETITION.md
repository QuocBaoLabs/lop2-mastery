# Spaced Repetition — Lớp 2 Mastery

## Bậc thang mặc định

1 → 3 → 7 → 14 → 30 ngày (tối đa 30 ngày cho lớp 2).

## Quy tắc thích ứng

| Kết quả ôn | Hành động |
|---|---|
| Đúng 100%, trả lời nhanh | Tăng 1 bậc interval (giữ 30 nếu đang ở mức tối đa). |
| Đúng 80–99% | Giữ nguyên bậc interval. |
| Đúng 50–79% | Giảm 1 bậc interval, lên lịch ôn sớm. |
| Đúng < 50% | Reset về 1 ngày, đưa vào hàng chờ học lại, kiểm tra prerequisite. |

## Chính sách theo mức quan trọng

- **A · CORE**: ôn dài hạn bắt buộc — không bao giờ ngừng, interval tối đa 30 ngày.
- **B · IMPORTANT**: cho phép ngừng khi đạt M4 + 2 lần ôn liên tiếp đúng 100%.
- **C · SUPPORT**: tối đa 2 chu kỳ ôn sau khi đạt M3.
- **D · FAST TRACK**: không ôn riêng; gộp vào mastery check của skill mẹ.

## Ngân sách ôn hằng ngày

- Tối đa **3 skill ôn/ngày** để không quá tải.
- Khi quá tải lịch: ưu tiên CORE → GRADE_3_FOUNDATION → đến hạn sớm nhất.

## Dạng phiên ôn

1. **Quick check** — 2–3 câu dạng đã thành thạo, xác nhận còn nhớ.
2. **Mixed check (interleaving)** — trộn 2 skill đã học, mỗi skill 2–3 câu.
3. **Mastery recheck** — 5–8 câu biến thể khi quick check thấp.

## Dữ liệu liên quan

- `rules/spaced_repetition_rules.json` — toàn bộ quy tắc dạng máy đọc.
- Bảng `review` trong `database_schema.md` — lưu interval, retention_score, next_review.
