"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function Registro() {
  const supabase = createClient()
  const router = useRouter()

  const [nombre, setNombre] = useState("")
  const [dni, setDni] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [escuela, setEscuela] = useState("")
  const [anio, setAnio] = useState("")
  const [escuelas, setEscuelas] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarEscuelas()
  }, [])

  const cargarEscuelas = async () => {
    const { data, error } = await supabase
      .from("escuelas")
      .select("*")
      .eq("activa", true)
      .order("nombre", { ascending: true })

    if (!error && data) {
      setEscuelas(data)
    }
  }

  const registrar = async () => {
    if (!nombre || !dni || !email || !password || !escuela || !anio) {
      alert("Completá todos los campos")
      return
    }

    const anioNumero = Number(anio)

    if (anioNumero < 1 || anioNumero > 6) {
      alert("El año debe ser entre 1 y 6")
      return
    }

    setLoading(true)

    const codigo = `${String(dni).trim()}${String(escuela).trim()}`

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password
    })

    if (authError) {
      setLoading(false)
      alert(authError.message)
      return
    }

    const authUserId = authData?.user?.id || null

    const { error: perfilError } = await supabase
      .from("estudiantes")
      .insert([
        {
          nombre: nombre.trim(),
          dni: String(dni).trim(),
          email: email.trim(),
          escuela_codigo: Number(escuela),
          anio: String(anioNumero),
          codigo,
          rol: "estudiante",
          auth_user_id: authUserId
        }
      ])

    setLoading(false)

    if (perfilError) {
      alert(perfilError.message)
      return
    }

    alert("Registro exitoso")
    router.push("/panel")
  }

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
            Registro
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Creá tu cuenta
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
            Registrate para acceder a tu panel personal, tu carné digital, las novedades de tu escuela y los cuadernillos según el año que cursás.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nombre
              </label>
              <input
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                placeholder="Ingresá tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                DNI
              </label>
              <input
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                placeholder="Ingresá tu DNI"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                placeholder="Ingresá tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                type="password"
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                placeholder="Creá una contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Escuela
              </label>
              <select
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                value={escuela}
                onChange={(e) => setEscuela(e.target.value)}
              >
                <option value="">Seleccionar escuela</option>
                {escuelas.map((esc) => (
                  <option key={esc.id} value={esc.codigo}>
                    {esc.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Año que cursa
              </label>
              <select
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              >
                <option value="">Seleccionar año</option>
                <option value="1">1° año</option>
                <option value="2">2° año</option>
                <option value="3">3° año</option>
                <option value="4">4° año</option>
                <option value="5">5° año</option>
                <option value="6">6° año</option>
              </select>
            </div>

            <button
              onClick={registrar}
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}