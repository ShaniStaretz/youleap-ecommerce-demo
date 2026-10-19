import productsData from "../../mock-data/products.json"
import { toCatalogProduct } from "@/lib/catalog"
import type { CatalogProduct } from "@/types/catalog"
import type { Product } from "@/types/product"

type ProductFilters = {
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

function filterProducts({ query, collection, tag }: ProductFilters): Product[] {
  const normalizedQuery = query?.trim().toLowerCase()
  const normalizedCollection = collection?.trim().toLowerCase()
  const normalizedTag = tag?.trim().toLowerCase()
  let filtered = [...productsData]

  if (normalizedQuery) {
    filtered = filtered.filter(
      (product) =>
        product.title.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery)
    )
  }
  if (normalizedCollection) {
    filtered = filtered.filter(
      (product) =>
        product.collection.handle.toLowerCase() === normalizedCollection
    )
  }
  if (normalizedTag) {
    filtered = filtered.filter((product) =>
      product.tags.some((productTag) =>
        productTag.value.toLowerCase() === normalizedTag
      )
    )
  }

  return filtered
}

function countOptions(values: string[]): FilterOption[] {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return Array.from(counts, ([value, count]) => ({ value, count })).sort(
    (first, second) =>
      second.count - first.count || first.value.localeCompare(second.value)
  )
}

export function getProductFilterAggregations(
  filters: ProductFilters
): ProductFilterAggregations {
  const filtered = filterProducts(filters)
  return {
    total: filtered.length,
    collections: countOptions(
      filtered.map((product) => product.collection.handle)
    ),
    tags: countOptions(
      filtered.flatMap((product) =>
        product.tags.map((productTag) => productTag.value)
      )
    ),
  }
}

export function listProducts(
  filters: ProductFilters,
  { limit, offset }: { limit: number; offset: number }
): { products: Product[]; count: number } {
  const filtered = filterProducts(filters)
  return {
    products: filtered.slice(offset, offset + limit),
    count: filtered.length,
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
