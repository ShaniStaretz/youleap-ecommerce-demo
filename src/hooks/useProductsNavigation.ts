import { useRouter, useSearchParams } from "next/navigation"
import {
  buildProductsHref,
  parseProductQuery,
  type ProductQuery,
} from "@/lib/productQuery"

// The URL is the single source of truth for search, filters and paging.
export function useProductsNavigation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = parseProductQuery(Object.fromEntries(searchParams))

  function update(
    changes: Partial<ProductQuery>,
    { replace = false, scroll = true } = {}
  ) {
    const href = buildProductsHref({ ...query, page: 1, ...changes })
    if (replace) {
      router.replace(href, { scroll })
    } else {
      router.push(href, { scroll })
    }
  }

  return {
    query,
    setSearch: (q: string) => update({ q }, { replace: true, scroll: false }),
    toggleCollection: (value: string) =>
      update({ collection: query.collection === value ? "" : value }),
    toggleTag: (value: string) =>
      update({ tag: query.tag === value ? "" : value }),
    setLimit: (limit: number) => update({ limit }),
    clearAll: () => update({ q: "", collection: "", tag: "" }),
  }
}
