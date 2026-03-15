import { NextResponse } from "next/server"
import { createClient as createServerSupabase } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

function getStoragePathFromPublicUrl(url, bucketName) {
  if (!url) return null

  try {
    const parsed = new URL(url)
    const marker = `/storage/v1/object/public/${bucketName}/`
    const index = parsed.pathname.indexOf(marker)

    if (index === -1) return null

    return decodeURIComponent(parsed.pathname.slice(index + marker.length))
  } catch {
    return null
  }
}

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
    const { tipo, id } = body

    if (!tipo || !id) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    if (tipo === "promocion") {
      if (perfil.rol !== "fes") {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }

      const { error } = await adminSupabase
        .from("promociones")
        .delete()
        .eq("id", id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ ok: true })
    }

    if (tipo === "novedad") {
      const { data: novedad, error: fetchError } = await adminSupabase
        .from("novedades")
        .select("*")
        .eq("id", id)
        .maybeSingle()

      if (fetchError || !novedad) {
        return NextResponse.json({ error: "Novedad no encontrada" }, { status: 404 })
      }

      const puedeBorrar =
        perfil.rol === "fes" ||
        (perfil.rol === "centro" &&
          String(perfil.escuela_codigo) === String(novedad.escuela_codigo))

      if (!puedeBorrar) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }

      const imagePath = getStoragePathFromPublicUrl(novedad.imagen_url, "novedades")

      if (imagePath) {
        await adminSupabase.storage.from("novedades").remove([imagePath])
      }

      const { error } = await adminSupabase
        .from("novedades")
        .delete()
        .eq("id", id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ ok: true })
    }

    if (tipo === "cuadernillo") {
      const { data: cuadernillo, error: fetchError } = await adminSupabase
        .from("cuadernillos")
        .select("*")
        .eq("id", id)
        .maybeSingle()

      if (fetchError || !cuadernillo) {
        return NextResponse.json({ error: "Cuadernillo no encontrado" }, { status: 404 })
      }

      const puedeBorrar =
        perfil.rol === "fes" ||
        (perfil.rol === "centro" &&
          String(perfil.escuela_codigo) === String(cuadernillo.escuela_codigo))

      if (!puedeBorrar) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }

      const filePath = getStoragePathFromPublicUrl(cuadernillo.link, "cuadernillos")

      if (filePath) {
        await adminSupabase.storage.from("cuadernillos").remove([filePath])
      }

      const { error } = await adminSupabase
        .from("cuadernillos")
        .delete()
        .eq("id", id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}