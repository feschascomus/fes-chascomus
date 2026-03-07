import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function EscuelaPage({ params }) {
  const { codigo } = await params
  const supabase = await createClient()

  const { data: escuela } = await supabase
    .from("escuelas")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle()

  if (!escuela) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          Escuela no encontrada
        </div>
      </main>
    )
  }

  const { data: novedades } = await supabase
    .from("novedades")
    .select("*")
    .eq("escuela_codigo", codigo)
    .eq("activo", true)
    .order("created_at", { ascending: false })

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 mb-6">
          <Link
            href="/escuelas"
            className="text-sm text-blue-600 font-medium"
          >
            ← Volver a escuelas
          </Link>

          <h1 className="text-4xl font-bold mt-3 text-slate-900">
            {escuela.nombre}
          </h1>

          <p className="text-slate-500 mt-2">
            Novedades y comunicaciones de la institución.
          </p>
        </div>

        {/* NOVEDADES */}

        <div className="space-y-6">

          {!novedades || novedades.length === 0 && (
            <div className="bg-white rounded-3xl shadow p-6 border border-slate-200">
              No hay novedades publicadas todavía.
            </div>
          )}

          {novedades?.map((novedad) => (
            <div
              key={novedad.id}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
            >

              {/* CONTENIDO */}

              <div className="p-6">

                <h2 className="text-2xl font-bold text-slate-900">
                  {novedad.titulo}
                </h2>

                <p className="text-slate-600 mt-3 whitespace-pre-line">
                  {novedad.contenido}
                </p>

              </div>

              {/* IMAGEN (SIN RECORTE) */}

              {novedad.imagen_url && (
                <div className="px-6 pb-6">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                    <img
                      src={novedad.imagen_url}
                      alt={novedad.titulo}
                      className="w-full max-h-[500px] object-contain"
                    />

                  </div>
                </div>
              )}

              {/* ENLACE */}

              {novedad.enlace && (
                <div className="px-6 pb-6">

                  <a
                    href={novedad.enlace}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                  >
                    Ver más
                  </a>

                </div>
              )}

            </div>
          ))}

        </div>

      </div>
    </main>
  )
}