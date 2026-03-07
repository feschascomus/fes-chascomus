import Link from "next/link"
import { redirect } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { createClient } from "@/lib/supabase/server"

export default async function CarnePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  let estudiante = null

  const { data: porAuthId } = await supabase
    .from("estudiantes")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (porAuthId) {
    estudiante = porAuthId
  } else if (user.email) {
    const { data: porEmail } = await supabase
      .from("estudiantes")
      .select("*")
      .eq("email", user.email)
      .maybeSingle()

    estudiante = porEmail
  }

  if (!estudiante) {
    redirect("/login")
  }

  const { data: escuelas } = await supabase
    .from("escuelas")
    .select("*")
    .eq("codigo", estudiante.escuela_codigo)

  const nombreEscuela =
    escuelas && escuelas.length > 0
      ? escuelas[0].nombre
      : `Escuela ${estudiante.escuela_codigo}`

  const urlCarnet = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/carne`

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-md">
        <div className="mb-4">
          <Link
            href="/panel"
            className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Volver al panel
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="bg-blue-700 px-6 py-6 text-white">
            <p className="text-xs uppercase tracking-[0.25em] opacity-80">
              FES Chascomús
            </p>
            <h1 className="mt-2 text-2xl font-bold">Carné Estudiantil</h1>
            <p className="mt-1 text-sm text-blue-100">
              Federación de Estudiantes Secundarios
            </p>
          </div>

          <div className="p-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Titular
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {estudiante.nombre}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  DNI
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {estudiante.dni}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Año que cursa
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {estudiante.anio}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Escuela
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {nombreEscuela}
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">
                Validación digital
              </p>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <QRCodeSVG value={urlCarnet} size={150} />
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Código del carné
              </p>
              <p className="mt-1 break-all text-xl font-bold text-slate-900">
                {estudiante.codigo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}