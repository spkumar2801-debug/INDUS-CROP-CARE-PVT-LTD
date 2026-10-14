from PIL import Image

img = Image.open("resources/page_7_hi_res.png")
w, h = img.size

# Let's crop ABOLA (col 0, row 0)
# In 1728x2391:
# Let's inspect rough positions:
# Margins: Left ~ 80, Right ~ 1648. Card width ~ 360, Card height ~ 480
crop1 = img.crop((85, 450, 470, 930)) # includes package and label
crop1.save("resources/test_abola_card.png")

# Also crop just the package without blue badge:
crop1_pkg = img.crop((95, 455, 460, 840))
crop1_pkg.save("resources/test_abola_pkg.png")

print("Saved test_abola_card.png and test_abola_pkg.png")
