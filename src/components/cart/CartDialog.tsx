"use client"

import { useCart } from "@/components/CartProvider"
import CartItemList from "@/components/cart/CartItemList"
import CheckoutForm from "@/components/cart/CheckoutForm"
import { useCheckout } from "@/hooks/useCheckout"
import { useDialogFocus } from "@/hooks/useDialogFocus"
import { formatPrice } from "@/lib/pricing"

export default function CartDialog({ onClose }: { onClose: () => void }) {
  const cart = useCart()
  const checkout = useCheckout(cart.placeOrder)
  const dialogRef = useDialogFocus<HTMLElement>(true, onClose)

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        ref={dialogRef}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 shadow-2xl sm:p-7"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="cart-title" className="text-xl font-bold">Your cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-3 py-1"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {cart.items.length === 0 ? (
          checkout.message ? (
            <p role="status" className="text-sm text-green-700">{checkout.message}</p>
          ) : (
            <p className="text-gray-600">Your cart is empty.</p>
          )
        ) : (
          <>
            <CartItemList />
            {cart.cartError && (
              <p role="alert" className="mt-4 text-sm text-red-700">{cart.cartError}</p>
            )}
            <p className="mt-6 text-right text-lg font-bold">
              Total:{" "}
              {formatPrice({
                amount: cart.total,
                currency_code: cart.items[0].price.currency_code,
              })}
            </p>
            <button
              type="button"
              onClick={cart.clearCart}
              className="mt-3 w-full rounded-md border px-4 py-2 text-sm font-medium"
            >
              Clear cart
            </button>
            {checkout.isOpen ? (
              <CheckoutForm
                errors={checkout.errors}
                message={checkout.message}
                onSubmit={checkout.submit}
                onFieldChange={checkout.clearFieldError}
              />
            ) : (
              <button
                type="button"
                onClick={checkout.open}
                className="mt-6 w-full rounded-md bg-black px-4 py-3 text-white"
              >
                Checkout
              </button>
            )}
          </>
        )}
      </aside>
    </div>
  )
}
