# Sagunthala Jewelers - Repository Documentation

## 1. Project Purpose
This repository is a Next.js App Router project for Sagunthala Jewellers.
It currently includes:
- Customer-facing storefront pages and components
- A newly structured product management module (CRUD-ready with mock local state)

The product management module is designed so backend API integration can be done later by replacing helper internals only.

## 2. Tech Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- ESLint

## 3. Top-Level Structure
- `src/app`: App Router pages/layouts
- `src/components`: Reusable UI and domain components
- `src/data`: Local JS data/constants for frontend usage
- `src/helpers/store`: Context/state helper modules
- `src/lib/api`: API abstraction layer (currently mock implementation)
- `data/products.json`: Product seed/mock data for product module

## 4. Routing Overview
### Storefront (existing)
- `/` and other existing customer pages
- Shared layout in `src/app/layout.js`

### Product Management (new)
- `/products`: Product list management page
- `/products/new`: Create product page
- `/products/[id]`: Edit product page

Note:
- Older slug-based detail page under `src/app/products/[slug]/page.js` was removed to avoid dynamic segment conflict with `[id]`.
- If you need both storefront catalog details and admin product editor at the same time, use different route groups (example: `/shop/[slug]` for storefront and `/products/[id]` for admin).

## 5. Product Data Model Used
The mock data model in `data/products.json` follows this schema:
- `id`
- `tenant_id`
- `category_id`
- `collection_id`
- `name`
- `slug`
- `sku`
- `description`
- `price`
- `compare_price`
- `stock_qty`
- `is_published`
- `is_featured`
- `is_deleted`
- `tags: []`
- `attributes: {}`
- `images: []`
- `meta_title`
- `meta_desc`

## 6. Product Management Module Architecture
### 6.1 API Abstraction Layer
File: `src/lib/api/productHelpers.ts`
Functions:
- `getProducts()`
- `getProductById(id)`
- `createProduct(data)`
- `updateProduct(id, data)`
- `deleteProduct(id)`

Current behavior:
- Uses seeded JSON as initial state
- Stores mutable state in browser localStorage (`sj-products`)
- Simulates API latency
- Logs payloads in console for create/update/delete

Future backend migration:
- Keep component and store usage unchanged
- Replace internal helper logic with `fetch` calls
- Keep function signatures stable to avoid UI refactor

### 6.2 State Management Layer
File: `src/helpers/store/productStore.js`
Provides context-based state and actions:
- `products`, `isLoading`, `isSaving`
- `refreshProducts`, `getById`
- `addProduct`, `editProduct`, `softDeleteProduct`

Why this matters:
- Keeps UI components decoupled from data source
- Supports moving from local mock to API with minimal change

### 6.3 UI Components
Folder: `src/components/product-management`
- `ProductList.js`: Grid/empty state rendering
- `ProductCard.js`: Product card with more menu (Edit/Delete)
- `ProductEditorPage.js`: Create/edit wrapper and page-level behavior
- `ProductForm.js`: Reusable form for create and update
- `StatusToggle.js`: Published/Featured toggle
- `TagInput.js`: Add/remove tags
- `JsonEditor.js`: Structured attributes editor (no manual JSON typing required)
- `ImageUploader.js`: Image management with modal input

## 7. Important UX Behaviors Implemented
### Product List
- Clean card-based list
- Shows name, price, stock, featured/published statuses
- More menu with Edit and Delete
- Card click opens edit/details page

### Product Form
- Single form supports create and edit
- Slug auto-generation from name
- Basic validation for required fields and negative values
- Category and collection are dropdowns (dummy options)
- Attributes are key-value structured inputs with typed values
- Generated JSON preview is read-only

### Images
- Add image opens modal
- Two input modes:
  - Upload (mock local preview URL)
  - Link URL (direct URL accepted)
- Set primary image
- Remove image

### Delete Strategy
- Soft delete only (`is_deleted = true`)
- Item excluded from active list after delete

## 8. Dummy Options for Dropdowns
File: `src/data/productOptions.js`
Contains:
- `categoryOptions`
- `collectionOptions`

These are currently static dummy values and can later be replaced by API-fetched options.

## 9. Styling Notes
- Existing global styles remain in `src/app/globals.css`
- Product management uses neutral elevated cards and spacing
- Supports both light and dark mode classes
- Reusable `.input` class is used across form fields

## 10. Known Lint/Code Quality Notes
- Product management module is lint-clean for errors
- Warnings remain for using `<img>` instead of Next.js `<Image />`
- Full project lint may still fail because of pre-existing unrelated files outside this module

## 11. How to Run
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Lint full project: `npm run lint`
- Lint only product module:
  `npx eslint src/app/products src/components/product-management src/lib/api src/helpers/store/productStore.js`

## 12. Recommended Next Steps
1. Add route-group separation for storefront product details vs admin management.
2. Replace `productHelpers.ts` internals with real backend endpoints once available.
3. Introduce category/collection helper APIs and map dropdown values from those APIs.
4. Add server persistence for uploaded images (S3/Cloudinary/etc.) and replace local preview URLs.
5. Add unit tests for helper and form logic.
