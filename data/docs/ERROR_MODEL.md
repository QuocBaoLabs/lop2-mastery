# Error Model — Lớp 2 Mastery

Mỗi lỗi sai của trẻ được gán một `error_id` duy nhất. Error Engine dùng các mã này để:
- phân tích lỗi theo kỹ năng / dạng bài / thời gian;
- quyết định can thiệp: luyện ngắn, quay lại prerequisite hay dạy lại khái niệm;
- sinh báo cáo phụ huynh bằng ngôn ngữ dễ hiểu.

## Toán (MATH)

| error_id | Tên | Can thiệp chính |
|---|---|---|
| CALCULATION_ERROR | Sai kết quả tính | Luyện ngắn 3–5 phép cùng dạng. |
| PLACE_VALUE_ERROR | Sai hàng đơn vị/chục/trăm | Quay lại cấu tạo số; luyện tách số. |
| CARRY_ERROR | Quên nhớ khi cộng | Hỏi "Vì sao phải nhớ 1?"; luyện cộng qua 10. |
| BORROW_ERROR | Quên mượn khi trừ | Minh họa bằng que tính; luyện trừ có nhớ. |
| READ_PROBLEM_ERROR | Hiểu sai đề bài | Luyện 3 bước đọc đề → gạch chân dữ kiện → nói lại. |
| WRONG_OPERATION | Chọn sai phép tính | Phân tích ý nghĩa: thêm/gộp → cộng; bớt/còn lại → trừ. |
| UNIT_ERROR | Sai/thiếu đơn vị | Đọc lại câu hỏi trước khi ghi đáp số. |
| LOGIC_ERROR | Sai trình tự giải | Kể lại bài toán bằng 3 câu. |
| CARELESS_ERROR | Sai do cẩu thả | Xây thói quen soát bài. |
| CONCEPT_ERROR | Sai bản chất khái niệm | Dừng tiến độ; dạy lại bằng vật thật. |
| COMPARISON_ERROR | Sai so sánh số | So theo hàng trăm → chục → đơn vị. |
| MEASUREMENT_ERROR | Sai đo lường | Thực hành đo vật thật; luyện đổi đơn vị. |

## Tiếng Việt (VIETNAMESE)

| error_id | Tên | Can thiệp chính |
|---|---|---|
| READ_WORD_ERROR | Đọc sai từ | Ôn âm/vần bị sai; đọc chậm rồi mới nhanh. |
| READ_FLUENCY_ERROR | Đọc chưa trôi chảy | Đọc lặp đoạn ngắn 3–5 lần. |
| VOCAB_ERROR | Không hiểu nghĩa từ | Giải nghĩa bằng ví dụ; đặt câu với từ mới. |
| COMPREHENSION_ERROR | Không trả lời được đọc hiểu | Tìm từ khóa câu hỏi rồi dò bài đọc. |
| INFERENCE_ERROR | Chưa suy luận được | Hỏi "Vì sao con nghĩ vậy?" |
| SPELLING_INITIAL_ERROR | Lẫn âm đầu (s/x, ch/tr…) | Phân biệt qua nghĩa; bài tập điền âm đầu. |
| SPELLING_RHYME_ERROR | Lẫn vần | So sánh cặp vần qua từ mẫu. |
| TONE_ERROR | Sai dấu thanh | Đọc to phân biệt thanh; luyện điền dấu. |
| PUNCTUATION_ERROR | Sai dấu câu | Sửa bài: chấm câu → viết hoa → tên riêng. |
| SENTENCE_STRUCTURE_ERROR | Sai cấu trúc câu | Luyện mẫu câu Ai là gì/làm gì/thế nào. |
| WRITING_SEQUENCE_ERROR | Viết thiếu trình tự | Kể lại theo tranh; viết dàn ý 3 câu. |
| WRITING_CONTENT_ERROR | Viết lạc đề/thiếu ý | Gạch từ khóa đề; trả lời đủ câu hỏi gợi ý. |

## Cách Error Engine dùng dữ liệu

1. Mỗi câu sai trong `attempt` ghi `error_type` (error_id).
2. Engine gộp lỗi theo `skill_id` và theo `exercise_type_id`.
3. Phân loại phản ứng:
   - **CONCEPT_ERROR / PLACE_VALUE_ERROR / COMPREHENSION_ERROR** → dừng tiến độ, quay lại prerequisite.
   - **CALCULATION_ERROR / CARELESS_ERROR / TONE_ERROR** → luyện ngắn cùng dạng.
   - Lặp cùng error_id ≥ 3 lần → nâng can thiệp một mức (vd từ luyện ngắn thành dạy lại).
4. Báo cáo phụ huynh: "Con hay nhầm dấu thanh khi viết (TONE_ERROR) — tuần này luyện 5 phút/ngày điền dấu."

Toàn bộ mã lỗi dạng máy đọc: `rules/error_taxonomy.json`.
