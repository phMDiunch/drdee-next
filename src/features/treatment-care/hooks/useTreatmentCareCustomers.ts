// src/features/treatment-care/hooks/useTreatmentCareCustomers.ts
import { useQuery } from "@tanstack/react-query";
import { useAuthHeaders } from "@/lib/authHeaders";
import { TreatmentCareCustomer } from "../type";

export function useTreatmentCareCustomers(params: {
  date: string;
  keyword?: string;
}) {
  const { date, keyword } = params;
  const headers = useAuthHeaders();
  return useQuery({
    queryKey: ["treatment-care-customers", date, keyword ?? ""],
    queryFn: async (): Promise<TreatmentCareCustomer[]> => {
      const usp = new URLSearchParams();
      usp.set("date", date);
      if (keyword) usp.set("keyword", keyword);
      const res = await fetch(
        `/api/treatment-cares/customers?${usp.toString()}`,
        {
          cache: "no-store",
          headers,
        }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
