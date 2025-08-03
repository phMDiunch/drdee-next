// src/features/appointments/constants.ts

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: "Chờ xác nhận", label: "Chờ xác nhận", color: "orange" },
  { value: "Đã xác nhận", label: "Đã xác nhận", color: "blue" },
  { value: "Đã đến", label: "Đã đến", color: "green" },
  { value: "Đến đột xuất", label: "Đến đột xuất", color: "purple" },
  { value: "Không đến", label: "Không đến", color: "red" },
  { value: "Đã hủy", label: "Đã hủy", color: "gray" },
];

// ✅ Logic check-in rules - CẬP NHẬT THEO WORKFLOW MỚI
export const CHECKIN_ALLOWED_STATUSES = [
  "Chờ xác nhận", // ✅ Cho phép check-in ngay cả khi chưa confirm (lễ tân quên gọi)
  "Đã xác nhận", // ✅ Standard flow
  "Không đến", // ✅ Có thể check-in muộn sau khi đánh dấu không đến
];

export const CHECKIN_BLOCKED_STATUSES = [
  "Đã đến", // Đã check-in rồi
  "Đã hủy", // Đã hủy
];

// ✅ THÊM: Status transitions allowed
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  "Chờ xác nhận": ["Đã xác nhận", "Đã hủy"],
  "Chưa đến": ["Đã xác nhận", "Đã đến", "Đã hủy"], // ✅ THÊM: Cho phép từ "Chưa đến" chuyển sang các status khác
  "Đã xác nhận": ["Đã đến", "Không đến", "Đã hủy"], // Có thể chuyển sang không đến sau appointment time
  "Đã đến": [], // Không thể chuyển status sau khi đã check-in
  "Không đến": ["Đã đến"], // Có thể check-in muộn
  "Đã hủy": [], // Không thể chuyển từ đã hủy
  "Đến đột xuất": [], // Walk-in không chuyển status
};
