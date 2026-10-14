from PIL import Image
import os

os.makedirs("resources/test_page7", exist_ok=True)
img = Image.open("resources/pages/page_7.png")

# Page 7 items:
# Row 0: ABOLA, ANUCART GR, ANUCART -SP, BUILDOX
# Row 1: CHLORDIN, CROMA, CULTIWAR, EMATIN
# Row 2: FLUDON, INDIGO, INDIMITE, INDOX

col_bounds = [
    (90, 465),
    (495, 870),
    (900, 1275),
    (1305, 1680)
]

row_bounds = [
    (450, 930),
    (990, 1470),
    (1530, 2010)
]

# We can crop the package box (including the rounded border or pure package)
# Let's save both the card and the package area:
row0_names = ["abola", "anucart-gr", "anucart-sp", "buildox"]
row1_names = ["chlordin", "croma", "cultiwar", "ematin"]
row2_names = ["fludon", "indigo", "indimite", "indox"]
all_names = [row0_names, row1_names, row2_names]

for r_idx, row in enumerate(all_names):
    y1, y2 = row_bounds[r_idx]
    for c_idx, name in enumerate(row):
        x1, x2 = col_bounds[c_idx]
        card = img.crop((x1, y1, x2, y2))
        card.save(f"resources/test_page7/{name}_card.png")
        # Package only (top to just above the badge):
        pkg = img.crop((x1 + 8, y1 + 8, x2 - 8, y2 - 95))
        pkg.save(f"resources/test_page7/{name}_pkg.png")

print("Saved all 12 page 7 items to resources/test_page7")
