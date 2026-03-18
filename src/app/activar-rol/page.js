"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ActivarRolPage() {
  const router = useRouter()

  const [codigo, setCodigo] = useState("")
  const [loading, setLoading] = useState(false)

  const activar = async () => {
    const codigoFinal = codigo.trim().toUpperCase()

    if (!codigoFinal) {
      alert("Ingresá un código")
      return
    }

    setLoading(true)

    const res = await fetch("/api/roles/redeem-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ codigo: codigoFinal }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      alert(data.error || "No se pudo activar el rol")
      return
    }

    if (data.rol === "centro") {
      alert("Tu cuenta fue actualizada como centro")
    } else if (data.rol === "fes") {
      alert("Tu cuenta fue actualizada como FES")
    } else {
      alert("Tu cuenta fue actualizada")
    }

    router.push("/panel")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
            Activar rol
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Ingresá tu código
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
            Si ya tenés cuenta, podés ingresar un código válido para habilitar tu perfil como centro o FES.
          </p>

          <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-semibold text-white">
              Importante
            </p>
            <p className="mt-2 text-sm leading-relaxed text-blue-100">
              Si ingresás un código de centro, debe pertenecer a tu escuela actual.
              Si ingresás un código FES, tu cuenta pasará al rol FES.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Validación
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Activar centro o FES
            </h2>
            <p className="mt-3 text-slate-500">
              Ingresá tu código para actualizar tu rol sin salir de tu cuenta.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Código
              </label>
              <input
                type="text"
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                placeholder="Ingresá tu código"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              />
            </div>

            <button
              onClick={activar}
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Validando..." : "Activar rol"}
            </button>

            <div className="pt-2 text-center text-sm text-slate-600">
              <Link href="/panel" className="font-medium text-blue-600 hover:underline">
                Volver al panel
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}