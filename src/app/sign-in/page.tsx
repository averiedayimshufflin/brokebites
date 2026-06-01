"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"

export default function SignInPage() {


async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) {
    alert(error.message);
  }
}
  

   


     
    return(
        <>
        <div className = "min-h-screen flex justify-center items-center">
    <Card className = "w-full max-w-xl rounded-2xl shadow-sm opacity-50 focus:ring">
        <CardHeader className="pb-10 flex flex-col justify-center items-center">
            <CardTitle> Sign in</CardTitle>
            <CardDescription> "Welcome back to BrokeBites."
            </CardDescription>
        </CardHeader>
        <CardContent className = "flex flex-col gap-4">
        <Button
  type="button"
  variant="outline"
  className="w-full"
  onClick={handleGoogleLogin}
>
  Continue with Google
</Button>
        </CardContent>
        </Card>
        </div>
    </>
    )
}