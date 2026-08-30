# Sagunthala Jewellers

An e-commerce storefront and admin product console built with Next.js, React, Tailwind CSS, and a tenant-aware backend API.

## What This Project Includes

- A public storefront with a branded landing page, product detail view, and cart page.
- An authenticated admin area for listing, creating, and editing products.
- Product API integration for both public browsing and admin CRUD operations.
- JWT-based login with refresh-token support and tenant-aware request headers.

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- ESLint 9

## Project Structure

- `src/app` - route segments, layouts, and pages
- `src/components` - shared UI and domain components
- `src/lib` - API and auth helpers
- `store` - cart and wishlist state
- `src/data` - local product data and dropdown options
- `data/products.json` - seeded product data used by the admin/product module

## Main Routes

Public storefront:

- `/` - branded home page with hero, featured products, and new arrivals
- `/products/[slug]` - public product detail page
- `/cart` - shopping bag view with quantity controls and totals

Admin area:

- `/login` - admin sign-in page
- `/admin/products` - product list with search, pagination, edit, and delete actions
- `/admin/products/create` - create product flow
- `/admin/products/[id]` - edit product flow

## Features

- Hero-led luxury storefront design with sectioned landing-page layout
- Product gallery with thumbnail selection on the detail page
- Cart state stored in the browser and updated through shared store helpers
- Admin product table with optimistic delete handling and toast feedback
- Create/update forms with media, pricing, inventory, tags, and publish controls
- API helpers that can be swapped to backend endpoints without changing the UI

## Backend API Notes

The app is wired to the production API at `https://ecommerce-api-rgf0.onrender.com`.

- Public product requests use `src/lib/publicApi.js`.
- Admin requests use `src/lib/api.js`.
- Admin authentication stores access token, refresh token, and tenant ID in localStorage.
- Requests automatically send `Authorization` and `x-tenant-id` headers when available.

If you need to point the app to a different backend, update the base URL in:

- `src/lib/api.js`
- `src/lib/publicApi.js`

## Local Development

### Prerequisites

- Node.js 18+ recommended
- npm

### Install

```bash
npm install
```

### Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
```

### Start production server

```bash
npm run start
```

### Lint the project

```bash
npm run lint
```

## Useful Implementation Details

- The home page composition lives in `src/app/page.js`.
- Global layout, metadata, and shared chrome live in `src/app/layout.js`.
- Cart behavior is managed through `store/cartStore.js`.
- Public product lookup is handled by `src/lib/publicApi.js`.
- Admin auth/session helpers are handled by `src/lib/auth.js`.

## Product Data Model

The product APIs and admin form expect fields such as:

- `id`
- `name`
- `slug`
- `sku`
- `description`
- `price`
- `compare_price`
- `stock_qty`
- `is_published`
- `is_featured`
- `images`
- `tags`
- `attributes`
- `meta_title`
- `meta_desc`

## Notes

- The project uses App Router and colocated route folders under `src/app`.
- Some UI pieces intentionally use native `<img>` tags for now.
- Admin routes require a valid login session before access.

## Next Steps

1. Add environment variables for the API base URL instead of hardcoding it.
2. Add screenshots or a short demo GIF for the storefront and admin flow.
3. Expand the README with deployment steps once the hosting target is fixed.
