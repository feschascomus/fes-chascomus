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
      .select("codigo, activo, nombre")
      .eq("auth_user_id", user.id)
      .maybeSingle()

    if (porAuthId) {
      perfil = porAuthId
    } else if (user.email) {
      const { data: porEmail } = await supabase
        .from("estudiantes")
        .select("codigo, activo, nombre")
        .eq("email", user.email)
        .maybeSingle()

      perfil = porEmail
    }
  }

  const logueado = !!perfil && perfil.activo !== false
  const linkCarnet = logueado ? `/carne/${perfil.codigo}` : "/login"
  const linkPanel = logueado ? `/panel/${perfil.codigo}` : "/login"

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
              FES Chascomús
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
              Plataforma oficial de la Federación de Estudiantes Secundarios
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-100 sm:text-lg">
              Accedé a tu carné digital, promociones, novedades, cuadernillos y espacios de tu escuela desde un solo lugar.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {logueado ? (
                <>
                  <Link
                    href={linkPanel}
                    className="rounded-2xl bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    Ir a mi panel
                  </Link>

                  <Link
                    href={linkCarnet}
                    className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
                  >
                    Ver mi carné
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-2xl bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    Ingresar
                  </Link>

                  <Link
                    href="/registro"
                    className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
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
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Acceso rápido
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Carnet digital
            </h2>
            <p className="mt-3 text-slate-600">
              {logueado
                ? "Abrí tu carné estudiantil y mostralo cuando lo necesites."
                : "Ingresá o registrate para acceder a tu carné estudiantil."}
            </p>
          </Link>

          <Link
            href="/escuelas"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Información
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Escuelas
            </h2>
            <p className="mt-3 text-slate-600">
              Conocé los espacios, novedades y materiales de cada institución.
            </p>
          </Link>

          <Link
            href="/promociones"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Beneficios
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Promociones
            </h2>
            <p className="mt-3 text-slate-600">
              Descubrí descuentos, beneficios y oportunidades para estudiantes.
            </p>
          </Link>

          <Link
            href={logueado ? linkPanel : "/registro"}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Plataforma
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Mi cuenta
            </h2>
            <p className="mt-3 text-slate-600">
              {logueado
                ? "Entrá a tu panel personal para gestionar tu cuenta."
                : "Ingresá o registrate para empezar a usar la plataforma."}
            </p>
          </Link>
        </div>
      </section>
    </main>
  )
}