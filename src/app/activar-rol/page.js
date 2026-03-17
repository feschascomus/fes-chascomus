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
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
            Activar rol
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Ingresá tu código
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
            Si ya tenés cuenta como estudiante, podés ingresar tu código para habilitar tu perfil como centro o FES.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
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
              {loading ? "Activando..." : "Activar rol"}
            </button>

            <p className="pt-2 text-center text-sm text-slate-600">
              <Link href="/panel" className="font-medium text-blue-600 hover:underline">
                Volver al panel
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}