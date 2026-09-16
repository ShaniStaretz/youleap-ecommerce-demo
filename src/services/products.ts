import productsData from "../../mock-data/products.json"
import { toCatalogProduct } from "@/lib/catalog"
import type { CatalogProduct } from "@/types/catalog"
import type { Product, ProductsResponse } from "@/types/product"

type ProductListFilters = {
  limit: number
  offset: number
  query?: string
  collection?: string
  tag?: string
}

export type FilterOption = {
  value: string
  count: number
}

export type ProductFilterAggregations = {
  total: number
  collections: FilterOption[]
  tags: FilterOption[]
}

function filterProducts({
  query,
  collection,
  tag,
}: Omit<ProductListFilters, "limit" | "offset">): Product[] {
  const normalizedQuery = query?.trim().toLowerCase()
  const normalizedCollection = collection?.trim().toLowerCase()
  const normalizedTag = tag?.trim().toLowerCase()

  let filteredProducts = [...productsData]

  if (normalizedQuery) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery)
    )
  }

  if (normalizedCollection) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.collection.handle.toLowerCase() === normalizedCollection
    )
  }

  if (normalizedTag) {
    filteredProducts = filteredProducts.filter((product) =>
      product.tags.some((productTag) =>
        productTag.value.toLowerCase() === normalizedTag
      )
    )
  }

  return filteredProducts
}

function countOptions(values: string[]): FilterOption[] {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))

  return Array.from(counts, ([value, count]) => ({ value, count })).sort(
    (first, second) =>
      second.count - first.count || first.value.localeCompare(second.value)
  )
}

export function listProducts({
  limit,
  offset,
  query,
  collection,
  tag,
}: ProductListFilters): ProductsResponse {
  const filteredProducts = filterProducts({ query, collection, tag })

  return {
    products: filteredProducts.slice(offset, offset + limit),
    count: filteredProducts.length,
    limit,
    offset,
  }
}

export function getProductFilterAggregations(
  filters: Omit<ProductListFilters, "limit" | "offset">
): ProductFilterAggregations {
  const filteredProducts = filterProducts(filters)

  return {
    total: filteredProducts.length,
    collections: countOptions(
      filteredProducts.map((product) => product.collection.handle)
    ),
    tags: countOptions(
      filteredProducts.flatMap((product) =>
        product.tags.map((productTag) => productTag.value)
      )
    ),
  }
}

export function getProductById(id: string): Product | undefined {
  return productsData.find((product) => product.id === id)
}

export function getCatalogProductById(id: string): CatalogProduct | undefined {
  const product = getProductById(id)
  if (!product) {
    return undefined
  }

  return toCatalogProduct(product)
}
