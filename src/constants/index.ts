// src/constants/branches.ts

// Danh sách các chi nhánh (mẫu) – bạn có thể chỉnh sửa name, address, phone cho đúng thực tế
export const BRANCHES = [
  {
    label: "450 MK",
    value: "450MK",
    color: "#0072BC", // xanh đậm
    name: "Nha Khoa DR DEE",
    address: "450 Minh Khai, Hai Bà Trưng, Hà Nội",
    phone: "0335.450.450",
  },
  {
    label: "143 TDT",
    value: "143TDT",
    color: "#28B463", // xanh lá
    name: "Nha Khoa DR DEE",
    address: "143 Tôn Đức Thắng, Đống Đa, Hà Nội",
    phone: "0343.143.143",
  },
  {
    label: "153 DN",
    value: "153DN",
    color: "#D68910", // cam vàng
    name: "Nha Khoa DR DEE",
    address: "153 Đà Nẵng, Ngô Quyền, Hải Phòng",
    phone: "0332.153.153",
  },
] as const;

export type Branch = (typeof BRANCHES)[number];

export const getBranchByCode = (code?: string): Branch | undefined =>
  BRANCHES.find((b) => b.value === code);

// Giới tính
export const GENDER_OPTIONS = [
  { label: "Nam", value: "Nam" },
  { label: "Nữ", value: "Nữ" },
  { label: "Khác", value: "Khác" },
];
