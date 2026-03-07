import { Suspense } from "react"
import NuevaPasswordClient from "./NuevaPasswordClient"

export default function NuevaPasswordPage() {
  return (
    <Suspense
      fallback={
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
                Verificando enlace de recuperación...
              </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                Cargando...
              </div>
            </section>
          </div>
        </main>
      }
    >
      <NuevaPasswordClient />
    </Suspense>
  )
}