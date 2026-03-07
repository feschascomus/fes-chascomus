import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function PanelPage({ params }) {
  const { codigo } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("estudiantes")
    .select("*")
    .eq("codigo", codigo)

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <pre className="bg-slate-100 p-4 rounded-2xl overflow-auto text-sm">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </main>
    )
  }

  if (!data || data.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Usuario no encontrado</h1>
          <p className="text-slate-600">
            No existe un estudiante con ese código o no tenés permisos para verlo.
          </p>
        </div>
      </main>
    )
  }

  const usuario = data[0]

  const { data: escuelas } = await supabase
    .from("escuelas")
    .select("*")
    .eq("codigo", usuario.escuela_codigo)

  const escuela = escuelas && escuelas.length > 0 ? escuelas[0] : null

  const { data: cuadernillos, error: errorCuadernillos } = await supabase
    .from("cuadernillos")
    .select("*")
    .eq("escuela_codigo", usuario.escuela_codigo)
    .eq("anio", String(usuario.anio))
    .eq("activo", true)
    .order("created_at", { ascending: false })

  const puedePublicar =
    usuario.rol === "centro" || usuario.rol === "fes"

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-700 text-white p-6">
              <p className="text-xs uppercase tracking-[0.25em] opacity-80">
                FES Chascomús
              </p>
              <h1 className="text-2xl font-bold mt-2">
                Panel
              </h1>
              <p className="text-sm text-blue-100 mt-1">
                {usuario.nombre}
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Rol
                </p>
                <p className="font-semibold text-slate-900 mt-1">
                  {usuario.rol}
                </p>
              </div>

              {escuela && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Escuela
                  </p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {escuela.nombre}
                  </p>
                </div>
              )}

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Año que cursa
                </p>
                <p className="font-semibold text-slate-900 mt-1">
                  {usuario.anio}
                </p>
              </div>

              <nav className="pt-2 space-y-2">
                <Link
                  href={`/panel/${usuario.codigo}`}
                  className="block bg-slate-900 text-white rounded-2xl px-4 py-3 font-medium"
                >
                  Inicio del panel
                </Link>

                <Link
                  href={`/carne/${usuario.codigo}`}
                  className="block bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-medium hover:bg-slate-100 transition"
                >
                  Mi carné
                </Link>

                <Link
                  href={`/escuela/${usuario.escuela_codigo}?usuario=${usuario.codigo}`}
                  className="block bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-medium hover:bg-slate-100 transition"
                >
                  Mi escuela
                </Link>

                <Link
                  href={`/promociones?usuario=${usuario.codigo}`}
                  className="block bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-medium hover:bg-slate-100 transition"
                >
                  Promociones
                </Link>

                <Link
                  href={`/escuelas?usuario=${usuario.codigo}`}
                  className="block bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-medium hover:bg-slate-100 transition"
                >
                  Escuelas
                </Link>

                {puedePublicar && (
                  <>
                    <Link
                      href="/publicar-novedad"
                      className="block bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 font-medium hover:bg-yellow-100 transition"
                    >
                      Publicar novedad
                    </Link>

                    <Link
                      href="/publicar-cuadernillo"
                      className="block bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 font-medium hover:bg-yellow-100 transition"
                    >
                      Publicar cuadernillo
                    </Link>
                  </>
                )}

                {usuario.rol === "fes" && (
                  <Link
                    href="/admin-fes"
                    className="block bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 font-medium hover:bg-blue-100 transition"
                  >
                    Administración FES
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              Bienvenido/a
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-slate-900">
              {usuario.nombre}
            </h2>

            <p className="text-slate-500 mt-3 max-w-2xl">
              Desde este panel podés acceder a tu carné, tu escuela,
              promociones y materiales.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-5 text-slate-900">
              Mis cuadernillos
            </h2>

            {errorCuadernillos ? (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
                <p className="text-red-600">
                  Error al cargar cuadernillos.
                </p>
              </div>
            ) : !cuadernillos || cuadernillos.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                <p className="text-slate-600">
                  No hay cuadernillos cargados para tu escuela y año.
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
          </div>
        </section>
      </div>
    </main>
  )
}