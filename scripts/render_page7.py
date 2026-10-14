import pymupdf
from PIL import Image

doc = pymupdf.open("resources/Product.pdf")
page = doc[6] # Page 7
# Render page at 4x scale (approx 288 DPI)
zoom = 4.0
mat = pymupdf.Matrix(zoom, zoom)
pix = page.get_pixmap(matrix=mat)
pix.save("resources/page_7_hi_res.png")
print(f"Page 7 rendered: {pix.width}x{pix.height}")
