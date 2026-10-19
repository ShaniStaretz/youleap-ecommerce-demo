import { useEffect, type Dispatch } from "react"
import {
  CART_STORAGE_KEY,
  EMPTY_CART,
  parseStoredCart,
  serializeCart,
  type CartAction,
  type CartState,
} from "@/lib/cart"

export function useCartStorage(
  state: CartState,
  dispatch: Dispatch<CartAction>,
  onSaveError: (message: string) => void
) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      const parsed = stored ? parseStoredCart(stored) : null
      if (parsed) {
        dispatch({ type: "hydrate", state: parsed })
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY)
    }
  }, [dispatch])

  useEffect(() => {
    // The untouched initial state must not overwrite the stored cart before hydration.
    if (state === EMPTY_CART) {
      return
    }
    try {
      localStorage.setItem(CART_STORAGE_KEY, serializeCart(state))
    } catch {
      onSaveError("Unable to save your cart in this browser.")
    }
  }, [state, onSaveError])
}
