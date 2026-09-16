# LỚP 2 MASTERY — Hệ thống học tăng tốc Toán + Tiếng Việt lớp 2

> Dataset + Product Spec cho dashboard học tập thông minh, xây từ **4 SGK chương trình mới** (Bộ Kết nối tri thức với cuộc sống, NXB Giáo dục Việt Nam).

---

# START HERE FOR CODEX

Đọc file này trước khi viết bất kỳ dòng code nào.

## Bạn đang cầm gì?

Thư mục này là **toàn bộ dữ liệu + đặc tả** của hệ thống học lớp 2. Bạn **KHÔNG cần** phân tích lại SGK — mọi thứ đã được trích xuất, chuẩn hóa, gắn mã và truy vết nguồn.

## Nhiệm vụ của bạn khi nhận thư mục này

Xây **dashboard học tập** (web) dùng dữ liệu dưới đây. Không cần đọc 4 file PDF gốc.

## Thứ tự đọc

1. `CURRICULUM_OVERVIEW.md` — bản đồ chương trình 2 môn.
2. `PRODUCT_SPEC.md` — sản phẩm làm gì, cho ai.
3. `DASHBOARD_SPEC.md` — 14 màn hình + flow HỌC NGAY.
4. `MASTERY_MODEL.md` + `rules/mastery_rules.json` — thang M0–M4 và quy tắc thăng/giáng cấp.
5. `SPACED_REPETITION.md` + `rules/spaced_repetition_rules.json` — lịch ôn 1-3-7-14-30.
6. `LEARNING_ENGINE.md` + `rules/recommendation_rules.json` + `rules/risk_score_rules.json` — "hôm nay học gì" và rủi ro lỗ hổng.
7. `ERROR_MODEL.md` + `rules/error_taxonomy.json` — 24 mã lỗi.
8. `FAST_TRACK.md` + `rules/fast_track_rules.json` — giảm bài lặp.
9. `80_20_ANALYSIS.md` + `skills/core_20_percent.json` — 20% kỹ năng tạo 80% năng lực.
10. `MUST_MASTER.md` — điều kiện hoàn thành lớp 2.
11. `database_schema.md` — schema tối thiểu.
12. `AUDIT_REPORT.md` — tình trạng chất lượng dữ liệu.

## Dữ liệu (JSON)

| Thư mục | Nội dung |
|---|---|
| `curriculum/` | Bản đồ chương trình: chủ đề → đơn vị → bài → kỹ năng → trang SGK |
| `skills/` | Kỹ năng chuẩn hóa + tiên quyết + Top 20% |
| `exercises/` | Dạng bài tập + bài mẫu sinh mới (không sao chép SGK) |
| `assessment/` | Kiểm tra đầu vào + cuối chương trình |
| `rules/` | Toàn bộ engine dạng máy đọc |
| `source_map/` | Ánh xạ từng trang PDF → bài học |

## Các mô hình bạn cần hiểu

### Skill model
- `skill_id` chuẩn: `MATH_*` / `VIE_*` — không phụ thuộc tên bài, dùng lâu dài.
- Mỗi skill có: `subject`, `domain`, `subdomain`, `name`, `description`, `importance_level` (A/B/C/D), `importance_score` (1–100), `grade3_foundation`, `prerequisites[]`, `source_refs[]`, `mastery_definition{level_0..4}`, `mastery_check_rule`, `fast_track_allowed`, `exercise_type_ids[]`.
- `dependents[]` được sinh tự động từ `prerequisites[]` (đừng ghi tay).

### Mastery model
- Thang **M0–M4** (xem MASTERY_MODEL.md).
- Thăng/giáng cấp theo `rules/mastery_rules.json` — dùng quy tắc rời rạc, không dùng điểm liên tục cho quyết định.

### Exercise model
- 3 loại nguồn: `SGK_REFERENCE` (con trỏ tới bài/trang), `GENERATED_PRACTICE` (bài mới tương đương dạng), `MASTERY_CHECK` (bài mới kiểm tra thực chất).
- **Không** dùng lại câu đã luyện cho mastery check.

### Review engine
- Bậc thang 1-3-7-14-30 ngày, thích ứng theo kết quả ôn (xem SPACED_REPETITION.md).

### Recommendation engine
- `PriorityScore` 0–100, cổng tiên quyết (prerequisite ≥ M3), kế hoạch ngày ≤ 5 hoạt động (xem LEARNING_ENGINE.md).

### Error engine
- 24 `error_id` (12 Toán + 12 Tiếng Việt) → phản ứng khắc phục (xem ERROR_MODEL.md).

### Source reference hoạt động thế nào?
Mỗi skill/exercise_type mang `source_refs`:
```json
{"book": "math1", "volume": "Tập 1", "lesson": "Bài 19", "pdf_page": 47, "printed_page": 46, "section": "Hoạt động"}
```
→ Dashboard có thể hiển thị "SGK Toán 2 Tập 1, Bài 19, sách tr.46 (PDF tr.47)" và phụ huynh mở đúng trang sách giấy.

## Quy ước quan trọng

- Ngôn ngữ dữ liệu: tiếng Việt (nội dung hiển thị cho trẻ/phụ huynh).
- Mọi nội dung AI đề xuất ngoài SGK đều gắn cờ `"source": "AI_SUGGESTED"` + mô tả — không được coi là nội dung SGK.
- Mục tiêu sản phẩm: **trẻ làm chủ năng lực**, không phải học hết trang sách.

## Chạy web demo

Website trong `site/` (thuần HTML/CSS/JS, không cần build) hiển thị toàn bộ dataset. Mở `site/index.html` sau khi chạy `python _tools/build_site.py` (copy JSON vào `site/data/`).
