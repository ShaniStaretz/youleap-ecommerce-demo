"use client"

import { useRouter } from "next/navigation"
import QuickViewModal from "@/components/QuickViewModal"
import CartDialog from "@/components/cart/CartDialog"
import type { Product } from "@/types/product"

// Intercepted routes sit on top of the previous page, so closing means going back.
function useCloseRoute(intercepted: boolean) {
  const router = useRouter()
  return () => (intercepted ? router.back() : router.replace("/products"))
}

export function QuickViewRoute({
  product,
  intercepted,
}: {
  product: Product
  intercepted: boolean
}) {
  const close = useCloseRoute(intercepted)
  return <QuickViewModal product={product} onClose={close} />
}

export function CartRoute({ intercepted }: { intercepted: boolean }) {
  const close = useCloseRoute(intercepted)
  return <CartDialog onClose={close} />
}
