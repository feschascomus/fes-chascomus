"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function PublicarNovedadPage() {
  const supabase = createClient()
  const router = useRouter()

  const [usuario, setUsuario] = useState(null)
  const [escuela, setEscuela] = useState(null)
  const [escuelas, setEscuelas] = useState([])
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState("")
  const [titulo, setTitulo] = useState("")
  const [contenido, setContenido] = useState("")
  const [enlace, setEnlace] = useState("")
  const [imagen, setImagen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [publicando, setPublicando] = useState(false)

  useEffect(() => {
    cargarUsuario()
  }, [])

  const cargarUsuario = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      router.push("/login")
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
      alert("No se encontró el perfil del usuario")
      router.push("/login")
      return
    }

    if (perfil.rol !== "centro" && perfil.rol !== "fes") {
      alert("No tenés permisos para publicar novedades")
      router.push("/panel")
      return
    }

    setUsuario(perfil)

    const { data: escuelasData } = await supabase
      .from("escuelas")
      .select("*")
      .eq("activa", true)
      .order("nombre", { ascending: true })

    if (escuelasData) {
      setEscuelas(escuelasData)
    }

    if (perfil.rol === "centro") {
      const { data: escuelaActual } = await supabase
        .from("escuelas")
        .select("*")
        .eq("codigo", perfil.escuela_codigo)
        .maybeSingle()

      if (escuelaActual) {
        setEscuela(escuelaActual)
        setEscuelaSeleccionada(String(perfil.escuela_codigo))
      }
    }

    setCargando(false)
  }

  const subirImagen = async (codigoEscuela) => {
    if (!imagen) return null

    const extension = imagen.name.split(".").pop()
    const nombreArchivo = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
    const rutaArchivo = `${codigoEscuela}/${nombreArchivo}`

    const { error: uploadError } = await supabase.storage
      .from("novedades")
      .upload(rutaArchivo, imagen)

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data } = supabase.storage
      .from("novedades")
      .getPublicUrl(rutaArchivo)

    return data.publicUrl
  }

  const publicar = async () => {
    if (!titulo || !contenido) {
      alert("Completá al menos el título y el contenido")
      return
    }

    if (!usuario) return

    const codigoEscuelaFinal =
      usuario.rol === "fes"
        ? Number(escuelaSeleccionada)
        : Number(usuario.escuela_codigo)

    if (!codigoEscuelaFinal) {
      alert("Seleccioná una escuela")
      return
    }

    setPublicando(true)

    try {
      let imagenUrl = null

      if (imagen) {
        imagenUrl = await subirImagen(codigoEscuelaFinal)
      }

      const { error } = await supabase
        .from("novedades")
        .insert([
          {
            titulo: titulo.trim(),
            contenido: contenido.trim(),
            escuela_codigo: codigoEscuelaFinal,
            autor_codigo: usuario.codigo,
            imagen_url: imagenUrl,
            enlace: enlace.trim() || null,
            activo: true
          }
        ])

      setPublicando(false)

      if (error) {
        alert("Error al publicar: " + error.message)
        return
      }

      alert("Novedad publicada correctamente")
      router.push(`/escuela/${codigoEscuelaFinal}?usuario=${usuario.codigo}`)
    } catch (err) {
      setPublicando(false)
      alert("Error al subir la imagen: " + err.message)
    }
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-md text-center">
          Cargando...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-700 text-white p-6">
              <p className="text-xs uppercase tracking-[0.25em] opacity-80">
                FES Chascomús
              </p>
              <h1 className="text-2xl font-bold mt-2">
                Publicar novedad
              </h1>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Publicando como
                </p>
                <p className="font-semibold text-slate-900 mt-1">
                  {usuario?.nombre}
                </p>
              </div>

              {usuario?.rol === "centro" && escuela && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Escuela
                  </p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {escuela.nombre}
                  </p>
                </div>
              )}

              <nav className="space-y-2 pt-2">
                <Link
                  href="/panel"
                  className="block bg-slate-900 text-white rounded-2xl px-4 py-3 font-medium"
                >
                  Volver al panel
                </Link>
              </nav>
            </div>
          </div>
        </aside>

        <section>
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5 sm:p-8">
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              Crear publicación
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-slate-900">
              Nueva novedad
            </h2>

            <p className="text-slate-500 mt-3 mb-6">
              Publicá información importante para estudiantes, actividades, avisos, fechas o comunicados.
            </p>

            {usuario?.rol === "fes" && (
              <select
                className="border border-slate-200 p-3 mb-4 block w-full rounded-2xl"
                value={escuelaSeleccionada}
                onChange={(e) => setEscuelaSeleccionada(e.target.value)}
              >
                <option value="">Seleccionar escuela</option>
                {escuelas.map((esc) => (
                  <option key={esc.id} value={esc.codigo}>
                    {esc.nombre}
                  </option>
                ))}
              </select>
            )}

            <input
              className="border border-slate-200 p-3 mb-4 block w-full rounded-2xl"
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />

            <textarea
              className="border border-slate-200 p-3 mb-4 block w-full rounded-2xl min-h-[220px]"
              placeholder="Escribí la novedad. Podés usar texto largo, párrafos, horarios, links, emojis e información importante."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
            />

            <input
              className="border border-slate-200 p-3 mb-4 block w-full rounded-2xl"
              placeholder="Enlace externo (opcional)"
              value={enlace}
              onChange={(e) => setEnlace(e.target.value)}
            />

            <div className="mb-5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Imagen (opcional)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600"
              />
            </div>

            <button
              onClick={publicar}
              disabled={publicando}
              className="bg-blue-600 text-white px-6 py-4 rounded-2xl w-full font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {publicando ? "Publicando..." : "Publicar novedad"}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}