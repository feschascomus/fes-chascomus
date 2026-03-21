"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function RegistroPage() {
  const supabase = createClient()
  const router = useRouter()

  const [nombre, setNombre] = useState("")
  const [dni, setDni] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [escuelas, setEscuelas] = useState([])
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState("")
  const [anio, setAnio] = useState("")
  const [codigoRol, setCodigoRol] = useState("")
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [registrando, setRegistrando] = useState(false)

  useEffect(() => {
    cargarEscuelas()
  }, [])

  const cargarEscuelas = async () => {
    const { data } = await supabase
      .from("escuelas")
      .select("*")
      .eq("activa", true)
      .order("nombre", { ascending: true })

    setEscuelas(data || [])
    setCargando(false)
  }

  const limpiarDni = (valor) => valor.replace(/\D/g, "").slice(0, 8)
  const limpiarEmail = (valor) => valor.trim().toLowerCase()

  const normalizarNombre = (valor) => {
    const limpio = valor.trim().replace(/\s+/g, " ")
    return limpio
      .split(" ")
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(" ")
  }

  const registrar = async () => {
    const nombreFinal = normalizarNombre(nombre)
    const dniFinal = limpiarDni(dni)
    const emailFinal = limpiarEmail(email)

    if (!nombreFinal || !dniFinal || !emailFinal || !password || !anio) {
      alert("Completá todos los campos")
      return
    }

    if (!aceptaTerminos) {
      alert("Debés aceptar los términos y condiciones")
      return
    }

    if (!escuelaSeleccionada) {
      alert("Seleccioná una escuela")
      return
    }

    setRegistrando(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailFinal,
      password,
    })

    if (authError) {
      setRegistrando(false)
      alert(authError.message)
      return
    }

    const codigo = `${dniFinal}${escuelaSeleccionada}`

    const { error: insertError } = await supabase
      .from("estudiantes")
      .insert([
        {
          nombre: nombreFinal,
          dni: dniFinal,
          email: emailFinal,
          escuela_codigo: Number(escuelaSeleccionada),
          anio: String(anio),
          codigo,
          rol: "estudiante",
          activo: true,
          acepta_terminos: true,
          fecha_aceptacion: new Date(),
          auth_user_id: authData.user?.id || null,
        },
      ])

    if (insertError) {
      setRegistrando(false)
      alert(insertError.message)
      return
    }

    await supabase.auth.signInWithPassword({
      email: emailFinal,
      password,
    })

    setRegistrando(false)

    router.replace("/panel")
    router.refresh()
  }

  if (cargando) {
    return <div className="p-10 text-center">Cargando...</div>
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl space-y-4">
        <h1 className="text-3xl font-bold">Registro</h1>

        <input
          placeholder="Nombre y apellido"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="DNI"
          value={dni}
          onChange={(e) => setDni(limpiarDni(e.target.value))}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(limpiarEmail(e.target.value))}
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <select
          value={escuelaSeleccionada}
          onChange={(e) => setEscuelaSeleccionada(e.target.value)}
          className="w-full border p-3 rounded-xl"
        >
          <option value="">Seleccionar escuela</option>
          {escuelas.map((e) => (
            <option key={e.id} value={e.codigo}>
              {e.nombre}
            </option>
          ))}
        </select>

        <select
          value={anio}
          onChange={(e) => setAnio(e.target.value)}
          className="w-full border p-3 rounded-xl"
        >
          <option value="">Seleccionar año</option>
          <option value="1">1°</option>
          <option value="2">2°</option>
          <option value="3">3°</option>
          <option value="4">4°</option>
          <option value="5">5°</option>
          <option value="6">6°</option>
        </select>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
          />
          <p className="text-sm">
            Acepto los{" "}
            <a href="/terminos" target="_blank" className="text-blue-600 underline">
              términos y condiciones
            </a>
          </p>
        </div>

        <button
          onClick={registrar}
          disabled={registrando}
          className="w-full bg-blue-600 text-white p-4 rounded-xl font-semibold"
        >
          {registrando ? "Registrando..." : "Registrarme"}
        </button>

        <p className="text-center text-sm">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-blue-600 underline">
            Ingresar
          </Link>
        </p>
      </div>
    </main>
  )
}