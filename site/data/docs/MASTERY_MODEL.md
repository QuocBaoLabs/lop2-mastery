# Mastery Model — Lớp 2 Mastery

## Thang đo

| Mức | Tên | Định nghĩa |
|---|---|---|
| M0 | Chưa biết | Chưa tiếp xúc hoặc chưa làm được dù có hướng dẫn. |
| M1 | Biết nhưng cần hướng dẫn | Làm được khi có người hướng dẫn/làm mẫu từng bước. |
| M2 | Làm độc lập, chưa ổn định | Tự làm được nhưng còn sai sót, cần nhắc nhẹ hoặc làm chậm. |
| M3 | Thành thạo | Làm đúng, ổn định, đúng tốc độ phù hợp, không cần nhắc. |
| M4 | Thành thạo và giải thích được | Làm đúng ổn định, giải thích được cách làm/bản chất, xử lý được biến thể. |

## Nguyên tắc

1. **Không dùng một ngưỡng cho mọi kỹ năng.** Mỗi skill có `mastery_definition` (level_0..level_4) và `mastery_check_rule` riêng trong `skills/all_skills.json`.
2. **Lên cấp bằng bằng chứng, không bằng thời gian.** Chỉ tăng mức khi có kết quả kiểm tra đạt ngưỡng (xem `rules/mastery_rules.json`).
3. **Xuống cấp khi bằng chứng đảo ngược.** Quên liên tục khi ôn → hạ mức và đưa về lịch học lại.
4. **CORE không bao giờ đóng băng.** Skill mức A vẫn phải kiểm tra định kỳ dù đã đạt M4.
5. **Nền lớp 3 phải đạt tối thiểu M3.** `grade3_foundation = true` là điều kiện bắt buộc để coi là hoàn thành lớp 2.

## Ví dụ mastery_definition (kỹ năng Cộng có nhớ trong phạm vi 100)

| Mức | Định nghĩa |
|---|---|
| M0 | Chưa biết đặt tính cộng hoặc chưa hiểu "nhớ 1". |
| M1 | Làm đúng khi được hướng dẫn từng bước: đặt tính → cộng đơn vị → nhớ → cộng chục. |
| M2 | Tự đặt tính và làm đúng phần lớn nhưng còn quên nhớ 1–2 lần/10 câu. |
| M3 | Làm đúng ≥ 8/10 câu không nhắc, cả dạng đặt tính và tính nhẩm, giải được ≥ 1 bài vận dụng. |
| M4 | Làm đúng ổn định, giải thích được vì sao phải nhớ 1, xử lý được câu biến đổi (vd 3 số hạng, tìm số hạng). |

## Mastery check

- Mastery check là bài **mới**, không trùng câu đã luyện.
- Mặc định: 5 câu, đạt khi ≥ 4/5 đúng, không dùng gợi ý.
- Skill CORE có chu kỳ kiểm tra lại dài hạn theo spaced repetition.
- Mastery score (0–100) = kết hợp độ chính xác gần nhất, streak và độ ổn định; chỉ dùng để hiển thị, quyết định thăng/giáng cấp theo quy tắc rời rạc ở `rules/mastery_rules.json`.

## Vai trò trong dashboard

- Màn hình **Mastery**: lưới kỹ năng tô màu theo mức (M0–M4).
- Màn hình **Hôm nay nên học gì**: ưu tiên kỹ năng chưa đạt M3 có risk cao.
- Màn hình **MUST MASTER**: hiển thị 2 danh sách ngắn (Toán, Tiếng Việt) trẻ phải đạt trước khi hoàn thành lớp 2.
