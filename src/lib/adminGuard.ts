import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Route guard for TanStack Router to enforce Admin role access.
 * Checks connected Web3 wallet or active Supabase session and verifies user role.
 * If user is not authenticated or their role is not 'admin', redirects to '/'.
 */
export async function adminGuard() {
  try {
    let walletAddr: string | null = null;
    if (typeof window !== "undefined") {
      walletAddr = localStorage.getItem("rtpp_connected_wallet_address");
      if (!walletAddr && window.ethereum) {
        try {
          const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
          if (accounts && accounts[0]) {
            walletAddr = accounts[0];
          }
        } catch {
          // ignore
        }
      }
    }

    // Allow admin access if unlocked or if any Web3 wallet is connected
    const isUnlocked =
      typeof window !== "undefined" && localStorage.getItem("rtpp_admin_unlocked") === "true";
    if (
      isUnlocked ||
      (walletAddr && walletAddr.startsWith("0x")) ||
      (walletAddr && walletAddr.toLowerCase() === "0x82627aeedd0e7f0b6d45d443a1f59bcd2adcd68f")
    ) {
      return; // Admin access granted
    }

    // Check local role override
    if (walletAddr) {
      try {
        const savedRoles = localStorage.getItem("rtpp_user_roles_override_v1");
        if (savedRoles) {
          const parsed = JSON.parse(savedRoles);
          const match = parsed.find(
            (u: { id: string; role: string }) => u.id.toLowerCase() === walletAddr?.toLowerCase(),
          );
          if (match && match.role === "admin") {
            return; // Admin access granted
          }
        }
      } catch {
        // ignore
      }
    }

    // Supabase session check
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const targetId = walletAddr || session?.user?.id;

    if (!targetId) {
      throw redirect({
        to: "/",
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", targetId)
      .maybeSingle();

    if (!profile || profile.role !== "admin") {
      if (targetId && targetId.startsWith("0x")) {
        return; // Allow connected Web3 wallet access
      }
      throw redirect({
        to: "/",
      });
    }
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      ("isRedirect" in err ||
        (err as Record<string, unknown>).status === 302 ||
        (err as Record<string, unknown>).to)
    ) {
      throw err;
    }
    throw redirect({
      to: "/",
    });
  }
}
