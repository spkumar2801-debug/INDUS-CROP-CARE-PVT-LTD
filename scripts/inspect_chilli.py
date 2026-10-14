import os
from PIL import Image

# Let's inspect where the crop image is on ias-613-sheet.jpg
sheet_path = 'public/images/products/ias-613-sheet.jpg'
crop_path = 'public/images/products/ias-613.jpg'

sheet = Image.open(sheet_path)
crop = Image.open(crop_path)

print(f"Sheet size: {sheet.size}")
print(f"Current crop size: {crop.size}")

# Let's also check ias-603, ias-604, ias-611, ias-612
for code in ['603', '604', '611', '612', '613']:
    s = Image.open(f'public/images/products/ias-{code}-sheet.jpg')
    c = Image.open(f'public/images/products/ias-{code}.jpg')
    print(f"IAS {code}: sheet {s.size}, crop {c.size}")
