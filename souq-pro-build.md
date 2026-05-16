# Souq Pro E-commerce Build

## Goal
Build the Souq Pro Premium PWA using Next.js, Tailwind CSS, Sanity.io (CMS for Products/Categories), and InsForge (BaaS for Auth, Orders, and Storage), featuring a glassmorphic design system and functional cart state.

## Tasks
- [x] Task 1: Initialize Next.js project with Tailwind CSS.
- [x] Task 2: Configure Tailwind theme and global CSS with Souq Pro design tokens (Dual Theme support).
- [x] Task 3: Build isolated reusable UI components (GlassCard, Button, Input, BottomNavigation).
- [x] Task 4: Setup Sanity.io Backend (Product Schema & Client Setup).
- [x] Task 5: Implement Cart State Management with Zustand & Persistence.
- [x] Task 6: Home & Category Pages with Live Data Integration (Sanity.io).
- [x] Task 7: Setup InsForge Auth for user profiles & orders.
- [x] Task 8: Build Cart & Express Checkout flows.

## Done When
- [x] Next.js app runs successfully with the Souq Pro design system.
- [x] Products are fetched dynamically from Sanity.io CMS.
- [x] Cart state is functional and persistent.
- [x] User authentication is integrated via InsForge.
- [x] Checkout flow is ready for production.

## Notes
- Technology: Next.js 15+, Tailwind v4, Zustand, Sanity.io, InsForge SDK.
- Design: Dark theme (#121414) & Warm-Light theme, Primary Gold (#D4AF37).
- Visuals: Deep glassmorphism, Tajawal typography.
- Guest Checkout: Order submission decoupled from authentication, allowing seamless checkout for non-logged-in users.
- Rendering: Client-side mounting implemented for state-heavy components to resolve Next.js hydration mismatches.
- Notifications: Telegram bot integration successfully routes orders to Admin dynamically.
