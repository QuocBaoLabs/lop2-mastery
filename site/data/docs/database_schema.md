# Database Schema — Lớp 2 Mastery

Schema tối thiểu cho dashboard. Dùng SQL thuần (PostgreSQL/SQLite đều chạy được) hoặc ánh xạ 1-1 sang JSON collection nếu dùng local-first.

## 1. student

| cột | kiểu | mô tả |
|---|---|---|
| student_id | text PK | id học sinh |
| name | text | tên hiển thị (tên thân mật cho trẻ) |
| parent_name | text | tên phụ huynh |
| grade | int | mặc định 2 |
| created_at | timestamp | ngày tạo hồ sơ |

## 2. skill

| cột | kiểu | mô tả |
|---|---|---|
| skill_id | text PK | vd `MATH_ADD_CARRY_100_001` |
| subject | text | `MATH` / `VIETNAMESE` |
| domain | text | chủ đề lớn (vd Số học) |
| subdomain | text | chủ đề con (vd Phép cộng có nhớ) |
| name | text | tên kỹ năng |
| description | text | mô tả năng lực |
| importance_level | text | A / B / C / D |
| importance_score | int | 1–100 |
| grade3_foundation | bool | nền móng lớp 3 |
| mastery_definition | json | level_0..level_4 |
| mastery_check_rule | json | quy tắc đạt mastery |
| fast_track_allowed | bool | có được rút gọn luyện tập |
| source_refs | json | mảng tham chiếu SGK |
| prerequisites | json | mảng skill_id tiên quyết |
| dependents | json | mảng skill_id phụ thuộc (derived) |

## 3. exercise

| cột | kiểu | mô tả |
|---|---|---|
| exercise_id | text PK | id bài |
| skill_id | text FK | kỹ năng gắn với bài |
| exercise_type_id | text FK | dạng bài (vd `MATH_ADD_CARRY_TYPE_01`) |
| source_type | text | `SGK_REFERENCE` / `GENERATED_PRACTICE` / `MASTERY_CHECK` |
| difficulty | int | 1–5 |
| question | json/text | đề bài (cấu trúc theo môn) |
| answer | json/text | đáp án |
| explanation | text | giải thích |
| source_page | json | nguồn trang SGK (chỉ SGK_REFERENCE) |
| error_tags | json | mã lỗi liên quan (error_id) |
| is_active | bool | dùng trong ngân hàng bài |

## 4. attempt

| cột | kiểu | mô tả |
|---|---|---|
| attempt_id | text PK | id lần làm |
| student_id | text FK | học sinh |
| skill_id | text FK | kỹ năng |
| exercise_id | text FK | bài đã làm |
| answer | json/text | câu trả lời của trẻ |
| correct | bool | đúng/sai |
| error_type | text | error_id nếu sai |
| time_spent_s | int | thời gian làm (giây) |
| hint_used | bool | có dùng gợi ý |
| created_at | timestamp | thời điểm |

## 5. mastery

| cột | kiểu | mô tả |
|---|---|---|
| student_id | text PK | (khóa ghép với skill_id) |
| skill_id | text PK | |
| mastery_level | int | 0–4 |
| mastery_score | real | 0–100 (điểm tổng hợp) |
| correct_streak | int | số lần đúng liên tiếp hiện tại |
| attempt_count | int | tổng số lần làm |
| last_tested | timestamp | lần kiểm tra gần nhất |
| next_review | date | ngày ôn kế tiếp |
| updated_at | timestamp | cập nhật gần nhất |

## 6. review

| cột | kiểu | mô tả |
|---|---|---|
| review_id | text PK | id phiên ôn |
| student_id | text FK | |
| skill_id | text FK | |
| interval_days | int | khoảng cách hiện tại |
| next_review | date | ngày ôn tiếp theo |
| retention_score | real | 0–100 ước lượng khả năng còn nhớ |
| last_result | text | `remembered` / `partial` / `forgotten` |
| reviewed_at | timestamp | |

## 7. risk_snapshot (tùy chọn, cache)

| cột | kiểu | mô tả |
|---|---|---|
| student_id | text PK | |
| skill_id | text PK | |
| risk_score | int | 0–100 |
| band | text | `OK` / `WATCH` / `REINFORCE` / `PRIORITY` |
| computed_at | timestamp | |

## 8. daily_plan (tùy chọn, cache)

| cột | kiểu | mô tả |
|---|---|---|
| plan_id | text PK | |
| student_id | text FK | |
| plan_date | date | ngày học |
| items | json | danh sách {type, skill_id, reason} |
| created_at | timestamp | |

## Quan hệ chính

```
student 1─N attempt N─1 exercise N─1 skill
student 1─N mastery N─1 skill
student 1─N review N─1 skill
skill 1─N skill (prerequisite, qua bảng skill_edges)
```

`skill_edges(from_skill_id, to_skill_id, reason)` lưu đồ thị tiên quyết từ `skills/prerequisites.json`.

## Lưu ý triển khai

- Dashboard có thể khởi động **local-first**: toàn bộ skill/exercise đọc từ JSON, trạng thái học sinh lưu SQLite.
- `source_refs` luôn giữ nguyên để truy vết ngược về SGK (môn → tập → bài → trang PDF → trang sách).
- Mọi bài tập trong dataset là bài **mới tương đương dạng SGK** (GENERATED_PRACTICE / MASTERY_CHECK); `SGK_REFERENCE` chỉ là con trỏ tới bài/trang trong sách, không chứa nội dung sao chép.
