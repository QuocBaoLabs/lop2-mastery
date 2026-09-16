import sys
sys.path.insert(0, r"E:\sach hoc\.venv\Lib\site-packages")
import fitz, numpy as np, onnxruntime as ort

pdf = r"C:\Users\BAO LION\Downloads\SGK - Toán 2 - Tập 1 - Chương trình mới.pdf"
doc = fitz.open(pdf)
for pno in [2,3]:
    page = doc[pno]
    pix = page.get_pixmap(dpi=200)
    pix.save(rf"E:\sach hoc\lop2-mastery-data\_tools\math1_p{pno+1}.png")
    print("saved page", pno+1, pix.width, "x", pix.height)
