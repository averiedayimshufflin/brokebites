"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const pathname = usePathname()

  // Hide navbar on original homepage
  if (pathname === "/") {
    return null
  }

  return (
    <nav className="w-full border-b px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold">
          BrokeBites
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/pantry">Pantry</Link>
          <Link href="/recipes">Recipes</Link>
          <Link href="/smartbot">SmartBot</Link>

          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = "/"
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}