"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { z } from "zod"
import { formatPrice } from "@/lib/pricing"
import type { Price } from "@/types/product"

type CartItem = {
  id: string
  productId: string
  productTitle: string
  variantTitle: string
  price: Price
  quantity: number
  inventoryQuantity: number
}

type AddToCartInput = Omit<CartItem, "id" | "quantity">

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  total: number
  addToCart: (item: AddToCartInput) => void
  removeFromCart: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)
const shippingSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  address: z.string().trim().min(5, "Enter a valid address."),
  city: z.string().trim().min(2, "Enter your city."),
  postalCode: z.string().trim().min(3, "Enter a valid postal code."),
})

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used inside CartProvider")
  }
  return context
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState("")
  const [checkoutError, setCheckoutError] = useState("")

  const cart = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const total = items.reduce(
      (sum, item) => sum + item.price.amount * item.quantity,
      0
    )
    return {
      items,
      itemCount,
      total,
      addToCart: (input) => {
        setItems((current) => {
          const existing = current.find((item) => item.id === `${input.productId}:${input.price.amount}:${input.variantTitle}`)
          if (existing) {
            return current.map((item) =>
              item.id === existing.id
                ? { ...item, quantity: Math.min(item.quantity + 1, item.inventoryQuantity) }
                : item
            )
          }
          return [
            ...current,
            {
              ...input,
              id: `${input.productId}:${input.price.amount}:${input.variantTitle}`,
              quantity: 1,
            },
          ]
        })
        setCheckoutMessage("")
        setCheckoutError("")
        setIsOpen(true)
      },
      removeFromCart: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      setQuantity: (id, quantity) =>
        setItems((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.inventoryQuantity)) }
              : item
          )
        ),
    }
  }, [items])

  function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const result = shippingSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) {
      setCheckoutError(result.error.issues[0]?.message ?? "Check your shipping details.")
      setCheckoutMessage("")
      return
    }
    setCheckoutError("")
    setCheckoutMessage("Order confirmed. Thank you for your purchase!")
    setItems([])
    event.currentTarget.reset()
  }

  return (
    <CartContext.Provider value={cart}>
      {children}
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="fixed right-4 top-4 z-40 rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-lg"
      >
        Cart ({cart.itemCount})
      </button>
      {isOpen && (
        <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l bg-white p-5 shadow-2xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Your cart</h2>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-md border px-3 py-1" aria-label="Close cart">
              ×
            </button>
          </div>
          {cart.items.length === 0 ? (
            <>
              <p className="text-gray-600">Your cart is empty.</p>
              {checkoutMessage && <p role="status" className="mt-4 text-sm text-green-700">{checkoutMessage}</p>}
            </>
          ) : (
            <>
              <ul className="space-y-4">
                {cart.items.map((item) => (
                  <li key={item.id} className="border-b pb-4">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.productTitle}</p>
                        <p className="text-sm text-gray-600">{item.variantTitle}</p>
                        <p className="text-sm">{formatPrice(item.price)}</p>
                      </div>
                      <button type="button" onClick={() => cart.removeFromCart(item.id)} className="text-sm underline">
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
                        onChange={(event) => cart.setQuantity(item.id, Number(event.target.value))}
                        className="w-20 rounded-md border px-2 py-1"
                      />
                    </label>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-right text-lg font-bold">Total: {formatPrice({ amount: cart.total, currency_code: cart.items[0].price.currency_code })}</p>
              <form onSubmit={handleCheckout} className="mt-6 space-y-3">
                <h3 className="font-semibold">Checkout</h3>
                {(["name", "address", "city", "postalCode"] as const).map((field) => (
                  <input key={field} name={field} placeholder={field === "postalCode" ? "Postal code" : field[0].toUpperCase() + field.slice(1)} className="w-full rounded-md border px-3 py-2" />
                ))}
                {checkoutError && <p role="alert" className="text-sm text-red-700">{checkoutError}</p>}
                {checkoutMessage && <p role="status" className="text-sm text-green-700">{checkoutMessage}</p>}
                <button type="submit" className="w-full rounded-md bg-black px-4 py-3 text-white">Complete checkout</button>
              </form>
            </>
          )}
        </aside>
      )}
    </CartContext.Provider>
  )
}
