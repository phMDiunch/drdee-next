// src/features/treatment-care/hooks/useCandidates.ts
import { useQuery } from "@tanstack/react-query";
import { useAuthHeaders } from "@/lib/authHeaders";
import { CandidateItem } from "../type";

export function useAftercareCandidates(params: {
  date: string;
  keyword?: string;
}) {
  const { date, keyword } = params;
  const headers = useAuthHeaders();
  return useQuery({
    queryKey: ["aftercare-candidates", date, keyword ?? ""],
    queryFn: async (): Promise<CandidateItem[]> => {
      const usp = new URLSearchParams();
      usp.set("date", date);
      if (keyword) usp.set("keyword", keyword);
      const res = await fetch(`/api/aftercare/candidates?${usp.toString()}`, {
        cache: "no-store",
        headers,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });
}
