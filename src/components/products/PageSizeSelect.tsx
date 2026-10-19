"use client"

import { useProductsNavigation } from "@/hooks/useProductsNavigation"
import { PAGE_SIZE_OPTIONS } from "@/lib/productQuery"

export default function PageSizeSelect() {
  const { query, setLimit } = useProductsNavigation()

  return (
    <label className="mb-6 flex items-center gap-2 text-sm">
      <span>Products per page</span>
      <select
        value={query.limit}
        onChange={(event) => setLimit(Number(event.target.value))}
        className="rounded-md border px-2 py-1"
      >
        {PAGE_SIZE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
