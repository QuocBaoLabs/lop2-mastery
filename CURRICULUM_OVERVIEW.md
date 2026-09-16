# CURRICULUM OVERVIEW — Bản đồ chương trình lớp 2

> Nguồn dữ liệu: **4 SGK chương trình mới** (Bộ Kết nối tri thức với cuộc sống, NXB Giáo dục Việt Nam). Toàn bộ 576 trang PDF scan đã được OCR và đối chiếu (Latin pass + PaddleOCR tiếng Việt), không chỉ đọc mục lục.

## 1. Sách nguồn và quy ước trang

| book_id | Tên sách | Số trang PDF | Quy tắc trang in | Ghi chú |
|---|---|---|---|---|
| `math1` | Toán 2 · Tập 1 | 142 | `printed = pdf − 1` | Đã xác minh bằng số trang in ở chân trang (PDF 117 → in 116, 125 → 124, 136 → 135) |
| `math2` | Toán 2 · Tập 2 | 142 | `printed = pdf − 1` | Đã xác minh bằng số trang in ở chân trang |
| `vie1` | Tiếng Việt 2 · Tập 1 | 146 | `printed = pdf + 10` | Bản **tái bản lần thứ hai**; chân trang PDF 11 → in 21, PDF 18 → in 28; mục lục trang PDF 5–9 |
| `vie2` | Tiếng Việt 2 · Tập 2 | 146 | `printed = pdf − 1` | Chân trang PDF 22 → in 21, PDF 110 → in 109, PDF 140 → in 139; mục lục trang PDF 4–8 |

> ⚠️ Vì TV1 là bản tái bản nên số trang in lệch so với bản in lần đầu (và lệch so với số trang trên các trang web giải bài tập). Mọi `printed_page` trong dataset đều theo **số trang in của chính file PDF này**.

## 2. Toán — 75 bài, 64 kỹ năng

### Tập 1 (`math1`, PDF 7–138)
| Chủ đề | Đơn vị | Bài | Trang PDF | Kỹ năng chính |
|---|---|---|---|---|
| Ôn tập và bổ sung | Ôn tập các số đến 100 | 1–6 | 7–26 | Cấu tạo số, so sánh, thành phần phép tính, bài toán hơn/kém |
| | Cộng trừ trong phạm vi 20 | 7–14 | 27–57 | Cộng/trừ qua 10, bảng cộng/trừ, bài toán thêm bớt, nhiều hơn ít hơn |
| | Khối lượng, dung tích | 15–18 | 58–76 | Ki-lô-gam, lít, thực hành cân đong |
| | Cộng trừ (có nhớ) trong phạm vi 100 | 19–24 | 73–98 | Cộng có nhớ (1 chữ số/2 chữ số), trừ có nhớ (1 chữ số/2 chữ số) |
| | Làm quen với hình phẳng | 25–28 | 99–112 | Điểm, đoạn thẳng, đường gấp khúc, hình tứ giác, thực hành gấp cắt |
| | Ngày – giờ, giờ – phút, ngày – tháng | 29–32 | 113–124 | Đồng hồ, lịch, ngày–tháng |
| Ôn tập học kì 1 | — | 33–36 | 125–138 | Ôn tập tổng hợp HK1 |

### Tập 2 (`math2`, PDF 5–139)
| Chủ đề | Đơn vị | Bài | Trang PDF | Kỹ năng chính |
|---|---|---|---|---|
| Phép nhân, phép chia | Phép nhân | 37–40 | 5–15 | Khái niệm nhân, thừa số – tích, bảng nhân 2, bảng nhân 5 |
| | Phép chia | 41–45 | 16–34 | Khái niệm chia, số bị chia – số chia – thương, bảng chia 2, bảng chia 5, quan hệ nhân – chia |
| | Làm quen với khối trụ, khối cầu | 46–47 | 35–40 | Khối trụ, khối cầu |
| Các số trong phạm vi 1000 | Các số trong phạm vi 1000 | 48–54 | 41–68 | Đơn vị–chục–trăm–nghìn, số tròn trăm/chục, số có ba chữ số, viết số thành tổng, so sánh |
| | Đơn vị đo độ dài, tiền Việt Nam | 55–58 | 66–79 | Đề-xi-mét, mét, ki-lô-mét; tiền Việt Nam; thực hành đo |
| | Cộng trừ trong phạm vi 1000 | 59–63 | 80–100 | Cộng/trừ không nhớ, có nhớ trong phạm vi 1000 |
| Thu thập, phân loại số liệu và khả năng xảy ra | Thống kê và xác suất ban đầu | 64–67 | 101–110 | Thu thập, phân loại, kiểm đếm; biểu đồ tranh; chắc chắn – có thể – không thể |
| | Ôn tập cuối năm | 68–75 | 111–139 | Ôn tập số, cộng trừ 100/1000, nhân chia, hình học, đo lường, thống kê, tổng hợp |

**Lưu ý đã đính chính so với bản nháp:** Bài 60 là *Phép cộng (có nhớ)* và Bài 61 là *Phép trừ (không nhớ)* trong phạm vi 1000 (bản nháp từng ghi ngược); các bài Ôn tập cuối năm 69–74 đã sửa đúng tên theo header trang sách.

## 3. Tiếng Việt — 62 bài + 4 phần Ôn tập, 54 kỹ năng

### Tập 1 (`vie1`, PDF 11–143)
| Chủ điểm | Bài | Trang PDF |
|---|---|---|
| Em lớn lên từng ngày | 1–8 (Tôi là học sinh lớp 2 … Cầu thủ dự bị) | 11–40 |
| Đi học vui sao | 9–16 (Cô giáo lớp em … Khi trang sách mở ra) | 41–71 |
| Ôn tập giữa học kì 1 | GK1 | 72–79 |
| Niềm vui tuổi thơ | 17–24 (Gọi bạn … Nặn đồ chơi) | 80–109 |
| Mái ấm gia đình | 25–32 (Sự tích hoa tỉ muội … Chơi chong chóng) | 110–137 |
| Ôn tập và đánh giá cuối học kì 1 | CK1 | 138–143 |

### Tập 2 (`vie2`, PDF 10–143)
| Chủ điểm | Bài | Trang PDF |
|---|---|---|
| Vẻ đẹp quanh em | 1–8 (Chuyện bốn mùa … Lũy tre) | 10–39 |
| Hành tinh xanh của em | 9–16 (Vè chim … Tạm biệt cánh cam) | 40–68 |
| Ôn tập giữa học kì 2 | GK2 | 69–77 |
| Giao tiếp và kết nối | 17–20 (Những cách chào độc đáo … Từ chú bồ câu đến in-tơ-nét) | 78–92 |
| Con người Việt Nam | 21–24 (Mai An Tiêm … Chiếc rễ đa tròn) | 93–110 |
| Việt Nam quê hương em | 25–30 (Đất nước chúng mình … Cánh đồng quê em) | 111–133 |
| Ôn tập và đánh giá cuối học kì 2 | CK2 | 134–143 |

Mỗi bài gồm 5 hoạt động: **Đọc → Viết → Nói và nghe → Luyện tập (Luyện từ và câu, Luyện viết đoạn) → Đọc mở rộng**.

## 4. Bản đồ kỹ năng

- `curriculum/math.json` + `skills/math_skills_t*.json`: **64 kỹ năng Toán**, ID `MATH_*`, gom theo miền (Số học, Phép tính, Bài toán có lời văn, Đo lường, Hình học, Thống kê – xác suất).
- `curriculum/vietnamese.json` + `skills/vietnamese_skills.json`: **54 kỹ năng Tiếng Việt**, ID `VIE_*`, gom theo năng lực thực tế: Đọc (14), Chính tả (11), Từ và câu (12), Viết (11), Nói và nghe (6). Không đặt ID theo tên bài đọc.
- `skills/all_skills.json`: 118 kỹ năng hợp nhất; `skills/prerequisites.json`: đồ thị tiên quyết hai chiều; `skills/core_20_percent.json`: Top 20% từng môn.

## 5. Truy vết nguồn (source tracing)

Mọi kỹ năng có `source_refs` trỏ về `book → lesson → section → volume → printed_page`; mọi bài có `pdf_pages` + `printed_pages`. Bản đồ từng trang ở `source_map/math_source_map.json` và `source_map/vietnamese_source_map.json` (576 trang, không trang nào NEEDS_REVIEW). Nội dung ngoài SGK (bài tập sinh mới, đề kiểm tra) đều ghi rõ: **“AI đề xuất – không phải nội dung nguyên bản SGK”**.
