import productsData from "../../mock-data/products.json"
import { toCatalogProduct } from "@/lib/catalog"
import type { CatalogProduct } from "@/types/catalog"
import type { Product } from "@/types/product"

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
