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
  const [cuadernillos, setCuadernillos] = useState([])

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  const [busquedaEstudiante, setBusquedaEstudiante] = useState("")
  const [filtroRol, setFiltroRol] = useState("todos")
  const [filtroActivo, setFiltroActivo] = useState("todos")

  const [filtroCuadernilloEscuela, setFiltroCuadernilloEscuela] = useState("todas")
  const [filtroCuadernilloAnio, setFiltroCuadernilloAnio] = useState("todos")
  const [filtroCuadernilloEstado, setFiltroCuadernilloEstado] = useState("todos")

  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoDni, setNuevoDni] = useState("")
  const [nuevoEmail, setNuevoEmail] = useState("")
  const [nuevoPassword, setNuevoPassword] = useState("")
  const [nuevaEscuela, setNuevaEscuela] = useState("")
  const [nuevoAnio, setNuevoAnio] = useState("")
  const [nuevoRol, setNuevoRol] = useState("estudiante")
  const [creandoUsuario, setCreandoUsuario] = useState(false)

  const [nuevoComercio, setNuevoComercio] = useState("")
  const [nuevoDescuento, setNuevoDescuento] = useState("")
  const [nuevaDescripcionPromo, setNuevaDescripcionPromo] = useState("")
  const [creandoPromo, setCreandoPromo] = useState(false)

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
      cuadernillosRes,
    ] = await Promise.all([
      supabase.from("estudiantes").select("*").order("created_at", { ascending: false }),
      supabase.from("escuelas").select("*").order("nombre", { ascending: true }),
      supabase.from("promociones").select("*").order("created_at", { ascending: false }),
      supabase.from("novedades").select("*").order("created_at", { ascending: false }),
      supabase.from("cuadernillos").select("*").order("created_at", { ascending: false }),
    ])

    setEstudiantes(estudiantesRes.data || [])
    setEscuelas(escuelasRes.data || [])
    setPromociones(promocionesRes.data || [])
    setNovedades(novedadesRes.data || [])
    setCuadernillos(cuadernillosRes.data || [])

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

  const cambiarActivoUsuario = async (estudianteId, activoActual) => {
    const { error } = await supabase
      .from("estudiantes")
      .update({ activo: !activoActual })
      .eq("id", estudianteId)

    if (error) {
      alert("Error al actualizar usuario: " + error.message)
      return
    }

    setEstudiantes((prev) =>
      prev.map((item) =>
        item.id === estudianteId ? { ...item, activo: !activoActual } : item
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

  const cambiarEstadoCuadernillo = async (cuadernilloId, activoActual) => {
    const { error } = await supabase
      .from("cuadernillos")
      .update({ activo: !activoActual })
      .eq("id", cuadernilloId)

    if (error) {
      alert("Error al actualizar cuadernillo: " + error.message)
      return
    }

    setCuadernillos((prev) =>
      prev.map((item) =>
        item.id === cuadernilloId ? { ...item, activo: !activoActual } : item
      )
    )
  }

  const eliminarUsuario = async (estudianteId, nombre) => {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar permanentemente a ${nombre}?`
    )

    if (!confirmar) return

    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estudianteId }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "No se pudo eliminar el usuario")
      return
    }

    alert("Usuario eliminado permanentemente")
    setEstudiantes((prev) => prev.filter((item) => item.id !== estudianteId))
  }

  const eliminarItem = async (tipo, id, textoConfirmacion) => {
    const confirmar = window.confirm(textoConfirmacion)
    if (!confirmar) return

    const res = await fetch("/api/admin/delete-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tipo, id }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "No se pudo eliminar")
      return
    }

    if (tipo === "promocion") {
      setPromociones((prev) => prev.filter((item) => item.id !== id))
    }

    if (tipo === "novedad") {
      setNovedades((prev) => prev.filter((item) => item.id !== id))
    }

    if (tipo === "cuadernillo") {
      setCuadernillos((prev) => prev.filter((item) => item.id !== id))
    }

    alert("Eliminado permanentemente")
  }

  const crearUsuario = async () => {
    if (!nuevoNombre || !nuevoDni || !nuevoEmail || !nuevoPassword || !nuevaEscuela || !nuevoAnio || !nuevoRol) {
      alert("Completá todos los campos")
      return
    }

    setCreandoUsuario(true)

    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nuevoNombre,
        dni: nuevoDni,
        email: nuevoEmail,
        password: nuevoPassword,
        escuela_codigo: nuevaEscuela,
        anio: nuevoAnio,
        rol: nuevoRol,
      }),
    })

    const data = await res.json()
    setCreandoUsuario(false)

    if (!res.ok) {
      alert(data.error || "No se pudo crear el usuario")
      return
    }

    alert("Usuario creado correctamente")

    setNuevoNombre("")
    setNuevoDni("")
    setNuevoEmail("")
    setNuevoPassword("")
    setNuevaEscuela("")
    setNuevoAnio("")
    setNuevoRol("estudiante")

    await cargarTodo()
  }

  const crearPromocion = async () => {
    if (!nuevoComercio || !nuevoDescuento) {
      alert("Completá comercio y descuento")
      return
    }

    setCreandoPromo(true)

    const { error } = await supabase
      .from("promociones")
      .insert([
        {
          comercio: nuevoComercio.trim(),
          descuento: nuevoDescuento.trim(),
          descripcion: nuevaDescripcionPromo.trim() || null,
          activo: true,
        },
      ])

    setCreandoPromo(false)

    if (error) {
      alert("Error al crear promoción: " + error.message)
      return
    }

    alert("Promoción creada correctamente")
    setNuevoComercio("")
    setNuevoDescuento("")
    setNuevaDescripcionPromo("")
    await cargarTodo()
  }

  const mapaEscuelas = {}
  escuelas.forEach((escuela) => {
    mapaEscuelas[escuela.codigo] = escuela.nombre
  })

  const mapaAutores = {}
  estudiantes.forEach((estudiante) => {
    if (estudiante.codigo) {
      mapaAutores[estudiante.codigo] = estudiante.nombre
    }
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

      const coincideActivo =
        filtroActivo === "todos" ||
        (filtroActivo === "activos" && estudiante.activo === true) ||
        (filtroActivo === "inactivos" && estudiante.activo === false)

      return coincideTexto && coincideRol && coincideActivo
    })
  }, [estudiantes, busquedaEstudiante, filtroRol, filtroActivo])

  const cuadernillosFiltrados = useMemo(() => {
    return cuadernillos.filter((item) => {
      const coincideEscuela =
        filtroCuadernilloEscuela === "todas" ||
        String(item.escuela_codigo) === filtroCuadernilloEscuela

      const coincideAnio =
        filtroCuadernilloAnio === "todos" ||
        String(item.anio) === filtroCuadernilloAnio

      const coincideEstado =
        filtroCuadernilloEstado === "todos" ||
        (filtroCuadernilloEstado === "activos" && item.activo === true) ||
        (filtroCuadernilloEstado === "inactivos" && item.activo === false)

      return coincideEscuela && coincideAnio && coincideEstado
    })
  }, [cuadernillos, filtroCuadernilloEscuela, filtroCuadernilloAnio, filtroCuadernilloEstado])

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          Cargando administración FES...
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link
            href="/panel"
            className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            Volver
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <h1 className="mb-4 text-3xl font-bold">Administración FES</h1>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <Link
            href="/panel"
            className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            Volver al panel
          </Link>
        </div>

        <section className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 p-6 text-white shadow-xl sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
            Administración FES
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Panel general de gestión
          </h1>

          <p className="mt-4 max-w-2xl text-blue-100">
            Administrá estudiantes, promociones, novedades, cuadernillos y escuelas de toda la plataforma.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">Estudiantes</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{estudiantes.length}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">Activos</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {estudiantes.filter((x) => x.activo).length}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">Escuelas</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{escuelas.length}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">Novedades</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{novedades.length}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">Cuadernillos</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{cuadernillos.length}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900">Crear nuevo usuario</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Nombre"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
              />

              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="DNI"
                value={nuevoDni}
                onChange={(e) => setNuevoDni(e.target.value)}
              />

              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Email"
                value={nuevoEmail}
                onChange={(e) => setNuevoEmail(e.target.value)}
              />

              <input
                type="password"
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Contraseña"
                value={nuevoPassword}
                onChange={(e) => setNuevoPassword(e.target.value)}
              />

              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={nuevaEscuela}
                onChange={(e) => setNuevaEscuela(e.target.value)}
              >
                <option value="">Seleccionar escuela</option>
                {escuelas.map((escuela) => (
                  <option key={escuela.id} value={escuela.codigo}>
                    {escuela.nombre}
                  </option>
                ))}
              </select>

              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={nuevoAnio}
                onChange={(e) => setNuevoAnio(e.target.value)}
              >
                <option value="">Seleccionar año</option>
                <option value="1">1° año</option>
                <option value="2">2° año</option>
                <option value="3">3° año</option>
                <option value="4">4° año</option>
                <option value="5">5° año</option>
                <option value="6">6° año</option>
              </select>

              <select
                className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                value={nuevoRol}
                onChange={(e) => setNuevoRol(e.target.value)}
              >
                <option value="estudiante">estudiante</option>
                <option value="centro">centro</option>
                <option value="fes">fes</option>
              </select>
            </div>

            <button
              onClick={crearUsuario}
              disabled={creandoUsuario}
              className="mt-5 rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {creandoUsuario ? "Creando..." : "Crear usuario"}
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900">Crear promoción</h2>

            <div className="mt-5 grid gap-3">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Comercio"
                value={nuevoComercio}
                onChange={(e) => setNuevoComercio(e.target.value)}
              />

              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Descuento"
                value={nuevoDescuento}
                onChange={(e) => setNuevoDescuento(e.target.value)}
              />

              <textarea
                className="rounded-2xl border border-slate-200 px-4 py-3 min-h-[120px]"
                placeholder="Descripción (opcional)"
                value={nuevaDescripcionPromo}
                onChange={(e) => setNuevaDescripcionPromo(e.target.value)}
              />

              <button
                onClick={crearPromocion}
                disabled={creandoPromo}
                className="rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {creandoPromo ? "Creando..." : "Crear promoción"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Gestionar estudiantes</h2>
              <p className="mt-2 text-slate-600">
                Podés cambiar roles, desactivar o eliminar permanentemente.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3 lg:w-[760px]">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Buscar por nombre, DNI o email"
                value={busquedaEstudiante}
                onChange={(e) => setBusquedaEstudiante(e.target.value)}
              />

              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
              >
                <option value="todos">Todos los roles</option>
                <option value="estudiante">estudiante</option>
                <option value="centro">centro</option>
                <option value="fes">fes</option>
              </select>

              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={filtroActivo}
                onChange={(e) => setFiltroActivo(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
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
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{estudiante.nombre}</p>
                      <p className="mt-1 text-sm text-slate-600">DNI: {estudiante.dni}</p>
                      <p className="mt-1 text-sm text-slate-600">Email: {estudiante.email || "Sin email"}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Escuela: {mapaEscuelas[estudiante.escuela_codigo] || `Escuela ${estudiante.escuela_codigo}`}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Estado: {estudiante.activo ? "Activo" : "Inactivo"}
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3 xl:w-[620px]">
                      <select
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                        value={estudiante.rol || "estudiante"}
                        onChange={(e) => cambiarRol(estudiante.id, e.target.value)}
                      >
                        <option value="estudiante">estudiante</option>
                        <option value="centro">centro</option>
                        <option value="fes">fes</option>
                      </select>

                      <button
                        onClick={() => cambiarActivoUsuario(estudiante.id, estudiante.activo)}
                        className={`rounded-2xl px-4 py-3 font-medium transition ${
                          estudiante.activo
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {estudiante.activo ? "Desactivar" : "Activar"}
                      </button>

                      <button
                        onClick={() => eliminarUsuario(estudiante.id, estudiante.nombre)}
                        className="rounded-2xl bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-900">Gestionar promociones</h2>
              <span className="text-sm text-slate-500">{promociones.length} total</span>
            </div>

            <div className="mt-5 space-y-3">
              {promociones.length === 0 ? (
                <p className="text-slate-600">No hay promociones cargadas.</p>
              ) : (
                promociones.map((promo) => (
                  <div key={promo.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{promo.comercio}</p>
                    <p className="mt-1 text-sm text-slate-600">{promo.descuento}</p>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        onClick={() => cambiarEstadoPromocion(promo.id, promo.activo)}
                        className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                          promo.activo
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {promo.activo ? "Desactivar" : "Activar"}
                      </button>

                      <button
                        onClick={() =>
                          eliminarItem(
                            "promocion",
                            promo.id,
                            `¿Seguro que querés eliminar permanentemente la promoción de ${promo.comercio}?`
                          )
                        }
                        className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-900">Gestionar novedades</h2>
              <Link
                href="/publicar-novedad"
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Nueva novedad
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {novedades.length === 0 ? (
                <p className="text-slate-600">No hay novedades cargadas.</p>
              ) : (
                novedades.map((novedad) => (
                  <div key={novedad.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{novedad.titulo}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Escuela: {mapaEscuelas[novedad.escuela_codigo] || `Escuela ${novedad.escuela_codigo}`}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        onClick={() => cambiarEstadoNovedad(novedad.id, novedad.activo)}
                        className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                          novedad.activo
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {novedad.activo ? "Desactivar" : "Activar"}
                      </button>

                      <button
                        onClick={() =>
                          eliminarItem(
                            "novedad",
                            novedad.id,
                            `¿Seguro que querés eliminar permanentemente la novedad "${novedad.titulo}"?`
                          )
                        }
                        className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Gestionar cuadernillos</h2>
              <p className="mt-2 text-slate-600">
                Filtrá por escuela y año. Ahora se muestra el nombre de la escuela y quién lo subió.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3 lg:w-[760px]">
              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={filtroCuadernilloEscuela}
                onChange={(e) => setFiltroCuadernilloEscuela(e.target.value)}
              >
                <option value="todas">Todas las escuelas</option>
                {escuelas.map((escuela) => (
                  <option key={escuela.id} value={escuela.codigo}>
                    {escuela.nombre}
                  </option>
                ))}
              </select>

              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={filtroCuadernilloAnio}
                onChange={(e) => setFiltroCuadernilloAnio(e.target.value)}
              >
                <option value="todos">Todos los años</option>
                <option value="1">1° año</option>
                <option value="2">2° año</option>
                <option value="3">3° año</option>
                <option value="4">4° año</option>
                <option value="5">5° año</option>
                <option value="6">6° año</option>
              </select>

              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={filtroCuadernilloEstado}
                onChange={(e) => setFiltroCuadernilloEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {cuadernillosFiltrados.length === 0 ? (
              <p className="text-slate-600">No hay cuadernillos para ese filtro.</p>
            ) : (
              cuadernillosFiltrados.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.titulo}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Escuela: {mapaEscuelas[item.escuela_codigo] || `Escuela ${item.escuela_codigo}`}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">Año: {item.anio}°</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Subido por: {mapaAutores[item.autor_codigo] || item.autor_codigo || "Sin dato"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Estado: {item.activo ? "Activo" : "Inactivo"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Ver archivo
                      </a>

                      <button
                        onClick={() => cambiarEstadoCuadernillo(item.id, item.activo)}
                        className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                          item.activo
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {item.activo ? "Desactivar" : "Activar"}
                      </button>

                      <button
                        onClick={() =>
                          eliminarItem(
                            "cuadernillo",
                            item.id,
                            `¿Seguro que querés eliminar permanentemente el cuadernillo "${item.titulo}"?`
                          )
                        }
                        className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Escuelas</h2>
            <span className="text-sm text-slate-500">{escuelas.length} total</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {escuelas.map((escuela) => (
              <Link
                key={escuela.id}
                href={`/escuela/${escuela.codigo}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
              >
                <p className="font-semibold text-slate-900">{escuela.nombre}</p>
                <p className="mt-1 text-sm text-slate-600">Código: {escuela.codigo}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}