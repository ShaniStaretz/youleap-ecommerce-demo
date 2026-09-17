import type { Product, ProductVariant } from "@/types/product"
import type { CatalogProduct, CatalogVariant, VariantOptionValues } from "@/types/catalog"

export function hasAvailableVariant(product: Product): boolean {
  return product.variants.some((variant) => variant.inventory_quantity > 0)
}

export function getVariantOptionValues(
  variantTitle: string,
  options: Product["options"]
): VariantOptionValues {
  const normalizedTitle = variantTitle.toLowerCase()

  return Object.fromEntries(
    options
      .map((option) => {
        const value = option.values.find((optionValue) =>
          normalizedTitle.includes(optionValue.toLowerCase())
        )
        return value ? [option.title, value] : null
      })
      .filter((entry): entry is [string, string] => entry !== null)
  )
}

export function toCatalogVariant(
  variant: ProductVariant,
  options: Product["options"]
): CatalogVariant {
  return {
    ...variant,
    option_values: getVariantOptionValues(variant.title, options),
  }
}

export function toCatalogProduct(product: Product): CatalogProduct {
  return {
    ...product,
    variants: product.variants.map((variant) =>
      toCatalogVariant(variant, product.options)
    ),
  }
}
