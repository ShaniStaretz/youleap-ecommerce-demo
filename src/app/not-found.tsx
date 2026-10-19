import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-gray-600">The page or product you requested does not exist.</p>
      <Link href="/products" className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
        Back to products
      </Link>
    </main>
  )
}
