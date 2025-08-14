// src/features/treatment-care/constants.ts

// Đơn giản, đồng bộ với style constants khác trong project
export const TREATMENT_CARE_STATUS_OPTIONS: Array<{
  value: string;
  label: string;
  color: string;
}> = [
  { value: "STABLE", label: "Ổn định", color: "green" },
  { value: "UNREACHABLE", label: "Không liên lạc được", color: "red" },
  { value: "NEEDS_FOLLOW_UP", label: "Cần theo dõi", color: "gold" },
];

// Map màu dùng cho Tag/hiển thị nhanh
export const CARE_STATUS_COLOR_MAP: Record<string, string> = {
  STABLE: "green",
  UNREACHABLE: "red",
  NEEDS_FOLLOW_UP: "gold",
};
