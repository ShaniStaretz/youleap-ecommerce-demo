"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import type { Product, ProductVariant } from "@/types/product"
import { formatPrice, getVariantPrice } from "@/lib/pricing"
import { getVariantOptionValues } from "@/lib/catalog"
import { useCart } from "@/components/CartProvider"
import { useDialogFocus } from "@/hooks/useDialogFocus"

type QuickViewModalProps = {
  product: Product
  onClose: () => void
}

export default function QuickViewModal({
  product,
  onClose,
}: QuickViewModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  )
  const [activeImage, setActiveImage] = useState(product.thumbnail)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addToCart, getAvailableStock } = useCart()
  const dialogRef = useDialogFocus(true, onClose)

  useEffect(() => {
    const firstVariant = product.variants[0]
    setSelectedOptions(
      firstVariant
        ? getVariantOptionValues(firstVariant.title, product.options)
        : {}
    )
    setActiveImage(product.thumbnail)
    setAddedToCart(false)
  }, [product])

  const selectedVariant: ProductVariant | undefined = product.variants.find(
    (variant) => {
      const optionValues = getVariantOptionValues(
        variant.title,
        product.options
      )
      return product.options.every(
        (option) => optionValues[option.title] === selectedOptions[option.title]
      )
    }
  )
  const variant = selectedVariant
  const availableStock = variant
    ? getAvailableStock(variant.id, variant.inventory_quantity)
    : 0
  const isInStock = availableStock > 0
  const images = product.images.length > 0
    ? product.images.map((image) => image.url)
    : [product.thumbnail]

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        tabIndex={-1}
        ref={dialogRef}
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="quick-view-title" className="text-xl font-bold sm:text-2xl">
            Quick View
          </h2>
          <button
            type="button"
            aria-label="Close quick view"
            onClick={onClose}
            className="rounded-md border px-3 py-1 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="grid gap-7 md:grid-cols-2">
          <div>
            <Image
              src={activeImage}
              alt={product.title}
              width={800}
              height={800}
              className="aspect-square w-full rounded-md object-cover"
            />
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className="overflow-hidden rounded-md border"
                  aria-label={`View ${product.title} image`}
                >
                  <Image
                    src={image}
                    alt=""
                    width={200}
                    height={200}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="break-words text-2xl font-bold">{product.title}</h3>
            <p className="mt-3 text-gray-600">{product.description}</p>

            <div className="mt-6 space-y-4">
              {product.options.map((option) => (
                <label key={option.id} className="block text-sm font-medium">
                  {option.title}
                  <select
                    value={selectedOptions[option.title] ?? ""}
                    onChange={(event) =>
                      setSelectedOptions((current) => ({
                        ...current,
                        [option.title]: event.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                  >
                    {option.values.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <p className="mt-6 text-2xl font-semibold">
              {formatPrice(variant ? getVariantPrice(variant) : undefined)}
            </p>
            <p className={isInStock ? "text-green-700" : "text-red-700"}>
              {variant
                ? isInStock
                  ? `${availableStock} in stock`
                  : "Out of stock"
                : "Variant unavailable"}
            </p>

            <button
              type="button"
              disabled={!isInStock}
              onClick={() => {
                if (!variant) {
                  return
                }
                const price = getVariantPrice(variant)
                if (!price) {
                  return
                }
                const added = addToCart({
                  productId: product.id,
                  variantId: variant.id,
                  productTitle: product.title,
                  variantTitle: variant.title,
                  price,
                  inventoryQuantity: variant.inventory_quantity,
                })
                if (added) {
                  onClose()
                }
              }}
              className="mt-5 w-full rounded-md bg-black px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addedToCart ? "Added to cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
