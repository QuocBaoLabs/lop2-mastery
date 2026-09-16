import sys
sys.path.insert(0, r"E:\sach hoc\.venv\Lib\site-packages")
import numpy as np, cv2
from paddleocr import PaddleOCR

ocr = PaddleOCR(
    text_detection_model_name=None,
    rec_model_dir=r"E:\sach hoc\_models\vi_rec_v6",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    device="cpu",
)
img = cv2.imread(r"E:\sach hoc\lop2-mastery-data\_tools\math1_p3.png")
crop = img[280:350, 540:1000]
res = ocr.predict(input=crop)
for r in res:
    print(r)
