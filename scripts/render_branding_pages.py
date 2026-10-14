import pymupdf
from PIL import Image

doc = pymupdf.open("resources/Product.pdf")

# Page 1 (Cover)
page1 = doc[0]
pix1 = page1.get_pixmap(matrix=pymupdf.Matrix(4.0, 4.0))
pix1.save("resources/page_1_hi_res.png")

# Page 2 (About Us with leadership)
page2 = doc[1]
pix2 = page2.get_pixmap(matrix=pymupdf.Matrix(4.0, 4.0))
pix2.save("resources/page_2_hi_res.png")

# Page 3 (Vision / Mission)
page3 = doc[2]
pix3 = page3.get_pixmap(matrix=pymupdf.Matrix(4.0, 4.0))
pix3.save("resources/page_3_hi_res.png")

# Page 20 (Back cover)
page20 = doc[19]
pix20 = page20.get_pixmap(matrix=pymupdf.Matrix(4.0, 4.0))
pix20.save("resources/page_20_hi_res.png")

print("Rendered pages 1, 2, 3, 20")
