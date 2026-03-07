import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default async function EscuelasPage({ searchParams }) {
  const search = await searchParams
  const usuarioCodigo = search?.usuario || ""

  const { data: escuelas, error } = await supabase
    .from("escuelas")
    .select("*")
    .eq("activa", true)
    .order("nombre", { ascending: true })

  if (error) {
    return (
      <main className="px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <h1 className="mb-4 text-3xl font-bold">Escuelas</h1>
          <p className="text-red-600">Error al cargar escuelas.</p>
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
            Escuelas
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Instituciones secundarias adheridas
          </h1>
          <p className="mt-3 text-slate-600">
            Explorá las escuelas de Chascomús que forman parte de la plataforma.
          </p>
        </div>

        {!escuelas || escuelas.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-slate-600">Todavía no hay escuelas cargadas.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {escuelas.map((escuela) => (
              <Link
                href={
                  usuarioCodigo
                    ? `/escuela/${escuela.codigo}?usuario=${usuarioCodigo}`
                    : `/escuela/${escuela.codigo}`
                }
                key={escuela.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:shadow-2xl"
              >
                <h2 className="text-xl font-bold text-slate-900">
                  {escuela.nombre}
                </h2>
                <p className="mt-2 text-slate-500">
                  Código: {escuela.codigo}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}