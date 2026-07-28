import {
  getCurrentUser,
  getFriendlySupabaseError,
  type AuthCheck,
} from "@/lib/auth-state";
import { supabase } from "@/lib/supabase";

type RouteChoice =
  | {
      ok: true;
      route: "/dashboard" | "/onboarding" | "/sign-in";
    }
  | {
      ok: false;
      authState: AuthCheck;
    };

export async function chooseAutomaticRoute(): Promise<RouteChoice> {
  const userCheck = await getCurrentUser();

  if (!userCheck.ok) {
    return {
      ok: true,
      route: "/sign-in",
    };
  }

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userCheck.user.id)
      .maybeSingle();

    if (error) {
      return {
        ok: false,
        authState: {
          ok: false,
          reason: "unavailable",
          title: "Could not choose where to send you",
          message: getFriendlySupabaseError(error),
        },
      };
    }

    return {
      ok: true,
      route: profile?.onboarding_completed ? "/dashboard" : "/onboarding",
    };
  } catch {
    return {
      ok: false,
      authState: {
        ok: false,
        reason: "unavailable",
        title: "Could not choose where to send you",
        message: "Supabase did not respond. Please refresh and try again.",
      },
    };
  }
}
