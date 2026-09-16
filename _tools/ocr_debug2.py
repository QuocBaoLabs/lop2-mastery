import sys, os
sys.path.insert(0, r"E:\sach hoc\.venv\Lib\site-packages")
import numpy as np, cv2, onnxruntime as ort
sess = ort.InferenceSession(r"E:\sach hoc\_models\latin_rec\rec.onnx", providers=["CPUExecutionProvider"])
dict_chars = open(r"E:\sach hoc\_models\latin_rec\dict.txt", encoding="utf-8").read().rstrip("\n").split("\n")
img = cv2.imread(r"E:\sach hoc\lop2-mastery-data\_tools\math1_p3.png")
crop = img[280:350, 540:1000]
h,w = crop.shape[:2]
rh=48; rw=max(8,int(round(w*rh/h/8.0)*8))
r = cv2.resize(crop,(rw,rh),interpolation=cv2.INTER_LINEAR)
r = cv2.cvtColor(r,cv2.COLOR_BGR2RGB).astype(np.float32)
r = (r/255.0-0.5)/0.5
r = np.transpose(r,(2,0,1))[None,...]
out = sess.run(None, {sess.get_inputs()[0].name: r})[0]
idx = np.argmax(out, axis=2)[0]
print("raw indices:", idx.tolist())
# decode collapse
prev=None; chars=[]
for c in idx:
    if c==prev: continue
    prev=c
    chars.append(dict_chars[c] if c < len(dict_chars) else f"<{c}>")
print("decode(dict[c]):", "".join(chars))
# offset -1: c==0 -> blank
prev=None; chars=[]
for c in idx:
    if c==prev: continue
    prev=c
    if c==0: chars.append("|")
    elif c==503: chars.append("_")
    else: chars.append(dict_chars[c-1] if c-1 < len(dict_chars) else f"<{c}>")
print("decode(offset-1):", "".join(chars))
print("dict[0:6]:", dict_chars[0:6])
print("dict[95:110]:", dict_chars[95:110])
