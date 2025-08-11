// src/features/reports/utils/dataFilter.ts
import type { RevenueData, SalesData, SalesComparisonData } from "../type";

/**
 * Filter revenue data by clinic ID client-side
 * This avoids unnecessary API calls when switching between clinics
 */
export function filterRevenueDataByClinic(
  data: RevenueData,
  targetClinicId?: string
): RevenueData {
  // If no clinic filter or data is empty, return as is
  if (!targetClinicId || !data) {
    return data;
  }

  // Safety checks for data structure
  if (!data.byClinic || !Array.isArray(data.byClinic)) {
    return data;
  }

  if (!data.byTime || !Array.isArray(data.byTime)) {
    return data;
  }

  if (!data.byEmployee || !Array.isArray(data.byEmployee)) {
    return data;
  }

  // Filter daily data by clinic
  const filteredDailyData = data.byTime.map((day) => {
    // For single clinic, we need to recalculate daily totals
    // This is complex because we don't have clinic breakdown per day
    // So we'll use clinic percentages to estimate
    const clinicData = data.byClinic.find((c) => c.clinicId === targetClinicId);
    if (!clinicData) {
      return {
        ...day,
        revenue: 0,
        sales: 0,
        transactions: 0,
        cash: 0,
        cardNormal: 0,
        cardVisa: 0,
        transfer: 0,
      };
    }

    // Calculate clinic percentage of total
    const revenuePercentage =
      data.totalRevenue > 0 ? clinicData.revenue / data.totalRevenue : 0;
    const salesPercentage =
      data.totalSales > 0 ? clinicData.sales / data.totalSales : 0;

    return {
      ...day,
      revenue: Math.round(day.revenue * revenuePercentage),
      sales: Math.round(day.sales * salesPercentage),
      transactions: Math.round(day.transactions * revenuePercentage),
      cash: Math.round(day.cash * revenuePercentage),
      cardNormal: Math.round(day.cardNormal * revenuePercentage),
      cardVisa: Math.round(day.cardVisa * revenuePercentage),
      transfer: Math.round(day.transfer * revenuePercentage),
    };
  });

  // Filter employee data by clinic
  const filteredEmployeeData = data.byEmployee.filter(() => {
    // This is complex because employees can work across clinics
    // For now, we'll include all employees but this could be enhanced
    return true;
  });

  // Get clinic-specific data
  const clinicData = data.byClinic.find((c) => c.clinicId === targetClinicId);

  if (!clinicData) {
    // Return empty data if clinic not found
    return {
      ...data,
      totalRevenue: 0,
      totalSales: 0,
      totalTransactions: 0,
      averageTransaction: 0,
      byPaymentMethod: {
        cash: 0,
        cardNormal: 0,
        cardVisa: 0,
        transfer: 0,
      },
      byTime: filteredDailyData,
      byEmployee: filteredEmployeeData,
      byClinic: [],
    };
  }

  // Calculate payment method breakdown for this clinic
  const revenuePercentage =
    data.totalRevenue > 0 ? clinicData.revenue / data.totalRevenue : 0;

  const filteredPaymentMethods = {
    cash: Math.round((data.byPaymentMethod?.cash || 0) * revenuePercentage),
    cardNormal: Math.round(
      (data.byPaymentMethod?.cardNormal || 0) * revenuePercentage
    ),
    cardVisa: Math.round(
      (data.byPaymentMethod?.cardVisa || 0) * revenuePercentage
    ),
    transfer: Math.round(
      (data.byPaymentMethod?.transfer || 0) * revenuePercentage
    ),
  };

  return {
    ...data,
    totalRevenue: clinicData.revenue,
    totalSales: clinicData.sales,
    totalTransactions: clinicData.transactions,
    averageTransaction:
      clinicData.transactions > 0
        ? Math.round(clinicData.revenue / clinicData.transactions)
        : 0,
    byPaymentMethod: filteredPaymentMethods,
    byTime: filteredDailyData,
    byEmployee: filteredEmployeeData,
    byClinic: [clinicData],
  };
}

/**
 * Check if we can filter data client-side instead of making API call
 */
export function canUseClientSideFiltering(
  allClinicsData: RevenueData | null,
  targetClinicId?: string
): boolean {
  if (!allClinicsData || !targetClinicId) {
    return false;
  }

  // Check if the target clinic exists in the all-clinics data
  const hasClinicData = allClinicsData.byClinic.some(
    (clinic) => clinic.clinicId === targetClinicId
  );

  return hasClinicData;
}

/**
 * Filter sales data by clinic ID client-side
 * This avoids unnecessary API calls when switching between clinics
 */
export function filterSalesDataByClinic(
  data: SalesData,
  targetClinicId?: string
): SalesData {
  // If no clinic filter or data is empty, return as is
  if (!targetClinicId || !data) {
    return data;
  }

  // Safety checks for data structure
  if (!data.details || !Array.isArray(data.details)) {
    return data;
  }

  // Filter sales details by clinic
  const filteredDetails = data.details.filter(
    (item) => item.clinicId === targetClinicId
  );

  // Recalculate totals based on filtered details
  const totalSales = filteredDetails.reduce(
    (sum, item) => sum + item.finalPrice,
    0
  );
  const totalServices = filteredDetails.length;

  return {
    totalSales,
    totalServices,
    details: filteredDetails,
  };
}

/**
 * Filter sales comparison data by clinic ID client-side
 */
export function filterSalesComparisonDataByClinic(
  data: SalesComparisonData,
  targetClinicId?: string
): SalesComparisonData {
  if (!targetClinicId || !data) {
    return data;
  }

  const filteredCurrent = filterSalesDataByClinic(data.current, targetClinicId);

  return {
    current: filteredCurrent,
    previousMonth: {
      ...data.previousMonth,
      data: filterSalesDataByClinic(data.previousMonth.data, targetClinicId),
    },
    previousYear: {
      ...data.previousYear,
      data: filterSalesDataByClinic(data.previousYear.data, targetClinicId),
    },
  };
}

/**
 * Check if we can filter sales data client-side instead of making API call
 */
export function canUseSalesClientSideFiltering(
  allClinicsData: SalesComparisonData | null,
  targetClinicId?: string
): boolean {
  if (!allClinicsData || !targetClinicId) {
    return false;
  }

  // Check if the target clinic exists in the sales data
  const hasClinicData = allClinicsData.current.details.some(
    (item) => item.clinicId === targetClinicId
  );

  return hasClinicData;
}
