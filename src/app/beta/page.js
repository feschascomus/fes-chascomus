import Link from "next/link"

export default function BetaHomePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">
            Laboratorio FES
          </p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            Funciones en borrador
          </h1>
          <p className="mt-5 max-w-2xl text-blue-100">
            Acá probamos nuevas secciones antes de publicarlas en la plataforma principal.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Link href="/beta/cursos" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:shadow-2xl">
            <p className="text-sm font-semibold text-blue-600">Beta</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Cursos</h2>
            <p className="mt-3 text-slate-600">Listado, detalle y gestión de cursos.</p>
          </Link>

          <Link href="/beta/mensajes" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:shadow-2xl">
            <p className="text-sm font-semibold text-blue-600">Beta</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Mensajes</h2>
            <p className="mt-3 text-slate-600">Contacto con centro, FES o ambos.</p>
          </Link>

          <Link href="/beta/calendario" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition hover:shadow-2xl">
            <p className="text-sm font-semibold text-blue-600">Beta</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Calendario</h2>
            <p className="mt-3 text-slate-600">Eventos institucionales y agenda personal.</p>
          </Link>
        </section>
      </div>
    </main>
  )
}