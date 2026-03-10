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
    const { nombre, dni, email, password, escuela_codigo, anio, rol } = body

    if (!nombre || !dni || !email || !password || !escuela_codigo || !anio || !rol) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: authData, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email: String(email).trim(),
        password,
        email_confirm: true,
      })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const codigo = `${String(dni).trim()}${String(escuela_codigo).trim()}`

    const { error: insertError } = await adminSupabase
      .from("estudiantes")
      .insert([
        {
          nombre: String(nombre).trim(),
          dni: String(dni).trim(),
          email: String(email).trim(),
          escuela_codigo: Number(escuela_codigo),
          anio: String(anio),
          codigo,
          rol: String(rol),
          activo: true,
          auth_user_id: authData.user.id,
        },
      ])

    if (insertError) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}