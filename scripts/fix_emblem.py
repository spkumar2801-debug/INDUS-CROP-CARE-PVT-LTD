from PIL import Image

logo = Image.open("public/images/branding/indus/indus-logo.png")
# Let's crop just the circular tree
emblem = logo.crop((20, 20, 260, 260))
emblem.save("public/images/branding/indus/indus-emblem.png")

# Transparent emblem
import numpy as np
arr = np.array(emblem.convert("RGBA"))
mask_white = (arr[:, :, 0] > 240) & (arr[:, :, 1] > 240) & (arr[:, :, 2] > 240)
arr[mask_white, 3] = 0
trans = Image.fromarray(arr, mode="RGBA")
trans.save("public/images/branding/indus/indus-emblem-transparent.png")
trans.resize((64, 64), Image.Resampling.LANCZOS).save("public/favicon.png")
trans.resize((32, 32), Image.Resampling.LANCZOS).save("public/favicon.ico")

print("Regenerated precise emblem and favicon!")
