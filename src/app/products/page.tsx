"use client"

import { useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"
import type { Product, ProductsResponse } from "@/types/product"

const SEARCH_PATTERN = /^[\p{L}\p{N}\s'.,:&()+\-/_]{0,100}$/u
const INITIAL_FILTER_OPTION_COUNT = 3
const PRODUCTS_PAGE_SIZE = 12

type FilterOption = {
  value: string
  count: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [offset, setOffset] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [collection, setCollection] = useState("")
  const [tag, setTag] = useState("")
  const [collectionOptions, setCollectionOptions] = useState<FilterOption[]>([])
  const [tagOptions, setTagOptions] = useState<FilterOption[]>([])
  const [collectionsExpanded, setCollectionsExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchError, setSearchError] = useState("")

  useEffect(() => {
    const normalizedSearch = search.trim()

    if (!SEARCH_PATTERN.test(normalizedSearch)) {
      setSearchError(
        "Use up to 100 letters, numbers, spaces, or common punctuation."
      )
      return
    }

    setSearchError("")
    const params = new URLSearchParams()
    params.set("limit", String(PRODUCTS_PAGE_SIZE))
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
    const timeout = setTimeout(() => {
      fetch(`/api/products${params.size ? `?${params}` : ""}`, {
        signal: controller.signal,
      })
        .then((res) => res.json() as Promise<ProductsResponse>)
        .then((data) => {
          setProducts((currentProducts) =>
            offset === 0
              ? data.products
              : [...(currentProducts ?? []), ...data.products]
          )
          setTotalProducts(data.count)
          setCollectionOptions((currentOptions) => {
            if (currentOptions.length > 0) {
              return currentOptions
            }

            const counts = new Map<string, number>()
            data.products.forEach((product) => {
              const value = product.collection.handle
              counts.set(value, (counts.get(value) ?? 0) + 1)
            })

            return Array.from(counts, ([value, count]) => ({ value, count })).sort(
              (first, second) =>
                second.count - first.count || first.value.localeCompare(second.value)
            )
          })
          setTagOptions((currentOptions) => {
            if (currentOptions.length > 0) {
              return currentOptions
            }

            const counts = new Map<string, number>()
            data.products.forEach((product) => {
              product.tags.forEach((productTag) => {
                const value = productTag.value
                counts.set(value, (counts.get(value) ?? 0) + 1)
              })
            })

            return Array.from(counts, ([value, count]) => ({ value, count })).sort(
              (first, second) =>
                second.count - first.count || first.value.localeCompare(second.value)
            )
          })
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return
          }
          throw error
        })
        .finally(() => setIsLoading(false))
    }, 300)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [collection, offset, search, tag])

  const hasMoreProducts = (products?.length ?? 0) < totalProducts

  function handleCollectionChange(value: string) {
    setOffset(0)
    setCollection((currentCollection) =>
      currentCollection === value ? "" : value
    )
  }

  function handleTagChange(value: string) {
    setOffset(0)
    setTag((currentTag) => (currentTag === value ? "" : value))
  }

  function handleSearchChange(value: string) {
    setOffset(0)
    setSearch(value)
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
            <h2 className="mb-4 font-semibold">Filters</h2>
            <fieldset className="mb-6">
              <legend className="mb-2 text-sm font-medium">Collection</legend>
              <label className="mb-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!collection}
                  onChange={() => setCollection("")}
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
                  onChange={() => setTag("")}
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
          <input
            id="product-search"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search products"
            maxLength={100}
            className="mb-6 w-full rounded-md border px-3 py-2"
          />
          {searchError && (
            <p role="alert" className="mb-6 text-sm text-red-600">
              {searchError}
            </p>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasMoreProducts && (
            <button
              type="button"
              onClick={() => setOffset((currentOffset) => currentOffset + PRODUCTS_PAGE_SIZE)}
              disabled={isLoading}
              className="mx-auto mt-8 block rounded-md border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Load more products"}
            </button>
          )}
        </section>
      </div>
    </main>
  )
}
