import { NextRequest, NextResponse } from "next/server"
import productsData from "../../../../mock-data/products.json"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const limit = Number(searchParams.get("limit") ?? 12)
  const offset = Number(searchParams.get("offset") ?? 0)
  const query = searchParams.get("q")?.toLowerCase()
  const collection = searchParams.get("collection")
  const tag = searchParams.get("tag")

  await new Promise((r) => setTimeout(r, 200 + Math.random() * 300))

  let filtered = [...productsData]

  if (query) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    )
  }

  if (collection) {
    filtered = filtered.filter((p) => p.collection.handle === collection)
  }

  if (tag) {
    filtered = filtered.filter((p) => p.tags.some((t) => t.value === tag))
  }

  const count = filtered.length
  const products = filtered.slice(offset, offset + limit)

  return NextResponse.json({ products, count, limit, offset })
}
