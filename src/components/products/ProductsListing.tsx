import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import FiltersLayout from "@/components/products/FiltersLayout"
import ProductFiltersPanel from "@/components/products/ProductFiltersPanel"
import ProductSearch from "@/components/products/ProductSearch"
import PageSizeSelect from "@/components/products/PageSizeSelect"
import BackToTopButton from "@/components/products/BackToTopButton"
import { hasAvailableVariant } from "@/lib/catalog"
import {
  buildProductsHref,
  parseProductQuery,
  type RawProductParams,
} from "@/lib/productQuery"
import { getProductFilterAggregations, listProducts } from "@/services/products"

export default async function ProductsListing({
  searchParams,
}: {
  searchParams: Promise<RawProductParams>
}) {
  const query = parseProductQuery(await searchParams)
  const filters = { query: query.q, collection: query.collection, tag: query.tag }
  const visibleCount = query.limit * query.page

  const { products } = listProducts(filters, { limit: visibleCount, offset: 0 })
  const aggregations = getProductFilterAggregations(filters)
  const availableProducts = products.filter(hasAvailableVariant)
  const hasMore = visibleCount < aggregations.total

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:p-6">
      <FiltersLayout
        sidebar={
          <ProductFiltersPanel
            collectionOptions={aggregations.collections}
            tagOptions={aggregations.tags}
          />
        }
      >
        <ProductSearch serverError={query.searchError} />
        <PageSizeSelect />
        {availableProducts.length > 0 && (
          <p className="mb-4 text-sm text-gray-600" aria-live="polite">
            Showing {availableProducts.length} available products of {aggregations.total}
          </p>
        )}
        {availableProducts.length === 0 && !query.searchError && (
          <p className="mb-6 rounded-md border p-6 text-center text-gray-600">
            No products match your current search and filters.
          </p>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {availableProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {hasMore && (
          <Link
            href={buildProductsHref({ ...query, page: query.page + 1 })}
            scroll={false}
            className="mx-auto mt-8 block w-fit rounded-md border px-4 py-2 text-sm font-medium"
          >
            Load more products
          </Link>
        )}
      </FiltersLayout>
      <BackToTopButton />
    </main>
  )
}
