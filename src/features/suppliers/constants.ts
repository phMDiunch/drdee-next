// src/features/suppliers/constants.ts

export const SUPPLIER_CATEGORIES = [
  { value: "medical_equipment", label: "Thiết bị y tế" },
  { value: "consumables", label: "Vật tư tiêu hao" },
  { value: "pharmaceuticals", label: "Dược phẩm" },
  { value: "office_equipment", label: "Thiết bị văn phòng" },
  { value: "maintenance_service", label: "Dịch vụ bảo trì" },
  { value: "dental_materials", label: "Vật liệu nha khoa" },
  { value: "laboratory_service", label: "Dịch vụ phòng lab" },
  { value: "software_service", label: "Dịch vụ phần mềm" },
  { value: "cleaning_supplies", label: "Vật tư vệ sinh" },
  { value: "other", label: "Khác" },
] as const;

export type SupplierCategoryType =
  (typeof SUPPLIER_CATEGORIES)[number]["value"];

// Color mapping for categories
export const SUPPLIER_CATEGORY_COLORS: Record<SupplierCategoryType, string> = {
  medical_equipment: "#1890ff", // blue
  consumables: "#52c41a", // green
  pharmaceuticals: "#722ed1", // purple
  office_equipment: "#fa8c16", // orange
  maintenance_service: "#faad14", // gold
  dental_materials: "#13c2c2", // cyan
  laboratory_service: "#eb2f96", // pink
  software_service: "#f5222d", // red
  cleaning_supplies: "#a0d911", // lime
  other: "#8c8c8c", // gray
};

// Helper function to get category label
export const getSupplierCategoryLabel = (value: string): string => {
  const category = SUPPLIER_CATEGORIES.find((cat) => cat.value === value);
  return category?.label || "Không xác định";
};

// Helper function to get category color
export const getSupplierCategoryColor = (value: string): string => {
  return SUPPLIER_CATEGORY_COLORS[value as SupplierCategoryType] || "#8c8c8c";
};

// Rating options
export const SUPPLIER_RATING_OPTIONS = [
  { value: 1, label: "1 sao - Rất kém", color: "#ff4d4f" },
  { value: 2, label: "2 sao - Kém", color: "#ff7a45" },
  { value: 3, label: "3 sao - Trung bình", color: "#faad14" },
  { value: 4, label: "4 sao - Tốt", color: "#73d13d" },
  { value: 5, label: "5 sao - Xuất sắc", color: "#52c41a" },
] as const;

// Status options
export const SUPPLIER_STATUS_OPTIONS = [
  { value: true, label: "Đang hoạt động", color: "green" },
  { value: false, label: "Tạm dừng", color: "red" },
] as const;
