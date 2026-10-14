import pymupdf as fitz
import sys

doc = fitz.open("resources/Product.pdf")
print(f"Total pages: {len(doc)}")

for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text().strip()
    image_list = page.get_images(full=True)
    print(f"Page {page_num + 1}: Rect={page.rect}, Images count={len(image_list)}, Text length={len(text)}")
    if text:
        first_few = text.replace('\n', ' ')[:100]
        print(f"   Text sample: {first_few}")
