import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function PanelRootPage() {
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
    .select("codigo, activo")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (porAuthId) {
    estudiante = porAuthId
  } else if (user.email) {
    const { data: porEmail } = await supabase
      .from("estudiantes")
      .select("codigo, activo")
      .eq("email", user.email)
      .maybeSingle()

    estudiante = porEmail
  }

  if (!estudiante?.codigo || estudiante.activo === false) {
    redirect("/login")
  }

  redirect(`/panel/${estudiante.codigo}`)
}