"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SignOutButton({
  className = "",
  children = "Salir",
}) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signOut()

    setLoading(false)

    if (error) {
      alert("Error al cerrar sesión: " + error.message)
      return
    }

    router.push("/login")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={className}
    >
      {loading ? "Saliendo..." : children}
    </button>
  )
}