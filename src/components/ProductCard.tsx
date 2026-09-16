"use client"

import type { Product } from "@/types/product"
import { formatPrice, getStartingPrice } from "@/lib/pricing"

type ProductCardProps = {
  product: Product
  onQuickView: (product: Product) => void
}

export default function ProductCard({
  product,
  onQuickView,
}: ProductCardProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border bg-white shadow-sm">
      <img
        src={product.thumbnail}
        width={400}
        height={400}
        alt={product.title}
        className="aspect-square h-auto w-full object-cover"
      />
      <div className="p-4">
        <h3 className="break-words text-lg font-medium">{product.title}</h3>
        <p className="mt-1 text-gray-600">
          {formatPrice(getStartingPrice(product))}
        </p>
        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="mt-3 w-full rounded-md bg-black py-2 text-white text-sm hover:bg-gray-800 transition-colors"
        >
          Quick View
        </button>
      </div>
    </div>
  )
}
