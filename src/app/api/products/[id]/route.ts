import { NextRequest, NextResponse } from "next/server"
import productsData from "../../../../../mock-data/products.json"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await new Promise((r) => setTimeout(r, 150 + Math.random() * 200))

  const product = productsData.find((p) => p.id === id)

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json({ product })
}
