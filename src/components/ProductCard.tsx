"use client"

import type { Product } from "@/types/product"

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border bg-white shadow-sm">
      <img
        src={product.thumbnail}
        width={400}
        height={400}
        className="aspect-square h-auto w-full object-cover"
      />
      <div className="p-4">
        <h3 className="break-words text-lg font-medium">{product.title}</h3>
        <p className="text-gray-600 mt-1">
          {(product.variants[0].prices[0].amount / 100).toFixed(2)}
        </p>
        <button
          onClick={() => {}}
          className="mt-3 w-full rounded-md bg-black py-2 text-white text-sm hover:bg-gray-800 transition-colors"
        >
          Quick View
        </button>
      </div>
    </div>
  )
}
