import "./globals.css"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "FES Chascomús",
  description: "Plataforma oficial de la Federación de Estudiantes Secundarios de Chascomús"
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900">
        <Navbar />

        <div className="min-h-screen pt-16">
          {children}
        </div>

        <footer className="px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 text-center shadow-sm">
              <p className="font-semibold text-slate-900">
                FES Chascomús
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Plataforma oficial de la Federación de Estudiantes Secundarios
              </p>
            </div>
          </div>
        </footer>

        <div className="pointer-events-none fixed bottom-3 right-3 z-40">
          <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-[10px] text-slate-400 shadow-sm backdrop-blur sm:text-xs">
            Desarrollado por Vista Aérea Producciones
          </div>
        </div>
      </body>
    </html>
  )
}