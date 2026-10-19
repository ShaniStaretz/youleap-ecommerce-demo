"use client"

import { createContext, useContext, useMemo, useReducer, useState } from "react"
import {
  cartReducer,
  EMPTY_CART,
  findOversoldItem,
  getAvailableStock,
  getCartTotal,
  getItemCount,
  validateAdd,
  type AddToCartInput,
  type CartItem,
} from "@/lib/cart"
import { useCartStorage } from "@/hooks/useCartStorage"
import { useTransientMessage } from "@/hooks/useTransientMessage"

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  total: number
  cartError: string
  cartMessage: string
  addToCart: (item: AddToCartInput) => boolean
  getAvailableStock: (variantId: string, fallback: number) => number
  clearCart: () => void
  removeFromCart: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  placeOrder: () => boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used inside CartProvider")
  }
  return context
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, EMPTY_CART)
  const [cartError, setCartError] = useState("")
  const [cartMessage, showCartMessage] = useTransientMessage(4000)

  useCartStorage(state, dispatch, setCartError)

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount: getItemCount(state.items),
      total: getCartTotal(state.items),
      cartError,
      cartMessage,
      addToCart: (input) => {
        const error = validateAdd(state, input)
        if (error) {
          setCartError(error)
          return false
        }
        dispatch({ type: "add", input })
        setCartError("")
        showCartMessage(`${input.variantTitle} was added to your cart.`)
        return true
      },
      getAvailableStock: (variantId, fallback) =>
        getAvailableStock(state, variantId, fallback),
      clearCart: () => {
        dispatch({ type: "clear" })
        setCartError("")
      },
      removeFromCart: (id) => dispatch({ type: "remove", id }),
      setQuantity: (id, quantity) => dispatch({ type: "setQuantity", id, quantity }),
      placeOrder: () => {
        const oversold = findOversoldItem(state)
        if (oversold) {
          setCartError(`${oversold.variantTitle} does not have enough stock for this order.`)
          return false
        }
        dispatch({ type: "checkout" })
        setCartError("")
        return true
      },
    }),
    [state, cartError, cartMessage, showCartMessage]
  )

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}
