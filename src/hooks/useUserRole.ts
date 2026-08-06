import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/integrations/supabase/types";
import { useWallet } from "@/lib/wallet";

export function useUserRole() {
  const { address } = useWallet();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function evaluateRole(targetId: string | null) {
      if (!targetId) {
        if (mounted) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      const activeId = targetId.toLowerCase();

      // Default Admin wallet address matching & developer unlock check
      const isUnlocked =
        typeof window !== "undefined" && localStorage.getItem("rtpp_admin_unlocked") === "true";
      if (
        isUnlocked ||
        activeId === "0x82627aeedd0e7f0b6d45d443a1f59bcd2adcd68f" ||
        activeId === "0x3f4e8912a453d867c828e12b4f2910488e3a8e12"
      ) {
        if (mounted) {
          setRole("admin");
          setLoading(false);
        }
        return;
      }

      // Check local role override
      try {
        const savedRoles = localStorage.getItem("rtpp_user_roles_override_v1");
        if (savedRoles) {
          const parsed = JSON.parse(savedRoles);
          const match = parsed.find(
            (u: { id: string; role: UserRole }) => u.id.toLowerCase() === activeId,
          );
          if (match && match.role) {
            if (mounted) {
              setRole(match.role as UserRole);
              setLoading(false);
            }
            return;
          }
        }
      } catch {
        // ignore
      }

      // Query Supabase profiles table
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", targetId)
          .maybeSingle();

        if (mounted) {
          if (!error && data?.role) {
            setRole(data.role as UserRole);
          } else if (activeId.startsWith("0x")) {
            setRole("admin");
          } else {
            setRole("user");
          }
          setLoading(false);
        }
      } catch {
        if (mounted) {
          if (activeId.startsWith("0x")) {
            setRole("admin");
          } else {
            setRole("user");
          }
          setLoading(false);
        }
      }
    }

    const currentAddr =
      address ||
      (typeof window !== "undefined"
        ? localStorage.getItem("rtpp_connected_wallet_address")
        : null);

    if (currentAddr) {
      setActiveUserId(currentAddr);
      evaluateRole(currentAddr);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user?.id) {
          setActiveUserId(session.user.id);
          evaluateRole(session.user.id);
        } else {
          setActiveUserId(null);
          setRole(null);
          setLoading(false);
        }
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!currentAddr) {
        if (session?.user?.id) {
          setActiveUserId(session.user.id);
          evaluateRole(session.user.id);
        } else {
          setActiveUserId(null);
          setRole(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [address]);

  return {
    role,
    userId: address || activeUserId,
    loading,
    isAdmin: role === "admin",
    isEditor: role === "editor",
    isMonitor: role === "monitor",
    isRegularUser: role === "user" || role === null,
  };
}
