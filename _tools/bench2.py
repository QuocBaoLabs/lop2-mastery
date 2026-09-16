import sys, os, time
sys.path.insert(0, r"E:\sach hoc\.venv\Lib\site-packages")
os.environ.setdefault("OMP_NUM_THREADS", "6")
os.environ.setdefault("MKL_NUM_THREADS", "6")
import numpy as np, cv2, fitz
from rapidocr_onnxruntime.ch_ppocr_v3_det.text_detect import TextDetector
from paddle import inference

DET = dict(use_cuda=False, limit_side_len=736, limit_type="min", thresh=0.3, box_thresh=0.5,
    max_candidates=1000, unclip_ratio=1.6, use_dilation=True, score_mode="fast",
    model_path=r"E:\sach hoc\.venv\Lib\site-packages\rapidocr_onnxruntime\models\ch_PP-OCRv3_det_infer.onnx")
det = TextDetector(DET)

cfg = inference.Config(r"E:\sach hoc\_models\vi_rec_v6\inference.json", r"E:\sach hoc\_models\vi_rec_v6\inference.pdiparams")
cfg.disable_gpu(); cfg.set_cpu_math_library_num_threads(6)
cfg.disable_glog_info()
predictor = inference.create_predictor(cfg)
keys = open(r"E:\sach hoc\_models\vi_rec_v6\ppocr_keys.txt", encoding="utf-8").read().rstrip("\n").split("\n")

def rec(crop):
    h, w = crop.shape[:2]
    rh = 48; rw = max(8, int(round(w*rh/h))); rw = min(rw, 640)
    r = cv2.resize(crop, (rw, rh), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    r = r / 127.5 - 1.0
    canvas = np.full((3, rh, 640), -1.0, dtype=np.float32)
    canvas[:, :, :rw] = np.transpose(r, (2, 0, 1))
    predictor.get_input_handle("x").copy_from_cpu(canvas[None])
    predictor.run()
    out = predictor.get_output_handle("fetch_name_0").copy_to_cpu()
    idx = np.argmax(out, axis=2)[0]
    prev=None; chars=[]
    for c in idx:
        if c==prev: continue
        prev=c
        if c < len(keys): chars.append(keys[c])
    return "".join(chars).strip()

doc = fitz.open(r"C:\Users\BAO LION\Downloads\SGK - Toán 2 - Tập 1 - Chương trình mới.pdf")
for pno in [3, 4]:
    t0=time.time()
    pix = doc[pno].get_pixmap(dpi=150)
    img = cv2.cvtColor(np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, pix.n), cv2.COLOR_RGB2BGR)
    t1=time.time()
    boxes, _ = det(img)
    t2=time.time()
    nrec=0
    for box in boxes:
        xs=[p[0] for p in box]; ys=[p[1] for p in box]
        x0,y0,x1,y1 = int(min(xs))-2, int(min(ys))-2, int(max(xs))+2, int(max(ys))+2
        y0=max(0,y0); x0=max(0,x0); x1=min(img.shape[1],x1); y1=min(img.shape[0],y1)
        crop=img[y0:y1,x0:x1]
        if crop.shape[0] < 8: continue
        rec(crop); nrec+=1
    t3=time.time()
    print(f"page {pno+1}: render {t1-t0:.2f}s, det {t2-t1:.2f}s ({len(boxes)} boxes), rec {t3-t2:.2f}s ({nrec} boxes), total {t3-t0:.2f}s", flush=True)
