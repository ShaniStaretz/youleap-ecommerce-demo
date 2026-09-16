import ProductsPage from "@/app/products/page"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await params

  return <ProductsPage />
}
