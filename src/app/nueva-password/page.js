"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function NuevaPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState("")
  const [confirmarPassword, setConfirmarPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [mensaje, setMensaje] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const prepararSesion = async () => {
      setErrorMsg("")
      setMensaje("")

      const code = searchParams.get("code")

      if (!code) {
        setVerificando(false)
        setErrorMsg("El enlace de recuperación no es válido o ya expiró.")
        return
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      setVerificando(false)

      if (error) {
        setErrorMsg("No se pudo validar el enlace de recuperación. Pedí uno nuevo.")
        return
      }
    }

    prepararSesion()
  }, [searchParams, supabase])

  const cambiar = async () => {
    if (!password || !confirmarPassword) {
      setErrorMsg("Completá ambos campos")
      setMensaje("")
      return
    }

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres")
      setMensaje("")
      return
    }

    if (password !== confirmarPassword) {
      setErrorMsg("Las contraseñas no coinciden")
      setMensaje("")
      return
    }

    setLoading(true)
    setMensaje("")
    setErrorMsg("")

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    setMensaje("Contraseña actualizada correctamente.")

    setTimeout(() => {
      router.push("/login")
    }, 1200)
  }

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
            Seguridad
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Nueva contraseña
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
            Elegí una nueva contraseña para volver a ingresar a tu cuenta.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          {verificando ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              Verificando enlace de recuperación...
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                  placeholder="Ingresá una nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                  placeholder="Repetí la nueva contraseña"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                />
              </div>

              <button
                onClick={cambiar}
                disabled={loading || !!errorMsg}
                className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Actualizando..." : "Cambiar contraseña"}
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
          )}
        </section>
      </div>
    </main>
  )
}