# Phân tích 80/20 — 20% kỹ năng tạo 80% năng lực

## Phương pháp

1. Mỗi kỹ năng được chấm `importance_score` 1–100 dựa trên: mức độ dùng lại ở lớp trên, tần suất xuất hiện trong SGK, hậu quả khi bị hổng, và vai trò trong chuỗi tiên quyết.
2. Xếp hạng **riêng từng môn** (không trộn điểm Toán với Tiếng Việt vì thang điểm hai môn không cùng "độ phóng đại").
3. Lấy Top 20% từng môn: Toán 13/64, Tiếng Việt 11/54 → tổng 24/118 kỹ năng trong `skills/core_20_percent.json`.
4. Đối chiếu với `grade3_foundation` (nền móng lớp 3) để chắc rằng không skill nền nào bị tuột khỏi danh sách chỉ vì điểm số.

## Top 20% — Toán (13/64)

| Skill | Điểm | Lý do ngắn |
|---|---|---|
| MATH_ADD_BRIDGE10_001 | 96 | Kỹ thuật "tách để được 10" là bản chất cộng có nhớ mọi phạm vi |
| MATH_SUB_BRIDGE10_001 | 96 | Bản chất trừ có nhớ; nền mọi phép trừ lớp trên |
| MATH_ADD_CARRY_100_001/002 | 95 | Cộng có nhớ phạm vi 100 — dùng lại nguyên văn ở phạm vi 1000 |
| MATH_NUM_PLACE_VALUE_001 | 95 | Cấu tạo số — gốc của mọi thứ về số |
| MATH_SUB_BORROW_100_001/002 | 95 | Trừ có nhớ phạm vi 100 |
| MATH_MULT_CONCEPT_001 | 94 | Khái niệm gốc của phép nhân |
| MATH_DIV_CONCEPT_001 | 94 | Khái niệm gốc của phép chia (chia đều) |
| MATH_NUM_PLACE_VALUE_1000_001 | 94 | Cấu tạo số 3 chữ số — nền lớp 3 |
| MATH_ADD_CARRY_1000_001 | 92 | Cộng có nhớ phạm vi 1000 |
| MATH_DIV_TABLE_2_001 | 92 | Bảng chia 2 — chia đôi, một nửa, dùng suốt đời |
| MATH_DIV_TABLE_5_001 | 92 | Bảng chia 5 |

## Top 20% — Tiếng Việt (11/54)

| Skill | Điểm | Lý do ngắn |
|---|---|---|
| VIE_READ_WORD_001 | 92 | Đọc đúng từ là tiền đề tuyệt đối của đọc hiểu và chính tả |
| VIE_READ_FLUENCY_001 | 90 | Cầu nối nhận diện chữ → đọc hiểu |
| VIE_READ_INFO_001 | 90 | Dạng đọc hiểu nền tảng ở mọi bài, mọi môn |
| VIE_SPELL_CAPITAL_001 | 88 | Quy tắc viết hoa dùng suốt đời |
| VIE_READ_ANSWER_001 | 87 | Đọc hiểu + diễn đạt — chiếm phần lớn bài kiểm tra |
| VIE_READ_COMPREHEND_001 | 86 | Vốn từ quyết định tốc độ đọc hiểu |
| VIE_READ_INFERENCE_001 | 85 | Đọc hiểu bậc cao — quyết định điểm đọc hiểu |
| VIE_SPELL_DICTATION_001 | 85 | Tổng hợp mọi quy tắc chính tả, dạng thi cố định |
| VIE_READ_MAINIDEA_001 | 84 | Rút ý chính — dùng ở mọi môn từ lớp 3 |
| VIE_WRITE_3_5_SENT_001 | 84 | Chuẩn viết đoạn lớp 2, là yêu cầu viết lớp 3 |
| VIE_SENTENCE_MAKE_001 | 83 | Kỹ năng trung tâm nối từ vựng với diễn đạt |

## Nhận xét

- Top 20% không máy móc: một số skill cùng cặp (ví dụ cộng/trừ có nhớ hai dạng) đều nằm trong danh sách vì chúng độc lập về kỹ thuật thao tác, không phải "lặp nguyên lý".
- Các skill mức B/C/D không nằm trong Top 20% nhưng vẫn được theo dõi mastery bình thường — chúng chỉ được ưu tiên **sau** khi 20% này chắc (M3 trở lên).
- Khi nguồn lực hạn chế (trẻ mệt, nghỉ học dài), engine chỉ chạy lịch ôn trên nhóm này trước — xem `rules/recommendation_rules.json`.
