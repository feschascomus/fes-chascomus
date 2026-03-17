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
      .select("codigo, activo")
      .eq("auth_user_id", user.id)
      .maybeSingle()

    if (porAuthId) {
      perfil = porAuthId
    } else if (user.email) {
      const { data: porEmail } = await supabase
        .from("estudiantes")
        .select("codigo, activo")
        .eq("email", user.email)
        .maybeSingle()

      perfil = porEmail
    }
  }

  const logueado = !!perfil && perfil.activo !== false

  const linkCarnet = logueado
    ? `/carne/${perfil.codigo}`
    : "/login"

  const linkPanel = logueado
    ? `/panel/${perfil.codigo}`
    : "/login"

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HERO */}
      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
              FES Chascomús
            </p>

            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
              Plataforma oficial de la Federación de Estudiantes Secundarios
            </h1>

            <p className="mt-5 text-blue-100 max-w-2xl">
              Accedé a tu carné digital, promociones, novedades y cuadernillos desde un solo lugar.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {logueado ? (
                <>
                  <Link
                    href={linkPanel}
                    className="bg-white text-blue-700 px-5 py-3 rounded-2xl font-semibold hover:bg-blue-50"
                  >
                    Ir a mi panel
                  </Link>

                  <Link
                    href={linkCarnet}
                    className="border border-white/30 px-5 py-3 rounded-2xl font-semibold hover:bg-white/20"
                  >
                    Ver mi carnet
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="bg-white text-blue-700 px-5 py-3 rounded-2xl font-semibold hover:bg-blue-50"
                  >
                    Ingresar
                  </Link>

                  <Link
                    href="/registro"
                    className="border border-white/30 px-5 py-3 rounded-2xl font-semibold hover:bg-white/20"
                  >
                    Registrarme
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CARDS */}
      <section className="px-4 pb-10 sm:px-6 sm:pb-14">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">

          {/* 🔥 ESTE ES EL IMPORTANTE */}
          <Link
            href={linkCarnet}
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-xl hover:shadow-2xl transition"
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
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-xl hover:shadow-2xl transition"
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
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-xl hover:shadow-2xl transition"
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
            className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-xl hover:shadow-2xl transition"
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

    </main>
  )
}