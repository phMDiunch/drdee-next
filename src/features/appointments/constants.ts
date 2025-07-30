// src/features/appointments/constants.ts

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: "Chờ xác nhận", label: "Chờ xác nhận", color: "orange" },
  { value: "Đã xác nhận", label: "Đã xác nhận", color: "blue" },
  { value: "Đã đến", label: "Đã đến", color: "green" },
  { value: "Đến đột xuất", label: "Đến đột xuất", color: "purple" }, // Mới thêm
  { value: "Không đến", label: "Không đến", color: "red" },
  { value: "Đã hủy", label: "Đã hủy", color: "gray" },
];

// Logic check-in rules
export const CHECKIN_ALLOWED_STATUSES = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Không đến", // Có thể check-in muộn
];

export const CHECKIN_BLOCKED_STATUSES = [
  "Đã đến", // Đã check-in rồi
  "Đã hủy", // Đã hủy
];
