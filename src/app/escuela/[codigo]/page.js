import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function EscuelaPage({ params, searchParams }) {
  const { codigo } = await params
  const resolvedSearchParams = await searchParams
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let perfil = null

  if (user) {
    const { data: porAuthId } = await supabase
      .from("estudiantes")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle()

    if (porAuthId) {
      perfil = porAuthId
    } else if (user.email) {
      const { data: porEmail } = await supabase
        .from("estudiantes")
        .select("*")
        .eq("email", user.email)
        .maybeSingle()

      perfil = porEmail
    }
  }

  const { data: novedades } = await supabase
    .from("novedades")
    .select("*")
    .eq("escuela_codigo", codigo)
    .eq("activo", true)
    .order("created_at", { ascending: false })

  let cuadernillos = []
  const mismoColegio =
    perfil &&
    String(perfil.escuela_codigo) === String(codigo) &&
    perfil.activo !== false

  if (mismoColegio) {
    const { data: cuadernillosData } = await supabase
      .from("cuadernillos")
      .select("*")
      .eq("escuela_codigo", codigo)
      .eq("anio", String(perfil.anio))
      .eq("activo", true)
      .order("created_at", { ascending: false })

    cuadernillos = cuadernillosData || []
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={perfil?.codigo ? `/panel/${perfil.codigo}` : "/escuelas"}
              className="text-sm text-blue-600 font-medium"
            >
              ← Volver
            </Link>

            <Link
              href="/"
              className="text-sm text-slate-600 font-medium hover:text-slate-900"
            >
              Ir al inicio
            </Link>
          </div>

          <h1 className="text-4xl font-bold mt-3 text-slate-900">
            {escuela.nombre}
          </h1>

          <p className="text-slate-500 mt-2">
            Novedades, comunicaciones y materiales de la institución.
          </p>

          {mismoColegio && (
            <div className="mt-4 inline-flex rounded-2xl bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700">
              Estás viendo los cuadernillos de {perfil.anio}° año
            </div>
          )}
        </div>

        <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Novedades
            </h2>
            <span className="text-sm text-slate-500">
              {novedades?.length || 0} publicaciones
            </span>
          </div>

          <div className="space-y-6">
            {!novedades || novedades.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                <p className="text-slate-600">
                  No hay novedades publicadas todavía.
                </p>
              </div>
            ) : (
              novedades.map((novedad) => (
                <div
                  key={novedad.id}
                  className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {novedad.titulo}
                    </h3>

                    <p className="text-slate-600 mt-3 whitespace-pre-line">
                      {novedad.contenido}
                    </p>
                  </div>

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
              ))
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Cuadernillos
            </h2>

            {mismoColegio ? (
              <span className="text-sm text-slate-500">
                {cuadernillos.length} de {perfil.anio}° año
              </span>
            ) : (
              <span className="text-sm text-slate-500">
                Iniciá sesión con una cuenta de esta escuela para ver cuadernillos
              </span>
            )}
          </div>

          {!mismoColegio ? (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <p className="text-slate-600">
                Los cuadernillos se muestran según el año y la escuela del estudiante.
              </p>
            </div>
          ) : cuadernillos.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <p className="text-slate-600">
                No hay cuadernillos cargados para {perfil.anio}° año.
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
                    <p className="text-slate-600 mt-2">
                      {item.descripcion}
                    </p>
                  )}
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}