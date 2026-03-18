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

    if (!perfil || perfil.activo === false) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await req.json()
    const codigoIngresado = String(body.codigo || "").trim().toUpperCase()

    if (!codigoIngresado) {
      return NextResponse.json({ error: "Ingresá un código" }, { status: 400 })
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: codigoValido } = await adminSupabase
      .from("codigos_roles")
      .select("*")
      .eq("codigo", codigoIngresado)
      .eq("activo", true)
      .maybeSingle()

    if (!codigoValido) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    if (codigoValido.rol_destino === "centro") {
      if (!codigoValido.escuela_codigo) {
        return NextResponse.json(
          { error: "El código de centro no tiene escuela asignada" },
          { status: 400 }
        )
      }

      if (String(perfil.escuela_codigo) !== String(codigoValido.escuela_codigo)) {
        return NextResponse.json(
          { error: "Este código no pertenece a tu escuela" },
          { status: 400 }
        )
      }

      const { error: updateError } = await adminSupabase
        .from("estudiantes")
        .update({
          rol: "centro",
        })
        .eq("id", perfil.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }

      return NextResponse.json({
        ok: true,
        rol: "centro",
      })
    }

    if (codigoValido.rol_destino === "fes") {
      const { error: updateError } = await adminSupabase
        .from("estudiantes")
        .update({
          rol: "fes",
        })
        .eq("id", perfil.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }

      return NextResponse.json({
        ok: true,
        rol: "fes",
      })
    }

    return NextResponse.json({ error: "Código inválido" }, { status: 400 })
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}