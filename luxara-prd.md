# Luxara Store - Product Requirements Document (PRD)

## 1. Product Overview
**Luxara** is an ultra-modern, premium e-commerce web application. It is designed to provide a highly aesthetic, glassmorphism-inspired UI with seamless micro-animations, supporting multiple languages and themes. The backend is powered by modern tools to ensure stability, scalability, and security.

## 2. Core Features & Capabilities
### 2.1 UI/UX & Theming
- **Premium Design System:** Glassmorphism panels, smooth gradients, and micro-animations.
- **Dark/Light Mode:** Full support for both themes, toggled seamlessly via the top navigation.
- **Multilingual Support:** Fully supports Arabic (RTL), English (LTR), and French (LTR). The layout automatically adjusts direction based on the selected language.
- **Sound Effects:** Micro-interactions (like adding to cart, navigating) have subtle sound effects (can be muted).

### 2.2 Frontend Pages
- **Home Page (`/`):** Features a dynamic hero section with floating particles, horizontal category scrolls, trending products, new arrivals, and promotional banners.
- **Shop / Catalog (`/shop`):** Displays all products with search functionality and category filters.
- **Product Modal:** Clicking any product opens a detailed modal with large images, discount tags, ratings, and "Add to Cart" / "Buy Now" actions.
- **Cart (`/cart`):** A side/bottom navigation cart where users can update quantities or remove items. Calculates subtotal and delivery fees dynamically.
- **Checkout (`/checkout`):** A 3-step checkout form requiring: Full Name, Phone, Wilaya (State), and Address. Supports "Cash on Delivery" (COD) by default.
- **Success Page (`/success`):** Displays a confetti animation and order confirmation message after a successful checkout.

### 2.3 Backend & Infrastructure
- **Framework:** Next.js (React).
- **Product Management (CMS):** Powered by **Sanity.io**. All products, images, prices, and discounts are fetched dynamically from Sanity.
- **Order Processing & Database:** Powered by **Firebase (Firestore)**. Orders are saved securely in Firestore.
- **Admin Authentication:** Powered by **Insforge**. Admin panel access requires valid Insforge credentials to prevent unauthorized access.
- **Admin Dashboard (`/admin`):** A secure dashboard to manage products, view total revenue, track order status (pending, processing, delivered), and delete/edit items.
- **Notification System:** Integrates with Telegram Bot API to notify the store owner immediately upon new orders.

## 3. Testing Scope (For TestSprite)
TestSprite must cover the following user flows and technical endpoints:

### 3.1 Frontend Test Flows
- **Flow 1 (Shopping):** Navigate to Home -> Switch Language to EN -> Add a product to cart -> Verify cart counter updates.
- **Flow 2 (Checkout):** Open Cart -> Proceed to Checkout -> Fill required fields (Name, Phone, Wilaya, Address) -> Submit Order -> Verify redirection to Success Page.
- **Flow 3 (Theme & Navigation):** Toggle Dark Mode -> Use bottom navigation to browse between Home, Shop, and Cart.

### 3.2 Backend API Tests
- **POST `/api/orders`:**
  - Submit a valid order payload (items with valid Sanity IDs, valid shipping details). Expect a `200 OK` and a new Firebase document ID.
  - Submit an invalid payload (missing required fields or invalid product IDs). Expect a `400 Bad Request` or `409 Conflict`.
- **Firebase Security & Insforge Auth:**
  - Ensure unauthorized users cannot access the admin endpoints or `/api/admin`.
  - Validate that Insforge Bearer tokens are correctly verified before granting access.

## 4. Known Constraints
- The backend relies heavily on external services (Sanity, Firebase, Insforge). If API keys are missing or expired (e.g., Firebase `ACCESS_TOKEN_EXPIRED`), the checkout process will fail with a `500 Internal Server Error`.
