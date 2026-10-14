from PIL import Image

img = Image.open("resources/pages/page_7.png")
# cultiwar is col 2 (900 to 1275), row 1 (990 to 1470)
x1, x2 = 900, 1275
y1, y2 = 990, 1470

pure = img.crop((x1 + 16, y1 + 16, x2 - 16, y2 - 96))
pure.save("resources/test_page7/cultiwar_pure.png")
print("Saved cultiwar_pure.png")
