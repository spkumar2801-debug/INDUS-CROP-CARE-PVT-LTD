import os
import json
import re

PRODUCTS_DIR = r"C:\Users\HP\Downloads\Pesticides\PRODUCTS"

# Master images in Downloads
downloads_map = {}
for root, dirs, files in os.walk(PRODUCTS_DIR):
    for f in files:
        if f.lower().endswith(('.jpg', '.jpeg', '.png')):
            base = os.path.splitext(f)[0].upper().replace('-', ' ').replace('_', ' ')
            base = re.sub(r'\s+', ' ', base).strip()
            downloads_map[base] = (os.path.join(root, f), f, os.path.basename(root))

meta_file = r"c:\Users\HP\Desktop\INDAS AGRI PVT  LMT\resources\indus_catalog_metadata.json"
with open(meta_file, "r", encoding="utf-8") as fp:
    products = json.load(fp)

matched = []
unmatched = []

for p in products:
    name = p["name"]
    code = p["code"]
    slug = p["slug"]
    cat = p["category"]
    
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
        matched.append((code, name, cat, slug, file_info))
    else:
        unmatched.append((code, name, cat, slug))

print(f"Total Catalogue Products: {len(products)}")
print(f"Matched with Master High-Res Images: {len(matched)}")
print(f"Remaining (Pages 14-19: Fertilizers, Micronutrients, Bio-stimulants, Bio-fertilizers, Antibiotics): {len(unmatched)}")

print("\n--- MATCHED PRODUCTS ---")
for code, name, cat, slug, (fpath, fname, folder) in matched:
    print(f"[{code}] {name:20s} ({cat:16s}) -> {fname} [{folder}]")
