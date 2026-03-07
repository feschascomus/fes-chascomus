"use client"

import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import SignOutButton from "@/components/SignOutButton"

function NavbarContent() {
  const searchParams = useSearchParams()
  const usuario = searchParams.get("usuario")

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/fes-logo.png"
            width={36}
            height={36}
            alt="FES"
          />
          <div>
            <p className="font-semibold text-slate-900">
              FES Chascomús
            </p>
            <p className="text-xs text-slate-500">
              Federación de Estudiantes Secundarios
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/escuelas"
            className="text-slate-600 hover:text-slate-900"
          >
            Escuelas
          </Link>

          <Link
            href="/promociones"
            className="text-slate-600 hover:text-slate-900"
          >
            Promociones
          </Link>

          {usuario ? (
            <>
              <Link
                href={`/panel/${usuario}`}
                className="bg-slate-100 px-4 py-2 rounded-xl"
              >
                Mi panel
              </Link>

              <SignOutButton className="bg-red-100 text-red-600 px-4 py-2 rounded-xl" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-600"
              >
                Ingresar
              </Link>

              <Link
                href="/registro"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl"
              >
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  )
}