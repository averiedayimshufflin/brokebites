'use client'

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

export default function SignInPage() {
     const router = useRouter()

     const [email, setEmail] = useState("")
     const [password, setPassword] = useState("")
     const [message, setMessage] = useState("")
     const [loading, setLoading] = useState(false)

     async function handleSignIn(e: React.FormEvent){
        e.preventDefault()

        setLoading(true)
        setMessage("")

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        setLoading(false)

        if(error){
            setMessage(error.message)
            return
        }

        router.push("/dashboard")

     }
    return(
        <>
        <div className = "min-h-screen flex justify-center items-center">
    <Card className = "w-full max-w-xl rounded-2xl shadow-sm opacity-50 focus:ring">
        <CardHeader className="pb-10 flex flex-col justify-center items-center">
            <CardTitle> Sign in</CardTitle>
            <CardDescription>
                   Welcome back to BrokeBites.
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
        required/>

         <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        </CardContent>
         </Card>
         </div>
    </>
    )
}