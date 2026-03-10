"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import SignOutButton from "./SignOutButton"

export default function Navbar() {
  const supabase = createClient()

  const [cargando, setCargando] = useState(true)
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    let mounted = true

    const cargarPerfil = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (mounted) {
          setPerfil(null)
          setCargando(false)
        }
        return
      }

      let perfilEncontrado = null

      const { data: porAuthId } = await supabase
        .from("estudiantes")
        .select("codigo, activo, nombre")
        .eq("auth_user_id", user.id)
        .maybeSingle()

      if (porAuthId) {
        perfilEncontrado = porAuthId
      } else if (user.email) {
        const { data: porEmail } = await supabase
          .from("estudiantes")
          .select("codigo, activo, nombre")
          .eq("email", user.email)
          .maybeSingle()

        perfilEncontrado = porEmail
      }

      if (mounted) {
        setPerfil(perfilEncontrado && perfilEncontrado.activo !== false ? perfilEncontrado : null)
        setCargando(false)
      }
    }

    cargarPerfil()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user

      if (!user) {
        setPerfil(null)
        setCargando(false)
        return
      }

      let perfilEncontrado = null

      const { data: porAuthId } = await supabase
        .from("estudiantes")
        .select("codigo, activo, nombre")
        .eq("auth_user_id", user.id)
        .maybeSingle()

      if (porAuthId) {
        perfilEncontrado = porAuthId
      } else if (user.email) {
        const { data: porEmail } = await supabase
          .from("estudiantes")
          .select("codigo, activo, nombre")
          .eq("email", user.email)
          .maybeSingle()

        perfilEncontrado = porEmail
      }

      setPerfil(perfilEncontrado && perfilEncontrado.activo !== false ? perfilEncontrado : null)
      setCargando(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const logueado = !cargando && !!perfil

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white">
            <Image
              src="/fes-logo.png"
              alt="Logo FES"
              fill
              className="object-contain p-1"
            />
          </div>

          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold text-slate-900 sm:text-base">
              FES Chascomús
            </p>
            <p className="truncate text-[11px] text-slate-500 sm:text-xs">
              Federación de Estudiantes Secundarios
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href={logueado ? `/escuelas?usuario=${perfil.codigo}` : "/escuelas"}
            className="hidden rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 md:inline-flex"
          >
            Escuelas
          </Link>

          <Link
            href={logueado ? `/promociones?usuario=${perfil.codigo}` : "/promociones"}
            className="hidden rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 md:inline-flex"
          >
            Promociones
          </Link>

          {logueado ? (
            <>
              <Link
                href={`/panel/${perfil.codigo}`}
                className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 sm:px-4"
              >
                Mi panel
              </Link>

              <SignOutButton className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 sm:px-4">
                Salir
              </SignOutButton>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 sm:px-4"
              >
                Ingresar
              </Link>

              <Link
                href="/registro"
                className="rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:px-4"
              >
                Registro
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}