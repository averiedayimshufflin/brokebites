"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { getCurrentUser, getFriendlySupabaseError } from "@/lib/auth-state"

export default function Navbar() {
  const pathname = usePathname()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    async function checkSession() {
      const userCheck = await getCurrentUser()

      setIsSignedIn(userCheck.ok)
      setCheckingSession(false)
    }

    checkSession()
  }, [pathname])

  // Hide navbar on original homepage
  if (pathname === "/") {
    return null
  }

  return (
    <nav className="w-full border-b px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href={isSignedIn ? "/dashboard" : "/"} className="text-xl font-bold">
          BrokeBites
        </Link>

        <div className="flex items-center gap-4">
          {!checkingSession && isSignedIn ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/pantry">Pantry</Link>
              <Link href="/recipes">Recipes</Link>
              <Link href="/budget">Budget</Link>
              <Link href="/smartbot">SmartBot</Link>

              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await supabase.auth.signOut()
                  } catch (error) {
                    console.warn(getFriendlySupabaseError(error))
                  } finally {
                    window.location.href = "/sign-in"
                  }
                }}
              >
                Sign Out
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
