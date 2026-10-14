import os
from PIL import Image

# Let's save a visual breakdown of ias-613-sheet.jpg and ias-613.jpg
sheet = Image.open('public/images/products/ias-613-sheet.jpg')
crop = Image.open('public/images/products/ias-613.jpg')

print(f"Sheet size: {sheet.size}, crop size: {crop.size}")

# Let's check where the photo box is on the sheet
# On the seed spec sheets (like ias-613-sheet.jpg), where is the photograph?
# Usually on the left side or top left!
# Let's crop candidate regions from ias-613-sheet.jpg and save them to examine:
os.makedirs('resources/calibration', exist_ok=True)
# Region 1: top left
sheet.crop((30, 150, 310, 390)).save('resources/calibration/ias-613-region1.jpg')
# Region 2: check existing crop
crop.save('resources/calibration/ias-613-existing.jpg')

print("Saved candidate crops.")
