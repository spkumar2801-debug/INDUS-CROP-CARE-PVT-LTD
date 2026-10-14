import json
import os
import re

meta_path = 'resources/indus_catalog_metadata.json'
with open(meta_path, 'r', encoding='utf-8') as f:
    metadata = json.load(f)

img_dir = 'public/images/indus-products'
existing_files = set(os.listdir(img_dir))

with open('src/data/indusProducts.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Extract imageUrl for each product from indusProducts.ts
# Match id and imageUrl
product_blocks = re.findall(r'\{\s*"id":\s*"([^"]+)",[\s\S]*?"imageUrl":\s*"([^"]+)",[\s\S]*?"sheetImageUrl":\s*"([^"]+)"', ts_content)

print(f"Total product blocks extracted from indusProducts.ts: {len(product_blocks)}")

missing_main_imgs = []
missing_sheets = []
verified_count = 0

for pid, img_url, sheet_url in product_blocks:
    # strip leading / and prepend public
    local_img = os.path.join('public', img_url.lstrip('/'))
    local_sheet = os.path.join('public', sheet_url.lstrip('/'))
    
    img_exists = os.path.isfile(local_img)
    sheet_exists = os.path.isfile(local_sheet)
    
    if not img_exists:
        missing_main_imgs.append((pid, img_url))
    if not sheet_exists:
        missing_sheets.append((pid, sheet_url))
    if img_exists and sheet_exists:
        verified_count += 1

print(f"Verified products with BOTH main image & sheet image existing on disk: {verified_count}")
print(f"Missing main images: {len(missing_main_imgs)}")
if missing_main_imgs:
    for m in missing_main_imgs[:10]:
        print("  Missing main:", m)

print(f"Missing sheets: {len(missing_sheets)}")
if missing_sheets:
    for s in missing_sheets[:10]:
        print("  Missing sheet:", s)
