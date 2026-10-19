import { notFound } from "next/navigation"
import ProductsListing from "@/components/products/ProductsListing"
import { QuickViewRoute } from "@/components/routes/RouteDialogs"
import type { RawProductParams } from "@/lib/productQuery"
import { getProductById } from "@/services/products"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const product = getProductById((await params).id)
  return product
    ? { title: product.title, description: product.description }
    : {}
}

// Direct visits and refreshes; in-app navigation is handled by @modal/(.)product/[id].
export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<RawProductParams>
}) {
  const product = getProductById((await params).id)
  if (!product) {
    notFound()
  }

  return (
    <>
      <ProductsListing searchParams={searchParams} />
      <QuickViewRoute product={product} intercepted={false} />
    </>
  )
}
