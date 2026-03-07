import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function middleware(req) {
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

  const rutasPublicasAuth = [
    "/login",
    "/registro",
  ]

  const requiereLogin = rutasPrivadas.some((ruta) =>
    pathname.startsWith(ruta)
  )

  const esRutaAuth = rutasPublicasAuth.some((ruta) =>
    pathname.startsWith(ruta)
  )

  if (requiereLogin && !user) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (esRutaAuth && user) {
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
  ],
}