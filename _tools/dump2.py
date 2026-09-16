import json
d = json.load(open(r"E:\sach hoc\lop2-mastery-data\_tools\ocr_raw\latin_math1_3_6.json", encoding="utf-8"))
for p in d["pages"]:
    print("=== pdf page", p["page"])
    for L in p.get("lines", []):
        print("%4d %4d | %s" % (L["y0"], L["x0"], L["t"]))
