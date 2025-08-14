// src/features/treatment-care/hooks/useTreatmentCares.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthHeaders } from "@/lib/authHeaders";
import { GroupedByDay, TreatmentCareRecord } from "../type";

export function useTreatmentCares(params: {
  from?: string;
  to?: string;
  groupBy?: "day";
  onlyMine?: boolean;
  clinicId?: string;
}) {
  const { from, to, groupBy = "day", onlyMine, clinicId } = params;
  const headers = useAuthHeaders();
  return useQuery({
    queryKey: ["treatment-cares", from, to, groupBy, onlyMine, clinicId],
    queryFn: async () => {
      const usp = new URLSearchParams();
      if (from) usp.set("from", from);
      if (to) usp.set("to", to);
      if (groupBy) usp.set("groupBy", groupBy);
      if (onlyMine !== undefined) usp.set("onlyMine", String(onlyMine));
      if (clinicId) usp.set("clinicId", clinicId);
      const res = await fetch(`/api/treatment-cares?${usp.toString()}`, {
        cache: "no-store",
        headers,
      });
      if (!res.ok) throw new Error(await res.text());
      if (groupBy === "day") return (await res.json()) as GroupedByDay;
      return (await res.json()) as TreatmentCareRecord[];
    },
  });
}

export function useCreateTreatmentCare() {
  const qc = useQueryClient();
  const headers = useAuthHeaders();
  return useMutation({
    mutationFn: async (payload: {
      customerId: string;
      treatmentDate: string; // YYYY-MM-DD
      careAt: string; // ISO
      careStatus: string;
      careContent: string;
    }) => {
      const res = await fetch("/api/treatment-cares", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treatment-cares"] });
      qc.invalidateQueries({ queryKey: ["aftercare-candidates"] });
    },
  });
}

export function useDeleteTreatmentCare() {
  const qc = useQueryClient();
  const headers = useAuthHeaders();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/treatment-cares/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treatment-cares"] });
      qc.invalidateQueries({ queryKey: ["aftercare-candidates"] });
    },
  });
}

export function useCustomerTreatmentCares(customerId?: string) {
  const headers = useAuthHeaders();
  return useQuery({
    queryKey: ["treatment-cares", "customer", customerId],
    enabled: !!customerId,
    queryFn: async (): Promise<TreatmentCareRecord[]> => {
      const usp = new URLSearchParams();
      if (customerId) usp.set("customerId", customerId);
      const res = await fetch(`/api/treatment-cares?${usp.toString()}`, {
        cache: "no-store",
        headers,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
