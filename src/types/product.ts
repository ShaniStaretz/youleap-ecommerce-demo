export type Price = {
  amount: number
  currency_code: string
}

export type ProductVariant = {
  id: string
  title: string
  sku: string
  prices: Price[]
  inventory_quantity: number
}

export type ProductOption = {
  id: string
  title: string
  values: string[]
}

export type ProductImage = {
  url: string
}

export type ProductTag = {
  value: string
}

export type ProductCollection = {
  id: string
  title: string
  handle: string
}

export type Product = {
  id: string
  title: string
  handle: string
  description: string
  thumbnail: string
  images: ProductImage[]
  variants: ProductVariant[]
  options: ProductOption[]
  tags: ProductTag[]
  collection: ProductCollection
  created_at: string
}

export type ProductsResponse = {
  products: Product[]
  count: number
  limit: number
  offset: number
}

export type ProductResponse = {
  product: Product
}
