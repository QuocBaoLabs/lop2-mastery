import sys, os, json, time, argparse
sys.path.insert(0, r"E:\sach hoc\.venv\Lib\site-packages")
import numpy as np, cv2, fitz
cv2.setNumThreads(1)
from paddle import inference

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
    ap.add_argument("--threads", type=int, default=2)
    args = ap.parse_args()
    os.environ["OMP_NUM_THREADS"] = str(args.threads)
    os.environ["MKL_NUM_THREADS"] = str(args.threads)

    latin_path = os.path.join(OUT_DIR, f"latin_{args.book}_{args.start}_{args.end}.json")
    boxes_by_page = {}
    if os.path.exists(latin_path):
        d = json.load(open(latin_path, encoding="utf-8"))
        boxes_by_page = {p["page"]: p.get("lines", []) for p in d.get("pages", [])}

    out_path = os.path.join(OUT_DIR, f"vi_{args.book}_{args.start}_{args.end}.json")
    pages_by_no = {}
    if os.path.exists(out_path):
        pages_by_no = {p["page"]: p for p in json.load(open(out_path, encoding="utf-8")).get("pages", [])}

    cfg = inference.Config(r"E:\sach hoc\_models\vi_rec_v6\inference.json", r"E:\sach hoc\_models\vi_rec_v6\inference.pdiparams")
    cfg.disable_gpu(); cfg.set_cpu_math_library_num_threads(args.threads); cfg.disable_glog_info()
    predictor = inference.create_predictor(cfg)
    keys = open(r"E:\sach hoc\_models\vi_rec_v6\ppocr_keys.txt", encoding="utf-8").read().rstrip("\n").split("\n")

    def rec_batch(crops):
        batch = np.zeros((len(crops), 3, 48, 640), dtype=np.float32) - 1.0
        for i, crop in enumerate(crops):
            h, w = crop.shape[:2]
            rw = max(8, min(640, int(round(w * 48.0 / h))))
            r = cv2.resize(crop, (rw, 48), interpolation=cv2.INTER_CUBIC).astype(np.float32) / 127.5 - 1.0
            batch[i, :, :, :rw] = np.transpose(r, (2, 0, 1))
        predictor.get_input_handle("x").copy_from_cpu(batch)
        predictor.run()
        out = predictor.get_output_handle("fetch_name_0").copy_to_cpu()
        texts = []
        for o in out:
            idx = np.argmax(o, axis=1)
            prev = -1; chars = []
            for c in idx:
                if c == prev: continue
                prev = c
                if c < len(keys): chars.append(keys[c])
            texts.append("".join(chars).strip())
        return texts

    doc = fitz.open(BOOKS[args.book])
    t0 = time.time()
    done = 0
    for pg in sorted(boxes_by_page.keys()):
        if pg in pages_by_no: continue
        if pg < args.start or pg > args.end: continue
        lines = boxes_by_page[pg]
        if not lines: continue
        pix = doc[pg - 1].get_pixmap(dpi=150)
        img = cv2.cvtColor(np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, pix.n), cv2.COLOR_RGB2BGR)
        boxes = []
        seen = []
        for L in lines:
            x0, y0, x1, y1 = L["x0"], L["y0"], L["x1"], L["y1"]
            x0 = max(0, x0 - 2); y0 = max(0, y0 - 2); x1 = min(img.shape[1], x1 + 2); y1 = min(img.shape[0], y1 + 2)
            if x1 - x0 < 8 or y1 - y0 < 8: continue
            boxes.append((x0, y0, x1, y1, img[y0:y1, x0:x1]))
        texts = []
        for i in range(0, len(boxes), 4):
            texts += rec_batch([b[4] for b in boxes[i:i+4]])
        out_lines = [{"x0": b[0], "y0": b[1], "x1": b[2], "y1": b[3], "t": t, "s": 1.0} for b, t in zip(boxes, texts) if t]
        out_lines.sort(key=lambda L: (L["y0"] // 12, L["x0"]))
        pages_by_no[pg] = {"page": pg, "lines": out_lines}
        done += 1
        if done % 10 == 0 or pg == args.end:
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump({"book": args.book, "total": len(boxes_by_page), "pages": [pages_by_no[k] for k in sorted(pages_by_no)]}, f, ensure_ascii=False)
            el = time.time() - t0
            print(f"[vi {args.book} {args.start}-{args.end}] {done}/{len(boxes_by_page)} ({el:.0f}s, {el/max(1,done):.1f}s/pg)", flush=True)
    print(f"DONE vi {args.book} {args.start}-{args.end}", flush=True)

if __name__ == "__main__":
    main()

