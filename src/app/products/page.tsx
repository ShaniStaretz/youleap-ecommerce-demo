import ProductsListing from "@/components/products/ProductsListing"
import type { RawProductParams } from "@/lib/productQuery"

export const metadata = { title: "Products" }

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<RawProductParams>
}) {
  return <ProductsListing searchParams={searchParams} />
}
