"use client"

import { useState } from "react"

export default function FiltersLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="product-filters"
          onClick={() => setFiltersOpen((isOpen) => !isOpen)}
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          {filtersOpen ? "Hide filters" : "Show filters"}
        </button>
      </div>
      <div
        className={`grid min-w-0 gap-6 lg:gap-8 ${
          filtersOpen ? "lg:grid-cols-[220px_minmax(0,1fr)]" : ""
        }`}
      >
        {filtersOpen && sidebar}
        <section className="min-w-0">{children}</section>
      </div>
    </>
  )
}
