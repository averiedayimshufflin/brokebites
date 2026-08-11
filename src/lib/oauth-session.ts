import { supabase } from "@/lib/supabase";

type OAuthSessionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      title: string;
      message: string;
    };

function cleanAuthTokensFromUrl() {
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`
  );
}

export async function finishOAuthSessionFromUrl(): Promise<OAuthSessionResult> {
  const currentUrl = new URL(window.location.href);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const queryError =
    currentUrl.searchParams.get("error_description") ||
    currentUrl.searchParams.get("error");
  const hashError = hashParams.get("error_description") || hashParams.get("error");
  const authCode = currentUrl.searchParams.get("code");
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");

  if (queryError || hashError) {
    cleanAuthTokensFromUrl();
    return {
      ok: false,
      title: "Could not finish sign in",
      message: queryError || hashError || "Google sign-in was cancelled.",
    };
  }

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    cleanAuthTokensFromUrl();

    if (error) {
      return {
        ok: false,
        title: "Could not finish sign in",
        message:
          "Google sent you back to BrokeBites, but the session could not be saved. Please try signing in again.",
      };
    }
  }

  if (authCode) {
    const { error } = await supabase.auth.exchangeCodeForSession(authCode);

    if (error) {
      return {
        ok: false,
        title: "Could not finish sign in",
        message:
          "Google sent you back to BrokeBites, but the session could not be saved. Please try signing in again.",
      };
    }
  }

  return {
    ok: true,
  };
}
