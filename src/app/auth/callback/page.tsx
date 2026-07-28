"use client";

import { useEffect, useState } from "react";
import AuthStatusCard from "@/components/AuthStatusCard";
import { getCurrentUser, getFriendlySupabaseError, type AuthCheck } from "@/lib/auth-state";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const [authState, setAuthState] = useState<AuthCheck | null>(null);

  useEffect(() => {
    async function sendUserToCorrectPage() {
      const userCheck = await getCurrentUser();

      if (!userCheck.ok) {
        setAuthState(userCheck);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", userCheck.user.id)
          .maybeSingle();

        if (error) {
          setAuthState({
            ok: false,
            reason: "unavailable",
            title: "Could not finish sign in",
            message: getFriendlySupabaseError(error),
          });
          return;
        }

        if (profile?.onboarding_completed) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/onboarding";
        }
      } catch {
        setAuthState({
          ok: false,
          reason: "unavailable",
          title: "Could not finish sign in",
          message:
            "Supabase did not respond after Google sign-in. Please try again in a moment.",
        });
      }
    }

    sendUserToCorrectPage();
  }, []);

  if (authState && !authState.ok) {
    return <AuthStatusCard title={authState.title} message={authState.message} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6">
      <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-orange-600">BrokeBites</p>

        <h1 className="mt-2 text-2xl font-bold text-gray-950">
          Signing you in...
        </h1>

        <p className="mt-3 text-gray-600">
          Checking your setup.
        </p>
      </section>
    </main>
  );
}
