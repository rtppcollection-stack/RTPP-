import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/integrations/supabase/types";

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchRole(id: string) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", id)
          .maybeSingle();

        if (mounted) {
          if (!error && data?.role) {
            setRole(data.role as UserRole);
          } else {
            setRole("user");
          }
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setRole("user");
          setLoading(false);
        }
      }
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUserId(session.user.id);
        fetchRole(session.user.id);
      } else {
        setRole(null);
        setUserId(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUserId(session.user.id);
        fetchRole(session.user.id);
      } else {
        setRole(null);
        setUserId(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    role,
    userId,
    loading,
    isAdmin: role === "admin",
    isEditor: role === "editor",
    isMonitor: role === "monitor",
    isRegularUser: role === "user" || role === null,
  };
}
