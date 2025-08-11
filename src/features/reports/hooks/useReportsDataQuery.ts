// src/features/reports/hooks/useReportsDataQuery.ts
"use client";
import { useQueries } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import dayjs from "dayjs";
import type { RevenueData, ReportsFilters, ComparisonData } from "../type";

// Query keys - centralized for easy invalidation
export const reportsQueryKeys = {
  all: ["reports"] as const,
  revenue: () => [...reportsQueryKeys.all, "revenue"] as const,
  revenueByFilters: (filters: ReportsFilters, clinicId?: string) =>
    [...reportsQueryKeys.revenue(), { filters, clinicId }] as const,
};

export const useReportsDataQuery = (filters: ReportsFilters) => {
  const { employeeProfile } = useAppStore();

  // Advanced cache strategies based on data recency
  const getCacheStrategy = (startDate: string, endDate: string) => {
    const today = dayjs();
    const dataStart = dayjs(startDate);
    const dataEnd = dayjs(endDate);

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

  // Get date range based on time range selection
  const getDateRange = (
    timeRange: string,
    selectedMonth?: string,
    customStart?: string,
    customEnd?: string
  ) => {
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
      case "range":
        if (customStart && customEnd) {
          return {
            startDate: dayjs(customStart).format("YYYY-MM-DD"),
            endDate: dayjs(customEnd).format("YYYY-MM-DD"),
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

  // Get previous month for comparison
  const getPreviousMonthRange = (currentStart: string) => {
    const currentDate = dayjs(currentStart);
    const previousMonth = currentDate.subtract(1, "month");

    return {
      startDate: previousMonth.startOf("month").format("YYYY-MM-DD"),
      endDate: previousMonth.endOf("month").format("YYYY-MM-DD"),
    };
  };

  // Get same month previous year for comparison
  const getPreviousYearRange = (currentStart: string, currentEnd: string) => {
    const startDate = dayjs(currentStart).subtract(1, "year");
    const endDate = dayjs(currentEnd).subtract(1, "year");

    return {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
    };
  };

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

  // Current period parameters
  const { startDate, endDate } = getDateRange(
    filters.timeRange,
    filters.selectedMonth,
    filters.startDate,
    filters.endDate
  );

  const currentParams = new URLSearchParams({
    startDate,
    endDate,
  });

  // Add clinic filter
  const clinicId =
    employeeProfile?.role !== "admin" && employeeProfile?.clinicId
      ? employeeProfile.clinicId
      : filters.clinicId;

  if (clinicId) {
    currentParams.set("clinicId", clinicId);
  }

  // Previous month parameters
  const { startDate: prevMonthStart, endDate: prevMonthEnd } =
    getPreviousMonthRange(startDate);

  // Previous year parameters (same month/period last year)
  const { startDate: prevYearStart, endDate: prevYearEnd } =
    getPreviousYearRange(startDate, endDate);

  const previousMonthParams = new URLSearchParams(currentParams);
  previousMonthParams.set("startDate", prevMonthStart);
  previousMonthParams.set("endDate", prevMonthEnd);

  const previousYearParams = new URLSearchParams(currentParams);
  previousYearParams.set("startDate", prevYearStart);
  previousYearParams.set("endDate", prevYearEnd);

  // Use useQueries để fetch current, previous month, và previous year data
  const currentCacheStrategy = getCacheStrategy(startDate, endDate);
  const previousMonthCacheStrategy = getCacheStrategy(
    prevMonthStart,
    prevMonthEnd
  );
  const previousYearCacheStrategy = getCacheStrategy(
    prevYearStart,
    prevYearEnd
  );

  const queries = useQueries({
    queries: [
      {
        queryKey: reportsQueryKeys.revenueByFilters(
          { ...filters, startDate, endDate },
          clinicId
        ),
        queryFn: () => fetchRevenueData(currentParams),
        enabled: !!employeeProfile,
        ...currentCacheStrategy,
      },
      {
        queryKey: reportsQueryKeys.revenueByFilters(
          { ...filters, startDate: prevMonthStart, endDate: prevMonthEnd },
          clinicId
        ),
        queryFn: () => fetchRevenueData(previousMonthParams),
        enabled: !!employeeProfile,
        ...previousMonthCacheStrategy,
      },
      {
        queryKey: reportsQueryKeys.revenueByFilters(
          { ...filters, startDate: prevYearStart, endDate: prevYearEnd },
          clinicId
        ),
        queryFn: () => fetchRevenueData(previousYearParams),
        enabled: !!employeeProfile,
        ...previousYearCacheStrategy,
      },
    ],
  });

  const [currentQuery, previousMonthQuery, previousYearQuery] = queries;

  // Calculate comparison data
  const comparisonData: ComparisonData | null = (() => {
    if (!currentQuery.data) {
      return null;
    }

    const current = currentQuery.data;

    // Helper function to calculate growth
    const calculateGrowth = (currentVal: number, previousVal: number) => {
      return previousVal > 0
        ? ((currentVal - previousVal) / previousVal) * 100
        : 0;
    };

    // Helper function to get period label
    const getPeriodLabel = (start: string, end: string) => {
      const startDate = dayjs(start);
      const endDate = dayjs(end);

      if (startDate.isSame(endDate, "month")) {
        return `Tháng ${startDate.format("MM/YYYY")}`;
      } else {
        return `${startDate.format("DD/MM/YYYY")} - ${endDate.format(
          "DD/MM/YYYY"
        )}`;
      }
    };

    const result: ComparisonData = {
      current,
      previousPeriod: {
        data: {} as RevenueData, // Placeholder - not used
        periodLabel: "",
        growth: { revenue: 0, sales: 0, transactions: 0 },
      },
      previousMonth: {
        data: previousMonthQuery.data || ({} as RevenueData),
        periodLabel: getPeriodLabel(prevMonthStart, prevMonthEnd),
        growth: {
          revenue: previousMonthQuery.data
            ? calculateGrowth(
                current.totalRevenue,
                previousMonthQuery.data.totalRevenue
              )
            : 0,
          sales: previousMonthQuery.data
            ? calculateGrowth(
                current.totalSales,
                previousMonthQuery.data.totalSales
              )
            : 0,
          transactions: previousMonthQuery.data
            ? calculateGrowth(
                current.totalTransactions,
                previousMonthQuery.data.totalTransactions
              )
            : 0,
        },
      },
      previousYear: {
        data: previousYearQuery.data || ({} as RevenueData),
        periodLabel: getPeriodLabel(prevYearStart, prevYearEnd),
        growth: {
          revenue: previousYearQuery.data
            ? calculateGrowth(
                current.totalRevenue,
                previousYearQuery.data.totalRevenue
              )
            : 0,
          sales: previousYearQuery.data
            ? calculateGrowth(
                current.totalSales,
                previousYearQuery.data.totalSales
              )
            : 0,
          transactions: previousYearQuery.data
            ? calculateGrowth(
                current.totalTransactions,
                previousYearQuery.data.totalTransactions
              )
            : 0,
        },
      },
    };

    return result;
  })();

  return {
    // Loading states
    loading: currentQuery.isLoading,
    isLoading:
      currentQuery.isLoading ||
      previousMonthQuery.isLoading ||
      previousYearQuery.isLoading,
    isFetching:
      currentQuery.isFetching ||
      previousMonthQuery.isFetching ||
      previousYearQuery.isFetching,

    // Error states
    error: currentQuery.error,
    isError: currentQuery.isError,

    // Data
    revenueData: currentQuery.data || null,
    comparisonData,

    // Utility functions (giữ để compatible với code cũ)
    getDateRange,

    // Refetch functions
    refetch: () => {
      currentQuery.refetch();
      previousMonthQuery.refetch();
      previousYearQuery.refetch();
    },

    // Query status for debugging
    queryStatus: {
      current: {
        status: currentQuery.status,
        fetchStatus: currentQuery.fetchStatus,
        dataUpdatedAt: currentQuery.dataUpdatedAt,
      },
      previousMonth: {
        status: previousMonthQuery.status,
        fetchStatus: previousMonthQuery.fetchStatus,
        dataUpdatedAt: previousMonthQuery.dataUpdatedAt,
      },
      previousYear: {
        status: previousYearQuery.status,
        fetchStatus: previousYearQuery.fetchStatus,
        dataUpdatedAt: previousYearQuery.dataUpdatedAt,
      },
    },
  };
};
