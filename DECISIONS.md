# Implementation Decisions

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

### Validation and Constants

- Added validation for `limit` and `offset`.
- `limit` must be a positive integer and `offset` must be a non-negative integer; invalid values return HTTP 400.
- Collection and tag filters are trimmed and compared case-insensitively.
- Added a toggleable product filter sidebar with live search and collection/tag checkbox filters. Search validation uses a bounded allowlist regex before building the `q` query parameter. Invalid search input shows a local error and returns before `fetch`, which prevents malformed or control-character input from reaching the API. The pattern is intentionally restrictive and linear-time to avoid regex backtracking risks; normal letters, numbers, spaces, and common punctuation remain supported.
- Shared pagination defaults, simulated delay values, and HTTP status codes are stored in `src/app/api/products/constants.ts` instead of being repeated as magic numbers in route handlers.

### State Management and Libraries

- The products page uses React `useState` and `useEffect` to manage search text, filter selections, filter options, and product results while fetching from `/api/products`.
- Search and filter requests are debounced and stale requests are aborted so rapid input changes do not overwrite newer results.
- `ProductCard` uses the shared `Product` type rather than an untyped `any` prop.
- No additional state-management library was added. The current scope only requires local storefront state, and the provided project does not yet contain a completed cart or checkout implementation.
- No new dependency was added. Existing Next.js, React, TypeScript, `lucide-react`, and `zod` dependencies remain unchanged.

## Tradeoffs

- Product data is read from a JSON file on every service call. This is appropriate for the supplied demo, but a production implementation would use a repository or Medusa client with caching and error handling.
- Simulated delays remain in the route handlers to preserve the starter behavior. A production API would rely on real backend latency and would likely add request tracing and structured error responses.
- Pagination validation is intentionally limited to the documented numeric parameters. The API does not impose a maximum page size because the README does not specify one.
- The frontend now supports the product grid, live search, and collection/tag filters. Quick view, cart, and checkout still require implementation to satisfy the full product brief.
- Product search and filter changes now send the README-documented `q`, `collection`, and `tag` parameters after local validation and a short debounce. The filter choices are derived from the initial product response, and checkbox groups allow one active collection and one active tag because that is the API contract. This is a client-side input guard, not a replacement for server-side validation.
- Product results use a 12-item page size and the API's `offset` value. Loading more appends the next page, while changing search or filters resets the offset and replaces the result list.
- Filter counts and available collection/tag options are refreshed from a full metadata request whenever the first page or active filters change, so the sidebar reflects the current filtered result set instead of only the first visible page.
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
  - Product lookup returns the expected product.
  - Missing product lookup returns HTTP 404.
- The products page and product card were checked at responsive breakpoints through responsive grid, spacing, sticky-sidebar, fluid-image, and overflow-safe classes.
- Editor diagnostics reported no errors in the changed files.
- Targeted `pnpm lint` passes for the products page and product card, with one remaining warning for the existing raw `<img>` element.

## Surprises

- The starter frontend is intentionally minimal compared with the breadth of the README requirements: it currently renders a product grid but does not yet implement the quick-view modal, cart, or checkout workflow.
- The repository is configured with pnpm `10.28.2` through the `packageManager` field, which makes the package-manager version explicit for clean clones.
- The API initially accepted negative pagination values and used case-sensitive collection and tag filters, so those edge cases were hardened while preserving the documented response contract.
- Search validation required balancing usability with input safety, so the allowlist supports common product-search punctuation while rejecting control characters and unexpected symbols before a request is sent.
- Responsive behavior required keeping the sidebar useful on both narrow and wide screens, so it stacks on mobile and becomes sticky only at the large-screen breakpoint.
