import type { Product } from "@/types/product"
import Image from "next/image"
import Link from "next/link"
import { formatPrice, getStartingPrice } from "@/lib/pricing"

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border bg-white shadow-sm">
      <Image
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
        <Link
          href={`/product/${encodeURIComponent(product.id)}`}
          scroll={false}
          aria-label={`Quick view ${product.title}`}
          className="mt-3 block w-full rounded-md bg-black py-2 text-center text-white text-sm hover:bg-gray-800 transition-colors"
        >
          Quick View
        </Link>
      </div>
    </div>
  )
}
