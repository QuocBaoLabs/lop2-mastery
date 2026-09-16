import sys, os
sys.path.insert(0, r"E:\sach hoc\.venv\Lib\site-packages")
import numpy as np, cv2, onnxruntime as ort
sess = ort.InferenceSession(r"E:\sach hoc\_models\latin_rec\rec.onnx", providers=["CPUExecutionProvider"])
print("inputs:", [(i.name, i.shape) for i in sess.get_inputs()])
print("outputs:", [(o.name, o.shape) for o in sess.get_outputs()])
dict_chars = open(r"E:\sach hoc\_models\latin_rec\dict.txt", encoding="utf-8").read().rstrip("\n").split("\n")
print("dict len:", len(dict_chars))
img = cv2.imread(r"E:\sach hoc\lop2-mastery-data\_tools\math1_p3.png")
crop = img[280:350, 540:1000]
h,w = crop.shape[:2]
rh=48; rw=max(8,int(round(w*rh/h/8.0)*8))
r = cv2.resize(crop,(rw,rh),interpolation=cv2.INTER_LINEAR)
r = cv2.cvtColor(r,cv2.COLOR_BGR2RGB).astype(np.float32)
r = (r/255.0-0.5)/0.5
r = np.transpose(r,(2,0,1))[None,...]
print("feed shape:", r.shape)
out = sess.run(None, {sess.get_inputs()[0].name: r})
for o in out:
    print("out shape:", o.shape)
    a = o
    # try (1,seq,C)
    idx = np.argmax(a, axis=2)[0]
    print("seq len:", len(idx), "top chars:", [dict_chars[c] if c < len(dict_chars) else f"<{c}>" for c in idx[:60]])
