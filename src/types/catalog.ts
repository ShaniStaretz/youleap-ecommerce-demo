import type { Product, ProductVariant } from "@/types/product"

export type VariantOptionValues = Record<string, string>

export type CatalogVariant = ProductVariant & {
  option_values: VariantOptionValues
}

export type CatalogProduct = Omit<Product, "variants"> & {
  variants: CatalogVariant[]
}
