import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: "",
    password: "",
  })
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
    if (submitFeedback.message) {
      setSubmitFeedback({
        type: "",
        message: "",
      })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setIsSubmitting(true)
    setSubmitFeedback({
      type: "",
      message: "",
    })

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""
    const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`
    const requestStartTime = Date.now()

    try {
      // Simulate backend response if no real API yet, or call real one
      const response = await fetch(LOGIN_ENDPOINT, {
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
        throw new Error(result?.message ?? "Login failed. Please try again.")
      }

      if (result?.token) {
        localStorage.setItem("token", result.token)
      }

      const remainingDelay = Math.max(0, 1000 - (Date.now() - requestStartTime))
      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay))
      }

      setSubmitFeedback({
        type: "success",
        message: result?.message ?? "Login success.",
      })

      setTimeout(() => {
        navigate("/dashboard")
      }, 500)
    } catch (error) {
      const remainingDelay = Math.max(0, 1000 - (Date.now() - requestStartTime))
      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay))
      }

      setSubmitFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Login failed. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-border/60 bg-card p-7 shadow-lg">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue to your account.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="guest@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
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
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>

          <Button asChild className="w-full font-medium" type="button" variant="secondary" disabled={isSubmitting}>
            <Link to="/register">Register</Link>
          </Button>

          {submitFeedback.message && (
            <p
              className={`text-center text-sm ${submitFeedback.type === "success" ? "text-green-600" : "text-destructive"}`}
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

export default Login