import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function proxy(req) {
  let res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname

  const rutasPrivadas = [
    "/panel",
    "/carne",
    "/admin-fes",
    "/publicar-novedad",
    "/publicar-cuadernillo",
  ]

  const rutasAuth = ["/login", "/registro", "/recuperar", "/nueva-password"]

  const requiereLogin = rutasPrivadas.some((ruta) =>
    pathname.startsWith(ruta)
  )

  const esRutaAuth = rutasAuth.some((ruta) =>
    pathname.startsWith(ruta)
  )

  let perfil = null

  if (user) {
    const { data: porAuthId } = await supabase
      .from("estudiantes")
      .select("codigo,activo")
      .eq("auth_user_id", user.id)
      .maybeSingle()

    if (porAuthId) {
      perfil = porAuthId
    } else if (user.email) {
      const { data: porEmail } = await supabase
        .from("estudiantes")
        .select("codigo,activo")
        .eq("email", user.email)
        .maybeSingle()

      perfil = porEmail
    }
  }

  const usuarioActivo = !!perfil && perfil.activo === true

  if (requiereLogin && (!user || !usuarioActivo)) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (esRutaAuth && user && usuarioActivo) {
    const url = req.nextUrl.clone()
    url.pathname = "/panel"
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/carne/:path*",
    "/admin-fes/:path*",
    "/publicar-novedad/:path*",
    "/publicar-cuadernillo/:path*",
    "/login",
    "/registro",
    "/recuperar",
    "/nueva-password",
  ],
}