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
- Shared pagination defaults, simulated delay values, and HTTP status codes are stored in `src/app/api/products/constants.ts` instead of being repeated as magic numbers in route handlers.

### State Management and Libraries

- The existing products page uses React `useState` and `useEffect` to fetch products from `/api/products`.
- No additional state-management library was added. The current scope only requires local storefront state, and the provided project does not yet contain a completed cart or checkout implementation.
- No new dependency was added. Existing Next.js, React, TypeScript, `lucide-react`, and `zod` dependencies remain unchanged.

## Tradeoffs

- Product data is read from a JSON file on every service call. This is appropriate for the supplied demo, but a production implementation would use a repository or Medusa client with caching and error handling.
- Simulated delays remain in the route handlers to preserve the starter behavior. A production API would rely on real backend latency and would likely add request tracing and structured error responses.
- Pagination validation is intentionally limited to the documented numeric parameters. The API does not impose a maximum page size because the README does not specify one.
- The current frontend fetches the default product list only. Search, filters, quick view, cart, and checkout still require frontend implementation to satisfy the full product brief.
- With more time, I would add automated route/service tests, typed frontend API responses, loading and error states, and a shared client-side cart model.

## Verification

- Ran `pnpm install --frozen-lockfile` successfully with pnpm `10.28.2`.
- Started the app with `pnpm dev` and confirmed the local page returned HTTP 200.
- Ran `pnpm typecheck` successfully after the service extraction and API validation changes.
- Verified the API at runtime:
  - Invalid pagination returns HTTP 400.
  - Mixed-case collection and tag filters return matching products.
  - Product lookup returns the expected product.
  - Missing product lookup returns HTTP 404.
- Editor diagnostics reported no errors in the changed service and API files.
- `pnpm lint` still reports an existing error in `src/components/ProductCard.tsx` for the unused `onQuickView` prop, plus warnings for existing `any` usage and raw `<img>` usage.

## Surprises

- The starter frontend is intentionally minimal compared with the breadth of the README requirements: it currently renders a product grid but does not yet implement the quick-view modal, cart, or checkout workflow.
- The repository is configured with pnpm `10.28.2` through the `packageManager` field, which makes the package-manager version explicit for clean clones.
- The API initially accepted negative pagination values and used case-sensitive collection and tag filters, so those edge cases were hardened while preserving the documented response contract.
