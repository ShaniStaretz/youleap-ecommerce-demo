"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { z } from "zod"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/pricing"
import type { Price } from "@/types/product"
import { useDialogFocus } from "@/hooks/useDialogFocus"

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
  cartError: string
  addToCart: (item: AddToCartInput) => boolean
  getAvailableStock: (variantId: string, fallback: number) => number
  clearCart: () => void
  removeFromCart: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
}

type CheckoutField = "name" | "address" | "city" | "postalCode"

const CART_STORAGE_KEY = "youleap-cart"
const CART_STORAGE_VERSION = 1

type StoredCart = {
  version: number
  items: CartItem[]
  stockByVariant: Record<string, number>
}

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
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [cartMessage, setCartMessage] = useState("")
  const [checkoutMessage, setCheckoutMessage] = useState("")
  const [checkoutErrors, setCheckoutErrors] = useState<Partial<Record<CheckoutField, string>>>({})
  const [cartError, setCartError] = useState("")
  const [stockByVariant, setStockByVariant] = useState<Record<string, number>>({})

  useEffect(() => {
    function syncCartUrl() {
      setIsOpen(window.location.pathname === "/cart")
    }

    syncCartUrl()
    window.addEventListener("popstate", syncCartUrl)
    return () => window.removeEventListener("popstate", syncCartUrl)
  }, [])
  const hasHydratedStorage = useRef(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<StoredCart>
        if (parsed.version === CART_STORAGE_VERSION && Array.isArray(parsed.items)) {
          setItems(parsed.items)
        }
        if (
          parsed.version === CART_STORAGE_VERSION &&
          parsed.stockByVariant &&
          typeof parsed.stockByVariant === "object"
        ) {
          setStockByVariant(parsed.stockByVariant)
        }
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY)
    } finally {
      hasHydratedStorage.current = true
    }
  }, [])

  useEffect(() => {
    if (!hasHydratedStorage.current) {
      return
    }
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ version: CART_STORAGE_VERSION, items, stockByVariant } satisfies StoredCart)
      )
    } catch {
      setCartError("Unable to save your cart in this browser.")
    }
  }, [items, stockByVariant])

  useEffect(() => {
    if (!cartMessage) {
      return
    }
    const timeout = setTimeout(() => setCartMessage(""), 4000)
    return () => clearTimeout(timeout)
  }, [cartMessage])

  function closeCart() {
    router.replace("/products")
    setIsOpen(false)
  }

  const cartDialogRef = useDialogFocus(isOpen, closeCart)

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
      cartError,
      addToCart: (input) => {
        const cartCurrency = currentCurrency(items)
        if (cartCurrency && cartCurrency !== input.price.currency_code) {
          setCartError("Items in one cart must use the same currency.")
          return false
        }
        const availableStock = stockByVariant[input.variantId] ?? input.inventoryQuantity
        const existing = items.find((item) => item.variantId === input.variantId)
        if (availableStock <= (existing?.quantity ?? 0)) {
          setCartError(`${input.variantTitle} has no more stock available.`)
          return false
        }
        if (stockByVariant[input.variantId] === undefined) {
          setStockByVariant((current) => ({
            ...current,
            [input.variantId]: input.inventoryQuantity,
          }))
        }
        setItems((current) => {
          const currentItem = current.find((item) => item.id === input.variantId)
          if (currentItem) {
            return current.map((item) =>
              item.id === currentItem.id
                ? { ...item, quantity: item.quantity + 1 }
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
        setCartError("")
        setIsCheckoutOpen(false)
        setCartMessage(`${input.variantTitle} was added to your cart.`)
        return true
      },
      getAvailableStock: (variantId, fallback) => stockByVariant[variantId] ?? fallback,
      clearCart: () => {
        setItems([])
        setIsCheckoutOpen(false)
        setCheckoutMessage("")
        setCheckoutErrors({})
        setCartError("")
      },
      removeFromCart: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      setQuantity: (id, quantity) =>
        setItems((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: Number.isFinite(quantity)
                    ? Math.max(1, Math.min(Math.floor(quantity), stockByVariant[item.variantId] ?? item.inventoryQuantity))
                    : item.quantity,
                }
              : item
          )
        ),
    }
  }, [cartError, items, stockByVariant])

  function toggleCart() {
    if (isOpen) {
      closeCart()
      return
    }
    window.history.pushState({}, "", "/cart")
    setCheckoutMessage("")
    setIsOpen(true)
  }

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
    const stockError = items.find((item) =>
      item.quantity > (stockByVariant[item.variantId] ?? item.inventoryQuantity)
    )
    if (stockError) {
      setCartError(
        `${stockError.variantTitle} does not have enough stock for this order.`
      )
      return
    }
    setStockByVariant((current) => {
      const next = { ...current }
      items.forEach((item) => {
        next[item.variantId] =
          (next[item.variantId] ?? item.inventoryQuantity) - item.quantity
      })
      return next
    })
    setCartError("")
    setCheckoutErrors({})
    setCheckoutMessage("Order confirmed. Thank you for your purchase!")
    setIsCheckoutOpen(false)
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
          onClick={toggleCart}
          className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm"
        >
          <ShoppingCart size={18} aria-hidden="true" />
          View cart ({cart.itemCount})
        </button>
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
      {children}
      {isOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCart()
            }
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            ref={cartDialogRef}
            tabIndex={-1}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 id="cart-title" className="text-xl font-bold">Your cart</h2>
              <button type="button" onClick={closeCart} className="rounded-md border px-3 py-1" aria-label="Close cart">
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
                        <Link
                          href={`/product/${encodeURIComponent(item.productId)}`}
                          onClick={closeCart}
                          className="font-medium underline"
                        >
                          {item.productTitle}
                        </Link>
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
              {cartError && <p role="alert" className="mt-4 text-sm text-red-700">{cartError}</p>}
              <p className="mt-6 text-right text-lg font-bold">Total: {formatPrice({ amount: cart.total, currency_code: cart.items[0].price.currency_code })}</p>
              <button
                type="button"
                onClick={cart.clearCart}
                className="mt-3 w-full rounded-md border px-4 py-2 text-sm font-medium"
              >
                Clear cart
              </button>
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
        </div>
      )}
    </CartContext.Provider>
  )
}
