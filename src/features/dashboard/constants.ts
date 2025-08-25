// src/features/dashboard/constants.ts
export const APPOINTMENT_STATUS_COLORS = {
  "Chờ xác nhận": "orange",
  "Đã xác nhận": "blue",
  "Đã đến": "green",
  "Không đến": "red",
  "Đã hủy": "red",
} as const;

export const SERVICE_STATUS_COLORS = {
  "Chưa chốt": "orange",
  "Đã chốt": "green",
} as const;

export const TREATMENT_STATUS_COLORS = {
  "Chưa điều trị": "orange",
  "Đang điều trị": "blue",
  "Hoàn thành": "green",
} as const;

export const EMPTY_STATE_MESSAGE = "No data";

export const TIME_FORMAT = "HH:mm";
export const DATE_FORMAT = "YYYY-MM-DD";
