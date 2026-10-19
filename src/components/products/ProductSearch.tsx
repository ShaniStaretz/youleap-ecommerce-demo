"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback"
import { useProductsNavigation } from "@/hooks/useProductsNavigation"
import { isValidSearch, SEARCH_ERROR } from "@/lib/productQuery"

const SEARCH_DEBOUNCE_MS = 300

export default function ProductSearch({ serverError }: { serverError: string }) {
  const { query, setSearch } = useProductsNavigation()
  const [input, setInput] = useState(query.q)
  const [appliedQuery, setAppliedQuery] = useState(query.q)
  const debouncedSearch = useDebouncedCallback(setSearch, SEARCH_DEBOUNCE_MS)

  // Follow URL changes made elsewhere (e.g. "Clear all") without clobbering typing.
  if (query.q !== appliedQuery) {
    setAppliedQuery(query.q)
    if (query.q !== input.trim()) {
      setInput(query.q)
    }
  }

  const error = isValidSearch(input) ? serverError : SEARCH_ERROR

  function handleChange(value: string) {
    setInput(value)
    if (isValidSearch(value)) {
      debouncedSearch(value.trim())
    } else {
      debouncedSearch.cancel()
    }
  }

  return (
    <>
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <div className="relative mb-6">
        <input
          id="product-search"
          value={input}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Search products"
          maxLength={100}
          className="w-full rounded-md border px-3 py-2 pr-10"
        />
        {input && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => handleChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mb-6 text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  )
}
