import os
import re
from PIL import Image

with open('src/data/indusProducts.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

product_blocks = re.findall(r'\{\s*"id":\s*"([^"]+)",[\s\S]*?"code":\s*"([^"]+)",[\s\S]*?"name":\s*"([^"]+)",[\s\S]*?"category":\s*"([^"]+)",[\s\S]*?"imageUrl":\s*"([^"]+)"', ts_content)

print(f"Auditing {len(product_blocks)} products for image resolution and sharpness...\n")

low_res = []
high_res = []
for pid, code, name, cat, img_url in product_blocks:
    local_path = os.path.join('public', img_url.lstrip('/'))
    if os.path.isfile(local_path):
        try:
            with Image.open(local_path) as im:
                w, h = im.size
                size_kb = os.path.getsize(local_path) / 1024
                if w < 250 or h < 250:
                    low_res.append((code, name, cat, img_url, w, h, size_kb))
                else:
                    high_res.append((code, name, cat, img_url, w, h, size_kb))
        except Exception as e:
            print(f"Error opening {local_path}: {e}")

print(f"High-Res / Sharp Images (>=250px): {len(high_res)}")
print(f"Lower-Res Images (<250px): {len(low_res)}")

if low_res:
    print("\n--- LOWER-RES IMAGES (investigating if master exists) ---")
    for item in low_res:
        print(f"[{item[0]}] {item[1]} ({item[2]}): {item[4]}x{item[5]} ({item[6]:.1f} KB) -> {item[3]}")
