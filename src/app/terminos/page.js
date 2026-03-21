export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-xl space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Términos y Condiciones
        </h1>

        <p className="text-slate-600">
          Al utilizar la plataforma de la Federación de Estudiantes Secundarios de Chascomús (FES),
          el usuario acepta las siguientes condiciones:
        </p>

        <ul className="list-disc pl-6 space-y-2 text-slate-600">
          <li>El uso de la plataforma es exclusivo para estudiantes secundarios del distrito.</li>
          <li>La información ingresada debe ser verídica y actualizada.</li>
          <li>La FES podrá utilizar los datos con fines organizativos, estadísticos y de comunicación.</li>
          <li>Los contenidos publicados deben respetar normas de convivencia y respeto.</li>
          <li>La FES se reserva el derecho de suspender cuentas ante uso indebido.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">Uso de datos</h2>

        <p className="text-slate-600">
          Los datos personales serán utilizados únicamente para:
        </p>

        <ul className="list-disc pl-6 space-y-2 text-slate-600">
          <li>Identificación del estudiante</li>
          <li>Acceso al carnet digital</li>
          <li>Comunicación institucional</li>
          <li>Gestión de beneficios y servicios</li>
        </ul>

        <p className="text-sm text-slate-400 mt-6">
          Última actualización: 2026
        </p>
      </div>
    </main>
  )
}