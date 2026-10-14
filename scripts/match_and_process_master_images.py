import os
import re
from PIL import Image

PRODUCTS_DIR = r"C:\Users\HP\Downloads\Pesticides\PRODUCTS"
TARGET_DIR = r"c:\Users\HP\Desktop\INDAS AGRI PVT  LMT\public\images\indus-products"
os.makedirs(TARGET_DIR, exist_ok=True)

# Walk PRODUCTS_DIR and find all images
found_files = []
for root, dirs, files in os.walk(PRODUCTS_DIR):
    for f in files:
        if f.lower().endswith(('.jpg', '.jpeg', '.png')):
            full_path = os.path.join(root, f)
            rel_folder = os.path.basename(root)
            found_files.append((rel_folder, f, full_path))

print(f"Total master images found in Downloads: {len(found_files)}")

# Map file base names to clean product slugs
def normalize_name(n):
    # Remove extension
    base = os.path.splitext(n)[0].upper()
    # Replace symbols
    base = base.replace("-", " ").replace("_", " ")
    base = re.sub(r'\s+', ' ', base).strip()
    return base

mapping = []
for folder, fname, fpath in found_files:
    norm = normalize_name(fname)
    with Image.open(fpath) as im:
        w, h = im.size
    mapping.append({
        "folder": folder,
        "filename": fname,
        "normalized": norm,
        "path": fpath,
        "dimensions": f"{w}x{h}"
    })

for m in sorted(mapping, key=lambda x: (x["folder"], x["normalized"])):
    print(f"[{m['folder']}] {m['filename']} -> {m['normalized']} ({m['dimensions']})")
