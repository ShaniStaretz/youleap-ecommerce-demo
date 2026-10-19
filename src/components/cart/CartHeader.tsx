"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/CartProvider"

export default function CartHeader() {
  const { itemCount, cartMessage, cartError } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <Link href="/products" className="font-semibold tracking-tight">
          Youleap Store
        </Link>
        <Link
          href="/cart"
          aria-label={`View cart with ${itemCount} items`}
          className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm"
        >
          <ShoppingCart size={18} aria-hidden="true" />
          View cart ({itemCount})
        </Link>
      </div>
      {cartMessage && (
        <p role="status" className="mx-auto mt-2 w-full max-w-7xl text-right text-sm text-green-700">
          {cartMessage}
        </p>
      )}
      {cartError && (
        <p role="alert" className="mx-auto mt-2 w-full max-w-7xl text-right text-sm text-red-700">
          {cartError}
        </p>
      )}
    </header>
  )
}
