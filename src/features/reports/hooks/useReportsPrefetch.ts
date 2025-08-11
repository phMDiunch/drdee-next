// src/features/reports/hooks/useReportsPrefetch.ts
"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import { reportsQueryKeys } from "./useReportsDataQuery";
import dayjs from "dayjs";
import type { ReportsFilters, RevenueData } from "../type";

export const useReportsPrefetch = () => {
  const queryClient = useQueryClient();
  const { employeeProfile } = useAppStore();

  // Fetch function for revenue data
  const fetchRevenueData = async (
    params: URLSearchParams
  ): Promise<RevenueData> => {
    const response = await fetch(`/api/reports/revenue?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to fetch reports data");
    }

    return response.json();
  };

  // Get date range helper
  const getDateRange = (timeRange: string, selectedMonth?: string) => {
    const now = dayjs();

    switch (timeRange) {
      case "month":
        if (selectedMonth) {
          const [year, month] = selectedMonth.split("-");
          const monthStart = dayjs()
            .year(parseInt(year))
            .month(parseInt(month) - 1)
            .startOf("month");
          const monthEnd = monthStart.endOf("month");
          return {
            startDate: monthStart.format("YYYY-MM-DD"),
            endDate: monthEnd.format("YYYY-MM-DD"),
          };
        } else {
          return {
            startDate: now.startOf("month").format("YYYY-MM-DD"),
            endDate: now.endOf("month").format("YYYY-MM-DD"),
          };
        }
      default:
        return {
          startDate: now.startOf("month").format("YYYY-MM-DD"),
          endDate: now.endOf("month").format("YYYY-MM-DD"),
        };
    }
  };

  // Prefetch next month data
  const prefetchNextMonth = async (currentFilters: ReportsFilters) => {
    if (!employeeProfile) return;

    const current = currentFilters.selectedMonth
      ? dayjs(currentFilters.selectedMonth + "-01")
      : dayjs();

    const nextMonth = current.add(1, "month");
    const nextMonthKey = nextMonth.format("YYYY-MM");

    const { startDate, endDate } = getDateRange("month", nextMonthKey);

    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    // Add clinic filter
    const clinicId =
      employeeProfile?.role !== "admin" && employeeProfile?.clinicId
        ? employeeProfile.clinicId
        : currentFilters.clinicId;

    if (clinicId) {
      params.set("clinicId", clinicId);
    }

    return queryClient.prefetchQuery({
      queryKey: reportsQueryKeys.revenueByFilters(
        { ...currentFilters, selectedMonth: nextMonthKey, startDate, endDate },
        clinicId
      ),
      queryFn: () => fetchRevenueData(params),
      staleTime: 10 * 60 * 1000, // 10 minutes for prefetched data
      gcTime: 30 * 60 * 1000, // 30 minutes cache
    });
  };

  // Prefetch previous month data
  const prefetchPreviousMonth = async (currentFilters: ReportsFilters) => {
    if (!employeeProfile) return;

    const current = currentFilters.selectedMonth
      ? dayjs(currentFilters.selectedMonth + "-01")
      : dayjs();

    const prevMonth = current.subtract(1, "month");
    const prevMonthKey = prevMonth.format("YYYY-MM");

    const { startDate, endDate } = getDateRange("month", prevMonthKey);

    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    // Add clinic filter
    const clinicId =
      employeeProfile?.role !== "admin" && employeeProfile?.clinicId
        ? employeeProfile.clinicId
        : currentFilters.clinicId;

    if (clinicId) {
      params.set("clinicId", clinicId);
    }

    return queryClient.prefetchQuery({
      queryKey: reportsQueryKeys.revenueByFilters(
        { ...currentFilters, selectedMonth: prevMonthKey, startDate, endDate },
        clinicId
      ),
      queryFn: () => fetchRevenueData(params),
      staleTime: 15 * 60 * 1000, // 15 minutes for historical data
      gcTime: 60 * 60 * 1000, // 1 hour cache for historical data
    });
  };

  // Prefetch current month (in case user starts with different filter)
  const prefetchCurrentMonth = async (clinicId?: string) => {
    if (!employeeProfile) return;

    const currentMonthKey = dayjs().format("YYYY-MM");
    const { startDate, endDate } = getDateRange("month", currentMonthKey);

    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    const effectiveClinicId =
      employeeProfile?.role !== "admin" && employeeProfile?.clinicId
        ? employeeProfile.clinicId
        : clinicId;

    if (effectiveClinicId) {
      params.set("clinicId", effectiveClinicId);
    }

    return queryClient.prefetchQuery({
      queryKey: reportsQueryKeys.revenueByFilters(
        {
          timeRange: "month",
          selectedMonth: currentMonthKey,
          startDate,
          endDate,
        },
        effectiveClinicId
      ),
      queryFn: () => fetchRevenueData(params),
      staleTime: 2 * 60 * 1000, // 2 minutes for current month
      gcTime: 10 * 60 * 1000, // 10 minutes cache
    });
  };

  // Smart prefetch based on user behavior
  const smartPrefetch = async (currentFilters: ReportsFilters) => {
    // Always prefetch adjacent months for smooth navigation
    const prefetchPromises = [
      prefetchNextMonth(currentFilters),
      prefetchPreviousMonth(currentFilters),
    ];

    // If not on current month, also prefetch current month
    const currentMonthKey = dayjs().format("YYYY-MM");
    if (currentFilters.selectedMonth !== currentMonthKey) {
      prefetchPromises.push(prefetchCurrentMonth(currentFilters.clinicId));
    }

    return Promise.allSettled(prefetchPromises);
  };

  return {
    prefetchNextMonth,
    prefetchPreviousMonth,
    prefetchCurrentMonth,
    smartPrefetch,
  };
};
