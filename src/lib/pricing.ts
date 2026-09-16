import type { Price, Product } from "@/types/product"

export function getStartingPrice(product: Product): Price | undefined {
  const prices = product.variants.flatMap((variant) => variant.prices)
  if (prices.length === 0) {
    return undefined
  }

  const currency = prices[0].currency_code
  return prices
    .filter((price) => price.currency_code === currency)
    .reduce((lowest, price) =>
      price.amount < lowest.amount ? price : lowest
    )
}

export function formatPrice(price: Price | undefined): string {
  if (!price || !Number.isFinite(price.amount)) {
    return "Price unavailable"
  }

  const currencyCode = price.currency_code.toUpperCase()
  if (!/^[A-Z]{3}$/.test(currencyCode)) {
    return "Price unavailable"
  }

  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
  })
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2

  return formatter.format(price.amount / 10 ** fractionDigits)
}
