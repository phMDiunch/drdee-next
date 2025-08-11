// src/features/reports/hooks/useSimplifiedSalesData.ts
"use client";
import { useMemo } from "react";
import { useSalesReportsData } from "./useSalesReportsData";
import { filterSalesComparisonDataByClinic } from "../utils/dataFilter";
import type { ReportsFilters } from "../type";

export const useSimplifiedSalesData = (filters: ReportsFilters) => {
  // Always fetch data for all clinics when clinicId is specified
  // This allows client-side filtering without additional API calls
  const fetchFilters = useMemo(() => {
    if (filters.clinicId) {
      return { ...filters, clinicId: undefined };
    }
    return filters;
  }, [filters]);

  const {
    data: salesData,
    isLoading: loading,
    error,
    refetch,
  } = useSalesReportsData(fetchFilters);

  const processedData = useMemo(() => {
    if (!filters.clinicId) {
      return salesData;
    }

    if (salesData) {
      const filteredSalesData = filterSalesComparisonDataByClinic(
        salesData,
        filters.clinicId
      );

      return filteredSalesData;
    }

    return salesData;
  }, [filters.clinicId, salesData]);

  return {
    loading,
    error,
    data: processedData,
    refetch,
  };
};
