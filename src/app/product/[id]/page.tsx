import ProductsPage from "@/app/products/page"
import { getProductById } from "@/services/products"
import { notFound } from "next/navigation"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!getProductById(id)) {
    notFound()
  }

  return <ProductsPage initialQuickViewId={id} />
}
