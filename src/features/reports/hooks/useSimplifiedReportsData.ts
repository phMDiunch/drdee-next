// src/features/reports/hooks/useSimplifiedReportsData.ts
"use client";
import { useMemo } from "react";
import { useReportsDataQuery } from "./useReportsDataQuery";
import { filterRevenueDataByClinic } from "../utils/dataFilter";
import type { ReportsFilters, ComparisonData } from "../type";

export const useSimplifiedReportsData = (filters: ReportsFilters) => {
  const fetchFilters = useMemo(() => {
    if (filters.clinicId) {
      return { ...filters, clinicId: undefined };
    }
    return filters;
  }, [filters]);

  const { loading, error, revenueData, comparisonData, refetch } =
    useReportsDataQuery(fetchFilters);

  const processedData = useMemo(() => {
    if (!filters.clinicId) {
      return {
        revenueData,
        comparisonData,
      };
    }

    if (revenueData) {
      const filteredRevenue = filterRevenueDataByClinic(
        revenueData,
        filters.clinicId
      );

      const filteredComparison: ComparisonData | null = comparisonData
        ? {
            current: filteredRevenue,
            previousPeriod: {
              ...comparisonData.previousPeriod,
              data: comparisonData.previousPeriod.data
                ? filterRevenueDataByClinic(
                    comparisonData.previousPeriod.data,
                    filters.clinicId
                  )
                : filteredRevenue, // Fallback to current filtered data
            },
            previousMonth: {
              ...comparisonData.previousMonth,
              data: comparisonData.previousMonth.data
                ? filterRevenueDataByClinic(
                    comparisonData.previousMonth.data,
                    filters.clinicId
                  )
                : filteredRevenue, // Fallback to current filtered data
            },
            previousYear: {
              ...comparisonData.previousYear,
              data: comparisonData.previousYear.data
                ? filterRevenueDataByClinic(
                    comparisonData.previousYear.data,
                    filters.clinicId
                  )
                : filteredRevenue,
            },
          }
        : null;

      return {
        revenueData: filteredRevenue,
        comparisonData: filteredComparison,
      };
    }

    return {
      revenueData,
      comparisonData,
    };
  }, [filters.clinicId, revenueData, comparisonData]);

  return {
    loading,
    error,
    revenueData: processedData.revenueData,
    comparisonData: processedData.comparisonData,
    refetch,
  };
};
