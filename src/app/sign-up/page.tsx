"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import Link from "next/link"
export default function SignUp() {
    const [email, setEmail] = useState("")
    const [password, setPassword]= useState("")
    const [confirmPassword, setConfirmPassword]= useState("")
    const [loading, setLoading] = useState(false)

    const [error, setError] = useState("")

    async function handleAuth() {
    if (password !== confirmPassword) {
    setError("Passwords don't match")
    return
  } 

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
    setError(error.message);
      return;
    }

    alert("Thank you for signing up");
  }
  return(
      <>
        <div className = "min-h-screen flex justify-center items-center">
    
    <Card className = "w-full max-w-xl rounded-2xl shadow-sm opacity-50 focus:ring">
        <p>{error}</p>
        <CardHeader className="pb-10 flex flex-col justify-center items-center">
            <Link href="sign-in">{"<- Go back to login"}</Link>
            <CardTitle> Sign Up</CardTitle>
            <CardDescription> "Welcome back to BrokeBites."
            </CardDescription>
        </CardHeader>
        <CardContent className = "flex flex-col gap-4">

        <Input
        type="email"
        placeholder="Enter your email"
        value = {email}
        onChange = {(e) => setEmail(e.target.value)}
        required
        />

        <Input
        type="password"
        placeholder="Enter password"
        value = {password}
        onChange = {(e) => setPassword(e.target.value)}
        required
        />

        <Input
        type="password"
        placeholder="Confirm password"
        value = {confirmPassword}
        onChange = {(e) => setConfirmPassword(e.target.value)}
        required
        />

         <Button
  onClick={handleAuth}
  className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
>
  Log in
</Button>

<p>Don't have an account? <Link href="/sign-up">Sign up</Link></p>
        </CardContent>
         </Card>
         </div>
    </>
  )
}