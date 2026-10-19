import { Inter } from "next/font/google"
import "./globals.css"
import CartProvider from "@/components/CartProvider"
import CartHeader from "@/components/cart/CartHeader"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: { default: "Youleap Store — Dev Test", template: "%s | Youleap Store" },
  description: "Mid-level developer recruitment test",
}

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <CartProvider>
          <CartHeader />
          {children}
          {modal}
        </CartProvider>
      </body>
    </html>
  )
}
