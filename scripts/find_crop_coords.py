import os
import numpy as np
from PIL import Image

for code in ['603', '604', '611', '612', '613']:
    sheet_p = f'public/images/products/ias-{code}-sheet.jpg'
    crop_p = f'public/images/products/ias-{code}.jpg'
    
    sheet = np.array(Image.open(sheet_p).convert('RGB'))
    crop = np.array(Image.open(crop_p).convert('RGB'))
    
    # Template match to find exactly where crop was taken from
    sh, sw, _ = sheet.shape
    ch, cw, _ = crop.shape
    
    # Quick sample match
    best_diff = float('inf')
    best_pos = (0, 0)
    
    # check in top half
    for y in range(0, min(sh - ch, 500), 5):
        for x in range(0, min(sw - cw, 500), 5):
            diff = np.mean(np.abs(sheet[y:y+ch, x:x+cw] - crop))
            if diff < best_diff:
                best_diff = diff
                best_pos = (x, y)
                
    # refine
    bx, by = best_pos
    for y in range(max(0, by - 5), min(sh - ch, by + 6)):
        for x in range(max(0, bx - 5), min(sw - cw, bx + 6)):
            diff = np.mean(np.abs(sheet[y:y+ch, x:x+cw] - crop))
            if diff < best_diff:
                best_diff = diff
                best_pos = (x, y)
                
    print(f"IAS {code}: crop location on sheet is x={best_pos[0]}, y={best_pos[1]}, w={cw}, h={ch} (diff={best_diff:.2f})")
