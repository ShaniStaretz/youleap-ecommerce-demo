import { NextRequest, NextResponse } from "next/server"
import { listProducts } from "@/services/products"
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  HTTP_BAD_REQUEST,
  PRODUCTS_LIST_DELAY_BASE_MS,
  PRODUCTS_LIST_DELAY_RANGE_MS,
} from "./constants"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const limit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT)
  const offset = Number(searchParams.get("offset") ?? DEFAULT_OFFSET)
  const query = searchParams.get("q")?.toLowerCase()
  const collection = searchParams.get("collection")?.trim().toLowerCase()
  const tag = searchParams.get("tag")?.trim().toLowerCase()

  if (
    !Number.isInteger(limit) ||
    limit <= 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    return NextResponse.json(
      { error: "limit must be a positive integer and offset must be a non-negative integer" },
      { status: HTTP_BAD_REQUEST }
    )
  }

  await new Promise((r) =>
    setTimeout(
      r,
      PRODUCTS_LIST_DELAY_BASE_MS +
        Math.random() * PRODUCTS_LIST_DELAY_RANGE_MS
    )
  )

  return NextResponse.json(
    listProducts({ limit, offset, query, collection, tag })
  )
}
