"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  useEffect(() => {
    async function sendUserToCorrectPage() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", userData.user.id)
        .single();

      if (profile?.onboarding_completed) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/onboarding";
      }
    }

    sendUserToCorrectPage();
  }, []);

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