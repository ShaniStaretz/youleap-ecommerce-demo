"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { z } from "zod"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { formatPrice } from "@/lib/pricing"
import type { Price } from "@/types/product"

type CartItem = {
  id: string
  productId: string
  variantId: string
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

type CheckoutField = "name" | "address" | "city" | "postalCode"

function currentCurrency(items: CartItem[]): string | undefined {
  return items[0]?.price.currency_code
}

const CartContext = createContext<CartContextValue | null>(null)
const shippingSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name, at least 2 characters."),
  address: z.string().trim().min(5, "Enter your street address, at least 5 characters."),
  city: z.string().trim().min(2, "Enter your city, at least 2 characters."),
  postalCode: z.string().trim().min(3, "Enter your postal code, at least 3 characters."),
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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState("")
  const [checkoutErrors, setCheckoutErrors] = useState<Partial<Record<CheckoutField, string>>>({})
  const [currencyError, setCurrencyError] = useState("")

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
        const cartCurrency = currentCurrency(items)
        if (cartCurrency && cartCurrency !== input.price.currency_code) {
          setCurrencyError("Items in one cart must use the same currency.")
          return
        }
        setItems((current) => {
          const existing = current.find((item) => item.id === input.variantId)
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
              id: input.variantId,
              quantity: 1,
            },
          ]
        })
        setCheckoutMessage("")
        setCheckoutErrors({})
        setCurrencyError("")
        setIsCheckoutOpen(false)
        setIsOpen(true)
      },
      removeFromCart: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      setQuantity: (id, quantity) =>
        setItems((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: Number.isFinite(quantity)
                    ? Math.max(1, Math.min(Math.floor(quantity), item.inventoryQuantity))
                    : item.quantity,
                }
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
      const errors = result.error.issues.reduce<Partial<Record<CheckoutField, string>>>(
        (fieldErrors, issue) => {
          const field = issue.path[0]
          if (typeof field === "string" && field in shippingSchema.shape) {
            fieldErrors[field as CheckoutField] = issue.message
          }
          return fieldErrors
        },
        {}
      )
      setCheckoutErrors(errors)
      setCheckoutMessage("")
      const firstInvalidField = Object.keys(errors)[0]
      if (firstInvalidField) {
        document.getElementById(`checkout-${firstInvalidField}`)?.focus()
      }
      return
    }
    setCheckoutErrors({})
    setCheckoutMessage("Order confirmed. Thank you for your purchase!")
    setItems([])
    event.currentTarget.reset()
  }

  return (
    <CartContext.Provider value={cart}>
      <header className="sticky top-0 z-40 border-b bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <Link href="/products" className="font-semibold tracking-tight">
            Youleap Store
          </Link>
        <button
          type="button"
          aria-label={`View cart with ${cart.itemCount} items`}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm"
        >
          <ShoppingCart size={18} aria-hidden="true" />
          View cart ({cart.itemCount})
        </button>
        </div>
      </header>
      {children}
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
              {checkoutMessage ? (
                <p role="status" className="text-sm text-green-700">
                  {checkoutMessage}
                </p>
              ) : (
                <p className="text-gray-600">Your cart is empty.</p>
              )}
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
              {currencyError && <p role="alert" className="mt-4 text-sm text-red-700">{currencyError}</p>}
              <p className="mt-6 text-right text-lg font-bold">Total: {formatPrice({ amount: cart.total, currency_code: cart.items[0].price.currency_code })}</p>
              {!isCheckoutOpen ? (
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="mt-6 w-full rounded-md bg-black px-4 py-3 text-white"
                >
                  Checkout
                </button>
              ) : (
              <form onSubmit={handleCheckout} className="mt-6 space-y-3">
                <h3 className="font-semibold">Checkout</h3>
                {([
                  ["name", "Full name", "name"],
                  ["address", "Address", "street-address"],
                  ["city", "City", "address-level2"],
                  ["postalCode", "Postal code", "postal-code"],
                ] as const).map(([field, label, autoComplete]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium" htmlFor={`checkout-${field}`}>
                      {label}
                    </label>
                    <input
                      id={`checkout-${field}`}
                      name={field}
                      placeholder={
                        field === "name"
                          ? "e.g. Jane Doe"
                          : field === "address"
                            ? "e.g. 12 Main Street"
                            : field === "city"
                              ? "e.g. Tel Aviv"
                              : "e.g. 12345"
                      }
                      autoComplete={autoComplete}
                      required
                      aria-invalid={Boolean(checkoutErrors[field])}
                      aria-describedby={checkoutErrors[field] ? `${field}-error` : undefined}
                      onChange={() =>
                        setCheckoutErrors((current) => ({
                          ...current,
                          [field]: undefined,
                        }))
                      }
                      className={`w-full rounded-md border px-3 py-2 ${checkoutErrors[field] ? "border-red-600 ring-1 ring-red-600" : ""}`}
                    />
                    {checkoutErrors[field] && (
                      <p id={`${field}-error`} role="alert" className="mt-1 text-sm text-red-700">
                        {checkoutErrors[field]}
                      </p>
                    )}
                  </div>
                ))}
                {checkoutMessage && <p role="status" className="text-sm text-green-700">{checkoutMessage}</p>}
                <button type="submit" className="w-full rounded-md bg-black px-4 py-3 text-white">Complete checkout</button>
              </form>
              )}
            </>
          )}
        </aside>
      )}
    </CartContext.Provider>
  )
}
