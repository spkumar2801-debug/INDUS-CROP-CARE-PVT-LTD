from PIL import Image
import os

os.makedirs("resources/calibration", exist_ok=True)

# 4-col standard bounds (Pages 7, 8, 10, 12):
C4 = [
    (90, 465),
    (495, 870),
    (900, 1275),
    (1305, 1680)
]
R3 = [
    (450, 930),
    (990, 1470),
    (1530, 2010)
]

# Let's check Page 9:
# Row 0: 4 items (C4, R3[0])
# Row 1: 3 items. Let's see where they are centered.
# Width of card is 375.
# If 3 items are centered across 1728 width with gaps:
# Let's inspect page 9 directly:
p9 = Image.open("resources/pages/page_9.png")
# Let's crop a horizontal strip of row 1 (y: 990 to 1470)
p9_r1 = p9.crop((0, 950, 1728, 1500))
p9_r1.resize((864, 275)).save("resources/calibration/p9_r1.png")

# Page 13:
p13 = Image.open("resources/pages/page_13.png")
p13.resize((432, 597)).save("resources/calibration/p13_overview.png")

# Page 14:
p14 = Image.open("resources/pages/page_14.png")
p14.resize((432, 597)).save("resources/calibration/p14_overview.png")

# Page 15: (5 columns)
p15 = Image.open("resources/pages/page_15.png")
p15.resize((432, 597)).save("resources/calibration/p15_overview.png")

# Page 19:
p19 = Image.open("resources/pages/page_19.png")
p19.resize((432, 597)).save("resources/calibration/p19_overview.png")

print("Generated overview images for calibration.")
