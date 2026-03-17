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

  const { data: usuario, error } = await supabase
    .from("estudiantes")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle()

  if (error || !usuario) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow">
          <h1 className="mb-4 text-3xl font-bold">Usuario no encontrado</h1>
          <p className="text-slate-600">
            No existe un estudiante con ese código.
          </p>
        </div>
      </main>
    )
  }

  const esMismoUsuario =
    (usuario.auth_user_id && usuario.auth_user_id === user.id) ||
    (user.email && usuario.email === user.email)

  if (!esMismoUsuario || usuario.activo === false) {
    redirect("/login")
  }

  const { data: escuela } = await supabase
    .from("escuelas")
    .select("nombre, codigo")
    .eq("codigo", usuario.escuela_codigo)
    .maybeSingle()

  let cuadernillosQuery = supabase
    .from("cuadernillos")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false })

  if (usuario.rol === "fes") {
    cuadernillosQuery = cuadernillosQuery
  } else {
    cuadernillosQuery = cuadernillosQuery
      .eq("escuela_codigo", usuario.escuela_codigo)
      .eq("anio", String(usuario.anio))
  }

  const { data: cuadernillos, error: errorCuadernillos } =
    await cuadernillosQuery

  const puedePublicar =
    usuario.rol === "centro" || usuario.rol === "fes"

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="bg-blue-700 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.25em] opacity-80">
                FES Chascomús
              </p>
              <h1 className="mt-2 text-2xl font-bold">Panel</h1>
              <p className="mt-1 text-sm text-blue-100">{usuario.nombre}</p>
            </div>

            <div className="space-y-3 p-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Rol
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {usuario.rol}
                </p>
              </div>

              {escuela && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Escuela
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {escuela.nombre}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Año que cursa
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {usuario.anio}
                </p>
              </div>

              <nav className="space-y-2 pt-2">
                <Link
                  href={`/panel/${usuario.codigo}`}
                  className="block rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white"
                >
                  Inicio del panel
                </Link>

                <Link
                  href="/"
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium transition hover:bg-slate-100"
                >
                  Ir al inicio
                </Link>

                <Link
                  href={`/carne/${usuario.codigo}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium transition hover:bg-slate-100"
                >
                  Mi carné
                </Link>

                <Link
                  href={`/escuela/${usuario.escuela_codigo}?usuario=${usuario.codigo}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium transition hover:bg-slate-100"
                >
                  Mi escuela
                </Link>

                <Link
                  href={`/promociones?usuario=${usuario.codigo}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium transition hover:bg-slate-100"
                >
                  Promociones
                </Link>

                <Link
                  href={`/escuelas?usuario=${usuario.codigo}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium transition hover:bg-slate-100"
                >
                  Escuelas
                </Link>

                {usuario.rol === "estudiante" && (
                  <Link
                    href="/activar-rol"
                    className="block rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 font-medium transition hover:bg-blue-100"
                  >
                    Ingresar código de centro / FES
                  </Link>
                )}

                {puedePublicar && (
                  <>
                    <Link
                      href="/publicar-novedad"
                      className="block rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 font-medium transition hover:bg-yellow-100"
                    >
                      Publicar novedad
                    </Link>

                    <Link
                      href="/publicar-cuadernillo"
                      className="block rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 font-medium transition hover:bg-yellow-100"
                    >
                      Publicar cuadernillo
                    </Link>
                  </>
                )}

                {usuario.rol === "fes" && (
                  <Link
                    href="/admin-fes"
                    className="block rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 font-medium transition hover:bg-blue-100"
                  >
                    Administración FES
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Bienvenido/a
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              {usuario.nombre}
            </h2>

            <p className="mt-3 max-w-2xl text-slate-500">
              Desde este panel podés acceder a tu carné, tu escuela,
              promociones y materiales.
              {usuario.rol === "fes"
                ? " Como usuario FES, también ves todos los cuadernillos cargados."
                : ""}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">
              {usuario.rol === "fes" ? "Todos los cuadernillos" : "Mis cuadernillos"}
            </h2>

            {errorCuadernillos ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="text-red-600">Error al cargar cuadernillos.</p>
              </div>
            ) : !cuadernillos || cuadernillos.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-slate-600">
                  No hay cuadernillos cargados.
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
                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:shadow-md"
                  >
                    <p className="mb-1 text-sm font-semibold text-blue-600">
                      {item.anio}° año
                      {usuario.rol === "fes" && item.escuela_codigo
                        ? ` · Escuela ${item.escuela_codigo}`
                        : ""}
                    </p>

                    <h3 className="text-xl font-semibold text-slate-900">
                      {item.titulo}
                    </h3>

                    {item.descripcion && (
                      <p className="mt-2 text-slate-600">{item.descripcion}</p>
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