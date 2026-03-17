import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

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

  const logueado = !!perfil && perfil.activo !== false

  const linkCarnet = logueado ? `/carne/${perfil.codigo}` : "/login"
  const linkPanel = logueado ? `/panel/${perfil.codigo}` : "/login"

  const { data: escuelas } = await supabase
    .from("escuelas")
    .select("*")
    .order("nombre", { ascending: true })

  const mapaEscuelas = {}
  ;(escuelas || []).forEach((escuela) => {
    mapaEscuelas[escuela.codigo] = escuela.nombre
  })

  const { data: novedadesFes } = await supabase
    .from("novedades")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(6)

  let novedadesEscuela = []

  if (logueado && perfil.escuela_codigo) {
    const { data } = await supabase
      .from("novedades")
      .select("*")
      .eq("escuela_codigo", perfil.escuela_codigo)
      .eq("activo", true)
      .order("created_at", { ascending: false })
      .limit(6)

    novedadesEscuela = data || []
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
              FES Chascomús
            </p>

            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
              Plataforma oficial de la Federación de Estudiantes Secundarios
            </h1>

            <p className="mt-5 max-w-2xl text-blue-100">
              Accedé a tu carné digital, promociones, novedades y cuadernillos desde un solo lugar.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {logueado ? (
                <>
                  <Link
                    href={linkPanel}
                    className="rounded-2xl bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    Ir a mi panel
                  </Link>

                  <Link
                    href={linkCarnet}
                    className="rounded-2xl border border-white/30 px-5 py-3 font-semibold hover:bg-white/20"
                  >
                    Ver mi carnet
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-2xl bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    Ingresar
                  </Link>

                  <Link
                    href="/registro"
                    className="rounded-2xl border border-white/30 px-5 py-3 font-semibold hover:bg-white/20"
                  >
                    Registrarme
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 sm:pb-14">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href={linkCarnet}
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:shadow-2xl"
          >
            <p className="text-sm font-semibold text-blue-600">
              Acceso rápido
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Carnet digital
            </h2>

            <p className="mt-3 text-slate-600">
              {logueado
                ? "Accedé a tu carnet estudiantil."
                : "Ingresá o registrate para ver tu carnet."}
            </p>
          </Link>

          <Link
            href="/escuelas"
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:shadow-2xl"
          >
            <p className="text-sm font-semibold text-blue-600">
              Información
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Escuelas
            </h2>

            <p className="mt-3 text-slate-600">
              Novedades y contenido de cada escuela.
            </p>
          </Link>

          <Link
            href="/promociones"
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:shadow-2xl"
          >
            <p className="text-sm font-semibold text-blue-600">
              Beneficios
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Promociones
            </h2>

            <p className="mt-3 text-slate-600">
              Descuentos exclusivos para estudiantes.
            </p>
          </Link>

          <Link
            href={logueado ? linkPanel : "/registro"}
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:shadow-2xl"
          >
            <p className="text-sm font-semibold text-blue-600">
              Cuenta
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Mi cuenta
            </h2>

            <p className="mt-3 text-slate-600">
              {logueado
                ? "Gestioná tu cuenta."
                : "Creá tu cuenta para acceder."}
            </p>
          </Link>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 sm:pb-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Inicio
              </p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900">
                Novedades FES
              </h2>
            </div>
          </div>

          {!novedadesFes || novedadesFes.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <p className="text-slate-600">Todavía no hay novedades publicadas.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {novedadesFes.map((novedad) => (
                <article
                  key={novedad.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
                >
                  <div className="p-6">
                    <p className="text-sm font-semibold text-blue-600">
                      {mapaEscuelas[novedad.escuela_codigo] || "FES Chascomús"}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                      {novedad.titulo}
                    </h3>

                    <p className="mt-3 whitespace-pre-line text-slate-600">
                      {novedad.contenido}
                    </p>
                  </div>

                  {novedad.imagen_url && (
                    <div className="px-6 pb-6">
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        <img
                          src={novedad.imagen_url}
                          alt={novedad.titulo}
                          className="w-full max-h-[420px] object-contain"
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
                        className="inline-block rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                      >
                        Ver más
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {logueado && (
        <section className="px-4 pb-10 sm:px-6 sm:pb-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                  Tu escuela
                </p>
                <h2 className="mt-1 text-3xl font-bold text-slate-900">
                  Novedades de {mapaEscuelas[perfil.escuela_codigo] || "tu escuela"}
                </h2>
              </div>

              <Link
                href={`/escuela/${perfil.escuela_codigo}?usuario=${perfil.codigo}`}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Ver mi escuela
              </Link>
            </div>

            {novedadesEscuela.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                <p className="text-slate-600">Tu escuela todavía no tiene novedades publicadas.</p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {novedadesEscuela.map((novedad) => (
                  <article
                    key={novedad.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
                  >
                    <div className="p-6">
                      <p className="text-sm font-semibold text-blue-600">
                        {mapaEscuelas[novedad.escuela_codigo] || "Tu escuela"}
                      </p>

                      <h3 className="mt-2 text-2xl font-bold text-slate-900">
                        {novedad.titulo}
                      </h3>

                      <p className="mt-3 whitespace-pre-line text-slate-600">
                        {novedad.contenido}
                      </p>
                    </div>

                    {novedad.imagen_url && (
                      <div className="px-6 pb-6">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                          <img
                            src={novedad.imagen_url}
                            alt={novedad.titulo}
                            className="w-full max-h-[420px] object-contain"
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
                          className="inline-block rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                          Ver más
                        </a>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}