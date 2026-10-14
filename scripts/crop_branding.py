from PIL import Image

p2 = Image.open("resources/page_2_hi_res.png")
w, h = p2.size
print(f"Page 2 size: {w}x{h}")

# The logo is in the top center
# Let's crop x: 500 to 1250, y: 100 to 450
logo = p2.crop((500, 100, 1230, 430))
logo.save("public/images/branding/indus/indus-logo.png")

# Also crop MD and Director photos from page 2!
# K. Narendranath Dut (MD)
md_photo = p2.crop((120, 120, 400, 450))
md_photo.save("public/images/branding/indus/md-narendranath-dut.png")

# K. Anoopkumar (Director Sales & Marketing)
dir_photo = p2.crop((1330, 120, 1610, 450))
dir_photo.save("public/images/branding/indus/director-anoopkumar.png")

print("Saved logo and leadership photos!")
