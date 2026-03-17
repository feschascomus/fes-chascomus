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

  const limpiarDni = (valor) => {
    return valor.replace(/\D/g, "")
  }

  const limpiarEmail = (valor) => {
    return valor.trim().toLowerCase()
  }

  const normalizarNombre = (valor) => {
    const limpio = valor.trim().replace(/\s+/g, " ")

    return limpio
      .split(" ")
      .filter(Boolean)
      .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
      .join(" ")
  }

  const tieneNombreYApellido = (valor) => {
    const limpio = valor.trim().replace(/\s+/g, " ")
    const partes = limpio.split(" ").filter(Boolean)
    return partes.length >= 2
  }

  const emailValido = (valor) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
  }

  const dniValido = (valor) => {
    return /^\d{8}$/.test(valor)
  }

  const generarCodigo = (dniValor, escuelaCodigo) => {
    return `${dniValor}${escuelaCodigo}`
  }

  const registrar = async () => {
    const nombreFinal = normalizarNombre(nombre)
    const dniFinal = limpiarDni(dni)
    const emailFinal = limpiarEmail(email)

    if (!nombreFinal || !dniFinal || !emailFinal || !password || !escuelaSeleccionada || !anio) {
      alert("Completá todos los campos")
      return
    }

    if (!tieneNombreYApellido(nombreFinal)) {
      alert("Ingresá nombre y apellido")
      return
    }

    if (!dniValido(dniFinal)) {
      alert("El DNI debe tener exactamente 8 números")
      return
    }

    if (/^(\d)\1{7}$/.test(dniFinal)) {
      alert("Ingresá un DNI válido")
      return
    }

    if (!emailValido(emailFinal)) {
      alert("Ingresá un email válido")
      return
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setRegistrando(true)

    const { data: dniExistente } = await supabase
      .from("estudiantes")
      .select("id")
      .eq("dni", dniFinal)
      .maybeSingle()

    if (dniExistente) {
      setRegistrando(false)
      alert("Ya existe un usuario registrado con ese DNI")
      return
    }

    const { data: emailExistente } = await supabase
      .from("estudiantes")
      .select("id")
      .eq("email", emailFinal)
      .maybeSingle()

    if (emailExistente) {
      setRegistrando(false)
      alert("Ya existe un usuario registrado con ese email")
      return
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailFinal,
      password,
    })

    if (authError) {
      setRegistrando(false)
      alert(authError.message)
      return
    }

    const codigo = generarCodigo(dniFinal, escuelaSeleccionada)

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
          auth_user_id: authData.user?.id || null,
        },
      ])

    setRegistrando(false)

    if (insertError) {
      alert("Se creó el acceso, pero hubo un error al guardar el perfil: " + insertError.message)
      return
    }

    alert("Registro completado correctamente")
    router.push("/login")
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg text-center">
          Cargando...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
            Registro
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Creá tu cuenta
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
            Registrate para acceder a tu carné digital, cuadernillos, promociones y novedades de tu escuela.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nombre y apellido
              </label>
              <input
                type="text"
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                placeholder="Ejemplo: Mariano González"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                Ingresá nombre y apellido completos.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                DNI
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                placeholder="8 números sin puntos"
                value={dni}
                onChange={(e) => setDni(limpiarDni(e.target.value).slice(0, 8))}
              />
              <p className="mt-2 text-xs text-slate-500">
                Debe tener exactamente 8 números.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                placeholder="tuemail@gmail.com"
                value={email}
                onChange={(e) => setEmail(limpiarEmail(e.target.value))}
              />
              <p className="mt-2 text-xs text-slate-500">
                Se guarda en minúsculas y sin espacios.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                type="password"
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
                placeholder="Mínimo 6 caracteres"
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
                value={escuelaSeleccionada}
                onChange={(e) => setEscuelaSeleccionada(e.target.value)}
              >
                <option value="">Seleccionar escuela</option>
                {escuelas.map((escuela) => (
                  <option key={escuela.id} value={escuela.codigo}>
                    {escuela.nombre}
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
              disabled={registrando}
              className="mt-2 w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {registrando ? "Registrando..." : "Registrarme"}
            </button>

            <p className="pt-2 text-center text-sm text-slate-600">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                Ingresar
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}