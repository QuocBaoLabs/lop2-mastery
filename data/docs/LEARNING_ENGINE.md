# Learning Engine — Lớp 2 Mastery

Gồm 2 động cơ: **Recommendation Engine** (hôm nay học gì?) và **Knowledge Risk Engine** (lỗ hổng nào nguy hiểm nhất?).

## 1. Recommendation Engine

### Công thức Priority Score (0–100)

```
PriorityScore = 0.30*Importance + 0.25*Weakness + 0.20*ForgettingRisk
              + 0.15*DependencyWeight + 0.10*DueForReview
```

| Thành phần | Ý nghĩa |
|---|---|
| Importance | `importance_score` của skill (0–100). |
| Weakness | 100 − mastery_score×25; cộng penalty nếu sai gần đây. |
| ForgettingRisk | Ước lượng từ đường cong quên (số lần ôn thành công, ngày cách `last_tested`). |
| DependencyWeight | Số skill chưa học đang phụ thuộc trực tiếp + hệ số nền lớp 3. |
| DueForReview | 100 nếu đến hạn hôm nay, 50 nếu đến hạn trong 2 ngày, 0 nếu còn xa. |

### Cổng tiên quyết

Chỉ đề xuất **học mới** khi mọi prerequisite đạt tối thiểu M3 (M2 với skill mức C). Nếu prerequisite đỏ → đề xuất học lại prerequisite trước kèm lý do.

### Kế hoạch ngày mẫu (≤ 5 hoạt động, 20–30 phút)

- 1–2 skill **mới** (PriorityScore cao nhất trong nhóm đủ điều kiện).
- 1–3 skill **ôn** (từ lịch spaced repetition; ưu tiên CORE + nền lớp 3).
- 0–1 **mastery check** (khi có skill vừa đủ điều kiện kiểm tra).

Mọi đề xuất kèm 1 câu giải thích cho phụ huynh.

## 2. Knowledge Risk Engine

### Công thức Risk Score (0–100)

```
Risk = 40*Weakness + 25*Importance + 20*ForgettingRisk + 10*Dependency + 5*Grade3Flag
```

### Dải rủi ro

| Điểm | Nhãn | Hành động |
|---|---|---|
| 0–29 | Ổn | Duy trì lịch ôn. |
| 30–59 | Theo dõi | Ôn khi đến hạn. |
| 60–79 | Cần củng cố | Lên lịch củng cố trong tuần. |
| 80–100 | Ưu tiên ngay | Ưu tiên số 1 buổi kế tiếp + cảnh báo phụ huynh. |

### Trigger đặc biệt

- Skill mức A có sàn rủi ro tối thiểu 40.
- Sai trong 7 ngày gần nhất: +15 tạm thời.
- Quên 2 lần ôn liên tiếp: nhân đôi ForgettingRisk.
- Mỗi skill chưa học phụ thuộc trực tiếp: +8 (tối đa +24).

## 3. Vòng lặp học "HỌC NGAY"

```
ÔN NHANH → KIẾN THỨC MỚI → 2–3 VÍ DỤ → TRẺ TỰ LÀM → CHECK HIỂU BẢN CHẤT
→ MASTERY CHECK → CẬP NHẬT MASTERY → XẾP LỊCH ÔN
```

- **Toán**: luôn có câu "Tại sao?", "Nếu đổi số này thì sao?", "Có cách khác không?"
- **Tiếng Việt**: luôn có câu "Con tìm thông tin ở đâu?", "Vì sao con nghĩ như vậy?", "Con nói lại bằng lời của mình được không?"

## Dữ liệu máy đọc

- `rules/recommendation_rules.json`
- `rules/risk_score_rules.json`
