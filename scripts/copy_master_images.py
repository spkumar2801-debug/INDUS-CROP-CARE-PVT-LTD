import os
import json
import re
from PIL import Image

PRODUCTS_DIR = r"C:\Users\HP\Downloads\Pesticides\PRODUCTS"
TARGET_DIR = r"c:\Users\HP\Desktop\INDAS AGRI PVT  LMT\public\images\indus-products"

downloads_map = {}
for root, dirs, files in os.walk(PRODUCTS_DIR):
    for f in files:
        if f.lower().endswith(('.jpg', '.jpeg', '.png')):
            base = os.path.splitext(f)[0].upper().replace('-', ' ').replace('_', ' ')
            base = re.sub(r'\s+', ' ', base).strip()
            downloads_map[base] = (os.path.join(root, f), f)

meta_file = r"c:\Users\HP\Desktop\INDAS AGRI PVT  LMT\resources\indus_catalog_metadata.json"
with open(meta_file, "r", encoding="utf-8") as fp:
    products = json.load(fp)

processed = []
for p in products:
    name = p["name"]
    code = p["code"]
    slug = p["slug"]
    
    norm_name = name.upper().replace('-', ' ').replace('_', ' ')
    norm_name = re.sub(r'\s+', ' ', norm_name).strip()
    
    file_info = None
    if norm_name in downloads_map:
        file_info = downloads_map[norm_name]
    elif norm_name.replace("INDUS ", "") in downloads_map:
        file_info = downloads_map[norm_name.replace("INDUS ", "")]
    elif "INDUS " + norm_name in downloads_map:
        file_info = downloads_map["INDUS " + norm_name]
    elif norm_name == "GABBARKING" and "GABBERKING" in downloads_map:
        file_info = downloads_map["GABBERKING"]
    elif norm_name == "NEXAZEN" and "NEXAGEN" in downloads_map:
        file_info = downloads_map["NEXAGEN"]
    elif norm_name == "NEOPOLICE" and "NEO POLICE" in downloads_map:
        file_info = downloads_map["NEO POLICE"]
        
    if file_info:
        src_path, src_fname = file_info
        dest_filename = f"{slug}.png"
        dest_path = os.path.join(TARGET_DIR, dest_filename)
        
        with Image.open(src_path) as im:
            # Convert RGB if needed
            if im.mode != "RGB":
                im = im.convert("RGB")
            # Save crisp PNG
            im.save(dest_path, "PNG", optimize=True)
            w, h = im.size
            
        processed.append({
            "code": code,
            "name": name,
            "slug": slug,
            "source_file": src_fname,
            "dest_file": dest_filename,
            "resolution": f"{w}x{h}"
        })

print(f"Successfully processed and replaced {len(processed)} master packaging images!")
with open(r"c:\Users\HP\Desktop\INDAS AGRI PVT  LMT\resources\processed_master_images.json", "w", encoding="utf-8") as fp:
    json.dump(processed, fp, indent=2)

for item in processed[:10]:
    print(f"[{item['code']}] {item['name']} -> {item['dest_file']} ({item['resolution']})")
