import os
import json
from PIL import Image

output_img_dir = "public/images/indus-products"
os.makedirs(output_img_dir, exist_ok=True)

# 4-column standard bounds
C4 = [(90, 465), (495, 870), (900, 1275), (1305, 1680)]
R3 = [(450, 930), (990, 1470), (1530, 2010)]

# 5-column bounds for Page 15
C5 = [(88, 396), (412, 720), (736, 1044), (1060, 1368), (1384, 1692)]

def make_slug(name: str) -> str:
    cleaned = name.lower().strip()
    if cleaned.startswith("indus "):
        sub = cleaned[6:].strip()
    elif cleaned.startswith("indus-"):
        sub = cleaned[6:].strip()
    elif cleaned.startswith("indus"):
        sub = cleaned[5:].strip()
    else:
        sub = cleaned
    
    slug_part = sub.replace(" ", "-").replace("%", "").replace("/", "-").replace(":", "-").replace("(", "").replace(")", "").replace("+", "-")
    while "--" in slug_part:
        slug_part = slug_part.replace("--", "-")
    return f"indus-{slug_part}".strip("-")

products_meta = []

# PAGE 7: 12 Insecticides
p7_names = [
    ("ABOLA", "Diafenthiuron 50% WP"),
    ("ANUCART GR", "Cartap Hydrochloride 4% GR"),
    ("ANUCART-SP", "Cartap Hydrochloride 50% SP"),
    ("BUILDOX", "Novaluron 10% EC For Indigenous Manufacture"),
    ("CHLORDIN", "Chlorpyriphos 50% EC"),
    ("CROMA", "Dinotefuran 20% SG"),
    ("CULTIWAR", "Profenofos 40% + Cypermethrin 4% EC"),
    ("EMATIN", "Emamectin Benzoate 5% SG"),
    ("FLUDON", "Flubendiamide 20% WG"),
    ("INDIGO", "Spiromesifen 22.9% SC"),
    ("INDIMITE", "Propargite 57% EC"),
    ("INDOX", "Novaluron 5.25% + Indoxacarb 4.5% W/W SC"),
]
for idx, (name, form) in enumerate(p7_names):
    r, c = idx // 4, idx % 4
    x1, x2 = C4[c]
    y1, y2 = R3[r]
    products_meta.append((7, name, "Insecticides", form, make_slug(name), (x1, y1, x2, y2)))

# PAGE 8: 12 Insecticides
p8_names = [
    ("INDUS 505", "Chlorpyriphos 50% + Cypermethrin 5% EC"),
    ("INDUS-369", "Diafenthiuron 47% + Bifenthrin 9.4% SC"),
    ("INTRON", "Thiamethoxam 12.6% + Lambda-Cyhalothrin 9.5% ZC"),
    ("LUXOR", "Chlorantraniliprole 9.3% + Lambda-Cyhalothrin 4.6% ZC"),
    ("MAKUTA", "Chlorantraniliprole 0.4% W/W GR"),
    ("NAYARA", "Cyantraniliprole 10.26% W/W OD"),
    ("NEOPOLICE", "Fipronil 40% + Imidacloprid 40% WG"),
    ("NEXAZEN", "Chlorantraniliprole 18.5% SC"),
    ("RAAFEL GR", "Fipronil 0.6% W/W GR"),
    ("RAAFEL SC", "Fipronil 5% SC"),
    ("RAFTAR", "Dinotefuran 15% + Pymetrozine 45% WG"),
    ("SPARX", "Acetamiprid 20% SP"),
]
for idx, (name, form) in enumerate(p8_names):
    r, c = idx // 4, idx % 4
    x1, x2 = C4[c]
    y1, y2 = R3[r]
    products_meta.append((8, name, "Insecticides", form, make_slug(name), (x1, y1, x2, y2)))

# PAGE 9: 7 Insecticides
p9_row0 = [
    ("STERLING", "Tolfenpyrad 15% EC"),
    ("TRADER", "Spinosad 45% SC"),
    ("LAMBA", "Lambda Cyhalothrin 5% EC"),
    ("POWERMAX", "Pymetrozine 50% WG"),
]
for c, (name, form) in enumerate(p9_row0):
    x1, x2 = C4[c]
    y1, y2 = R3[0]
    products_meta.append((9, name, "Insecticides", form, make_slug(name), (x1, y1, x2, y2)))

p9_row1 = [
    ("INDON 3G", "Carbosulfan 3% CG", (130, 990, 505, 1470)),
    ("BARAZZ", "Novaluron 5.25% + Emamectin Benzoate 0.9% SC", (676, 990, 1051, 1470)),
    ("ADVANT", "Indoxacarb 14.5% SC", (1222, 990, 1597, 1470)),
]
for name, form, box in p9_row1:
    products_meta.append((9, name, "Insecticides", form, make_slug(name), box))

# PAGE 10: 12 Herbicides
p10_names = [
    ("DUNLOP", "Topramezone 336 G/L SC"),
    ("ELIXIR", "Atrazine 50% WP"),
    ("ERODE", "Pretilachlor 6.0% + Pyrazosulfuron Ethyl 0.15% GR"),
    ("HITMAX", "Pyrithiobac Sodium 10% EC"),
    ("INDISUPER", "Quizalofop Ethyl 10% EC"),
    ("INDUS PLUS", "Pendimethalin 37.8% CS"),
    ("INDUS XTRA", "Mesotrione 2.27% + Atrazine 22.7% SC"),
    ("JASMINE", "Ammonium Salt of Glyphosate 71% SG"),
    ("LOMBARAD", "Tembotrione 34.4% W/W SC"),
    ("NEO GOLD", "Bispyribac Sodium 10% SC"),
    ("PARAQUEEN", "Paraquat Dichloride 24% SL"),
    ("PERSIST", "Imazethapyr 10% SL"),
]
for idx, (name, form) in enumerate(p10_names):
    r, c = idx // 4, idx % 4
    x1, x2 = C4[c]
    y1, y2 = R3[r]
    products_meta.append((10, name, "Herbicides", form, make_slug(name), (x1, y1, x2, y2)))

# PAGE 11: 5 Herbicides
p11_row0 = [
    ("POWER PLUS", "Glufosinate Ammonium 13.5% W/W SL"),
    ("PRE-GUARD", "Pretilachlor 50% EC"),
    ("ULTRAFAST", "Glyphosate 41% SL"),
    ("VIVANTA", "Penoxsulam 1.02% + Cyhalofop-Butyl 5.1% OD"),
]
for c, (name, form) in enumerate(p11_row0):
    x1, x2 = C4[c]
    y1, y2 = R3[0]
    products_meta.append((11, name, "Herbicides", form, make_slug(name), (x1, y1, x2, y2)))

products_meta.append((11, "PENOXX", "Herbicides", "Penoxsulam 2.67% OD", make_slug("PENOXX"), (C4[0][0], R3[1][0], C4[0][1], R3[1][1])))

# PAGE 12: 12 Fungicides
p12_names = [
    ("AGRISOL", "Sulphur 80% WP"),
    ("CYZOLE", "Tricyclazole 75% WP"),
    ("EXPLORE", "Tricyclazole 18% + Mancozeb 62% WP"),
    ("FALCON", "Propiconazole 25% EC"),
    ("INDUS-ONE", "Isoprothiolane 40% EC"),
    ("MANKEB", "Carbendazim 12% + Mancozeb 63% WP"),
    ("MELUHA", "Azoxystrobin 11% + Tebuconazole 18.3% W/W SC"),
    ("RYDER", "Thiophanate Methyl 70% WP"),
    ("SENSOR", "Picoxystrobin 6.78% + Tricyclazole 20.33% W/W SC"),
    ("SHOGUN", "Thifluzamide 24% SC"),
    ("STOPEX", "Copper Oxychloride 50% WP"),
    ("SULFIRE", "Sulphur 80% WDG"),
]
for idx, (name, form) in enumerate(p12_names):
    r, c = idx // 4, idx % 4
    x1, x2 = C4[c]
    y1, y2 = R3[r]
    products_meta.append((12, name, "Fungicides", form, make_slug(name), (x1, y1, x2, y2)))

# PAGE 13: 2 Fungicides + 1 PGR
products_meta.append((13, "TESLA", "Fungicides", "Tebuconazole 10% + Sulphur 65% WG", make_slug("TESLA"), (C4[0][0], R3[0][0], C4[0][1], R3[0][1])))
products_meta.append((13, "HEXADUS", "Fungicides", "Hexaconazole 5% SC", make_slug("HEXADUS"), (C4[1][0], R3[0][0], C4[1][1], R3[0][1])))
products_meta.append((13, "GABBARKING", "Plant Growth Regulator", "Gibberellic Acid 0.001% L", make_slug("GABBARKING"), (C4[0][0], 1320, C4[0][1], 1800)))

# PAGE 14: 5 Organic Fertilizers
p14_row0 = [
    ("GROFUL PROM", "Organic DAP (Phosphorus-Rich Organic Manure)"),
    ("INSTA", "Organic-Potash"),
    ("CORYZE", "Organic Water Soluble Fertilizer"),
    ("INDUS AMULYA", "Neem High / Amulya Neem Cake"),
]
for c, (name, form) in enumerate(p14_row0):
    x1, x2 = C4[c]
    y1, y2 = R3[0]
    products_meta.append((14, name, "Organic Fertilizers", form, make_slug(name), (x1, y1, x2, y2)))

products_meta.append((14, "INDUS GOLD", "Organic Fertilizers", "City Compost / Organic Fertilizer", make_slug("INDUS GOLD"), (C4[0][0], R3[1][0], C4[0][1], R3[1][1])))

# PAGE 15: 14 Micro Nutrients
p15_row0 = [
    ("FERMAXX", "Formula-1 (for all crop)"),
    ("FOSTER", "Chelated with Biostimulants"),
    ("INDUS BHUVIJA", "Paddy Special Formula-7"),
    ("INDUS ZINC 12%", "Chelated Zinc 12%"),
    ("TRISHUL", "CMS- Soil Conditioner"),
]
for c, (name, form) in enumerate(p15_row0):
    x1, x2 = C5[c]
    y1, y2 = R3[0]
    products_meta.append((15, name, "Micro Nutrient", form, make_slug(name), (x1, y1, x2, y2)))

p15_row1 = [
    ("HI-ZINK GR 33%", "Zinc Monohydrate 33% (9+1)"),
    ("INDUS MAG", "Magnesium Sulphate 9.6%"),
    ("INDUS BORON", "Boron 20%"),
    ("INDUS BORON-14.5%", "Boron-14.5%"),
    ("HIKER", "Potassium Schoenite"),
]
for c, (name, form) in enumerate(p15_row1):
    x1, x2 = C5[c]
    y1, y2 = R3[1]
    products_meta.append((15, name, "Micro Nutrient", form, make_slug(name), (x1, y1, x2, y2)))

p15_row2 = [
    ("I NUTRI", "Water Soluble Formula-7"),
    ("SWARNA MAX", "Formula-4"),
    ("PROMAXX", "Micro Nutrient Fertilizer"),
    ("CALIBER", "Calcium + Boron-Liquid form"),
]
for c, (name, form) in enumerate(p15_row2):
    x1, x2 = C4[c]
    y1, y2 = R3[2]
    products_meta.append((15, name, "Micro Nutrient", form, make_slug(name), (x1, y1, x2, y2)))

# PAGE 16: 6 Water Soluble Fertilizers
p16_row0 = [
    ("13:00:45", "NPK 13:00:45"),
    ("19:19:19", "NPK 19:19:19"),
    ("00:00:50", "NPK 00:00:50 (Potassium Sulphate)"),
    ("12:61:0", "NPK 12:61:0 (Mono Ammonium Phosphate)"),
]
for c, (name, form) in enumerate(p16_row0):
    x1, x2 = C4[c]
    y1, y2 = R3[0]
    products_meta.append((16, name, "Water Soluble Fertilizers", form, make_slug(name), (x1, y1, x2, y2)))

p16_row1 = [
    ("00:52:34", "NPK 00:52:34 (Mono Potassium Phosphate)"),
    ("CALCIUM NITRATE", "Calcium Nitrate (NPK)"),
]
for c, (name, form) in enumerate(p16_row1):
    x1, x2 = C4[c]
    y1, y2 = R3[1]
    products_meta.append((16, name, "Water Soluble Fertilizers", form, make_slug(name), (x1, y1, x2, y2)))

# PAGE 17: 8 Bio Fertilizers
p17_row0 = [
    ("ECHO-ROOT", "VAM - Vascular Arbuscular Mycorrhiza"),
    ("O-FERA", "Microbial Biostimulant"),
    ("INDUS PSB", "Bio Fertilizer-Phosphorous (Phosphorous Solubilizing Bacteria)"),
    ("INDUS KMB", "Bio Fertilizer-Potash (Potassium Solubilizing Bacteria)"),
]
for c, (name, form) in enumerate(p17_row0):
    x1, x2 = C4[c]
    y1, y2 = R3[0]
    products_meta.append((17, name, "Bio Fertilizers", form, make_slug(name), (x1, y1, x2, y2)))

p17_row1 = [
    ("INDUS ZNSB", "Bio Fertilizer-Zinc (Zinc Solubilizing Bacteria)"),
    ("FERTIK", "Potash derived from Rhodiphytes"),
    ("GROZYME GRANULES", "Bio Fertilizer Carrier Based Consortia (NPK Consortiam)"),
    ("GROWZYME", "Bio Fertilizer Liquid Consortia (NPK Liquid Consortia)"),
]
for c, (name, form) in enumerate(p17_row1):
    x1, x2 = C4[c]
    y1, y2 = R3[1]
    products_meta.append((17, name, "Bio Fertilizers", form, make_slug(name), (x1, y1, x2, y2)))

# PAGE 18: 6 Bio Stimulants
p18_row0 = [
    ("EXPRO", "Herbal Miticide"),
    ("HI-HUMIC", "99% Water Soluble Humic Acid"),
    ("I-CURE-SP", "100% Water Soluble Growth Powder"),
    ("GROWTH GURU", "100% Water Soluble"),
]
for c, (name, form) in enumerate(p18_row0):
    x1, x2 = C4[c]
    y1, y2 = R3[0]
    products_meta.append((18, name, "Bio Stimulants", form, make_slug(name), (x1, y1, x2, y2)))

p18_row1 = [
    ("SOIL HEAL", "Soil Neutralizer"),
    ("GROZYME GOLD", "Yield Booster"),
]
for c, (name, form) in enumerate(p18_row1):
    x1, x2 = C4[c]
    y1, y2 = R3[1]
    products_meta.append((18, name, "Bio Stimulants", form, make_slug(name), (x1, y1, x2, y2)))

# PAGE 19: 2 Antibiotic + 1 Micronutrients Combo
products_meta.append((19, "INDUS BACTIN", "Antibiotic Products", "Organic Bactericide", make_slug("INDUS BACTIN"), (C4[0][0], R3[0][0], C4[0][1], R3[0][1])))
products_meta.append((19, "ACTIV8", "Antibiotic Products", "Natural Fungicide and Antibiotic", make_slug("ACTIV8"), (C4[1][0], R3[0][0], C4[1][1], R3[0][1])))
products_meta.append((19, "INDUS DHARTHI", "Micronutrients Combo", "Bio Fertilizer / Micronutrients Combo", make_slug("INDUS DHARTHI"), (C4[0][0], R3[2][0], C4[0][1], R3[2][1])))

page_images = {}
for p in range(7, 20):
    page_images[p] = Image.open(f"resources/pages/page_{p}.png")

ts_products = []

for order_idx, item in enumerate(products_meta):
    page_num, name, category, formulation, slug, box = item
    x1, y1, x2, y2 = box
    page_img = page_images[page_num]

    # Card with full badge
    card = page_img.crop((x1, y1, x2, y2))
    card.save(f"{output_img_dir}/{slug}-card.png")

    # Clean product package: inset by 22 px on left/right/top, 96px above badge
    # For Page 15 (5-cols) inset by 18px
    if page_num == 15 and y1 < 1500:
        inset_x = 18
    else:
        inset_x = 22
    
    pkg = page_img.crop((x1 + inset_x, y1 + 18, x2 - inset_x, y2 - 96))
    pkg.save(f"{output_img_dir}/{slug}.png")

    # Map category to broader navigation group
    nav_category = category
    if category in ["Water Soluble Fertilizers", "Organic Fertilizers"]:
        broad_group = "Fertilizers"
    elif category in ["Micro Nutrient", "Micronutrients Combo"]:
        broad_group = "Nutrients"
    elif category in ["Bio Fertilizer"]:
        broad_group = "Biologicals"
    elif category in ["Bio Stimulants"]:
        broad_group = "Biostimulants"
    elif category in ["Antibiotic Products"]:
        broad_group = "Bio Pesticides"
    elif category in ["Plant Growth Regulator"]:
        broad_group = "PGR"
    else:
        broad_group = category # Insecticides, Herbicides, Fungicides

    prod_obj = {
        "id": slug,
        "name": name,
        "code": f"ICC-{order_idx + 1:03d}",
        "slug": slug,
        "category": category,
        "broadGroup": broad_group,
        "formulation": formulation,
        "shortDescription": f"Authentic Indus Crop Care {category[:-1] if category.endswith('s') else category} formulation: {formulation}. Formulated for maximum crop protection and optimal yield response.",
        "description": f"Indus Crop Care {name} is a high-performance agricultural solution formulated with {formulation}. Developed in collaboration with top agricultural scientists and manufactured under strict ISO 9001:2015 quality standards, delivering dependable field efficacy and high return on investment for progressive growers.",
        "features": [
            f"Active Technical Composition: {formulation}",
            f"Official Indus Category: {category}",
            "Engineered for superior uptake, fast dispersion, and persistent efficacy",
            "Stringently tested across multiple seasons and soil ecosystems",
            "Backed by Indus Crop Care research and technical field advisory"
        ],
        "specifications": [
            {"label": "Product Name", "value": name},
            {"label": "Technical Composition", "value": formulation},
            {"label": "Primary Category", "value": category},
            {"label": "Application Sector", "value": broad_group},
            {"label": "Manufacturer", "value": "Indus Crop Care Pvt. Ltd."},
            {"label": "Quality Standard", "value": "ISO 9001:2015 Certified Manufacturing"},
            {"label": "Official Catalogue Reference", "value": f"Page {page_num}"}
        ],
        "imageUrl": f"/images/indus-products/{slug}.png",
        "sheetImageUrl": f"/images/indus-products/{slug}-card.png",
        "isPublished": True,
        "isFeatured": order_idx in [0, 6, 12, 14, 15, 31, 36, 48, 54, 62, 63, 68, 70, 82, 83, 88, 96, 102, 103],
        "sortOrder": order_idx + 1,
        "sourcePage": page_num
    }
    ts_products.append(prod_obj)

# Write TypeScript file
ts_code = """import { Product } from '../types/product';

export interface IndusCatalogProduct extends Product {
  broadGroup?: string;
  formulation?: string;
  sourcePage?: number;
}

export const INDUS_CATALOG_PRODUCTS: IndusCatalogProduct[] = """ + json.dumps(ts_products, indent=2) + ";\n"

with open("src/data/indusProducts.ts", "w", encoding="utf-8") as f:
    f.write(ts_code)

print(f"Successfully generated src/data/indusProducts.ts with {len(ts_products)} products!")
