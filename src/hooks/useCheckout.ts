import { useState, type FormEvent } from "react"
import { validateShipping, type CheckoutErrors, type CheckoutField } from "@/lib/checkout"

export function useCheckout(placeOrder: () => boolean) {
  const [isOpen, setIsOpen] = useState(false)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [message, setMessage] = useState("")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fieldErrors = validateShipping(new FormData(form))
    const firstInvalid = Object.keys(fieldErrors)[0]

    if (firstInvalid) {
      setErrors(fieldErrors)
      setMessage("")
      document.getElementById(`checkout-${firstInvalid}`)?.focus()
      return
    }
    if (!placeOrder()) {
      return
    }
    setErrors({})
    setMessage("Order confirmed. Thank you for your purchase!")
    setIsOpen(false)
    form.reset()
  }

  return {
    isOpen,
    errors,
    message,
    open: () => setIsOpen(true),
    clearFieldError: (field: CheckoutField) =>
      setErrors((current) => ({ ...current, [field]: undefined })),
    submit,
  }
}
