"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { finishOAuthSessionFromUrl } from "@/lib/oauth-session";
import { checkClientRateLimit, getRateLimitMessage } from "@/lib/rate-limit";
import { chooseAutomaticRoute } from "@/lib/route-choice";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function SignInPage() {
  const [notice, setNotice] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function redirectSignedInUser() {
      const oauthResult = await finishOAuthSessionFromUrl();

      if (!oauthResult.ok) {
        setNotice(oauthResult.message);
        setCheckingSession(false);
        return;
      }

      const routeChoice = await chooseAutomaticRoute();

      if (routeChoice.ok && routeChoice.route !== "/sign-in") {
        window.location.href = routeChoice.route;
        return;
      }

      setCheckingSession(false);
    }

    redirectSignedInUser();
  }, []);

  async function handleGoogleLogin() {
    const rateLimit = checkClientRateLimit({
      key: "google-sign-in",
      maxAttempts: 5,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      setNotice(getRateLimitMessage("starting sign in", rateLimit.retryAfterSeconds));
      return;
    }

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

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6">
        <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-orange-600">BrokeBites</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950">
            Checking your session...
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6">
      <Card className="w-full max-w-xl rounded-2xl border-orange-100 bg-white shadow-sm">
        <CardHeader className="items-center pb-10 text-center">
          <CardTitle className="text-3xl font-bold text-gray-950">Sign in</CardTitle>
          <CardDescription>Welcome back to BrokeBites.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-orange-100 bg-orange-50 font-semibold text-gray-950 hover:border-orange-400 hover:bg-orange-500 hover:text-white"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>

          {notice && (
            <p className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-center text-sm leading-6 text-orange-800">
              {notice}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
