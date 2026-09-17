# Implementation Decisions

> Keep this file aligned with the code. Update the relevant section after each meaningful change.

## Key Decisions

### Architecture

- Kept the Next.js App Router and the supplied REST API.
- Kept `mock-data/`, `src/types/product.ts`, and existing API route files unchanged.
- Added a new `/api/products/filters` route for server-side filter aggregations.
- Kept product lookup helpers in `src/services/products.ts`.
- Shared catalog and pricing rules live in `src/lib/`.
- Cart state is provided once at the app layout level.

### Data Fetching

- The products page uses `GET /api/products` for search, filters, and pagination.
- Filter UI is isolated in `ProductFilters.tsx`, keeping the products page focused on data fetching and page state.
- Filter options are loaded from `/api/products/filters`, so counts are calculated server-side and are not limited to the visible page.
- `openapi.json` documents the existing product routes and the new filter aggregation route.
- Product requests use `AbortController` and a request sequence guard.
- Non-success responses are converted into user-facing errors.
- HTTP 404 and 500 use named constants in `src/lib/http.ts`.
- Product and Quick View errors include a `Try again` action.
- The canonical `/product/:id` path restores the matching Quick View on refresh.

### Pricing and Variants

- Prices use `Intl.NumberFormat` and the product currency.
- Missing or invalid prices show `Price unavailable`.
- UI catalog types add structured `option_values` without changing protected API types.
- Cart items use the exact `variantId`.
- Quick View matches the selected option combination to one exact variant and displays its title, SKU, price, stock, and cart identity.
- Fully out-of-stock products are hidden from the grid.
- The sidebar provides `Clear all` for search and filter state, and the search input provides an accessible `×` clear button.
- The grid shows the available-result count and a clear empty-results message.
- Changing filters or page size scrolls the listing back to the top. Search typing does not force scrolling.
- Scroll behavior respects `prefers-reduced-motion`: smooth for most users and instant for users who request less motion.
- A keyboard-accessible Back to top button appears after scrolling down and uses the same reduced-motion behavior.
- The cart modal includes a Clear cart action that resets cart and checkout state while preserving the session stock ledger.

### Validation and Accessibility

- Search input uses a bounded allowlist and rejects invalid input before fetching.
- Checkout uses Zod validation with field-level messages.
- Invalid checkout fields receive focus, red styling, and `aria-invalid`.
- Quick View and Cart share `useDialogFocus` for focus trapping, Escape close, focus restoration, and scroll locking.
- Quick View image arrows hide at the first and last image.
- Product images use `next/image`.
- The cart is a centered modal opened by `View cart`; Add to Cart does not open it.

### State and Libraries

- React state handles search, filters, pagination, Quick View, cart, and checkout.
- Cart and checkout are client-only because no real order backend is required.
- Cart items and the session stock ledger are persisted in `localStorage`, so they survive refreshes and browser restarts on the same device.
- Cart close uses Next.js router navigation to return from `/cart` to `/products`, ensuring the products page remounts instead of leaving a blank route shell.
- The cart uses the canonical `/cart` page path. Refreshing `/cart` restores the cart modal and reads its items from `localStorage`.
- The `/cart` route reuses the products grid underneath the cart modal, so refreshing the cart keeps the storefront context instead of showing an empty background.
- Stored data is parsed defensively; invalid storage is removed. Checkout and modal visibility remain transient UI state.
- Stored cart data includes a version number so future storage-shape changes can invalidate old browser data safely.
- An App Router error boundary gives unexpected page failures a user-friendly retry action.
- Initial loading and filter updates show visible status text.
- No new dependency was added; existing Zod and Lucide libraries are used.

## Tradeoffs

- Cart data is browser-local. Production checkout must reserve inventory and persist orders on the server.
- Filter aggregation uses a separate server request, avoiding large client-side aggregation work.
- Filter state stays out of the page URL so request parameters remain visible in DevTools without changing navigation.
- Automated tests were not added by request.
- With more time, I would add focused API/component tests and server-render the initial results.
- I would add PostgreSQL with Prisma migrations, transactional inventory updates, and durable orders.
- I would add authentication with `customer` and `admin` roles.
- I would add admin screens for products, variants, stock changes, and audit history.
- I would add structured logging, request IDs, monitoring, and centralized error reporting.
- I would add Docker and Docker Compose for the app and database, plus a documented deployment pipeline.
- I would add personalized recommendations before checkout based on the current cart and after checkout based on the user's previous orders.
- With persisted order history, recommendations could start with simple complementary-product rules and later evolve into a recommendation service.

## Verification

- `pnpm install --frozen-lockfile` confirms a clean clone can install the locked dependencies.
- `pnpm typecheck` catches TypeScript errors before runtime.
- `pnpm lint` checks code quality and project style rules.
- `pnpm build` verifies the production bundle and all App Router routes compile.
- OpenAPI JSON parsing confirms the API contract file is valid JSON.
- Protected-path comparison confirms existing API routes, mock data, and shared product types were not changed.
- Manual product-flow checks cover search, filters, pagination, Quick View, variants, cart, checkout, stock, 404, 500, and retry behavior.
- Generated `.next` and TypeScript build artifacts are removed so they do not affect a clean submission.

## Surprises

- The starter UI was much smaller than the required feature set.
- The README allows new API route files but protects existing route files, so aggregation was added as a separate route.
- The supplied variant shape requires deriving option values from variant titles.
- The mock catalog uses minor-unit prices, so currency formatting needed a shared helper.
