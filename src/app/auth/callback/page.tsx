"use client";

import { useEffect, useState } from "react";
import AuthStatusCard from "@/components/AuthStatusCard";
import { type AuthCheck } from "@/lib/auth-state";
import { finishOAuthSessionFromUrl } from "@/lib/oauth-session";
import { chooseAutomaticRoute } from "@/lib/route-choice";

export default function AuthCallbackPage() {
  const [authState, setAuthState] = useState<AuthCheck | null>(null);

  useEffect(() => {
    async function sendUserToCorrectPage() {
      const oauthResult = await finishOAuthSessionFromUrl();

      if (!oauthResult.ok) {
        setAuthState({
          ok: false,
          reason: "unauthorized",
          title: oauthResult.title,
          message: oauthResult.message,
        });
        return;
      }

      const routeChoice = await chooseAutomaticRoute();

      if (!routeChoice.ok) {
        setAuthState(routeChoice.authState);
        return;
      }

      window.location.href = routeChoice.route;
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
