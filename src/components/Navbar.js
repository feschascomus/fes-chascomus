"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import SignOutButton from "./SignOutButton"

export default function Navbar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const partes = pathname.split("/").filter(Boolean)

  let usuarioCodigo = searchParams.get("usuario") || ""

  if (partes[0] === "panel" && partes[1]) usuarioCodigo = partes[1]
  if (partes[0] === "carne" && partes[1]) usuarioCodigo = partes[1]

  const enZonaPrivada =
    pathname.startsWith("/panel") ||
    pathname.startsWith("/admin-fes") ||
    pathname.startsWith("/publicar-novedad") ||
    pathname.startsWith("/publicar-cuadernillo") ||
    pathname.startsWith("/carne")

  const hrefLogo = enZonaPrivada ? "/panel" : "/"

  const hrefEscuelas =
    enZonaPrivada && usuarioCodigo
      ? `/escuelas?usuario=${usuarioCodigo}`
      : "/escuelas"

  const hrefPromociones =
    enZonaPrivada && usuarioCodigo
      ? `/promociones?usuario=${usuarioCodigo}`
      : "/promociones"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        <Link href={hrefLogo} className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-white">
            <Image
              src="/fes-logo.png"
              alt="Logo FES"
              fill
              className="object-contain"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">
              FES Chascomús
            </p>

            <p className="text-xs text-slate-500">
              Federación de Estudiantes Secundarios
            </p>
          </div>
        </Link>

        {!enZonaPrivada ? (

          <nav className="flex items-center gap-3">

            <Link
              href="/escuelas"
              className="hidden rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:inline-flex"
            >
              Escuelas
            </Link>

            <Link
              href="/promociones"
              className="hidden rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:inline-flex"
            >
              Promociones
            </Link>

            <Link
              href="/login"
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Ingresar
            </Link>

            <Link
              href="/registro"
              className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Registro
            </Link>

          </nav>

        ) : (

          <nav className="flex items-center gap-3">

            <Link
              href={hrefEscuelas}
              className="hidden rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:inline-flex"
            >
              Escuelas
            </Link>

            <Link
              href={hrefPromociones}
              className="hidden rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:inline-flex"
            >
              Promociones
            </Link>

            <Link
              href="/panel"
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Mi panel
            </Link>

            <SignOutButton
              className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Salir
            </SignOutButton>

          </nav>

        )}
      </div>
    </header>
  )
}