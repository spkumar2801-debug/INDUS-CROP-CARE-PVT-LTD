import os
import pymupdf

os.makedirs("resources/pages", exist_ok=True)
doc = pymupdf.open("resources/Product.pdf")

for page_idx in range(6, 19): # pages 7 through 19 (0-indexed: 6 to 18)
    page_num = page_idx + 1
    page = doc[page_idx]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(4.0, 4.0))
    out_path = f"resources/pages/page_{page_num}.png"
    pix.save(out_path)
    print(f"Page {page_num} saved: {pix.width}x{pix.height}")
