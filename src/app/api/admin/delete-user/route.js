import { NextResponse } from "next/server"
import { createClient as createServerSupabase } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(req) {
  try {
    const supabase = await createServerSupabase()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    let perfil = null

    const { data: porAuthId } = await supabase
      .from("estudiantes")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle()

    if (porAuthId) {
      perfil = porAuthId
    } else if (user.email) {
      const { data: porEmail } = await supabase
        .from("estudiantes")
        .select("*")
        .eq("email", user.email)
        .maybeSingle()

      perfil = porEmail
    }

    if (!perfil || perfil.rol !== "fes") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await req.json()
    const { estudianteId } = body

    if (!estudianteId) {
      return NextResponse.json({ error: "Falta estudianteId" }, { status: 400 })
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: estudiante, error: fetchError } = await adminSupabase
      .from("estudiantes")
      .select("*")
      .eq("id", estudianteId)
      .maybeSingle()

    if (fetchError || !estudiante) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    if (estudiante.auth_user_id) {
      const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(
        estudiante.auth_user_id
      )

      if (authDeleteError) {
        return NextResponse.json(
          { error: "No se pudo borrar el usuario de Authentication: " + authDeleteError.message },
          { status: 400 }
        )
      }
    }

    const { error: deleteRowError } = await adminSupabase
      .from("estudiantes")
      .delete()
      .eq("id", estudianteId)

    if (deleteRowError) {
      return NextResponse.json(
        { error: "No se pudo borrar el usuario de la tabla estudiantes: " + deleteRowError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}