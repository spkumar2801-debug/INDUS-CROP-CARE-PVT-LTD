import os
from PIL import Image

for f in sorted(os.listdir('public/images/products')):
    p = os.path.join('public/images/products', f)
    if os.path.isfile(p):
        with Image.open(p) as im:
            print(f"{f:20s}: {im.size[0]}x{im.size[1]} ({os.path.getsize(p)/1024:.1f} KB)")
