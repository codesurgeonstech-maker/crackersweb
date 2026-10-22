# 🎆 Crackzo — Multi-Shop Fireworks Catalogue & WhatsApp Ordering Platform

A clean, modern, high-performance multi-tenant crackers shop catalogue and quick-order platform built with **React (Vite)**, **Tailwind CSS**, **Framer Motion**, and **Firebase**.

---

## 🚀 Key Highlights & Tech Stack

- **Frontend**: React 19 + Vite + JavaScript (JSX)
- **Styling**: Tailwind CSS (Festive Red `#D71920`, Clean White `#FFFFFF`, Secondary `#F7F7F8`, Text `#202124`, Borders `#E5E7EB`)
- **Icons & Animations**: Lucide React + Framer Motion + Canvas Confetti
- **QR Code**: `qrcode.react` with SVG rendering, PNG download, and printable counter poster (`@media print`)
- **Backend & Database**: Firebase Authentication + Cloud Firestore + Firebase Storage
- **Server-Side Functions**: Firebase Cloud Functions (v2) for secure order verification, price tampering protection, and shop provisioning
- **WhatsApp Integration**: WhatsApp Click-to-Chat URL (`https://wa.me/...`) with normalized international phone numbers and human-readable prefilled order text

---

## 👥 Three Isolated Experiences

### 1. Developer Admin Panel
- Access route: [`/developer/login`](http://localhost:5173/developer/login)
- **Dashboard**: Aggregate metrics (Total Shops, Active Shops, Suspended Shops, Total Products Listed, Total Recorded Orders).
- **Shop Management**: Register new shops with custom unique slugs (e.g. `/shop/sri-murugan-crackers`), configure WhatsApp ordering numbers, activate or suspend shops, and manage shop owner credentials.

### 2. Shop Owner Admin Panel
- Access route: [`/admin/login`](http://localhost:5173/admin/login)
- **Dashboard**: Store overview, product stock counts, recent orders, category summaries.
- **Products**: Full CRUD, image upload to Firebase Storage, live availability toggle (In Stock / Sold Out), inline price updates, and bulk CSV import/export.
- **Categories**: Create, edit, delete, and reorder catalogue categories (Sparklers, Flower Pots, Chakras, Rockets, Fountains, Gift Boxes, Family Packs, Kids Special).
- **Orders**: View order details with historical item snapshots, update status (Pending, Confirmed, Completed, Cancelled), and one-click WhatsApp reply to customer.
- **Counter QR Code**: Printable high-resolution shop QR poster with scan-to-order instructions and PNG download.
- **Shop Settings**: Minimum order value, order acceptance toggle, greeting message, store address, and safety information.

### 3. Customer Catalogue
- Access route: `/shop/:slug` (e.g. [`/shop/sri-murugan-crackers`](http://localhost:5173/shop/sri-murugan-crackers) or [`/shop/lakshmi-crackers`](http://localhost:5173/shop/lakshmi-crackers))
- **No Account Required**: Fast, mobile-first design for immediate browsing at store counters or from home.
- **Product Grid**: Responsive (2-col mobile, 3-col tablet, 4-col desktop), discount badges, quantity adjusters, and animated "Add to Cart" feedback.
- **Shop-Isolated Cart**: LocalStorage cart persistence strictly keyed per shop (`crackers_cart_{shopId}`).
- **WhatsApp Checkout**: Generates unique order reference (`ORD-2026-XXXXX`), records order in Firestore, and opens shop owner's WhatsApp with formatted order details.

---

## 🔑 Demo Credentials (1-Click Test Login)

| Role | Email | Password | Assigned Shop |
| :--- | :--- | :--- | :--- |
| **Developer Admin** | `mohanprakash@gmail.com` | `Kutty@007` | Multi-Tenant Platform |
| **Shop Owner 1** | `murugan@crackers.com` | `murugan123` | Sri Murugan Crackers (`/shop/sri-murugan-crackers`) |
| **Shop Owner 2** | `lakshmi@crackers.com` | `lakshmi123` | Lakshmi Crackers (`/shop/lakshmi-crackers`) |

*(One-click auto-fill buttons are provided on both login screens for instant evaluation)*

---

## 🛠️ Project Structure

```
├── .env.example                # Firebase environment variables template
├── firebase.json               # Firebase Hosting, Firestore, Storage & Emulator config
├── firestore.rules             # Production security rules enforcing multi-tenant isolation
├── firestore.indexes.json      # Firestore query indexes
├── storage.rules               # Firebase Storage security rules
├── functions/                  # Firebase Cloud Functions (Node.js)
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── orders.js           # Secure order creation & price validation
│       └── shops.js            # Privileged shop provisioning & developer roles
├── public/
├── src/
│   ├── components/
│   │   ├── common/             # Button, Input, Modal, Badge, EmptyState, LoadingSkeleton, Footer
│   │   ├── layout/             # DeveloperLayout, AdminLayout, CustomerLayout
│   │   ├── categories/         # CategoryNav chips
│   │   ├── products/           # ProductCard, ProductGrid, ProductDetailModal
│   │   └── cart/               # CartDrawer, CartItem
│   ├── context/                # AuthContext, CartContext, ToastContext
│   ├── hooks/                  # useAuth, useCart, useToast
│   ├── pages/
│   │   ├── Home.jsx            # Multi-shop directory & portal selector
│   │   ├── developer/          # DeveloperLogin, Dashboard, ShopManagement, ShopCreate, ShopDetail
│   │   ├── admin/              # AdminLogin, Dashboard, Products, ProductCreate, Edit, Categories, Orders, QRCode, Settings
│   │   ├── catalogue/          # CataloguePage, ProductDetailPage, CartPage, CheckoutPage, OrderConfirmationPage
│   │   └── auth/               # ForgotPassword
│   ├── routes/                 # AppRoutes, ProtectedRoute
│   ├── services/               # firebase, authService, shopService, productService, categoryService, orderService, storageService
│   ├── utils/                  # formatters, whatsapp, sampleData
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🏃 Getting Started Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🔒 Security Rules & Firebase Deployment

- **Firestore Rules** (`firestore.rules`):
  - Shop owners can read and write only documents in their assigned `shops/{shopId}/...`.
  - Public customers can only read active shops and publish orders in `pending` status.
  - Customers cannot mark their own orders as confirmed.
  - Developer role is enforced at the database level.
- **Storage Rules** (`storage.rules`):
  - Enforces shop path isolation `shops/{shopId}/...` and validates image file MIME types and size (<5MB).
- **Deployment**:
  ```bash
  firebase deploy
  ```
