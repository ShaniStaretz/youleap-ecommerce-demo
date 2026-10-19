export const SEARCH_PATTERN = /^[\p{L}\p{N}\s'.,:&()+\-/_]{0,100}$/u
export const SEARCH_ERROR =
  "Use up to 100 letters, numbers, spaces, or common punctuation."
export const DEFAULT_PAGE_SIZE = 12
export const PAGE_SIZE_OPTIONS = [5, 10, DEFAULT_PAGE_SIZE, 20]
const MAX_PAGE = 100

export type ProductQuery = {
  q: string
  collection: string
  tag: string
  limit: number
  page: number
}

export type RawProductParams = Record<string, string | string[] | undefined>

export function isValidSearch(value: string): boolean {
  return SEARCH_PATTERN.test(value.trim())
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? ""
}

export function parseProductQuery(
  raw: RawProductParams
): ProductQuery & { searchError: string } {
  const rawSearch = first(raw.q).trim()
  const limit = Number(first(raw.limit))
  const page = Number(first(raw.page))

  return {
    q: isValidSearch(rawSearch) ? rawSearch : "",
    searchError: isValidSearch(rawSearch) ? "" : SEARCH_ERROR,
    collection: first(raw.collection),
    tag: first(raw.tag),
    limit: PAGE_SIZE_OPTIONS.includes(limit) ? limit : DEFAULT_PAGE_SIZE,
    page: Number.isInteger(page) && page > 1 ? Math.min(page, MAX_PAGE) : 1,
  }
}

export function buildProductsHref(query: Partial<ProductQuery>): string {
  const params = new URLSearchParams()
  if (query.q) params.set("q", query.q)
  if (query.collection) params.set("collection", query.collection)
  if (query.tag) params.set("tag", query.tag)
  if (query.limit && query.limit !== DEFAULT_PAGE_SIZE) {
    params.set("limit", String(query.limit))
  }
  if (query.page && query.page > 1) params.set("page", String(query.page))

  const queryString = params.toString()
  return queryString ? `/products?${queryString}` : "/products"
}
