import { useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  })

function handleChange(event){
    const { name, value } = event.target;
    setForm( prev => ({
      ...prev,
      [name]: value
    }))
}

  function handleSubmit(event) {
    event.preventDefault()

    console.log("Login submit:", form)
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

          <Button className="w-full font-medium shadow-sm" type="submit">
            Sign in
          </Button>

          <Button asChild className="w-full font-medium" type="button" variant="secondary">
            <Link to="/register">Register</Link>
          </Button>
        </form>
      </div>
    </main>
  )
}

export default Login