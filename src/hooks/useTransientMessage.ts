import { useEffect, useState } from "react"

export function useTransientMessage(duration: number) {
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!message) {
      return
    }
    const timeout = setTimeout(() => setMessage(""), duration)
    return () => clearTimeout(timeout)
  }, [message, duration])

  return [message, setMessage] as const
}
