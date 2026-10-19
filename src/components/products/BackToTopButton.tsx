"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

const SHOW_AFTER_PX = 500

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function update() {
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  if (!visible) {
    return null
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
      }}
      className="fixed bottom-5 right-5 z-40 rounded-full border bg-white p-3 shadow-lg transition hover:bg-gray-100"
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  )
}
