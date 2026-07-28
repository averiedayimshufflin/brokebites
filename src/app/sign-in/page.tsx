"use client";

import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SignInPage() {
  const [notice, setNotice] = useState("");

  async function handleGoogleLogin() {
    if (!isSupabaseConfigured) {
      setNotice(
        "Google sign-in is unavailable because Supabase environment variables are missing."
      );
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setNotice(
        "Google sign-in could not start. Please check your connection and try again."
      );
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F4EC] font-[family-name:var(--font-inter)] text-[#151515]">
      <section className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-[#FF7A1A]/20 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-[#238247]/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.08)] lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="relative hidden overflow-hidden bg-[#FF7A1A] p-10 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(35,130,71,0.35),transparent_32%)]" />

            <div className="relative z-10 flex h-full min-h-[560px] flex-col justify-between">
              <Link
                href="/"
                className="w-fit rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-[#151515] shadow-sm backdrop-blur-md transition hover:bg-white"
              >
                BrokeBites
              </Link>

              <div>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                  className="mb-5 w-fit rounded-full bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur"
                >
                  Welcome back
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
                  className="font-[family-name:var(--font-playfair)] text-6xl font-semibold leading-[0.9] tracking-[-0.055em] text-white"
                >
                  Sign in.
                  <br />
                  Save meals.
                  <br />
                  Spend less.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
                  className="mt-7 max-w-sm text-sm font-medium leading-7 text-white/85"
                >
                  Get back to your saved recipes, pantry-based meal ideas, and
                  budget-friendly cooking tools.
                </motion.p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/20 p-4 text-white backdrop-blur-md">
                  <p className="text-2xl font-semibold">Pantry</p>
                  <p className="mt-1 text-xs text-white/75">
                    Cook with what you have
                  </p>
                </div>

                <div className="rounded-2xl bg-white/20 p-4 text-white backdrop-blur-md">
                  <p className="text-2xl font-semibold">Budget</p>
                  <p className="mt-1 text-xs text-white/75">
                    Keep meals affordable
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-h-[560px] items-center justify-center bg-[#F8F4EC] p-6 sm:p-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.65, ease: "easeOut" }}
              className="w-full max-w-md"
            >
              <div className="mb-8 lg:hidden">
                <Link
                  href="/"
                  className="text-sm font-semibold tracking-tight text-[#151515]"
                >
                  BrokeBites
                </Link>
              </div>

              <Card className="rounded-[1.75rem] border border-orange-100 bg-white/90 p-2 shadow-[0_24px_70px_rgba(255,122,26,0.12)]">
                <CardHeader className="space-y-4 pb-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF5EC] text-2xl">
                    🍽️
                  </div>

                  <div>
                    <CardTitle className="font-[family-name:var(--font-playfair)] text-5xl font-semibold leading-none tracking-[-0.045em] text-[#151515]">
                      Sign in
                    </CardTitle>

                    <CardDescription className="mt-4 text-sm leading-6">
                      Welcome back to BrokeBites.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-full border-orange-100 bg-[#FFF8EF] text-sm font-semibold text-[#151515] transition duration-300 hover:border-[#FF7A1A] hover:bg-[#FF7A1A] hover:text-white"
                    onClick={handleGoogleLogin}
                  >
                    Continue with Google
                  </Button>

                  {notice && (
                    <p className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-center text-sm leading-6 text-orange-800">
                      {notice}
                    </p>
                  )}

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-orange-100" />
                    </div>

                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 font-medium text-neutral-500">
                        Pantry-first meal planning
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-green-100 bg-[#EAF5EC] p-4">
                      <p className="text-sm font-semibold text-[#238247]">
                        Save favorites
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#5b665d]">
                        Keep meals you want to cook again.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-orange-100 bg-[#FFF7ED] p-4">
                      <p className="text-sm font-semibold text-[#FF7A1A]">
                        Smart ideas
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#5b665d]">
                        Get recipes from your ingredients.
                      </p>
                    </div>
                  </div>

                  <p className="text-center text-xs leading-5 text-neutral-500">
                    By signing in, you can access your saved BrokeBites meal
                    tools and recipe preferences.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
