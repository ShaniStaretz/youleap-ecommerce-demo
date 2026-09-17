import { NextRequest, NextResponse } from "next/server"
import { getProductFilterAggregations } from "@/services/products"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  return NextResponse.json(
    getProductFilterAggregations({
      query: searchParams.get("q") ?? undefined,
      collection: searchParams.get("collection") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
    })
  )
}
