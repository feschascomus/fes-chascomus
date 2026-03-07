import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default async function Home() {
  const { data: novedades } = await supabase
    .from("novedades")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(3)

  const { data: escuelas } = await supabase
    .from("escuelas")
    .select("*")
    .eq("activa", true)
    .order("nombre", { ascending: true })

  const { data: promociones } = await supabase
    .from("promociones")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(3)

  const mapaEscuelas = {}
  ;(escuelas || []).forEach((escuela) => {
    mapaEscuelas[escuela.codigo] = escuela.nombre
  })

  return (
    <main className="bg-slate-50">
      {/* HERO */}
      <section className="px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 p-6 text-white shadow-xl sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
              FES Chascomús
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              La plataforma digital de estudiantes secundarios de Chascomús
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-100 sm:text-lg">
              Accedé a tu carné estudiantil, materiales por escuela, promociones,
              novedades y herramientas para estudiantes, centros de estudiantes y FES.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Ingresar
              </Link>

              <Link
                href="/registro"
                className="rounded-2xl border border-blue-400 bg-blue-800 px-6 py-4 text-center font-semibold text-white transition hover:bg-blue-950"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <Link
              href="/escuelas"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-900">Escuelas</h2>
              <p className="mt-2 text-slate-600">
                Explorá las instituciones secundarias y sus espacios digitales.
              </p>
            </Link>

            <Link
              href="/promociones"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-900">Promociones</h2>
              <p className="mt-2 text-slate-600">
                Beneficios y descuentos disponibles con tu carné estudiantil.
              </p>
            </Link>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900">Carné digital</h2>
              <p className="mt-2 text-slate-600">
                Código único, validación QR y acceso rápido desde cualquier dispositivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ÚLTIMAS NOVEDADES */}
      <section className="px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Novedades
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Últimas publicaciones
              </h2>
            </div>

            <Link
              href="/escuelas"
              className="hidden rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 sm:inline-flex"
            >
              Ver escuelas
            </Link>
          </div>

          {!novedades || novedades.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <p className="text-slate-600">
                Todavía no hay novedades publicadas.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {novedades.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
                >
                  {item.imagen_url && (
                    <img
                      src={item.imagen_url}
                      alt={item.titulo}
                      className="h-56 w-full object-cover"
                    />
                  )}

                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      {mapaEscuelas[item.escuela_codigo] || `Escuela ${item.escuela_codigo}`}
                    </p>

                    <h3 className="mt-3 text-2xl font-bold text-slate-900">
                      {item.titulo}
                    </h3>

                    <p className="mt-3 line-clamp-4 whitespace-pre-line text-slate-600">
                      {item.contenido}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <Link
                        href={`/escuela/${item.escuela_codigo}`}
                        className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Ver publicación
                      </Link>

                      {item.created_at && (
                        <span className="text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleDateString("es-AR")}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PROMOCIONES DESTACADAS */}
      <section className="px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Beneficios
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Promociones destacadas
              </h2>
            </div>

            <Link
              href="/promociones"
              className="hidden rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 sm:inline-flex"
            >
              Ver todas
            </Link>
          </div>

          {!promociones || promociones.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <p className="text-slate-600">
                Todavía no hay promociones cargadas.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {promociones.map((promo) => (
                <div
                  key={promo.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
                >
                  <h3 className="text-xl font-bold text-slate-900">
                    {promo.comercio}
                  </h3>

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
      </section>

      {/* ROLES */}
      <section className="px-4 pb-10 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            Comunidad
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Una plataforma para toda la red estudiantil
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Estudiantes</h3>
              <p className="mt-2 text-slate-600">
                Acceso a su carné, materiales por año, promociones y novedades escolares.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Centros de estudiantes</h3>
              <p className="mt-2 text-slate-600">
                Publicación de novedades, actividades y materiales dentro de cada escuela.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">FES</h3>
              <p className="mt-2 text-slate-600">
                Gestión general de contenidos, articulación institucional y comunicación estudiantil.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}