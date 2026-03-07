import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default async function EscuelaPage({ params, searchParams }) {
  const { codigo } = await params
  const search = await searchParams
  const usuarioCodigo = search?.usuario || ""

  const { data: escuelas, error: errorEscuela } = await supabase
    .from("escuelas")
    .select("*")
    .eq("codigo", Number(codigo))

  if (errorEscuela) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <pre className="bg-slate-100 p-4 rounded-2xl overflow-auto text-sm">
            {JSON.stringify(errorEscuela, null, 2)}
          </pre>
        </div>
      </main>
    )
  }

  if (!escuelas || escuelas.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Escuela no encontrada</h1>
          <p className="text-slate-600">
            No existe una escuela con ese código.
          </p>
        </div>
      </main>
    )
  }

  const escuela = escuelas[0]

  const { data: cuadernillos, error: errorCuadernillos } = await supabase
    .from("cuadernillos")
    .select("*")
    .eq("escuela_codigo", Number(codigo))
    .eq("activo", true)
    .order("anio", { ascending: true })

  const { data: novedades, error: errorNovedades } = await supabase
    .from("novedades")
    .select("*")
    .eq("escuela_codigo", Number(codigo))
    .eq("activo", true)
    .order("created_at", { ascending: false })

  const autorCodigos = [...new Set((novedades || []).map((n) => n.autor_codigo).filter(Boolean))]

  let autoresMap = {}

  if (autorCodigos.length > 0) {
    const { data: autores } = await supabase
      .from("estudiantes")
      .select("codigo,nombre")
      .in("codigo", autorCodigos)

    autoresMap = Object.fromEntries((autores || []).map((a) => [a.codigo, a.nombre]))
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
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

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-blue-700 text-white px-6 py-8 sm:px-8">
            <p className="text-xs uppercase tracking-[0.25em] opacity-80">
              FES Chascomús
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold mt-3">
              {escuela.nombre}
            </h1>
            <p className="text-blue-100 mt-2">
              Código de escuela: {escuela.codigo}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <section>
              <div className="flex items-center justify-between mb-5 gap-4">
                <h2 className="text-2xl font-bold">Novedades</h2>
              </div>

              {errorNovedades ? (
                <div className="bg-white rounded-2xl border p-5">
                  <p className="text-red-600">Error al cargar novedades.</p>
                </div>
              ) : !novedades || novedades.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <p className="text-slate-600">
                    Todavía no hay novedades publicadas para esta escuela.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {novedades.map((item) => (
                    <article
                      key={item.id}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      {item.imagen_url && (
                        <img
                          src={item.imagen_url}
                          alt={item.titulo}
                          className="w-full h-80 object-cover"
                        />
                      )}

                      <div className="p-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                          <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
                            Publicación escolar
                          </p>

                          {item.created_at && (
                            <p className="text-xs text-slate-400">
                              {new Date(item.created_at).toLocaleString("es-AR")}
                            </p>
                          )}
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900">
                          {item.titulo}
                        </h3>

                        <p className="text-slate-700 mt-4 whitespace-pre-line leading-relaxed">
                          {item.contenido}
                        </p>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-slate-500">
                            Publicado por{" "}
                            <span className="font-semibold text-slate-700">
                              {autoresMap[item.autor_codigo] || "Usuario FES"}
                            </span>
                          </p>

                          {item.enlace && (
                            <a
                              href={item.enlace}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                            >
                              Ver más
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-5">Cuadernillos</h2>

              {errorCuadernillos ? (
                <div className="bg-white rounded-2xl border p-5">
                  <p className="text-red-600">
                    Error al cargar cuadernillos.
                  </p>
                </div>
              ) : !cuadernillos || cuadernillos.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <p className="text-slate-600">
                    Todavía no hay cuadernillos cargados para esta escuela.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {cuadernillos.map((item) => (
                    <a
                      key={item.id}
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-50 rounded-2xl p-5 border border-slate-200 block hover:shadow-md transition"
                    >
                      <p className="text-sm text-blue-600 font-semibold mb-1">
                        {item.anio}° año
                      </p>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {item.titulo}
                      </h3>
                      {item.descripcion && (
                        <p className="text-slate-600 mt-2">{item.descripcion}</p>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-12">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h2 className="text-xl font-semibold mb-2">Centro de estudiantes</h2>
                <p className="text-slate-600">
                  Espacio institucional de participación, comunicación y organización estudiantil.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}