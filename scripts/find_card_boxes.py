from PIL import Image
import numpy as np

def find_cards_on_page(page_num):
    img = Image.open(f"resources/pages/page_{page_num}.png").convert("RGB")
    arr = np.array(img)
    H, W, _ = arr.shape
    
    # In each page, the cards have a dark outline border (~ RGB [40, 40, 40] or [60, 60, 60])
    # Let's find pixels where brightness is low (< 100) or where badge is colored
    # Or let's inspect where cards are located by looking at the white interior (#FFFFFF)
    # Inside the card is pure white (255, 255, 255), while page background has blue/tint
    is_pure_white = (arr[:, :, 0] > 250) & (arr[:, :, 1] > 250) & (arr[:, :, 2] > 250)
    
    # Row projection of white pixels
    white_row_count = np.sum(is_pure_white[300:2100, :], axis=1)
    
    print(f"Page {page_num}: H={H}, W={W}")

for p in range(7, 20):
    find_cards_on_page(p)
