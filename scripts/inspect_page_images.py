import pymupdf

doc = pymupdf.open("resources/Product.pdf")

# Inspect images on page 7 (0-indexed: page 6)
page7 = doc[6]
images = page7.get_images(full=True)
print(f"Page 7 has {len(images)} images.")
for i, img in enumerate(images[:15]):
    xref = img[0]
    base_image = doc.extract_image(xref)
    image_bytes = base_image["image"]
    image_ext = base_image["ext"]
    w = base_image["width"]
    h = base_image["height"]
    print(f"  Img {i+1} (xref {xref}): {w}x{h}, ext={image_ext}, size={len(image_bytes)} bytes")
