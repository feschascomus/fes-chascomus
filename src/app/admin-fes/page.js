"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminFesPage() {
  const supabase = createClient()

  const [usuario, setUsuario] = useState(null)

  const [estudiantes, setEstudiantes] = useState([])
  const [escuelas, setEscuelas] = useState([])
  const [promociones, setPromociones] = useState([])
  const [novedades, setNovedades] = useState([])

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  const [busquedaEstudiante, setBusquedaEstudiante] = useState("")
  const [filtroRol, setFiltroRol] = useState("todos")

  const [busquedaPromocion, setBusquedaPromocion] = useState("")
  const [filtroPromocionEstado, setFiltroPromocionEstado] = useState("todas")

  const [busquedaNovedad, setBusquedaNovedad] = useState("")
  const [filtroNovedadEstado, setFiltroNovedadEstado] = useState("todas")
  const [filtroNovedadEscuela, setFiltroNovedadEscuela] = useState("todas")

  useEffect(() => {
    cargarTodo()
  }, [])

  const cargarTodo = async () => {
    setCargando(true)
    setError("")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setError("No hay una sesión activa.")
      setCargando(false)
      return
    }

    let perfil = null

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

    if (!perfil) {
      setError("No se encontró el perfil del usuario.")
      setCargando(false)
      return
    }

    if (perfil.rol !== "fes") {
      setUsuario(perfil)
      setError("Esta sección es solo para usuarios con rol FES.")
      setCargando(false)
      return
    }

    setUsuario(perfil)

    const [
      estudiantesRes,
      escuelasRes,
      promocionesRes,
      novedadesRes,
    ] = await Promise.all([
      supabase.from("estudiantes").select("*").order("created_at", { ascending: false }),
      supabase.from("escuelas").select("*").order("nombre", { ascending: true }),
      supabase.from("promociones").select("*").order("created_at", { ascending: false }),
      supabase.from("novedades").select("*").order("created_at", { ascending: false }),
    ])

    setEstudiantes(estudiantesRes.data || [])
    setEscuelas(escuelasRes.data || [])
    setPromociones(promocionesRes.data || [])
    setNovedades(novedadesRes.data || [])

    setCargando(false)
  }

  const cambiarRol = async (estudianteId, nuevoRol) => {
    const { error } = await supabase
      .from("estudiantes")
      .update({ rol: nuevoRol })
      .eq("id", estudianteId)

    if (error) {
      alert("Error al cambiar rol: " + error.message)
      return
    }

    setEstudiantes((prev) =>
      prev.map((item) =>
        item.id === estudianteId ? { ...item, rol: nuevoRol } : item
      )
    )
  }

  const cambiarEstadoPromocion = async (promoId, activoActual) => {
    const { error } = await supabase
      .from("promociones")
      .update({ activo: !activoActual })
      .eq("id", promoId)

    if (error) {
      alert("Error al actualizar promoción: " + error.message)
      return
    }

    setPromociones((prev) =>
      prev.map((item) =>
        item.id === promoId ? { ...item, activo: !activoActual } : item
      )
    )
  }

  const cambiarEstadoNovedad = async (novedadId, activoActual) => {
    const { error } = await supabase
      .from("novedades")
      .update({ activo: !activoActual })
      .eq("id", novedadId)

    if (error) {
      alert("Error al actualizar novedad: " + error.message)
      return
    }

    setNovedades((prev) =>
      prev.map((item) =>
        item.id === novedadId ? { ...item, activo: !activoActual } : item
      )
    )
  }

  const mapaEscuelas = {}
  escuelas.forEach((escuela) => {
    mapaEscuelas[escuela.codigo] = escuela.nombre
  })

  const estudiantesFiltrados = useMemo(() => {
    const q = busquedaEstudiante.trim().toLowerCase()

    return estudiantes.filter((estudiante) => {
      const coincideTexto =
        q === "" ||
        String(estudiante.nombre || "").toLowerCase().includes(q) ||
        String(estudiante.dni || "").toLowerCase().includes(q) ||
        String(estudiante.email || "").toLowerCase().includes(q)

      const coincideRol =
        filtroRol === "todos" || String(estudiante.rol || "") === filtroRol

      return coincideTexto && coincideRol
    })
  }, [estudiantes, busquedaEstudiante, filtroRol])

  const promocionesFiltradas = useMemo(() => {
    const q = busquedaPromocion.trim().toLowerCase()

    return promociones.filter((promo) => {
      const coincideTexto =
        q === "" ||
        String(promo.comercio || "").toLowerCase().includes(q) ||
        String(promo.descuento || "").toLowerCase().includes(q) ||
        String(promo.descripcion || "").toLowerCase().includes(q)

      const coincideEstado =
        filtroPromocionEstado === "todas" ||
        (filtroPromocionEstado === "activas" && promo.activo === true) ||
        (filtroPromocionEstado === "inactivas" && promo.activo === false)

      return coincideTexto && coincideEstado
    })
  }, [promociones, busquedaPromocion, filtroPromocionEstado])

  const novedadesFiltradas = useMemo(() => {
    const q = busquedaNovedad.trim().toLowerCase()

    return novedades.filter((novedad) => {
      const coincideTexto =
        q === "" ||
        String(novedad.titulo || "").toLowerCase().includes(q) ||
        String(novedad.contenido || "").toLowerCase().includes(q)

      const coincideEstado =
        filtroNovedadEstado === "todas" ||
        (filtroNovedadEstado === "activas" && novedad.activo === true) ||
        (filtroNovedadEstado === "inactivas" && novedad.activo === false)

      const coincideEscuela =
        filtroNovedadEscuela === "todas" ||
        String(novedad.escuela_codigo) === filtroNovedadEscuela

      return coincideTexto && coincideEstado && coincideEscuela
    })
  }, [novedades, busquedaNovedad, filtroNovedadEstado, filtroNovedadEscuela])

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          Cargando administración FES...
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            href="/panel"
            className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            Volver
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <h1 className="text-3xl font-bold mb-4">Administración FES</h1>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Link
            href="/panel"
            className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            Volver al panel
          </Link>
        </div>

        <section className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 p-6 sm:p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
            Administración FES
          </p>

          <h1 className="mt-3 text-3xl sm:text-4xl font-bold">
            Panel general de gestión
          </h1>

          <p className="mt-4 max-w-2xl text-blue-100">
            Administrá estudiantes, roles, promociones y publicaciones de la plataforma.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">Estudiantes</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{estudiantes.length}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">Escuelas</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{escuelas.length}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">Promociones</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{promociones.length}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">Novedades</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{novedades.length}</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Link
            href="/publicar-novedad"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-slate-900">
              Publicar novedad
            </h2>
            <p className="mt-2 text-slate-600">
              Crear publicaciones institucionales o para una escuela específica.
            </p>
          </Link>

          <Link
            href="/publicar-cuadernillo"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-slate-900">
              Publicar cuadernillo
            </h2>
            <p className="mt-2 text-slate-600">
              Subir materiales y PDFs para cualquier escuela.
            </p>
          </Link>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Gestionar estudiantes
              </h2>
              <p className="mt-2 text-slate-600">
                Buscá estudiantes y cambiá su rol dentro de la plataforma.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
              <input
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                placeholder="Buscar por nombre, DNI o email"
                value={busquedaEstudiante}
                onChange={(e) => setBusquedaEstudiante(e.target.value)}
              />

              <select
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
              >
                <option value="todos">Todos los roles</option>
                <option value="estudiante">estudiante</option>
                <option value="centro">centro</option>
                <option value="fes">fes</option>
              </select>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {estudiantesFiltrados.length === 0 ? (
              <p className="text-slate-600">No hay estudiantes que coincidan con la búsqueda.</p>
            ) : (
              estudiantesFiltrados.map((estudiante) => (
                <div
                  key={estudiante.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {estudiante.nombre}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        DNI: {estudiante.dni}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Email: {estudiante.email || "Sin email"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Escuela: {mapaEscuelas[estudiante.escuela_codigo] || `Escuela ${estudiante.escuela_codigo}`}
                      </p>
                    </div>

                    <div className="w-full lg:w-56">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Rol
                      </label>
                      <select
                        className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                        value={estudiante.rol || "estudiante"}
                        onChange={(e) => cambiarRol(estudiante.id, e.target.value)}
                      >
                        <option value="estudiante">estudiante</option>
                        <option value="centro">centro</option>
                        <option value="fes">fes</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Gestionar promociones
                </h2>
                <p className="mt-2 text-slate-600">
                  Buscá promociones y activalas o desactivalas.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                  placeholder="Buscar por comercio o descuento"
                  value={busquedaPromocion}
                  onChange={(e) => setBusquedaPromocion(e.target.value)}
                />

                <select
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                  value={filtroPromocionEstado}
                  onChange={(e) => setFiltroPromocionEstado(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  <option value="activas">Activas</option>
                  <option value="inactivas">Inactivas</option>
                </select>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {promocionesFiltradas.length === 0 ? (
                <p className="text-slate-600">No hay promociones que coincidan con la búsqueda.</p>
              ) : (
                promocionesFiltradas.map((promo) => (
                  <div
                    key={promo.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {promo.comercio}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {promo.descuento}
                    </p>

                    <button
                      onClick={() => cambiarEstadoPromocion(promo.id, promo.activo)}
                      className={`mt-3 rounded-2xl px-4 py-2 text-sm font-medium transition ${
                        promo.activo
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {promo.activo ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Gestionar novedades
                </h2>
                <p className="mt-2 text-slate-600">
                  Filtrá publicaciones por título, estado o escuela.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 sm:col-span-3"
                  placeholder="Buscar por título o contenido"
                  value={busquedaNovedad}
                  onChange={(e) => setBusquedaNovedad(e.target.value)}
                />

                <select
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                  value={filtroNovedadEstado}
                  onChange={(e) => setFiltroNovedadEstado(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  <option value="activas">Activas</option>
                  <option value="inactivas">Inactivas</option>
                </select>

                <select
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 sm:col-span-2"
                  value={filtroNovedadEscuela}
                  onChange={(e) => setFiltroNovedadEscuela(e.target.value)}
                >
                  <option value="todas">Todas las escuelas</option>
                  {escuelas.map((escuela) => (
                    <option key={escuela.id} value={String(escuela.codigo)}>
                      {escuela.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {novedadesFiltradas.length === 0 ? (
                <p className="text-slate-600">No hay novedades que coincidan con la búsqueda.</p>
              ) : (
                novedadesFiltradas.map((novedad) => (
                  <div
                    key={novedad.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {novedad.titulo}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Escuela: {mapaEscuelas[novedad.escuela_codigo] || `Escuela ${novedad.escuela_codigo}`}
                    </p>

                    <button
                      onClick={() => cambiarEstadoNovedad(novedad.id, novedad.activo)}
                      className={`mt-3 rounded-2xl px-4 py-2 text-sm font-medium transition ${
                        novedad.activo
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {novedad.activo ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}