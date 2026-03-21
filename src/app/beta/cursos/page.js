import { createClient } from "@/lib/supabase/server"

export default async function BetaCursosPage() {
  const supabase = await createClient()

  const { data: cursos } = await supabase
    .from("cursos")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false })

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
          <p className="text-sm font-semibold text-blue-600">
            Beta
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Cursos
          </h1>
          <p className="mt-3 text-slate-600">
            Explorá cursos disponibles para estudiantes.
          </p>
        </section>

        {!cursos || cursos.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow border text-center text-slate-600">
            No hay cursos disponibles todavía.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {cursos.map((curso) => (
              <div
                key={curso.id}
                className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200"
              >
                <p className="text-sm text-blue-600 font-semibold">
                  {curso.es_general ? "General" : `Escuela ${curso.escuela_codigo}`}
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  {curso.titulo}
                </h2>

                {curso.descripcion && (
                  <p className="text-slate-600 mt-3">
                    {curso.descripcion}
                  </p>
                )}

                {curso.fecha_inicio && (
                  <p className="text-sm text-slate-500 mt-3">
                    📅 {curso.fecha_inicio}
                  </p>
                )}

                {curso.lugar && (
                  <p className="text-sm text-slate-500">
                    📍 {curso.lugar}
                  </p>
                )}

                {curso.enlace_inscripcion && (
                  <a
                    href={curso.enlace_inscripcion}
                    target="_blank"
                    className="block mt-4 bg-blue-600 text-white px-4 py-3 rounded-xl text-center font-semibold hover:bg-blue-700"
                  >
                    Inscribirme
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}