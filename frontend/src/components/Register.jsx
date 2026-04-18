import { useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGISTER_ENDPOINT = import.meta.env.VITE_REGISTER_API_URL ?? "/api/register"

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [emailError, setEmailError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitFeedback, setSubmitFeedback] = useState({
    type: "",
    message: "",
  })

  function handleChange(event) {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (emailError) setEmailError("")
    if (submitFeedback.message) {
      setSubmitFeedback({
        type: "",
        message: "",
      })
    }
    //
    // if (name === "email") {
    //   if (!value || EMAIL_REGEX.test(value)) {
    //     setEmailError("")   //need to set back to empty error after updating first error
    //   } else {
    //     setEmailError("Please enter a valid email address.")
    //   }
    // }
  }

  async function handleSubmit(event) {
    event.preventDefault()  //do not refresh, remove all states

    if (!EMAIL_REGEX.test(form.email)) {
      setEmailError("Please enter a valid email address.")
      return
    }

    setIsSubmitting(true)
    setSubmitFeedback({
      type: "",
      message: "",
    })

    const requestStartTime = Date.now()

    try {
      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      let result = null
      try {
        result = await response.json()
      } catch {
        result = null
      }

      if (!response.ok) {
        throw new Error(result?.message ?? "Register failed. Please try again.")
      }

      const remainingDelay = Math.max(0, 1000 - (Date.now() - requestStartTime))
      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay))
      }

      setSubmitFeedback({
        type: "success",
        message: result?.message ?? "Register success.",
      })
    } catch (error) {
      const remainingDelay = Math.max(0, 1000 - (Date.now() - requestStartTime))
      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay))
      }

      setSubmitFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Register failed. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-border/60 bg-card p-7 shadow-lg">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
          <p className="text-sm text-muted-foreground">Register a new account to get started.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="username">
              Username
            </label>
            <Input
              id="username"
              name="username"
              placeholder="ooi guan cheng"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="gc@email.com"
              value={form.email}
              onChange={handleChange}
              required
              aria-invalid={Boolean(emailError)}
            />
            {emailError && <p className="text-xs text-red-600 text-destructive">{emailError}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button className="w-full font-medium shadow-sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </Button>

          <Button asChild className="w-full" type="button" variant="outline" disabled={isSubmitting}>
            <Link to="/login">Back to login</Link>
          </Button>

          {submitFeedback.message && (
            <p
              className={`text-sm ${submitFeedback.type === "success" ? "text-green-600" : "text-destructive"}`}
              role="status"
              aria-live="polite"
            >
              {submitFeedback.message}
            </p>
          )}
        </form>
      </div>
    </main>
  )
}

export default Register