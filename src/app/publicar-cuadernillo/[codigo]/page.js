"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function PublicarCuadernilloPage({ params }) {
  const [usuario, setUsuario] = useState(null)
  const [escuela, setEscuela] = useState(null)
  const [escuelas, setEscuelas] = useState([])
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState("")
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [anio, setAnio] = useState("")
  const [archivo, setArchivo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [publicando, setPublicando] = useState(false)

  const router = useRouter()

  useEffect(() => {
    cargarUsuario()
  }, [])

  const cargarUsuario = async () => {
    const resolvedParams = await params
    const codigo = resolvedParams.codigo

    const { data: usuarios, error } = await supabase
      .from("estudiantes")
      .select("*")
      .eq("codigo", codigo)

    if (error || !usuarios || usuarios.length === 0) {
      alert("No se encontró el usuario")
      router.push("/login")
      return
    }

    const user = usuarios[0]

    if (user.rol !== "centro" && user.rol !== "fes") {
      alert("No tenés permisos para publicar cuadernillos")
      router.push(`/panel/${codigo}`)
      return
    }

    setUsuario(user)

    const { data: escuelasData } = await supabase
      .from("escuelas")
      .select("*")
      .eq("activa", true)
      .order("nombre", { ascending: true })

    if (escuelasData) {
      setEscuelas(escuelasData)
    }

    if (user.rol === "centro") {
      const { data: escuelaActual } = await supabase
        .from("escuelas")
        .select("*")
        .eq("codigo", user.escuela_codigo)

      if (escuelaActual && escuelaActual.length > 0) {
        setEscuela(escuelaActual[0])
        setEscuelaSeleccionada(String(user.escuela_codigo))
      }
    }

    setCargando(false)
  }

  const subirArchivo = async (codigoEscuela) => {
    if (!archivo) return null

    const extension = archivo.name.split(".").pop()
    const nombreArchivo = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
    const rutaArchivo = `${codigoEscuela}/${nombreArchivo}`

    const { error: uploadError } = await supabase.storage
      .from("cuadernillos")
      .upload(rutaArchivo, archivo)

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data } = supabase.storage
      .from("cuadernillos")
      .getPublicUrl(rutaArchivo)

    return data.publicUrl
  }

  const publicar = async () => {
    if (!titulo || !anio || !archivo) {
      alert("Completá título, año y archivo PDF")
      return
    }

    const anioNumero = Number(anio)

    if (anioNumero < 1 || anioNumero > 6) {
      alert("El año debe ser entre 1 y 6")
      return
    }

    if (archivo.type !== "application/pdf") {
      alert("Solo se permiten archivos PDF")
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
      const archivoUrl = await subirArchivo(codigoEscuelaFinal)

      const { error } = await supabase
        .from("cuadernillos")
        .insert([
          {
            titulo: titulo.trim(),
            descripcion: descripcion.trim() || null,
            escuela_codigo: codigoEscuelaFinal,
            anio: String(anioNumero),
            link: archivoUrl,
            activo: true
          }
        ])

      setPublicando(false)

      if (error) {
        alert("Error al publicar: " + error.message)
        return
      }

      alert("Cuadernillo publicado correctamente")
      router.push(`/escuela/${codigoEscuelaFinal}`)
    } catch (err) {
      setPublicando(false)
      alert("Error al subir el PDF: " + err.message)
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
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-700 text-white p-6">
              <p className="text-xs uppercase tracking-[0.25em] opacity-80">
                FES Chascomús
              </p>
              <h1 className="text-2xl font-bold mt-2">
                Publicar cuadernillo
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
                  href={`/panel/${usuario.codigo}`}
                  className="block bg-slate-900 text-white rounded-2xl px-4 py-3 font-medium"
                >
                  Volver al panel
                </Link>

                <Link
                  href={`/escuela/${usuario.escuela_codigo}`}
                  className="block bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-medium hover:bg-slate-100 transition"
                >
                  Ir a mi escuela
                </Link>
              </nav>
            </div>
          </div>
        </aside>

        {/* Formulario */}
        <section>
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5 sm:p-8">
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
              Subir material
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-slate-900">
              Nuevo cuadernillo
            </h2>

            <p className="text-slate-500 mt-3 mb-6">
              Publicá materiales y PDFs para que los estudiantes puedan acceder desde la plataforma.
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
              placeholder="Título del cuadernillo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />

            <textarea
              className="border border-slate-200 p-3 mb-4 block w-full rounded-2xl min-h-[150px]"
              placeholder="Descripción (opcional)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />

            <input
              type="number"
              min="1"
              max="6"
              className="border border-slate-200 p-3 mb-4 block w-full rounded-2xl"
              placeholder="Año al que corresponde (1-6)"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            />

            <div className="mb-5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Archivo PDF
              </label>

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600"
              />
            </div>

            <button
              onClick={publicar}
              disabled={publicando}
              className="bg-blue-600 text-white px-6 py-4 rounded-2xl w-full font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {publicando ? "Publicando..." : "Publicar cuadernillo"}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}