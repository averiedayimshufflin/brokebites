"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, LayoutDashboard, Search, ShoppingBasket } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-state";

export default function NotFound() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const userCheck = await getCurrentUser();

      setIsSignedIn(userCheck.ok);
      setCheckingSession(false);
    }

    checkSession();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F4EC] px-4 py-10 font-[family-name:var(--font-inter)] text-[#151515] sm:px-6 lg:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_30px_90px_rgba(0,0,0,0.08)] sm:p-10 lg:p-14">
          <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-[#FF7A1A]/20 blur-3xl" />
          <div className="absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-[#238247]/20 blur-3xl" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="mb-5 w-fit rounded-full bg-[#FFF7ED] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#FF7A1A]">
                404 - missing recipe
              </p>

              <h1 className="font-[family-name:var(--font-playfair)] text-6xl font-semibold leading-[0.9] tracking-[-0.055em] text-[#151515] sm:text-7xl">
                This page is not in the pantry.
              </h1>

              <p className="mt-7 max-w-lg text-sm font-medium leading-7 text-[#5b665d] sm:text-base">
                The link may be old, mistyped, or moved. Check your pantry or
                jump back into your BrokeBites tools.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {checkingSession ? (
                  <span className="inline-flex min-h-11 w-36 animate-pulse rounded-full bg-[#151515]/15" />
                ) : (
                  <>
                    <Link
                      href={isSignedIn ? "/dashboard" : "/"}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#151515] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#238247]"
                    >
                      {isSignedIn ? (
                        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Home className="h-4 w-4" aria-hidden="true" />
                      )}
                      {isSignedIn ? "Dashboard" : "Back home"}
                    </Link>

                    {!isSignedIn ? (
                      <Link
                        href="/sign-in"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-orange-100 bg-[#FFF8EF] px-5 py-2 text-sm font-semibold text-[#151515] transition hover:border-[#FF7A1A] hover:bg-[#FF7A1A] hover:text-white"
                      >
                        Sign in
                      </Link>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-green-100 bg-[#EAF5EC] p-5 shadow-sm">
              <div className="rounded-[1.35rem] bg-white p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#238247]">
                      Try instead
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[#151515]">
                      Get back to cooking
                    </h2>
                  </div>

                  <div className="rounded-full bg-[#EAF5EC] px-4 py-2 text-xs font-semibold text-[#238247]">
                    BrokeBites
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/pantry"
                    className="flex items-center gap-4 rounded-2xl bg-[#F8F4EC] p-4 transition hover:-translate-y-0.5 hover:bg-[#FFF7ED]"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF7A1A] text-white">
                      <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#151515]">
                        Open pantry
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[#5b665d]">
                        See what ingredients you already have.
                      </span>
                    </span>
                  </Link>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-4 rounded-2xl bg-[#F8F4EC] p-4 transition hover:-translate-y-0.5 hover:bg-[#EAF5EC]"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#238247] text-white">
                      <Search className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#151515]">
                        Find meals
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[#5b665d]">
                        Search recipes that fit your budget.
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
