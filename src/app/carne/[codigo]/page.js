import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from "qrcode.react"

export default async function CarnePage({ params }) {
  const { codigo } = await params

  const { data, error } = await supabase
    .from("estudiantes")
    .select("*")
    .eq("codigo", codigo)

  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Error</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Carné no encontrado</h1>
        <p>No existe un estudiante con ese código.</p>
      </div>
    )
  }

  const estudiante = data[0]

  const { data: escuelas } = await supabase
    .from("escuelas")
    .select("*")
    .eq("codigo", estudiante.escuela_codigo)

  const nombreEscuela =
    escuelas && escuelas.length > 0
      ? escuelas[0].nombre
      : `Escuela ${estudiante.escuela_codigo}`

  const urlCarnet = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/validar/${estudiante.codigo}`

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <Link
            href={`/panel/${estudiante.codigo}`}
            className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            Volver al panel
          </Link>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-200">
          <div className="bg-blue-700 text-white px-6 py-6">
            <p className="text-xs uppercase tracking-[0.25em] opacity-80">
              FES Chascomús
            </p>
            <h1 className="text-2xl font-bold mt-2">Carné Estudiantil</h1>
            <p className="text-sm mt-1 text-blue-100">
              Federación de Estudiantes Secundarios
            </p>
          </div>

          <div className="p-6">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Titular
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {estudiante.nombre}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  DNI
                </p>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {estudiante.dni}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Año que cursa
                </p>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {estudiante.anio}
                </p>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Escuela
              </p>
              <p className="text-base font-semibold text-slate-900 mt-1">
                {nombreEscuela}
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                Validación digital
              </p>
              <div className="bg-white p-3 rounded-2xl border border-slate-200">
                <QRCodeSVG value={urlCarnet} size={150} />
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Código del carné
              </p>
              <p className="text-xl font-bold text-slate-900 mt-1 break-all">
                {estudiante.codigo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}