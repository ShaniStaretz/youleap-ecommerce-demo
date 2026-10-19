import type { FormEventHandler } from "react"
import {
  CHECKOUT_FIELDS,
  type CheckoutErrors,
  type CheckoutField,
} from "@/lib/checkout"

type CheckoutFormProps = {
  errors: CheckoutErrors
  message: string
  onSubmit: FormEventHandler<HTMLFormElement>
  onFieldChange: (field: CheckoutField) => void
}

export default function CheckoutForm({
  errors,
  message,
  onSubmit,
  onFieldChange,
}: CheckoutFormProps) {
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <h3 className="font-semibold">Checkout</h3>
      {CHECKOUT_FIELDS.map(({ name, label, autoComplete, placeholder }) => (
        <div key={name}>
          <label className="block text-sm font-medium" htmlFor={`checkout-${name}`}>
            {label}
          </label>
          <input
            id={`checkout-${name}`}
            name={name}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required
            aria-invalid={Boolean(errors[name])}
            aria-describedby={errors[name] ? `${name}-error` : undefined}
            onChange={() => onFieldChange(name)}
            className={`w-full rounded-md border px-3 py-2 ${errors[name] ? "border-red-600 ring-1 ring-red-600" : ""}`}
          />
          {errors[name] && (
            <p id={`${name}-error`} role="alert" className="mt-1 text-sm text-red-700">
              {errors[name]}
            </p>
          )}
        </div>
      ))}
      {message && <p role="status" className="text-sm text-green-700">{message}</p>}
      <button type="submit" className="w-full rounded-md bg-black px-4 py-3 text-white">
        Complete checkout
      </button>
    </form>
  )
}
