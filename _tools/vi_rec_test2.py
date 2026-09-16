import sys, os
sys.path.insert(0, r"E:\sach hoc\.venv\Lib\site-packages")
import numpy as np, cv2
from paddle import inference

MODEL_DIR = r"E:\sach hoc\_models\vi_rec_v6"
cfg = inference.Config(os.path.join(MODEL_DIR, "inference.json"), os.path.join(MODEL_DIR, "inference.pdiparams"))
cfg.disable_gpu(); cfg.set_cpu_math_library_num_threads(4)
cfg.delete_pass("reduce_mean_check_if_onednn_support")
predictor = inference.create_predictor(cfg)
keys = open(os.path.join(MODEL_DIR, "ppocr_keys.txt"), encoding="utf-8").read().rstrip("\n").split("\n")

def rec(crop):
    h, w = crop.shape[:2]
    rh = 48
    rw = max(8, int(round(w * rh / h)))
    rw = min(rw, 640)
    r = cv2.resize(crop, (rw, rh), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    r = r / 127.5 - 1.0
    canvas = np.full((3, rh, 640), -1.0, dtype=np.float32)
    canvas[:, :, :rw] = np.transpose(r, (2, 0, 1))
    x = canvas[None, ...]
    predictor.get_input_handle("x").copy_from_cpu(x)
    predictor.run()
    out = predictor.get_output_handle("fetch_name_0").copy_to_cpu()  # (1, seq, C)
    idx = np.argmax(out, axis=2)[0]
    prev = None; chars = []
    for c in idx:
        if c == prev: continue
        prev = c
        if c < len(keys): chars.append(keys[c])
    return "".join(chars).strip()

img = cv2.imread(r"E:\sach hoc\lop2-mastery-data\_tools\math1_p3.png")
print("crop1:", rec(img[280:350, 540:1000]))
print("crop2:", rec(img[340:420, 80:1300]))
print("crop3:", rec(img[360:440, 80:1300]))
