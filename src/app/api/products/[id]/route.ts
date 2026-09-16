import { NextRequest, NextResponse } from "next/server"
import { getProductById } from "@/services/products"
import {
  HTTP_NOT_FOUND,
  PRODUCT_DETAIL_DELAY_BASE_MS,
  PRODUCT_DETAIL_DELAY_RANGE_MS,
} from "../constants"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await new Promise((r) =>
    setTimeout(
      r,
      PRODUCT_DETAIL_DELAY_BASE_MS +
        Math.random() * PRODUCT_DETAIL_DELAY_RANGE_MS
    )
  )

  const product = getProductById(id)

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: HTTP_NOT_FOUND }
    )
  }

  return NextResponse.json({ product })
}
