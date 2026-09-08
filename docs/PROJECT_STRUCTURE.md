# Project Architecture & Directory Structure Guide

Welcome to the **Guru Diamonds** codebase. This document is a comprehensive guide to help developers understand how files, assets, components, state stores, and backend endpoints are organized.

---

## 📁 High-Level Repository Layout

```
Gurudiamonds/
├── backend/                # Express & Prisma Backend API
├── docs/                   # Developer documentation & design specifications
│   ├── design-references/  # Reference screenshots, raw mockups & design assets
│   ├── DEPLOYMENT.md       # Deployment instructions
│   ├── ENVIRONMENT.md      # Environment variables configuration
│   ├── PRODUCT_IMPORT.md   # Catalog import instructions
│   └── PROJECT_STRUCTURE.md# This directory & architecture guide
├── prisma/                 # Database Schema & Migrations
├── public/                 # Static public web assets (Served directly by Vite)
│   ├── categories/         # Category banner/card images
│   ├── gemstones/          # High-resolution gemstone transparency PNGs
│   ├── hero/               # Hero banner slides & campaigns
│   └── products/           # Catalog product imagery
├── scripts/                # Database seed & product import scripts
├── src/                    # Frontend React 18 + TypeScript Application
│   ├── components/         # Modular, reusable React UI components
│   ├── data/               # Static dataset fallbacks & initial catalogues
│   ├── pages/              # View pages (Storefront + Admin)
│   ├── services/           # Backend API client services (Axios/Fetch)
│   ├── stores/             # Global Zustand State Management stores
│   ├── types/              # TypeScript interfaces and domain types
│   └── utils/              # Helper utilities, formatters, and calculations
├── package.json            # Root dependencies & scripts
├── vite.config.ts          # Vite build & bundler configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 🎨 Asset Management Guidelines (Where to put images)

| Asset Type | Correct Location | Access URL in App / Code |
| :--- | :--- | :--- |
| **Web-Facing Public Images** | `public/<subfolder>/` | `/categories/Rings.png`, `/hero/hero1.png`, etc. |
| **Component Bundled Assets** | `src/assets/` | `import logo from '../assets/gurudimondslogo.png'` |
| **Design Mockups & References** | `docs/design-references/` | Not served in bundle (Internal reference only) |
| **Raw Excel Product Data** | `Products/` | Used by `scripts/import-products-from-xlsx.ts` |

> Always place newly added storefront images in the appropriate subfolder inside `public/` (e.g. `public/categories/`, `public/hero/`, `public/gemstones/`). Never place loose image files in the root folder.

---

## 🧩 Frontend (`src/`) Structure Explained

### 1. `src/components/`
- **`storefront/`**: Customer-facing widgets and sections:
  - `ProductCard.tsx`: Reusable jewellery item card with responsive ratings, metal rates, and cart actions.
  - `NavarathnaGemstonesShowcase.tsx`: Astrological 9-gemstones grid and details.
  - `TestimonialCarousel.tsx`: Customer reviews and ratings.
- **`layout/`**: Page scaffolding and navigation:
  - `StorefrontHeader.tsx`: Responsive navigation bar, search, cart trigger, and contact links.
  - `StorefrontFooter.tsx`: Footer links, policies, contact info, and copyright.
- **`ui/`**: Atomic, design-system primitives:
  - `Badge.tsx`, `CubeButton.tsx`, `ImageWithFallback.tsx`, `Toast.tsx`, etc.
- **`common/`**: Shared reusable components across storefront and admin:
  - `LiveMetalTicker.tsx`, `OrderTrackingModal.tsx`, `QuickViewModal.tsx`.

### 2. `src/pages/`
- **Storefront Pages**:
  - `HomePage.tsx`: Main campaign hero, curated categories carousel, signature bestsellers, spiritual heritage showcase, and authenticity promise.
  - `ShopPage.tsx`: Full product catalog with filters, search, metal type sorting, and sticky filter drawer.
  - `ProductDetailPage.tsx`: Rich product overview, dynamic pricing breakdown, metal weight details, gemstone certification, and customer reviews.
  - `ContactPage.tsx`: Contact form with immediate admin store integration, WhatsApp direct link, map, and store hours.
  - `CheckoutPage.tsx`: Cart review, delivery address capture, and payment options.
  - `CustomerLoginPage.tsx` / `CustomerAccountPage.tsx`: Customer profile, past orders, and addresses.
  - `StaticContentPages.tsx` / `TermsPoliciesPage.tsx`: About Us, FAQ, Privacy Policy, Terms & Conditions, and Shipping Policies.
- **Admin Portal (`src/pages/admin/`)**:
  - `AdminLayout.tsx`: Secure sidebar navigation with live unread inquiry and pending order badges.
  - `AdminDashboardPage.tsx`: Sales metrics, active orders, and inventory overview.
  - `AdminOrdersPage.tsx`: Order status management, shipment tracking, and details modal.
  - `AdminProductsPage.tsx` / `AdminProductFormPage.tsx`: Catalog CRUD management.
  - `AdminInquiriesPage.tsx`: Customer contact inquiries dashboard with quick WhatsApp / Email reply actions.
  - `AdminMetalRatesPage.tsx`: Live Gold & 925 Silver gram rates manager.

### 3. `src/stores/` (Zustand Global State)
- `useCartStore.ts`: Shopping cart items, counts, calculations, and local persistence.
- `useWishlistStore.ts`: Customer saved creations.
- `useProductStore.ts`: Product catalog, active category/metal filters, and search queries.
- `useMetalRateStore.ts`: Live metal rates per gram and pricing calculation cache.
- `useInquiryStore.ts`: Contact Us customer submissions and admin inquiry statuses.
- `useCMSStore.ts`: Dynamic storefront banners, announcements, and trust badges.
- `useOrderStore.ts`: Checkout orders lifecycle and customer tracking.

### 4. `src/utils/`
- `pricing.ts`: Live jewellery pricing formula based on metal weight, purity rates, making charges, gemstones, packaging, and 3% GST.
- `formatters.ts`: Currency formatting (`formatINR`) and date helpers.
- `navigation.ts`: Custom event-based zero-refresh URL navigation helper (`navigateTo`).

---

## 🛠️ Backend API (`backend/`)

- `backend/src/server.ts`: Express application bootstrap and middleware configuration.
- `backend/src/routes/`:
  - `/api/products`: Catalog listing and search endpoints.
  - `/api/orders`: Order creation, updates, and customer lookup.
  - `/api/rates`: Metal rate live syncing.
  - `/api/inquiries`: Customer contact form processing.

---

## 🚀 Common Developer Commands

```bash
# Start fullstack dev server (Vite frontend + Express API)
npm run dev:full

# Build production bundle
npm run build

# Seed sample database products
npm run seed
```
