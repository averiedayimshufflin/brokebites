"use client"

import {useEffect, useState} from "react";
import { supabase } from "@/lib/supabase";
import {Button} from "@/components/ui/button";
export default function DashboardPage() {
    const [email, setEmail] = useState<String | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkUser() {
            const {data} = await supabase.auth.getUser();

            if(!data.user){
                window.location.href="/sign-in";
                return;
            }

            setEmail(data.user.email ?? null);
            setLoading(false);
        }

        checkUser();
    }, []);

       async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = "/sign-in";
        }
  return (
    <main className="min-h-screen bg-orange-50 px-6 py-20">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-950">
          Your BrokeBites dashboard
        </h1>

        {loading ? (
  <p className="mt-4 text-gray-600">Checking login...</p>
) : (
  <p className="mt-4 text-gray-600">
    You are logged in as{" "}
    <span className="font-semibold text-gray-950">{email}</span>.
  </p>
)}
<Button
  onClick={handleLogout}
  className="mt-8 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
>
  Log out
</Button>
      </section>
    </main>
  );
}