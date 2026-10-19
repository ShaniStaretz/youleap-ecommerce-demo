import { z } from "zod"

export const CHECKOUT_FIELDS = [
  { name: "name", label: "Full name", autoComplete: "name", placeholder: "e.g. Jane Doe" },
  { name: "address", label: "Address", autoComplete: "street-address", placeholder: "e.g. 12 Main Street" },
  { name: "city", label: "City", autoComplete: "address-level2", placeholder: "e.g. Tel Aviv" },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code", placeholder: "e.g. 12345" },
] as const

export type CheckoutField = (typeof CHECKOUT_FIELDS)[number]["name"]
export type CheckoutErrors = Partial<Record<CheckoutField, string>>

const shippingSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name, at least 2 characters."),
  address: z.string().trim().min(5, "Enter your street address, at least 5 characters."),
  city: z.string().trim().min(2, "Enter your city, at least 2 characters."),
  postalCode: z.string().trim().min(3, "Enter your postal code, at least 3 characters."),
})

export function validateShipping(formData: FormData): CheckoutErrors {
  const result = shippingSchema.safeParse(Object.fromEntries(formData))
  if (result.success) {
    return {}
  }
  const errors: CheckoutErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as CheckoutField
    errors[field] ??= issue.message
  }
  return errors
}
