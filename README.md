# Youleap — Developer Test

## Overview

You're joining a team that builds e-commerce storefronts using **Next.js 16**, **React 19**, and **TypeScript**. Our backend is headless (Medusa v2), and storefronts consume product data via REST APIs.

Your task: build a **Product Quick View** feature for a storefront.

**Time:** This is scoped for roughly **one working day** (~6 hours). You have up to 3 days for scheduling flexibility. Over-engineering is not a plus — we value clean, focused work over feature count.
**Tools:** Use anything you want — AI assistants, libraries, documentation. We encourage AI usage. What matters is the final result and your decisions.

---

## Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

A starter `ProductCard` component is provided in `src/components/`. Use it, modify it, or replace it — up to you.

---

## The Task

### Core Requirements

1. **Product Grid with Search & Filters** (`/products`)
   - Fetch products from `GET /api/products`
   - Responsive grid layout
   - Search and filter products
   - Each card: thumbnail image, product title, starting price, "Quick View" button

2. **Quick View Modal**
   - Opens when clicking "Quick View" on a product card
   - Shows: product images, full title, description, variant selector (based on product options), price (updates per variant), stock status per variant, "Add to Cart" button
   - Closeable via backdrop click, escape key, or close button

3. **Cart + Checkout**
   - Add to cart with selected variant
   - Cart icon in header showing item count
   - Cart drawer/dropdown showing items, quantities, and total
   - Remove item from cart
   - Checkout form with shipping details and proper validation
   - On submit: display a success message (no real backend needed — just show confirmation)

---

## API Documentation

### `GET /api/products`

Returns a paginated list of products.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 12 | Items per page |
| `offset` | number | 0 | Pagination offset |
| `q` | string | — | Search by title/description |
| `collection` | string | — | Filter by collection handle |
| `tag` | string | — | Filter by tag value |

**Response:**
```json
{
  "products": [Product],
  "count": 12,
  "limit": 12,
  "offset": 0
}
```

### `GET /api/products/:id`

Returns a single product.

**Response:**
```json
{
  "product": Product
}
```

### Product Shape

See `src/types/product.ts` for full TypeScript types.

---

## DECISIONS.md (Required)

Create a `DECISIONS.md` file in the project root. Document:

- **Key decisions** — architecture, data fetching, state management, libraries. Why you chose what you chose.
- **Tradeoffs** — what would you do differently with more time?
- **Verification** — how did you verify the code you shipped works correctly?
- **Surprises** — anything in the codebase or requirements that caught you off guard, and how you handled it?

---

## Tech Stack

| What | Version |
|------|---------|
| Next.js | 16.2.1 |
| React | 19.2.4 |
| TypeScript | 5.9 |
| Tailwind CSS | 4.2 |
| Node.js | 22+ |
| Package manager | pnpm |

You may add libraries. If you do, document why in `DECISIONS.md`.

**Don't modify:** `mock-data/`, `src/app/api/`, `src/types/product.ts`
**Adding new files** (e.g., new API routes, extended types) **is fine.**

---

## Submission

1. Push your work to a **private GitHub repo**
2. Add the reviewer(s) as collaborators (we'll provide GitHub usernames)
3. Make sure `pnpm install && pnpm dev` works from a clean clone
4. Ensure `DECISIONS.md` is complete

Good luck!
