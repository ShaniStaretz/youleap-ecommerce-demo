import { notFound } from "next/navigation"
import { QuickViewRoute } from "@/components/routes/RouteDialogs"
import { getProductById } from "@/services/products"

export default async function InterceptedProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const product = getProductById((await params).id)
  if (!product) {
    notFound()
  }

  return <QuickViewRoute product={product} intercepted />
}
