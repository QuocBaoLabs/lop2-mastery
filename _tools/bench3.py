import sys, os, time
sys.path.insert(0, r"E:\sach hoc\.venv\Lib\site-packages")
os.environ.setdefault("OMP_NUM_THREADS", "6"); os.environ.setdefault("MKL_NUM_THREADS", "6")
import numpy as np, cv2
from paddle import inference
cfg = inference.Config(r"E:\sach hoc\_models\vi_rec_v6\inference.json", r"E:\sach hoc\_models\vi_rec_v6\inference.pdiparams")
cfg.disable_gpu(); cfg.set_cpu_math_library_num_threads(6); cfg.disable_glog_info()
p = inference.create_predictor(cfg)
keys = open(r"E:\sach hoc\_models\vi_rec_v6\ppocr_keys.txt", encoding="utf-8").read().rstrip("\n").split("\n")

def prep(crop):
    h,w = crop.shape[:2]
    rh=48; rw=max(8,int(round(w*rh/h))); rw=min(rw,640)
    r = cv2.resize(crop,(rw,rh),interpolation=cv2.INTER_CUBIC).astype(np.float32)/127.5-1.0
    c = np.full((3,rh,640),-1.0,dtype=np.float32); c[:,:,:rw]=np.transpose(r,(2,0,1))
    return c, rw

def decode(out):
    idx = np.argmax(out, axis=1)
    prev=None; chars=[]
    for c in idx:
        if c==prev: continue
        prev=c
        if c < len(keys): chars.append(keys[c])
    return "".join(chars).strip()

crops = [np.full((60,200,3),255,np.uint8) for _ in range(4)]
batch = np.stack([prep(c)[0] for c in crops])
t0=time.time()
p.get_input_handle("x").copy_from_cpu(batch)
p.run()
out = p.get_output_handle("fetch_name_0").copy_to_cpu()
t1=time.time()
print("batch out shape:", out.shape, "time:", round(t1-t0,2), "s")
print("decode:", [decode(o) for o in out])
