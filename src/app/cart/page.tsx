import ProductsListing from "@/components/products/ProductsListing"
import { CartRoute } from "@/components/routes/RouteDialogs"
import type { RawProductParams } from "@/lib/productQuery"

export const metadata = { title: "Cart" }

// Direct visits and refreshes; in-app navigation is handled by @modal/(.)cart.
export default function CartPage({
  searchParams,
}: {
  searchParams: Promise<RawProductParams>
}) {
  return (
    <>
      <ProductsListing searchParams={searchParams} />
      <CartRoute intercepted={false} />
    </>
  )
}
