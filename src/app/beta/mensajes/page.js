export default function BetaMensajesPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Beta
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Mensajes
          </h1>
          <p className="mt-3 text-slate-600">
            Acá vamos a construir el envío de mensajes a centro, FES o ambos.
          </p>
        </section>
      </div>
    </main>
  )
}