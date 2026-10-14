from PIL import Image

p1 = Image.open("resources/page_1_hi_res.png")
# The circular farmer image is in the center
# p1 is 1728 x 2391
# Y: from ~ 300 to ~ 1850, X: from ~ 100 to ~ 1628
hero = p1.crop((90, 280, 1638, 1828))
hero.save("public/images/branding/indus/indus-hero-circle.png")

# Also crop certification badges from bottom of page 1:
# Y: 2150 to 2350
certs = p1.crop((70, 2180, 1658, 2360))
certs.save("public/images/branding/indus/certifications-bar.png")

# Also crop contact banner from resources/indus-contact-banner.jpeg
contact_banner = Image.open("resources/indus-contact-banner.jpeg")
contact_banner.save("public/images/branding/indus/contact-official-banner.jpg")

print("Cropped hero, certs, and saved contact banner!")
