// src/features/auth/hooks/useAuth.ts
import { supabase } from "@/services/supabaseClient";
import { useEffect, useState } from "react";

export function useEmployeeProfile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data?.user?.id;
      if (!uid) {
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/employees/by-uid?uid=${uid}`);
      const info = await res.json();
      setEmployee(info);
      setLoading(false);
    });
  }, []);

  return { employee, loading };
}
