import { supabase } from "@/lib/supabase"

export default async function ValidarCarnePage({ params }) {
  const { codigo } = await params

  const { data, error } = await supabase
    .from("estudiantes")
    .select("*")
    .eq("codigo", codigo)

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6 flex items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
            Error
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            No se pudo validar el carné
          </h1>
          <p className="mt-4 text-slate-600">
            Ocurrió un problema al consultar la base de datos.
          </p>
        </div>
      </main>
    )
  }

  if (!data || data.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6 flex items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
            Carné inválido
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            No se encontró el estudiante
          </h1>
          <p className="mt-4 text-slate-600">
            El código escaneado no corresponde a un carné válido.
          </p>
        </div>
      </main>
    )
  }

  const estudiante = data[0]

  const { data: escuelas } = await supabase
    .from("escuelas")
    .select("*")
    .eq("codigo", estudiante.escuela_codigo)

  const escuela =
    escuelas && escuelas.length > 0
      ? escuelas[0].nombre
      : `Escuela ${estudiante.escuela_codigo}`

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xl">
        <div className="bg-green-600 px-6 py-6 text-white">
          <p className="text-xs uppercase tracking-[0.25em] opacity-80">
            Validación FES
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Carné válido
          </h1>
          <p className="mt-2 text-green-100">
            Federación de Estudiantes Secundarios de Chascomús
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Estudiante
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {estudiante.nombre}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Escuela
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {escuela}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Código del carné
            </p>
            <p className="mt-1 break-all text-base font-semibold text-slate-900">
              {estudiante.codigo}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}