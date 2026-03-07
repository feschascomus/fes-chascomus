"use client"

import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function RecuperarPage() {
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const recuperar = async () => {
    if (!email) {
      setErrorMsg("Ingresá tu email")
      setMensaje("")
      return
    }

    setLoading(true)
    setMensaje("")
    setErrorMsg("")

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/nueva-password`,
    })

    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    setMensaje("Revisá tu correo para cambiar la contraseña.")
  }

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
            Recuperación
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Recuperá tu contraseña
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
            Ingresá el email con el que te registraste y te enviaremos un enlace para crear una nueva contraseña.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                placeholder="Ingresá tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              onClick={recuperar}
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar email"}
            </button>

            {mensaje && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {mensaje}
              </div>
            )}

            {errorMsg && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <p className="pt-2 text-center text-sm text-slate-600">
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                Volver al ingreso
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}