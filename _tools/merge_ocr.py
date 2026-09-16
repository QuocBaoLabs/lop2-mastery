import json, os, glob, re

OUT = r"E:\sach hoc\lop2-mastery-data\_tools\ocr_raw"
BOOKS = ["math1", "math2", "vie1", "vie2"]

def merge(book):
    latin = {}
    vi = {}
    for f in glob.glob(os.path.join(OUT, f"latin_{book}_*.json")):
        d = json.load(open(f, encoding="utf-8"))
        for p in d.get("pages", []):
            latin[p["page"]] = p.get("lines", [])
    for f in glob.glob(os.path.join(OUT, f"vi_{book}_*.json")):
        d = json.load(open(f, encoding="utf-8"))
        for p in d.get("pages", []):
            vi[p["page"]] = p.get("lines", [])
    total = max(list(latin.keys()) + list(vi.keys()) + [0])
    pages = []
    for pg in range(1, total + 1):
        L, V = latin.get(pg, []), vi.get(pg, [])
        by_key = {}
        for l in L:
            by_key[(l["y0"], l["x0"])] = {"box": l, "latin": l["t"], "vi": None}
        for v in V:
            key = None
            for (y0, x0) in by_key:
                if abs(y0 - v["y0"]) <= 6 and abs(x0 - v["x0"]) <= 6:
                    key = (y0, x0); break
            if key is None:
                by_key[(v["y0"], v["x0"])] = {"box": v, "latin": None, "vi": v["t"]}
            else:
                by_key[key]["vi"] = v["t"]
        lines = []
        for k in sorted(by_key):
            item = by_key[k]
            txt = item["vi"] if item["vi"] else item["latin"]
            if not txt: continue
            lines.append({"y0": item["box"]["y0"], "x0": item["box"]["x0"], "t": txt,
                          "latin": item["latin"], "vi": item["vi"]})
        pages.append({"page": pg, "lines": lines})
    with open(os.path.join(OUT, f"merged_{book}.json"), "w", encoding="utf-8") as f:
        json.dump({"book": book, "total": total, "pages": pages}, f, ensure_ascii=False)
    # plain text dump
    txt_path = os.path.join(OUT, f"merged_{book}.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        for p in pages:
            f.write(f"\n===== {book} PDF page {p['page']} =====\n")
            for l in p["lines"]:
                f.write(l["t"] + "\n")
    print(book, total, "pages ->", txt_path)

if __name__ == "__main__":
    for b in BOOKS:
        merge(b)
