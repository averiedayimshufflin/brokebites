import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type AuthUser = {
  id: string;
  email?: string | null;
};

export type AuthCheck =
  | {
      ok: true;
      user: AuthUser;
    }
  | {
      ok: false;
      reason: "unauthorized" | "unavailable";
      title: string;
      message: string;
    };

export async function getCurrentUser(): Promise<AuthCheck> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      reason: "unavailable",
      title: "Account services are not configured",
      message:
        "BrokeBites cannot reach Supabase because the project URL or anon key is missing. You can still browse public pages, but account features are paused.",
    };
  }

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return {
        ok: false,
        reason: isUnauthorizedMessage(error.message)
          ? "unauthorized"
          : "unavailable",
        title: isUnauthorizedMessage(error.message)
          ? "Please sign in again"
          : "Account services are unavailable",
        message: isUnauthorizedMessage(error.message)
          ? "Your session could not be verified. Sign in with Google to continue."
          : "BrokeBites could not verify your account right now. Please try again in a moment.",
      };
    }

    if (!data.user) {
      return {
        ok: false,
        reason: "unauthorized",
        title: "Please sign in",
        message:
          "You need to sign in with Google before using your pantry, recipes, and saved meals.",
      };
    }

    return {
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  } catch {
    return {
      ok: false,
      reason: "unavailable",
      title: "Could not reach account services",
      message:
        "Supabase did not respond. Check your connection or try again in a moment.",
    };
  }
}

export function getFriendlySupabaseError(error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "";

  if (isUnauthorizedMessage(message)) {
    return "Your session expired or could not be verified. Please sign in again.";
  }

  if (!isSupabaseConfigured) {
    return "Account services are not configured. Add Supabase environment variables to use this feature.";
  }

  return "BrokeBites could not reach account services. Please try again in a moment.";
}

function isUnauthorizedMessage(message: string) {
  return /auth|jwt|session|unauthorized|not logged|invalid/i.test(message);
}
