// src/features/reports/constants.ts

export const REPORT_TIME_RANGES = [
  { label: "Chọn tháng", value: "month" },
  { label: "Chọn khoảng thời gian", value: "range" },
] as const;

export const REPORT_TYPES = [
  {
    label: "Doanh thu",
    value: "revenue",
    description: "Số tiền thực thu",
    color: "#52c41a",
    icon: "💰",
  },
  {
    label: "Doanh số",
    value: "sales",
    description: "Giá trị dịch vụ",
    color: "#1890ff",
    icon: "📊",
  },
] as const;

export const EMPLOYEE_ROLES_FOR_REPORTS = [
  { label: "Sale tư vấn", value: "consultingSale", field: "consultingSaleId" },
  {
    label: "Bác sĩ tư vấn",
    value: "consultingDoctor",
    field: "consultingDoctorId",
  },
  {
    label: "Bác sĩ điều trị",
    value: "treatingDoctor",
    field: "treatingDoctorId",
  },
] as const;

export const CHART_COLORS = [
  "#52c41a", // Green
  "#1890ff", // Blue
  "#722ed1", // Purple
  "#fa8c16", // Orange
  "#eb2f96", // Pink
  "#13c2c2", // Cyan
  "#faad14", // Gold
  "#f5222d", // Red
] as const;

// Payment method colors matching existing constants
export const PAYMENT_METHOD_COLORS = {
  "Tiền mặt": "#52c41a",
  "Quẹt thẻ thường": "#1890ff",
  "Quẹt thẻ Visa": "#722ed1",
  "Chuyển khoản": "#fa8c16",
} as const;
