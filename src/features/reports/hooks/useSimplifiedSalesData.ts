// src/features/reports/hooks/useSimplifiedSalesData.ts
"use client";
import { useMemo } from "react";
import { useSalesReportsData } from "./useSalesReportsData";
import type { ReportsFilters } from "../type";

export const useSimplifiedSalesData = (filters: ReportsFilters) => {
  // Respect server/query scoping; don't strip clinicId
  const fetchFilters = filters;

  const {
    data: salesData,
    isLoading: loading,
    error,
    refetch,
  } = useSalesReportsData(fetchFilters);

  const processedData = useMemo(() => {
    // Data already scoped by useSalesReportsData; no extra filtering here
    return salesData;
  }, [salesData]);

  return {
    loading,
    error,
    data: processedData,
    refetch,
  };
};
