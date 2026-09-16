import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Youleap Store</h1>
      <p className="text-gray-600 mb-8">Dev Test</p>
      <Link
        href="/products"
        className="rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800 transition-colors"
      >
        Browse Products
      </Link>
    </main>
  )
}
