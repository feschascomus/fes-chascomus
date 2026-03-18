"use client"

import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const login = async () => {
    const emailFinal = email.trim().toLowerCase()

    if (!emailFinal || !password) {
      alert("Completá email y contraseña")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: emailFinal,
      password,
    })

    if (error) {
      setLoading(false)
      alert(error.message)
      return
    }

    router.replace("/panel")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
            Ingreso
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Entrá a tu cuenta
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
            Accedé a tu panel personal para ver tu carné digital, cuadernillos,
            promociones y novedades de tu escuela.
          </p>

          <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-semibold text-white">
              Plataforma FES Chascomús
            </p>
            <p className="mt-2 text-sm leading-relaxed text-blue-100">
              Ingresá con tu cuenta para acceder a toda la experiencia completa
              de la plataforma.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Bienvenido
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Iniciar sesión
            </h2>
            <p className="mt-3 text-slate-500">
              Ingresá tus datos para continuar.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                placeholder="Ingresá tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                type="password"
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                placeholder="Ingresá tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              onClick={login}
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="pt-2 text-center text-sm text-slate-600">
              <Link
                href="/recuperar"
                className="font-medium text-blue-600 hover:underline"
              >
                Olvidé mi contraseña
              </Link>
            </div>

            <div className="pt-2 text-center text-sm text-slate-600">
              ¿Todavía no tenés cuenta?{" "}
              <Link
                href="/registro"
                className="font-medium text-blue-600 hover:underline"
              >
                Registrarme
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}