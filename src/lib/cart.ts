import type { Price } from "@/types/product"

export type CartItem = {
  id: string
  productId: string
  variantId: string
  productTitle: string
  variantTitle: string
  price: Price
  quantity: number
  inventoryQuantity: number
}

export type AddToCartInput = Omit<CartItem, "id" | "quantity">

export type CartState = {
  items: CartItem[]
  stockByVariant: Record<string, number>
}

export type CartAction =
  | { type: "hydrate"; state: CartState }
  | { type: "add"; input: AddToCartInput }
  | { type: "remove"; id: string }
  | { type: "setQuantity"; id: string; quantity: number }
  | { type: "clear" }
  | { type: "checkout" }

export const EMPTY_CART: CartState = { items: [], stockByVariant: {} }

const CART_STORAGE_VERSION = 1
export const CART_STORAGE_KEY = "youleap-cart"

export function getAvailableStock(
  state: CartState,
  variantId: string,
  fallback: number
): number {
  return state.stockByVariant[variantId] ?? fallback
}

export function getItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price.amount * item.quantity, 0)
}

export function validateAdd(
  state: CartState,
  input: AddToCartInput
): string | null {
  const cartCurrency = state.items[0]?.price.currency_code
  if (cartCurrency && cartCurrency !== input.price.currency_code) {
    return "Items in one cart must use the same currency."
  }
  const available = getAvailableStock(
    state,
    input.variantId,
    input.inventoryQuantity
  )
  const inCart =
    state.items.find((item) => item.variantId === input.variantId)?.quantity ?? 0
  if (available <= inCart) {
    return `${input.variantTitle} has no more stock available.`
  }
  return null
}

export function findOversoldItem(state: CartState): CartItem | undefined {
  return state.items.find(
    (item) =>
      item.quantity > getAvailableStock(state, item.variantId, item.inventoryQuantity)
  )
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return action.state
    case "add": {
      const { input } = action
      const stockByVariant =
        state.stockByVariant[input.variantId] === undefined
          ? { ...state.stockByVariant, [input.variantId]: input.inventoryQuantity }
          : state.stockByVariant
      const exists = state.items.some((item) => item.id === input.variantId)
      const items = exists
        ? state.items.map((item) =>
            item.id === input.variantId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...state.items, { ...input, id: input.variantId, quantity: 1 }]
      return { items, stockByVariant }
    }
    case "remove":
      return { ...state, items: state.items.filter((item) => item.id !== action.id) }
    case "setQuantity": {
      if (!Number.isFinite(action.quantity)) {
        return state
      }
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id !== action.id) {
            return item
          }
          const max = getAvailableStock(state, item.variantId, item.inventoryQuantity)
          return {
            ...item,
            quantity: Math.max(1, Math.min(Math.floor(action.quantity), max)),
          }
        }),
      }
    }
    case "clear":
      return { ...state, items: [] }
    case "checkout": {
      const stockByVariant = { ...state.stockByVariant }
      state.items.forEach((item) => {
        stockByVariant[item.variantId] =
          (stockByVariant[item.variantId] ?? item.inventoryQuantity) - item.quantity
      })
      return { items: [], stockByVariant }
    }
  }
}

export function serializeCart(state: CartState): string {
  return JSON.stringify({ version: CART_STORAGE_VERSION, ...state })
}

export function parseStoredCart(raw: string): CartState | null {
  const parsed = JSON.parse(raw) as Partial<CartState> & { version?: number }
  if (parsed.version !== CART_STORAGE_VERSION || !Array.isArray(parsed.items)) {
    return null
  }
  const stock = parsed.stockByVariant
  return {
    items: parsed.items,
    stockByVariant: stock && typeof stock === "object" ? stock : {},
  }
}
