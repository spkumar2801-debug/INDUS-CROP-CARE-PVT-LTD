# INDAS AGRI SEEDS INDIA PVT LTD — Official Corporate Web Platform

[![React 19](https://img.shields.io/badge/React-19.2-22c55e?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3b82f6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-8b5cf6?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-f59e0b?logo=firebase)](https://firebase.google.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20CDN-3b82f6?logo=cloudinary)](https://cloudinary.com/)

> **"Sowing Trust, Growing Future"**  
> **"మీ పంటకు - మా నమ్మకం!"**  
> Official corporate website and hybrid seed catalogue for **INDAS AGRI SEEDS INDIA PVT LTD**, a proud group company of **INDUS CROP CARE PVT LTD** (serving Indian farmers since 2010).

---

## 1. Executive Summary & Brand Overview

- **Company Name**: INDAS AGRI SEEDS INDIA PVT LTD
- **Group Parent Company**: INDUS CROP CARE PVT LTD (15+ Years Agro Legacy, Est. 2010)
- **Official Seeds Division Launch Date**: 20th October 2026
- **Primary Design Aesthetic**: Refined agricultural green (`#0E6B38`), fresh sprout green (`#66B634`), harvest seed gold (`#E79E18`), seed brown (`#683B20`), warm off-white surfaces (`#F8FAF7`), and dark high-contrast typography.
- **Official Brand Logo**: Official seedling logo provided by the company integrated across header, footer, modals, admin, and favicon.
- **Official Contact Email**: `indusagriseedspl@gmail.com`

---

## 2. Key Modules & User Journeys

### A. Public Website
1. **Home (`/`)**:
   - Fixed responsive header with company logo and mobile drawer.
   - High-impact agricultural hero section with headline, verified metrics (15+ Years Legacy, F1 Hybrids, High Yield), and official Telugu slogan banner.
   - Company heritage section with exact word-for-word copy from INDUS CROP CARE.
   - Featured dynamic products loaded from Firestore.
   - Crop portfolios (Bitter Gourd, Cucumber, Tomato, Okra, Brinjal, Chilli, Watermelon, Marigold).
   - Prominent WhatsApp quotation call to action.
2. **About Us (`/about`)**:
   - Editorial-grade layout preserving the official company text word-for-word, punctuation, capitalization, and Telugu tagline:
     *"INDUS CROP CARE - Protected Your Crop. INDAS AGRI SEEDS - Will Secure Your Future."*
     *"INDAS AGRI SEEDS INDIA PVT LTD - మీ పంటకు - మా నమ్మకం!"*
3. **Products Catalogue (`/products`)**:
   - Filterable by crop category (Bitter Gourd, Cucumber, etc.).
   - Live search input matching name, code, category, or traits.
   - Product cards featuring genuine crop photography, fruit length, average weight, and harvest maturity pills.
   - Dedicated Product Details Modal and direct URL route (`/products/:id`) with English specifications, Telugu agronomic traits, and official technical release sheet.
4. **Gallery (`/gallery`)**:
   - Filterable photo grid for Field Trials, Crop Varieties, and Farmer Visits.
   - Fullscreen lightbox viewer with accessible captions and keyboard navigation.
5. **Contact Us (`/contact`)**:
   - Clickable official email (`indusagriseedspl@gmail.com`).
   - WhatsApp quotation desk.
   - Validated general enquiry form with regional distribution coverage.

---

## 3. Product-Level WhatsApp Quotation Engine

Every product card and details sheet includes a direct **"Enquire on WhatsApp"** button:
- Opens a dedicated quotation modal pre-filled with the selected hybrid's name and code.
- Captures Customer Name, Phone Number, State, District, Quantity, and Notes.
- Formats a clean, URL-encoded click-to-chat message adhering to the official `wa.me/<number>?text=...` standard:
  ```text
  Hello INDAS AGRI SEEDS INDIA PVT LTD,

  I am interested in the following product enquiry:
  Product: F1 Hybrid Bitter Gourd (IAS 405)
  Quantity required: 20 Packets
  Name: Ramesh Kumar
  Contact: 9876543210
  Location: Guntur, Andhra Pradesh
  Additional requirements: Please share nursery recommendations and bulk rates.

  Please share the product availability, technical guidance, and quotation details.
  Thank you.
  ```
- **Handoff Safety**: If the business number is not yet supplied by the owner, the modal safely prevents broken links, displaying a copyable preview and email fallback.

---

## 4. Protected Admin Dashboard

Located at `/admin/login` and `/admin/dashboard`:
- **Routes**:
  - `/admin/login`: Secure administrator sign in.
  - `/admin/dashboard`: Real-time database counts, connection diagnostics, and quick links.
  - `/admin/products`: Product table with instant publish/unpublish toggle, edit, and deletion.
  - `/admin/products/new`: Add new hybrid with dual English and Telugu trait fields.
  - `/admin/products/edit/:id`: Update existing product records.
  - `/admin/gallery`: Upload and manage field trial photographs.
  - `/admin/settings`: Configure official WhatsApp number, company email, and view cloud status.

---

## 5. Technology Architecture

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + TypeScript (Strict Mode) |
| **Build Tooling** | Vite 8.3 |
| **Styling** | Vanilla CSS Design Tokens (Zero bloated Tailwind dependencies) |
| **Icons** | Lucide React |
| **Database** | Google Cloud Firestore (`indas-agri-seeds-ind-pvt-ltd`) |
| **Authentication** | Firebase Authentication (Email/Password & Role Profiles) |
| **Image Delivery** | Cloudinary CDN (`qnkatbvo`, preset `INDAS AGRI SEED IND PVT LTD`) |

---

## 6. Local Setup & Development

### Prerequisites
- Node.js 20+ (Node v26.8 installed)
- npm 10+

### Installation
```bash
# Clone or navigate to the workspace
cd "C:\Users\HP\Desktop\INDAS AGRI PVT  LMT"

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
```
Generates minified, production-optimized static assets in `dist/`.

---

## 7. Environment Variables (`.env`)

Configure the following variables in `.env` (never commit secrets to version control):

```ini
# Firebase Web Configuration
VITE_FIREBASE_API_KEY=AIzaSy...YourActualApiKey
VITE_FIREBASE_AUTH_DOMAIN=indas-agri-seeds-ind-pvt-ltd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=indas-agri-seeds-ind-pvt-ltd
VITE_FIREBASE_STORAGE_BUCKET=indas-agri-seeds-ind-pvt-ltd.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=929613596851
VITE_FIREBASE_APP_ID=1:929613596851:web
VITE_FIREBASE_MEASUREMENT_ID=G-MCDH7W73YR

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=qnkatbvo
VITE_CLOUDINARY_UPLOAD_PRESET=INDAS AGRI SEED IND PVT LTD

# Company Contact & WhatsApp
VITE_COMPANY_EMAIL=indusagriseedspl@gmail.com
VITE_WHATSAPP_NUMBER=919440170453
```

---

## 8. Firestore Security Rules (`firestore.rules`)

The deployed Firestore security rules enforce strict least-privilege access:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() && (
        request.auth.token.admin == true ||
        exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid))
      );
    }

    // Default Deny
    match /{document=**} {
      allow read, write: if false;
    }

    // Products: Public read only when published; Admin write
    match /products/{productId} {
      allow read: if resource.data.isPublished == true || isAdmin();
      allow create, update, delete: if isAdmin();
    }

    // Gallery: Public read only when published; Admin write
    match /gallery/{itemId} {
      allow read: if resource.data.isPublished == true || isAdmin();
      allow create, update, delete: if isAdmin();
    }

    // Site Settings: Public read; Admin write
    match /siteSettings/{settingDoc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Admin Users: Self-escalation strictly forbidden
    match /adminUsers/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAdmin() && request.auth.uid != userId;
    }

    // Enquiries: Public create with field validation; Admin read/delete
    match /enquiries/{enquiryId} {
      allow create: if request.resource.data.customerName is string &&
                       request.resource.data.phone is string &&
                       request.resource.data.phone.size() >= 10;
      allow read, update, delete: if isAdmin();
    }
  }
}
```

---

## 9. Verified Flagship Products (Included in Release)

1. **IAS 405 (F1 Hybrid Bitter Gourd)**: 10-12 cm fresh green fruits, 110-140g, thick ribbed rind, harvest in 50-55 days.
2. **IAS 404 (F1 Hybrid Bitter Gourd)**: 16-22 cm elongated dark green fruits, 110-140g, prominent spines, harvest in 50-55 days.
3. **IAS 503 (F1 Hybrid Cucumber)**: 20-22 cm cylindrical light green fruits, 110-140g, smooth stem without spines, harvest in 40-45 days.
4. **IAS 504 (F1 Hybrid Cucumber)**: 20-22 cm cylindrical deep dark green fruits, 110-140g, high heat resilience, harvest in 40-45 days.

---

## 10. Owner Actions Pending

1. **Firebase Web API Key**: Add the production Firebase Web API Key in `.env` (under `VITE_FIREBASE_API_KEY`).
2. **Official WhatsApp Number**: Add the company's verified business WhatsApp number in `.env` or directly via Admin Dashboard (`/admin/settings`).
3. **Admin User Creation**: Create the initial administrator user via Firebase Console -> Authentication -> Users -> Add User, and add their UID into `adminUsers/{uid}` in Firestore.
