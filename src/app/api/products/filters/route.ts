import { NextRequest, NextResponse } from "next/server"
import { getProductFilterAggregations } from "@/services/products"
import { HTTP_BAD_REQUEST, MAX_QUERY_LENGTH } from "../constants"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.get("q")?.trim()

  if (query && query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `q must be at most ${MAX_QUERY_LENGTH} characters` },
      { status: HTTP_BAD_REQUEST }
    )
  }

  return NextResponse.json(
    getProductFilterAggregations({
      query,
      collection: searchParams.get("collection") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
    })
  )
}
