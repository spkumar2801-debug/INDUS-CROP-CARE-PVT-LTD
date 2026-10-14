import json
import os
import re
from PIL import Image

with open('src/data/indusProducts.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Find start of INDUS_CATALOG_PRODUCTS array
anchor = ts_content.find('INDUS_CATALOG_PRODUCTS')
eq = ts_content.find('=', anchor) if anchor != -1 else -1
start = ts_content.find('[', eq) if eq != -1 else -1
end = ts_content.rfind(']')
if start != -1 and end != -1:
    json_str = ts_content[start:end+1]
    # Remove any trailing commas before } or ]
    json_str = re.sub(r',\s*([\}\]])', r'\1', json_str)
    products = json.loads(json_str)
    print(f"Successfully parsed {len(products)} products from indusProducts.ts")

    low_res = []
    high_res = []
    
    # Check all available image files in directory
    all_files = set(os.listdir('public/images/indus-products'))

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
            print(f"FILE MISSING: {local_path} for product {code} {name}")

    print(f"Sharp / Good Resolution (>=200px): {len(high_res)}")
    print(f"Small / Lower Resolution (<200px): {len(low_res)}")
    
    if low_res:
        print("\n--- PRODUCTS WITH RESOLUTION < 200px ---")
        for item in low_res:
            print(f"[{item[0]}] {item[1]} ({item[2]}): {item[4]}x{item[5]} ({item[6]:.1f} KB) -> {item[3]}")
