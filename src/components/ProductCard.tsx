"use client"

export default function ProductCard({ product, onQuickView }: any) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <img
        src={product.thumbnail}
        width={400}
        height={400}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3 className="font-medium text-lg">{product.title}</h3>
        <p className="text-gray-600 mt-1">
          {(product.variants[0].prices[0].amount / 100).toFixed(2)}
        </p>
        <button
          onClick={() => {}}
          className="mt-3 w-full rounded-md bg-black py-2 text-white text-sm hover:bg-gray-800 transition-colors"
        >
          Quick View
        </button>
      </div>
    </div>
  )
}
