import json
import os
from PIL import Image

with open('resources/indus_catalog_metadata.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from metadata.json")

# Let's inspect each product's imageUrl
low_res = []
high_res = []
missing = []

for p in products:
    code = p.get('code', 'N/A')
    name = p.get('name', 'N/A')
    cat = p.get('category', 'N/A')
    img_url = p.get('imageUrl', '')
    
    local_path = os.path.join('public', img_url.lstrip('/'))
    if os.path.isfile(local_path):
        with Image.open(local_path) as im:
            w, h = im.size
            size_kb = os.path.getsize(local_path) / 1024
            if w < 200 or h < 200:
                low_res.append((code, name, cat, img_url, w, h, size_kb))
            else:
                high_res.append((code, name, cat, img_url, w, h, size_kb))
    else:
        missing.append((code, name, cat, img_url))

print(f"Missing image files: {len(missing)}")
print(f"High-Res (>= 200px): {len(high_res)}")
print(f"Lower-Res (< 200px): {len(low_res)}")

if low_res:
    print("\n--- LOWER RES IMAGES ---")
    for item in low_res:
        print(f"[{item[0]}] {item[1]} ({item[2]}): {item[4]}x{item[5]} ({item[6]:.1f} KB) -> {item[3]}")
