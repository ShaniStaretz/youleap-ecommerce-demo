# Implementation Decisions

> Keep this file aligned with the code. Update the relevant section after each meaningful change.

## Key Decisions

### Architecture

- Kept the Next.js App Router and the supplied REST API.
- Kept protected files unchanged: `mock-data/`, `src/app/api/`, and `src/types/product.ts`.
- Kept product lookup helpers in `src/services/products.ts`.
- Shared catalog and pricing rules live in `src/lib/`.
- Cart state is provided once at the app layout level.

### Data Fetching

- The products page uses `GET /api/products` for search, filters, and pagination.
- Filter options are calculated from the returned product page because the API directory is protected.
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
- Stored data is parsed defensively; invalid storage is removed. Checkout and modal visibility remain transient UI state.
- No new dependency was added; existing Zod and Lucide libraries are used.

## Tradeoffs

- Cart data is browser-local. Production checkout must reserve inventory and persist orders on the server.
- Filter counts are limited to the product data returned by the protected API.
- Filter state stays out of the page URL so request parameters remain visible in DevTools without changing navigation.
- Automated tests were not added by request.

## Verification

- `pnpm install --frozen-lockfile` succeeds.
- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `pnpm build` passes.
- OpenAPI JSON parses successfully.
- Protected paths match the original baseline.
- Product, Quick View, cart, checkout, 404, 500, stock, and retry flows were reviewed manually.
- Generated `.next` and TypeScript build artifacts are removed before submission.

## Surprises

- The starter UI was much smaller than the required feature set.
- Protected API files limited where validation and aggregation could be implemented.
- The supplied variant shape requires deriving option values from variant titles.
- The mock catalog uses minor-unit prices, so currency formatting needed a shared helper.
