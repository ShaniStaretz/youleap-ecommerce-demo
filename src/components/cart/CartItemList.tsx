"use client"

import Link from "next/link"
import { useCart } from "@/components/CartProvider"
import { formatPrice } from "@/lib/pricing"

export default function CartItemList() {
  const { items, setQuantity, removeFromCart } = useCart()

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="border-b pb-4">
          <div className="flex justify-between gap-3">
            <div>
              <Link
                href={`/product/${encodeURIComponent(item.productId)}`}
                className="font-medium underline"
              >
                {item.productTitle}
              </Link>
              <p className="text-sm text-gray-600">{item.variantTitle}</p>
              <p className="text-sm">{formatPrice(item.price)}</p>
            </div>
            <button
              type="button"
              onClick={() => removeFromCart(item.id)}
              className="text-sm underline"
            >
              Remove
            </button>
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm">
            Quantity
            <input
              type="number"
              min={1}
              max={item.inventoryQuantity}
              value={item.quantity}
              onChange={(event) => setQuantity(item.id, Number(event.target.value))}
              className="w-20 rounded-md border px-2 py-1"
            />
          </label>
        </li>
      ))}
    </ul>
  )
}
