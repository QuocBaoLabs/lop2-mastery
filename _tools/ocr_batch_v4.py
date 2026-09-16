import sys, os, json, time, argparse
sys.path.insert(0, r"E:\sach hoc\.venv\Lib\site-packages")
import numpy as np, cv2, fitz, onnxruntime as ort
cv2.setNumThreads(1)
from rapidocr_onnxruntime.ch_ppocr_v3_det.text_detect import TextDetector

BOOKS = {
 "math1": r"C:\Users\BAO LION\Downloads\SGK - Toán 2 - Tập 1 - Chương trình mới.pdf",
 "math2": r"C:\Users\BAO LION\Downloads\SGK - Toán 2 - Tập 2 - Chương trình mới.pdf",
 "vie1": r"C:\Users\BAO LION\Downloads\Tieng-Viet-2-Tap-1-Ket-noi-tri-thuc-voi-cuoc-song.pdf",
 "vie2": r"C:\Users\BAO LION\Downloads\sach-giao-khoa-sgk-tieng-viet-2-tap-lop-2-ket-noi-tri-thuc-45.pdf",
}
OUT_DIR = r"E:\sach hoc\lop2-mastery-data\_tools\ocr_raw"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("book")
    ap.add_argument("--start", type=int, default=1)
    ap.add_argument("--end", type=int, default=10**9)
    ap.add_argument("--dpi", type=int, default=150)
    args = ap.parse_args()

    so = ort.SessionOptions(); so.intra_op_num_threads = 1; so.inter_op_num_threads = 1
    det = TextDetector(dict(use_cuda=False, limit_side_len=736, limit_type="min", thresh=0.3,
        box_thresh=0.5, max_candidates=1000, unclip_ratio=1.6, use_dilation=True, score_mode="fast",
        model_path=r"E:\sach hoc\.venv\Lib\site-packages\rapidocr_onnxruntime\models\ch_PP-OCRv3_det_infer.onnx"))
    rec_sess = ort.InferenceSession(r"E:\sach hoc\_models\latin_rec\rec.onnx", sess_options=so, providers=["CPUExecutionProvider"])
    dict_chars = open(r"E:\sach hoc\_models\latin_rec\dict.txt", encoding="utf-8").read().rstrip("\n").split("\n")

    def rec_batch(crops):
        batch = np.zeros((len(crops), 3, 48, 320), dtype=np.float32) - 1.0
        widths = []
        for i, crop in enumerate(crops):
            h, w = crop.shape[:2]
            rw = max(8, min(320, int(round(w * 48.0 / h / 8.0) * 8)))
            r = cv2.resize(crop, (rw, 48), interpolation=cv2.INTER_LINEAR).astype(np.float32) / 255.0 - 0.5
            batch[i, :, :, :rw] = np.transpose(r, (2, 0, 1))
            widths.append(rw)
        out = rec_sess.run(None, {rec_sess.get_inputs()[0].name: batch})[0]
        texts = []
        for o in out:
            idx = np.argmax(o, axis=1)
            prev = -2; chars = []
            for c in idx:
                if c == prev: continue
                prev = c
                if c == 0: continue          # blank
                if c == 503: chars.append(" ")  # space
                elif 1 <= c <= 502: chars.append(dict_chars[c - 1])
            texts.append("".join(chars).strip())
        return texts

    doc = fitz.open(BOOKS[args.book])
    n = len(doc); end = min(args.end, n)
    out_path = os.path.join(OUT_DIR, f"latin_{args.book}_{args.start}_{end}.json")
    pages_by_no = {}
    if os.path.exists(out_path):
        pages_by_no = {p["page"]: p for p in json.load(open(out_path, encoding="utf-8")).get("pages", [])}

    t0 = time.time()
    for pno in range(args.start - 1, end):
        pg = pno + 1
        if pg in pages_by_no: continue
        pix = doc[pno].get_pixmap(dpi=args.dpi)
        img = cv2.cvtColor(np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, pix.n), cv2.COLOR_RGB2BGR)
        try:
            boxes, _ = det(img)
            crops = []
            for box in boxes:
                xs = [p[0] for p in box]; ys = [p[1] for p in box]
                x0, y0, x1, y1 = int(min(xs)) - 2, int(min(ys)) - 2, int(max(xs)) + 2, int(max(ys)) + 2
                y0 = max(0, y0); x0 = max(0, x0); x1 = min(img.shape[1], x1); y1 = min(img.shape[0], y1)
                if x1 - x0 < 8 or y1 - y0 < 8: continue
                crops.append((x0, y0, x1, y1, img[y0:y1, x0:x1]))
            texts = []
            for i in range(0, len(crops), 8):
                texts += rec_batch([c[4] for c in crops[i:i+8]])
            lines = [{"x0": c[0], "y0": c[1], "x1": c[2], "y1": c[3], "t": t, "s": 1.0} for c, t in zip(crops, texts) if t]
            lines.sort(key=lambda L: (L["y0"] // 12, L["x0"]))
            pages_by_no[pg] = {"page": pg, "lines": lines}
        except Exception as e:
            pages_by_no[pg] = {"page": pg, "error": str(e)}
        if pg % 20 == 0 or pg == end:
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump({"book": args.book, "total": n, "pages": [pages_by_no[k] for k in sorted(pages_by_no)]}, f, ensure_ascii=False)
            el = time.time() - t0; done = len(pages_by_no)
            print(f"[{args.book} {args.start}-{end}] {done}/{end-args.start+1} ({el:.0f}s, {el/max(1,done):.1f}s/pg)", flush=True)
    print(f"DONE {args.book} {args.start}-{end}", flush=True)

if __name__ == "__main__":
    main()

