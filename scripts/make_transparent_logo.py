from PIL import Image
import numpy as np

# Load indus logo
logo = Image.open("public/images/branding/indus/indus-logo.png").convert("RGBA")
arr = np.array(logo)

# Crop emblem only (the circular tree)
# Looking at logo size:
W, H = logo.size
# Emblem is on the left
emblem = logo.crop((0, 0, int(H * 1.1), H))
emblem.save("public/images/branding/indus/indus-emblem.png")

# Create transparent version of logo
# Pixels that are near pure white (R>245, G>245, B>245) become transparent
r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
mask_white = (r > 245) & (g > 245) & (b > 245)
arr[mask_white, 3] = 0

trans_logo = Image.fromarray(arr, mode="RGBA")
trans_logo.save("public/images/branding/indus/indus-logo-transparent.png")

# Also create transparent emblem for favicon
emblem_arr = np.array(emblem)
er, eg, eb, ea = emblem_arr[:, :, 0], emblem_arr[:, :, 1], emblem_arr[:, :, 2], emblem_arr[:, :, 3]
emblem_mask_white = (er > 245) & (eg > 245) & (eb > 245)
emblem_arr[emblem_mask_white, 3] = 0
trans_emblem = Image.fromarray(emblem_arr, mode="RGBA")
trans_emblem.save("public/images/branding/indus/indus-emblem-transparent.png")

# Favicon 64x64 and 32x32
fav = trans_emblem.resize((64, 64), Image.Resampling.LANCZOS)
fav.save("public/images/branding/indus/favicon-64.png")

print("Created transparent logo, emblem, and favicon!")
