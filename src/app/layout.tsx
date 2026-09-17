import { Inter } from "next/font/google"
import "./globals.css"
import CartProvider from "@/components/CartProvider"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: "Youleap Store — Dev Test",
  description: "Mid-level developer recruitment test",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
