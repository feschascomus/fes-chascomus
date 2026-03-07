import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default async function PromocionesPage({ searchParams }) {
  const search = await searchParams
  const usuarioCodigo = search?.usuario || ""

  const { data: promociones, error } = await supabase
    .from("promociones")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <main className="px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <h1 className="mb-4 text-3xl font-bold">Promociones</h1>
          <p className="text-red-600">Error al cargar promociones.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        {usuarioCodigo && (
          <div className="mb-4">
            <Link
              href={`/panel/${usuarioCodigo}`}
              className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 transition"
            >
              Volver al panel
            </Link>
          </div>
        )}

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            Beneficios
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Promociones estudiantiles
          </h1>
          <p className="mt-3 text-slate-600">
            Descuentos y beneficios disponibles para estudiantes con carné FES.
          </p>
        </div>

        {!promociones || promociones.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-slate-600">Todavía no hay promociones cargadas.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {promociones.map((promo) => (
              <div
                key={promo.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
              >
                <h2 className="text-xl font-bold text-slate-900">
                  {promo.comercio}
                </h2>

                <p className="mt-3 text-lg font-semibold text-blue-600">
                  {promo.descuento}
                </p>

                <p className="mt-3 text-slate-600">
                  {promo.descripcion}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}