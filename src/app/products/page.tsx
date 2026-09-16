"use client"

import { useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"

export default function ProductsPage() {
  const [products, setProducts] = useState<any>(null)

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products))
  }, [])

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  )
}
