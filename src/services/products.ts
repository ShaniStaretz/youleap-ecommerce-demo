import productsData from "../../mock-data/products.json"
import type { Product, ProductsResponse } from "@/types/product"

type ProductListFilters = {
  limit: number
  offset: number
  query?: string
  collection?: string
  tag?: string
}

export function listProducts({
  limit,
  offset,
  query,
  collection,
  tag,
}: ProductListFilters): ProductsResponse {
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

  return {
    products: filteredProducts.slice(offset, offset + limit),
    count: filteredProducts.length,
    limit,
    offset,
  }
}

export function getProductById(id: string): Product | undefined {
  return productsData.find((product) => product.id === id)
}
