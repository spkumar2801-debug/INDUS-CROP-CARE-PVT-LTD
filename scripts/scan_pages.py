from PIL import Image
import numpy as np

def scan_page_cards(page_num):
    img = Image.open(f"resources/pages/page_{page_num}.png").convert("RGB")
    arr = np.array(img)
    # Cards have dark borders and colored badges
    print(f"--- Page {page_num} scan ---")
    # We can inspect rows with badges (saturated colors)
    # Blue badge hue/color: typically R < 50, G ~ 100-150, B > 180 (for insecticides)
    # Or Herbicide badge: Red R > 180, G < 50, B < 50
    # Fungicide: Green R < 50, G > 100, B < 50
    # Let's find horizontal lines where borders or badges exist
    return img.size

for p in [9, 11, 13, 14, 15, 16, 17, 18, 19]:
    scan_page_cards(p)
