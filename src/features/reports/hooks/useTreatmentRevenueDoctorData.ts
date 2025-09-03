// src/features/reports/hooks/useTreatmentRevenueDoctorData.ts
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import type { ReportsFilters, TreatmentRevenueResponse } from "../type";

const fetchTreatmentRevenueDoctorData = async (
  filters: ReportsFilters
): Promise<TreatmentRevenueResponse> => {
  const params = new URLSearchParams();

  params.append("timeRange", filters.timeRange);

  if (filters.selectedMonth) {
    params.append("selectedMonth", filters.selectedMonth);
  }

  if (filters.startDate) {
    params.append("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.append("endDate", filters.endDate);
  }

  if (filters.clinicId) {
    params.append("clinicId", filters.clinicId);
  }

  const response = await fetch(
    `/api/reports/treatment-revenue-doctor?${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch treatment revenue doctor data");
  }

  return response.json();
};

export function useTreatmentRevenueDoctorData(filters: ReportsFilters) {
  const { employeeProfile } = useAppStore();

  // Determine effective clinic ID - Admin sees all, others see their clinic
  const effectiveClinicId =
    employeeProfile?.role === "Admin"
      ? filters.clinicId
      : employeeProfile?.clinicId;

  const fetchFilters: ReportsFilters = {
    ...filters,
    clinicId: effectiveClinicId || undefined,
  };

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["treatment-revenue-doctor", fetchFilters, effectiveClinicId],
    queryFn: () => fetchTreatmentRevenueDoctorData(fetchFilters),
    enabled: !!employeeProfile, // Wait for profile to ensure correct scoping
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return {
    data,
    loading,
    error,
    refetch,
  };
}
