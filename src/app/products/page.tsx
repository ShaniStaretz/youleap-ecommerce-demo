"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"
import { ArrowUp, X } from "lucide-react"
import ProductCard from "@/components/ProductCard"
import QuickViewModal from "@/components/QuickViewModal"
import { hasAvailableVariant } from "@/lib/catalog"
import { HTTP_INTERNAL_SERVER_ERROR, HTTP_NOT_FOUND } from "@/lib/http"
import type { Product, ProductsResponse } from "@/types/product"

const SEARCH_PATTERN = /^[\p{L}\p{N}\s'.,:&()+\-/_]{0,100}$/u
const INITIAL_FILTER_OPTION_COUNT = 3
const DEFAULT_PAGE_SIZE = 12
const PAGE_SIZE_OPTIONS = [5, 10, DEFAULT_PAGE_SIZE, 20]

type FilterOption = {
  value: string
  count: number
}

type FilterAggregationsResponse = {
  total: number
  collections: FilterOption[]
  tags: FilterOption[]
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  const body = (await response.json().catch(() => null)) as
    | { error?: string }
    | T
    | null

  if (!response.ok) {
    if (response.status === HTTP_INTERNAL_SERVER_ERROR) {
      throw new Error("The server is temporarily unavailable. Please try again.")
    }
    if (response.status === HTTP_NOT_FOUND) {
      throw new Error("The requested product was not found.")
    }
    const message =
      body && typeof body === "object" && "error" in body && body.error
        ? body.error
        : `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return body as T
}

export default function ProductsPage({
  initialQuickViewId,
}: {
  initialQuickViewId?: string
}) {
  const requestSequence = useRef(0)
  const [products, setProducts] = useState<Product[] | null>(null)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [quickViewId, setQuickViewId] = useState<string | null>(
    initialQuickViewId ?? null
  )
  const [quickViewError, setQuickViewError] = useState("")
  const [quickViewRetry, setQuickViewRetry] = useState(0)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [collection, setCollection] = useState("")
  const [tag, setTag] = useState("")
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE)
  const [offset, setOffset] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [productError, setProductError] = useState("")
  const [productRetry, setProductRetry] = useState(0)
  const [filterRetry, setFilterRetry] = useState(0)
  const [filterError, setFilterError] = useState("")
  const [collectionOptions, setCollectionOptions] = useState<FilterOption[]>([])
  const [tagOptions, setTagOptions] = useState<FilterOption[]>([])
  const [collectionsExpanded, setCollectionsExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    function updateBackToTopVisibility() {
      setShowBackToTop(window.scrollY > 500)
    }

    updateBackToTopVisibility()
    window.addEventListener("scroll", updateBackToTopVisibility, {
      passive: true,
    })
    return () => window.removeEventListener("scroll", updateBackToTopVisibility)
  }, [])

  useEffect(() => {
    function syncQuickViewFromUrl() {
      const productPath = window.location.pathname.match(/^\/product\/([^/]+)$/)
      setQuickViewId(productPath ? decodeURIComponent(productPath[1]) : null)
    }

    syncQuickViewFromUrl()
    window.addEventListener("popstate", syncQuickViewFromUrl)
    return () => window.removeEventListener("popstate", syncQuickViewFromUrl)
  }, [initialQuickViewId])

  useEffect(() => {
    if (!quickViewId) {
      setQuickViewProduct(null)
      setQuickViewError("")
      return
    }

    const loadedProduct = products?.find((product) => product.id === quickViewId)
    if (loadedProduct) {
      setQuickViewProduct(loadedProduct)
      setQuickViewError("")
      return
    }

    if (!products) {
      return
    }

    const controller = new AbortController()
    setQuickViewProduct(null)
    setQuickViewError("")

    fetchJson<{ product: Product }>(
      `/api/products/${encodeURIComponent(quickViewId)}`,
      controller.signal
    )
      .then(({ product }) => setQuickViewProduct(product))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
        setQuickViewError(
          error instanceof Error ? error.message : "Unable to load quick view."
        )
      })

    return () => controller.abort()
  }, [products, quickViewId, quickViewRetry])

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    const normalizedSearch = search.trim()
    const sequence = ++requestSequence.current

    if (!SEARCH_PATTERN.test(normalizedSearch)) {
      setSearchError(
        "Use up to 100 letters, numbers, spaces, or common punctuation."
      )
      setProducts(null)
      setProductError("")
      setIsLoading(false)
      return
    }

    setSearchError("")
    const params = new URLSearchParams()
    params.set("limit", String(limit))
    params.set("offset", String(offset))
    if (normalizedSearch) {
      params.set("q", normalizedSearch)
    }
    if (collection) {
      params.set("collection", collection)
    }
    if (tag) {
      params.set("tag", tag)
    }
    const controller = new AbortController()
    setIsLoading(true)
    setProductError("")
    const timeout = setTimeout(() => {
      fetchJson<ProductsResponse>(`/api/products?${params}`, controller.signal)
        .then((data) => {
          if (sequence !== requestSequence.current) {
            return
          }

          const availableProducts = data.products.filter(hasAvailableVariant)
          setProducts((currentProducts) =>
            offset === 0
              ? availableProducts
              : [...(currentProducts ?? []), ...availableProducts]
          )
          setTotalProducts(data.count)
        })
        .catch((error: unknown) => {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return
          }
          if (sequence === requestSequence.current) {
            setProductError(
              error instanceof Error
                ? error.message
                : "Unable to load products."
            )
          }
        })
        .finally(() => {
          if (sequence === requestSequence.current) {
            setIsLoading(false)
          }
        })

    }, 300)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [collection, limit, offset, productRetry, search, tag])

  useEffect(() => {
    if (offset !== 0) {
      return
    }

    const params = new URLSearchParams()
    if (search.trim()) params.set("q", search.trim())
    if (collection) params.set("collection", collection)
    if (tag) params.set("tag", tag)
    const controller = new AbortController()

    setFilterError("")
    fetchJson<FilterAggregationsResponse>(
      `/api/products/filters${params.size ? `?${params}` : ""}`,
      controller.signal
    )
      .then((data) => {
        setTotalProducts(data.total)
        setCollectionOptions(data.collections)
        setTagOptions(data.tags)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
        setFilterError(
          error instanceof Error ? error.message : "Unable to load filters."
        )
      })

    return () => controller.abort()
  }, [collection, filterRetry, offset, search, tag])

  const hasMoreProducts = offset + limit < totalProducts

  function scrollListingToTop() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    })
  }

  function scrollPageToTop() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    })
  }

  function handleCollectionChange(value: string) {
    scrollListingToTop()
    setOffset(0)
    setCollection((currentCollection) =>
      currentCollection === value ? "" : value
    )
  }

  function handleTagChange(value: string) {
    scrollListingToTop()
    setOffset(0)
    setTag((currentTag) => (currentTag === value ? "" : value))
  }

  function handleLimitChange(value: string) {
    const nextLimit = Number(value)
    if (PAGE_SIZE_OPTIONS.includes(nextLimit)) {
      scrollListingToTop()
      setOffset(0)
      setLimit(nextLimit)
    }
  }

  function handleSearchChange(value: string) {
    setSearchInput(value)
    if (!SEARCH_PATTERN.test(value.trim())) {
      setSearchError(
        "Use up to 100 letters, numbers, spaces, or common punctuation."
      )
      return
    }
    setSearchError("")
    setOffset(0)
    setSearch(value.trim())
  }

  function clearAllFilters() {
    scrollListingToTop()
    setSearchInput("")
    setSearchError("")
    setSearch("")
    setCollection("")
    setTag("")
    setOffset(0)
  }

  function openQuickView(product: Product) {
    window.history.pushState({}, "", `/product/${encodeURIComponent(product.id)}`)
    setQuickViewId(product.id)
    setQuickViewProduct(product)
    setQuickViewError("")
  }

  function closeQuickView() {
    window.history.replaceState({}, "", "/products")
    setQuickViewId(null)
    setQuickViewProduct(null)
    setQuickViewError("")
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="product-filters"
          onClick={() => setFiltersOpen((isOpen) => !isOpen)}
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          {filtersOpen ? "Hide filters" : "Show filters"}
        </button>
      </div>

      <div
        className={`grid min-w-0 gap-6 lg:gap-8 ${
          filtersOpen ? "lg:grid-cols-[220px_minmax(0,1fr)]" : ""
        }`}
      >
        {filtersOpen && (
          <aside
            id="product-filters"
            className="rounded-lg border p-4 lg:sticky lg:top-6 lg:self-start"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold">Filters</h2>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-sm font-medium underline"
              >
                Clear all
              </button>
            </div>
            <fieldset className="mb-6">
              <legend className="mb-2 text-sm font-medium">Collection</legend>
              <label className="mb-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!collection}
                  onChange={() => {
                    setOffset(0)
                    setCollection("")
                  }}
                />
                All collections
              </label>
              {collectionOptions.map((option, index) => (
                <label
                  key={option.value}
                  className={`${collectionsExpanded || index < INITIAL_FILTER_OPTION_COUNT ? "flex" : "hidden lg:flex"} mb-2 items-center gap-2 text-sm`}
                >
                  <input
                    type="checkbox"
                    checked={collection === option.value}
                    onChange={() => handleCollectionChange(option.value)}
                  />
                  <span>{option.value}</span>
                  <span className="text-xs text-gray-500">({option.count})</span>
                </label>
              ))}
              {collectionOptions.length > INITIAL_FILTER_OPTION_COUNT && (
                <button
                  type="button"
                  onClick={() => setCollectionsExpanded((isExpanded) => !isExpanded)}
                  className="text-sm font-medium underline lg:hidden"
                >
                  {collectionsExpanded
                    ? "Show less"
                    : `Load more ${collectionOptions.length - INITIAL_FILTER_OPTION_COUNT}`}
                </button>
              )}
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Tag</legend>
              <label className="mb-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!tag}
                  onChange={() => {
                    setOffset(0)
                    setTag("")
                  }}
                />
                All tags
              </label>
              {tagOptions.map((option, index) => (
                <label
                  key={option.value}
                  className={`${tagsExpanded || index < INITIAL_FILTER_OPTION_COUNT ? "flex" : "hidden lg:flex"} mb-2 items-center gap-2 text-sm`}
                >
                  <input
                    type="checkbox"
                    checked={tag === option.value}
                    onChange={() => handleTagChange(option.value)}
                  />
                  <span>{option.value}</span>
                  <span className="text-xs text-gray-500">({option.count})</span>
                </label>
              ))}
              {tagOptions.length > INITIAL_FILTER_OPTION_COUNT && (
                <button
                  type="button"
                  onClick={() => setTagsExpanded((isExpanded) => !isExpanded)}
                  className="text-sm font-medium underline lg:hidden"
                >
                  {tagsExpanded
                    ? "Show less"
                    : `Load more ${tagOptions.length - INITIAL_FILTER_OPTION_COUNT}`}
                </button>
              )}
            </fieldset>
          </aside>
        )}

        <section className="min-w-0">
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <div className="relative mb-6">
            <input
              id="product-search"
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search products"
              maxLength={100}
              className="w-full rounded-md border px-3 py-2 pr-10"
            />
            {searchInput && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => handleSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>
          <label className="mb-6 flex items-center gap-2 text-sm">
            <span>Products per page</span>
            <select
              value={limit}
              onChange={(event) => handleLimitChange(event.target.value)}
              className="rounded-md border px-2 py-1"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          {searchError && (
            <p role="alert" className="mb-6 text-sm text-red-600">
              {searchError}
            </p>
          )}
          {productError && (
            <div role="alert" className="mb-6 text-sm text-red-600">
              <p>{productError}</p>
              <button
                type="button"
                onClick={() => setProductRetry((retry) => retry + 1)}
                className="mt-2 underline"
              >
                Try again
              </button>
            </div>
          )}
          {filterError && (
            <div role="alert" className="mb-6 text-sm text-red-600">
              <p>{filterError}</p>
              <button
                type="button"
                onClick={() => setFilterRetry((retry) => retry + 1)}
                className="mt-2 underline"
              >
                Try again
              </button>
            </div>
          )}
          {products && products.length > 0 && (
            <p className="mb-4 text-sm text-gray-600" aria-live="polite">
              Showing {products.length} available products of {totalProducts}
            </p>
          )}
          {!isLoading && !productError && !searchError && products?.length === 0 && (
            <p className="mb-6 rounded-md border p-6 text-center text-gray-600">
              No products match your current search and filters.
            </p>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {products?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={openQuickView}
              />
            ))}
          </div>
          {hasMoreProducts && (
            <button
              type="button"
              onClick={() => setOffset((currentOffset) => currentOffset + limit)}
              disabled={isLoading}
              className="mx-auto mt-8 block rounded-md border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Load more products"}
            </button>
          )}
        </section>
      </div>
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={closeQuickView}
        />
      )}
      {quickViewError && (
        <div role="alert" className="mt-6 text-sm text-red-700">
          <p>{quickViewError}</p>
          <button
            type="button"
            onClick={() => setQuickViewRetry((retry) => retry + 1)}
            className="mt-2 underline"
          >
            Try again
          </button>
        </div>
      )}
      {showBackToTop && (
        <button
          type="button"
          aria-label="Back to top"
          onClick={scrollPageToTop}
          className="fixed bottom-5 right-5 z-40 rounded-full border bg-white p-3 shadow-lg transition hover:bg-gray-100"
        >
          <ArrowUp size={20} aria-hidden="true" />
        </button>
      )}
    </main>
  )
}
