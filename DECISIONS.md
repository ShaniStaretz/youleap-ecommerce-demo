# Implementation Decisions

> Keep this document synchronized with the implementation. Every meaningful change should update the relevant subject: key decisions, tradeoffs, verification, or surprises.

## Key Decisions

### Architecture

- Kept the existing Next.js App Router and REST endpoint structure.
- Separated product business logic from HTTP route handlers by adding `src/services/products.ts`.
- `listProducts` owns search, collection and tag filtering, case normalization, and pagination.
- `getProductById` owns product lookup by ID.
- API route handlers remain responsible for query-string parsing, pagination validation, simulated latency, HTTP status codes, and response formatting.

### Data Fetching

- Continued using the provided `mock-data/products.json` through the existing API routes.
- Kept the documented response shapes unchanged:
  - `GET /api/products` returns `products`, `count`, `limit`, and `offset`.
  - `GET /api/products/:id` returns `{ product }`.
- No database or external commerce backend was added because the task supplies local mock data and does not require a real backend.
- Kept aggregation work on the server because production-sized datasets may require long-running SQL queries. The product list should fetch only a bounded page, while a dedicated aggregation query should return counts instead of transferring every matching product to the browser.
- For a real SQL-backed implementation, filter and join columns should be indexed, aggregation queries should select only required fields, and query plans should be reviewed with `EXPLAIN`. Requests should also use database timeouts, cancellation, and observability rather than allowing unbounded work to block application resources.

### Pricing and Variant Data

- Added `src/lib/pricing.ts` to select a product's lowest price within its currency and format minor-unit amounts with `Intl.NumberFormat`. Missing variants, missing prices, invalid currency codes, and non-finite amounts now produce `Price unavailable` instead of crashing or displaying a misleading hardcoded `/100` value.
- Added `src/types/catalog.ts` with `CatalogProduct` and `CatalogVariant`. Catalog variants expose explicit `option_values` keyed by option title, which gives future quick-view and cart UI a structured selection model instead of requiring components to parse variant titles.
- The service derives `option_values` from the existing variant titles and product option values because `src/types/product.ts` and the supplied mock data are protected. A real backend should return an authoritative variant-to-option mapping rather than infer it from display text.

### Validation and Constants

- Added validation for `limit` and `offset`.
- `limit` must be a positive integer and `offset` must be a non-negative integer; invalid values return HTTP 400.
- Collection and tag filters are trimmed and compared case-insensitively.
- Added a toggleable product filter sidebar with live search and collection/tag checkbox filters. Search validation uses a bounded allowlist regex before building the `q` query parameter. Invalid search input shows a local error and returns before `fetch`, which prevents malformed or control-character input from reaching the API. The pattern is intentionally restrictive and linear-time to avoid regex backtracking risks; normal letters, numbers, spaces, and common punctuation remain supported.
- Shared pagination defaults, simulated delay values, and HTTP status codes are stored in `src/app/api/products/constants.ts` instead of being repeated as magic numbers in route handlers.

### State Management and Libraries

- The products page uses React `useState` and `useEffect` to manage search text, filter selections, filter options, and product results while fetching from `/api/products`.
- Quick View receives the complete `Product` object already loaded for the grid, avoiding a duplicate product request when opening the modal. It is the primary product-detail experience and includes the image gallery, options, price, stock status, and add-to-cart action.
- Quick View uses the canonical product resource path, for example `/product/prod_01`, rather than a separate `quickView` query parameter. The `/product/[id]` route renders the same products grid with that Quick View open, so refreshing or directly visiting the path restores the modal experience.
- Refresh behavior is implemented by reusing `ProductsPage` from `/product/[id]`; the page reads the current pathname, restores the product ID, and opens `QuickViewModal`. This avoids maintaining a second product-detail presentation and keeps the refreshed experience identical to opening Quick View from the grid.
- The grid passes its selected `Product` directly to `QuickViewModal` through the `onQuickView` callback. This keeps opening the modal immediate and avoids requesting data that the grid already has.
- The URL stores only the product identity in the same path used by `GET /api/products/:id`, rather than the full product object. On refresh, `/product/prod_01` calls `GET /api/products/prod_01`, keeping the public resource URL consistent with the API route.
- Closing the modal returns to `/products`, and browser back/forward events synchronize the modal through the `popstate` listener.
- The `/product/[id]` route is the canonical refreshable product URL, but it reuses the grid and modal UI so users do not have two competing product-detail experiences.
- Product detail and Quick View share option-value derivation, price formatting, image galleries, variant selection, and stock-status behavior.
- Cart state is provided at the app layout boundary so it survives navigation between the grid and canonical product paths. Quick View adds the selected variant, price, title, and inventory limit to the cart; the cart drawer owns quantities, removal, totals, and checkout.
- Checkout is intentionally client-only because the README requires confirmation without a real backend. Shipping fields are validated with the existing `zod` dependency, and successful submission clears the cart while showing a confirmation message.
- Search, collection, tag, and pagination offset are kept in local React state. They are still serialized into request query parameters, so the values are visible in browser DevTools without changing the page URL. This keeps the page URL clean, at the cost of losing filter state on refresh and browser navigation.
- Search and filter requests are debounced and stale requests are aborted so rapid input changes do not overwrite newer results.
- API responses are checked for non-2xx status codes before being cast to success types. Product and filter metadata requests have separate error states so a metadata failure does not prevent products from rendering.
- A request sequence ID is checked alongside `AbortController` so an older request cannot update loading, product, filter, or error state after a newer URL query has started.
- `ProductCard` uses the shared `Product` type rather than an untyped `any` prop.
- No additional state-management library was added. Cart and checkout state are local to the client provider because the task explicitly requires no real checkout backend.
- No new dependency was added. Existing Next.js, React, TypeScript, `lucide-react`, and `zod` dependencies remain unchanged.

## Tradeoffs

- Product data is read from a JSON file on every service call. This is appropriate for the supplied demo, but a production implementation would use a repository or Medusa client with caching and error handling.
- Adding `GET /api/products/filters` is an intentional exception to the original README restriction against modifying `src/app/api/`, made to keep aggregation logic on the server as requested.
- The server-side aggregation boundary follows the same long-query best practice: keep expensive database work close to the data, return a small result, use bounded pagination for product rows, and avoid issuing an unbounded `SELECT *` from the client.
- Currency formatting and catalog normalization are kept in reusable domain helpers so price and variant rules do not leak into presentation components.
- Simulated delays remain in the route handlers to preserve the starter behavior. A production API would rely on real backend latency and would likely add request tracing and structured error responses.
- Pagination validation is intentionally limited to the documented numeric parameters. The API does not impose a maximum page size because the README does not specify one.
- The frontend now supports the product grid, live search, collection/tag filters, refresh-safe Quick View, cart management, and client-side checkout confirmation.
- Cart and checkout are implemented as local client state with no order persistence or backend submission, matching the task requirement that no real checkout backend is needed.
- Product search and filter changes now send the README-documented `q`, `collection`, and `tag` parameters after local validation and a short debounce. The filter choices are derived from the initial product response, and checkbox groups allow one active collection and one active tag because that is the API contract. This is a client-side input guard, not a replacement for server-side validation.
- Keeping filter state local avoids changing the page URL and keeps the interaction lightweight, but filtered views are not shareable or restorable after a refresh. The request query string remains explicit for API observability and debugging.
- Product results use a 12-item page size and the API's `offset` value. Loading more appends the next page, while changing search or filters resets the offset and replaces the result list.
- The products-per-page selector is URL-backed and supports `5`, `10`, the existing default `12`, and `20`. Changing the limit resets the offset, and Load More advances by the selected limit.
- Filter counts and available collection/tag options are refreshed from a dedicated server-side metadata request whenever the first page or active filters change, so the sidebar reflects the current filtered result set instead of only the first visible page.
- Aggregations are calculated through `GET /api/products/filters`; the browser receives only counts and option values instead of requesting up to 1,000 products and calculating them locally.
- On smaller screens, collection and tag options are ranked by frequency, with the three most common shown initially and a per-group `Load more <count>` control for the remaining options. Desktop keeps the complete filter list visible.
- The products layout uses responsive spacing and grid breakpoints, a mobile-stacked filter panel, a desktop-sticky sidebar, fluid card images, and minimum-width constraints to prevent overflow on narrow screens. The desktop sidebar column is only created while filters are open so the grid uses the full width otherwise.
- With more time, I would add automated route/service tests, richer request error handling, and a shared client-side cart model.

## Verification

- Ran `pnpm install --frozen-lockfile` successfully with pnpm `10.28.2`.
- Started the app with `pnpm dev` and confirmed the local page returned HTTP 200.
- Ran `pnpm typecheck` successfully after the service extraction and API validation changes.
- Verified the API at runtime:
  - Invalid pagination returns HTTP 400.
  - Mixed-case collection and tag filters return matching products.
  - Combined `q`, `collection`, and `tag` filters return the expected filtered results.
  - `limit=12&offset=0` and `limit=12&offset=12` return separate product pages with the expected count and offsets.
  - Production build passes with the URL search-parameter Suspense boundary.
  - Product card pricing now handles empty catalog data safely and uses currency-aware formatting.
  - Quick View adds selected in-stock variants to the global cart, supports removal and quantity limits, and validates shipping details before showing checkout confirmation.
  - Product lookup returns the expected product.
  - Missing product lookup returns HTTP 404.
- The products page and product card were checked at responsive breakpoints through responsive grid, spacing, sticky-sidebar, fluid-image, and overflow-safe classes.
- The canonical `/product/:id` route was production-built and verified to render the shared grid/Quick View route instead of the removed standalone detail component.
- Editor diagnostics reported no errors in the changed files.
- Targeted `pnpm lint` passes for the products page and product card, with one remaining warning for the existing raw `<img>` element.

## Surprises

- The starter frontend is intentionally minimal compared with the breadth of the README requirements: it currently renders a product grid but does not yet implement the quick-view modal, cart, or checkout workflow.
- The repository is configured with pnpm `10.28.2` through the `packageManager` field, which makes the package-manager version explicit for clean clones.
- The API initially accepted negative pagination values and used case-sensitive collection and tag filters, so those edge cases were hardened while preserving the documented response contract.
- Search validation required balancing usability with input safety, so the allowlist supports common product-search punctuation while rejecting control characters and unexpected symbols before a request is sent.
- Responsive behavior required keeping the sidebar useful on both narrow and wide screens, so it stacks on mobile and becomes sticky only at the large-screen breakpoint.
