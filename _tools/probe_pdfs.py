import sys, os, json
from pypdf import PdfReader

PDFS = {
 "math1": r"C:\Users\BAO LION\Downloads\SGK - Toán 2 - Tập 1 - Chương trình mới.pdf",
 "math2": r"C:\Users\BAO LION\Downloads\SGK - Toán 2 - Tập 2 - Chương trình mới.pdf",
 "vie1": r"C:\Users\BAO LION\Downloads\Tieng-Viet-2-Tap-1-Ket-noi-tri-thuc-voi-cuoc-song.pdf",
 "vie2": r"C:\Users\BAO LION\Downloads\sach-giao-khoa-sgk-tieng-viet-2-tap-lop-2-ket-noi-tri-thuc-45.pdf",
}
out = {}
for key, path in PDFS.items():
    r = PdfReader(path)
    n = len(r.pages)
    texts = []
    for i in [0,1,2, n//2, n-1]:
        try:
            t = r.pages[i].extract_text() or ""
        except Exception as e:
            t = f"<ERROR {e}>"
        texts.append((i+1, len(t), (t[:150].replace(chr(10)," | ") if t else "<EMPTY>")))
    out[key] = {"pages": n, "samples": texts}
    print(f"== {key}: {n} pages, file={os.path.getsize(path)//1024//1024}MB")
    for i, ln, s in texts:
        print(f"   p{i}: {ln} chars -> {s}")
json.dump(out, open(r"E:\sach hoc\lop2-mastery-data\_tools\pdf_probe.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
