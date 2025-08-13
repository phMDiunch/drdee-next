// src/features/reports/hooks/useSalesReportsData.ts
"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import dayjs from "dayjs";
import { ReportsFilters, SalesComparisonData } from "../type";

// Sales Query keys - centralized for easy invalidation
export const salesQueryKeys = {
  all: ["sales"] as const,
  reports: () => [...salesQueryKeys.all, "reports"] as const,
  reportsByFilters: (filters: ReportsFilters, clinicId?: string) =>
    [...salesQueryKeys.reports(), { filters, clinicId }] as const,
};

async function fetchSalesReports(
  filters: ReportsFilters
): Promise<SalesComparisonData> {
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

  const response = await fetch(`/api/reports/sales?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch sales reports");
  }

  return response.json();
}

export function useSalesReportsData(filters: ReportsFilters) {
  const { employeeProfile } = useAppStore();

  // Dynamic cache strategy based on data recency (same as revenue)
  const getCacheStrategy = () => {
    const today = dayjs();

    // Get date range from filters
    let dataStart: dayjs.Dayjs;
    let dataEnd: dayjs.Dayjs;

    if (filters.timeRange === "month" && filters.selectedMonth) {
      const [year, month] = filters.selectedMonth.split("-");
      dataStart = dayjs()
        .year(parseInt(year))
        .month(parseInt(month) - 1)
        .startOf("month");
      dataEnd = dataStart.endOf("month");
    } else if (
      filters.timeRange === "range" &&
      filters.startDate &&
      filters.endDate
    ) {
      dataStart = dayjs(filters.startDate);
      dataEnd = dayjs(filters.endDate);
    } else {
      // Default to current month
      dataStart = today.startOf("month");
      dataEnd = today.endOf("month");
    }

    // Check if data includes today
    const includesCurrentDay =
      dataStart.isSame(today, "day") ||
      (dataStart.isBefore(today, "day") && dataEnd.isAfter(today, "day"));

    // Check if data is from current month
    const isCurrentMonth = dataStart.isSame(today, "month");

    // Check if data is older than 3 months
    const isOldData = dataEnd.isBefore(today.subtract(3, "months"));

    if (includesCurrentDay) {
      // Today's data - very fresh
      return {
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes cache
        retry: 3,
      };
    } else if (isCurrentMonth) {
      // Current month data - moderately fresh
      return {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes cache
        retry: 2,
      };
    } else if (isOldData) {
      // Old data - can be cached longer
      return {
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 2 * 60 * 60 * 1000, // 2 hours cache
        retry: 1,
      };
    } else {
      // Recent data - standard caching
      return {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes cache
        retry: 2,
      };
    }
  };

  const cacheStrategy = getCacheStrategy();

  // Align Sales scoping with Revenue:
  // - Non-admin: always scoped to their clinicId
  // - Admin: use filters.clinicId (can be undefined to fetch all clinics)
  const effectiveClinicId =
    employeeProfile?.role !== "admin" && employeeProfile?.clinicId
      ? employeeProfile.clinicId
      : filters.clinicId;

  const fetchFilters: ReportsFilters = {
    ...filters,
    clinicId: effectiveClinicId,
  };

  return useQuery({
    queryKey: salesQueryKeys.reportsByFilters(fetchFilters, effectiveClinicId),
    queryFn: () => fetchSalesReports(fetchFilters),
    ...cacheStrategy,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: true, // Always fetch on mount
    enabled: !!employeeProfile, // Wait for profile to ensure correct scoping
  });
}

// Utility functions for cache management
export const useSalesCacheUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Invalidate all sales data
    invalidateAllSales: () => {
      return queryClient.invalidateQueries({
        queryKey: salesQueryKeys.all,
      });
    },

    // Invalidate sales reports
    invalidateSalesReports: () => {
      return queryClient.invalidateQueries({
        queryKey: salesQueryKeys.reports(),
      });
    },

    // Invalidate specific sales report by filters
    invalidateSalesByFilters: (filters: ReportsFilters, clinicId?: string) => {
      return queryClient.invalidateQueries({
        queryKey: salesQueryKeys.reportsByFilters(filters, clinicId),
      });
    },

    // Remove sales data from cache
    removeSalesCache: (filters: ReportsFilters, clinicId?: string) => {
      return queryClient.removeQueries({
        queryKey: salesQueryKeys.reportsByFilters(filters, clinicId),
      });
    },

    // Prefetch sales data
    prefetchSales: (filters: ReportsFilters) => {
      return queryClient.prefetchQuery({
        queryKey: salesQueryKeys.reportsByFilters(filters),
        queryFn: () => fetchSalesReports(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },
  };
};
