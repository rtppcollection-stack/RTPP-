import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Route guard for TanStack Router to enforce Admin role access.
 * Checks the active Supabase session and verifies user role in profiles table.
 * If user is not authenticated or their role is not 'admin', redirects to '/'.
 */
export async function adminGuard() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw redirect({
        to: "/",
      });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error || !profile || profile.role !== "admin") {
      throw redirect({
        to: "/",
      });
    }
  } catch (err: unknown) {
    // Re-throw TanStack Router redirects
    if (
      err &&
      typeof err === "object" &&
      ("isRedirect" in err ||
        (err as Record<string, unknown>).status === 302 ||
        (err as Record<string, unknown>).to)
    ) {
      throw err;
    }
    // Block access and redirect to home on any exception
    throw redirect({
      to: "/",
    });
  }
}
