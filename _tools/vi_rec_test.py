import sys, os, json
sys.path.insert(0, r"E:\sach hoc\.venv\Lib\site-packages")
import numpy as np, cv2
import paddle
from paddle import inference

MODEL_DIR = r"E:\sach hoc\_models\vi_rec_v6"
cfg = inference.Config(os.path.join(MODEL_DIR, "inference.json"), os.path.join(MODEL_DIR, "inference.pdiparams"))
cfg.disable_gpu()
cfg.set_cpu_math_library_num_threads(4)
predictor = inference.create_predictor(cfg)
in_names = predictor.get_input_names()
out_names = predictor.get_output_names()
print("inputs:", in_names, "outputs:", out_names)

keys = open(os.path.join(MODEL_DIR, "ppocr_keys.txt"), encoding="utf-8").read().rstrip("\n").split("\n")
print("keys len:", len(keys), "last 5:", keys[-5:])

def rec(crop):
    h, w = crop.shape[:2]
    rh = 48
    rw = int(round(w * rh / h))
    rw = min(rw, 640)
    r = cv2.resize(crop, (rw, rh), interpolation=cv2.INTER_LINEAR)
    canvas = np.full((3, rh, 640), 0, dtype=np.float32)
    t = np.transpose(r, (2, 0, 1)).astype(np.float32)
    canvas[:, :, :rw] = t
    x = canvas[None, ...]
    in_h = predictor.get_input_handle(in_names[0])
    in_h.copy_from_cpu(x)
    predictor.run()
    outs = [predictor.get_output_handle(n).copy_to_cpu() for n in out_names]
    for i, o in enumerate(outs):
        print("out", out_names[i], o.shape)
    ctc = outs[0]
    # find CTC head: shape (batch, seq, classes) with classes ~ len(keys)+1
    idx = np.argmax(ctc, axis=2)[0]
    prev = None; chars = []
    for c in idx:
        if c == prev: continue
        prev = c
        if c < len(keys): chars.append(keys[c])
    return "".join(chars).strip()

img = cv2.imread(r"E:\sach hoc\lop2-mastery-data\_tools\math1_p3.png")
for (y0,y1,x0,x1) in [(280,350,540,1000), (340,420,80,1300), (360,440,80,1300)]:
    print(">>>", rec(img[y0:y1, x0:x1]))
