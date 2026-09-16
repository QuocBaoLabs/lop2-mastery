import json, re, os

OUT = r"E:\sach hoc\lop2-mastery-data\_tools\ocr_raw"

def scan(book, path):
    d = json.load(open(path, encoding="utf-8"))
    results = []
    for p in d["pages"]:
        pg = p["page"]
        for L in p.get("lines", []):
            t = L["t"].strip()
            if re.match(r"^[Bb]à[iI1l]\s*\d+", t) and len(t) < 80:
                results.append((pg, L["y0"], L["x0"], t))
            if re.match(r"^[Tt]u[aà]n\s*\d+", t) and len(t) < 80:
                results.append((pg, L["y0"], L["x0"], "TUAN>> " + t))
    return results

for book, path in [
    ("math1", OUT + r"\latin_math1_1_71.json"),
    ("math2", OUT + r"\latin_math2_1_71.json"),
    ("vie1", OUT + r"\latin_vie1_1_73.json"),
    ("vie2", OUT + r"\latin_vie2_1_73.json"),
]:
    if not os.path.exists(path): continue
    res = scan(book, path)
    print("=====", book, "=====")
    for pg, y, x, t in res:
        print("pdf p%3d y=%4d | %s" % (pg, y, t))
