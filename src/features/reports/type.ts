// src/features/reports/type.ts

export interface RevenueData {
  totalRevenue: number;
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;

  // By payment method
  byPaymentMethod: {
    cash: number;
    cardNormal: number;
    cardVisa: number;
    transfer: number;
  };

  // By time (daily breakdown for charts)
  byTime: Array<{
    date: string;
    revenue: number;
    sales: number;
    transactions: number;
    cash: number;
    cardNormal: number;
    cardVisa: number;
    transfer: number;
  }>;

  // By employee
  byEmployee: Array<{
    employeeId: string;
    employeeName: string;
    role: string; // consultingSale, consultingDoctor, treatingDoctor
    revenue: number;
    sales: number;
    transactions: number;
  }>;

  // By clinic
  byClinic: Array<{
    clinicId: string;
    clinicName: string;
    revenue: number;
    sales: number;
    transactions: number;
  }>;
}

// Sales Data for detailed service listings
export interface SalesDetailData {
  id: string;
  customerId: string; // Add customer ID for navigation
  customerSource: string | null;
  sourceNotes: string | null;
  customerCode: string | null;
  customerName: string;
  serviceName: string;
  finalPrice: number;
  serviceConfirmDate: string;
  clinicId: string; // Add clinic ID for filtering

  // Consulting staff information
  consultingDoctorId: string | null;
  consultingDoctorName: string | null;
  consultingSaleId: string | null;
  consultingSaleName: string | null;
}

export interface SalesData {
  totalSales: number;
  totalServices: number;
  details: SalesDetailData[];
}

export interface SalesComparisonPeriod {
  data: SalesData;
  periodLabel: string;
  growth: {
    sales: number; // Percentage
    services: number;
  };
}

export interface SalesComparisonData {
  current: SalesData;
  previousMonth: SalesComparisonPeriod;
  previousYear: SalesComparisonPeriod;
}

export interface ReportsFilters {
  timeRange: "month" | "range";
  selectedMonth?: string; // Format: YYYY-MM for month picker
  startDate?: string; // Format: YYYY-MM-DD for range picker
  endDate?: string; // Format: YYYY-MM-DD for range picker
  clinicId?: string;
}

export interface ComparisonPeriod {
  data: RevenueData;
  periodLabel: string;
  growth: {
    revenue: number; // Percentage
    sales: number;
    transactions: number;
  };
}

export interface ComparisonData {
  current: RevenueData;
  previousPeriod: ComparisonPeriod; // So với kỳ trước (cùng khoảng thời gian)
  previousMonth: ComparisonPeriod; // So với tháng trước
  previousYear: ComparisonPeriod; // So với cùng tháng năm trước
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface EmployeeReportData {
  id: string;
  name: string;
  role: string;
  revenue: number;
  sales: number;
  transactions: number;
  growth?: {
    revenue: number;
    sales: number;
    transactions: number;
  };
}

// Treatment Revenue Doctor Data
export interface TreatmentRevenueDetailData {
  id: string; // PaymentVoucherDetail ID
  customerId: string;
  customerCode: string | null;
  customerName: string;
  serviceName: string; // consultedServiceName
  treatingDoctorId: string | null;
  treatingDoctorName: string | null;
  amountReceived: number; // detail.amount
  paymentDate: string; // voucher.paymentDate
  paymentMethod: string;
  clinicId: string;
}

export interface TreatmentRevenueResponse {
  totalRevenue: number;
  totalPayments: number;
  details: TreatmentRevenueDetailData[];
}
