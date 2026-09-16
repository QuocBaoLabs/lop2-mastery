import json
d = json.load(open(r"E:\sach hoc\lop2-mastery-data\_tools\ocr_raw\math1_1_3.json", encoding="utf-8"))
for p in d["pages"]:
    print("=== page", p["page"])
    for L in p.get("lines", [])[:60]:
        print("y=%4d x=%4d s=%.2f | %s" % (L["y0"], L["x0"], L["s"], L["t"]))
