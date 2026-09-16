import sys, os
sys.path.insert(0, r"E:\sach hoc\.venv\Lib\site-packages")
import numpy as np, cv2, onnxruntime as ort
from rapidocr_onnxruntime.ch_ppocr_v3_det.text_detect import TextDetector

DET = dict(
    use_cuda=False, limit_side_len=736, limit_type="min", thresh=0.3,
    box_thresh=0.5, max_candidates=1000, unclip_ratio=1.6, use_dilation=True,
    score_mode="fast",
    model_path=r"E:\sach hoc\.venv\Lib\site-packages\rapidocr_onnxruntime\models\ch_PP-OCRv3_det_infer.onnx",
)
det = TextDetector(DET)
img = cv2.imread(r"E:\sach hoc\lop2-mastery-data\_tools\math1_p3.png")
boxes, t = det(img)
print("boxes:", len(boxes))

dict_chars = open(r"E:\sach hoc\_models\latin_rec\dict.txt", encoding="utf-8").read().rstrip("\n").split("\n")
sess = ort.InferenceSession(r"E:\sach hoc\_models\latin_rec\rec.onnx", providers=["CPUExecutionProvider"])
inp_name = sess.get_inputs()[0].name
print("input name", inp_name, "shape", sess.get_inputs()[0].shape)

def rec(crop):
    h, w = crop.shape[:2]
    rh = 48
    rw = max(8, int(round(w * rh / h / 8.0) * 8))
    r = cv2.resize(crop, (rw, rh), interpolation=cv2.INTER_LINEAR)
    r = cv2.cvtColor(r, cv2.COLOR_BGR2RGB).astype(np.float32)
    r = (r / 255.0 - 0.5) / 0.5
    r = np.transpose(r, (2, 0, 1))[None, :, :, :]
    out = sess.run(None, {inp_name: r})[0]  # (1, seq, classes)
    idx = np.argmax(out, axis=2)[0]
    chars = []
    prev = -1
    for c in idx:
        if c == prev: continue
        prev = c
        if c < len(dict_chars): chars.append(dict_chars[c])
    return "".join(chars).strip()

lines = []
for box in boxes:
    xs = [p[0] for p in box]; ys = [p[1] for p in box]
    x0,y0,x1,y1 = int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))
    y0 = max(0, y0-2); y1 = min(img.shape[0], y1+2); x0=max(0,x0-2); x1=min(img.shape[1],x1+2)
    crop = img[y0:y1, x0:x1]
    if crop.size == 0: continue
    txt = rec(crop)
    if txt: lines.append((y0, x0, txt))
lines.sort()
for y,x,txt in lines:
    print(f"y={y:4d} x={x:4d} | {txt}")

