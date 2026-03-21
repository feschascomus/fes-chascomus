"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminCursosPage() {
  const supabase = createClient()

  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [lugar, setLugar] = useState("")
  const [fecha, setFecha] = useState("")
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)

  const crearCurso = async () => {
    if (!titulo) {
      alert("Ingresá un título")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("cursos").insert([
      {
        titulo,
        descripcion,
        lugar,
        fecha_inicio: fecha || null,
        enlace_inscripcion: link || null,
        es_general: true,
        activo: true,
      },
    ])

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert("Curso creado")

    setTitulo("")
    setDescripcion("")
    setLugar("")
    setFecha("")
    setLink("")
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl space-y-4">
        <h1 className="text-3xl font-bold">Crear curso</h1>

        <input
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="Lugar"
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="Link inscripción"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <button
          onClick={crearCurso}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-4 rounded-xl font-semibold"
        >
          {loading ? "Creando..." : "Crear curso"}
        </button>
      </div>
    </main>
  )
}