// src/features/customers/constants.ts

/**
 * Định nghĩa các loại hành vi cho ô "Ghi chú nguồn" trên form khách hàng.
 * - 'none': Ẩn ô ghi chú.
 * - 'text_input': Ô nhập liệu dạng văn bản, không bắt buộc.
 * - 'text_input_required': Ô nhập liệu dạng văn bản, bắt buộc nhập.
 * - 'employee_search': Ô tìm kiếm và chọn từ danh sách nhân viên.
 * - 'customer_search': Ô tìm kiếm và chọn từ danh sách khách hàng.
 */
type NoteType =
  | "none"
  | "text_input"
  | "text_input_optional"
  | "text_input_required"
  | "employee_search"
  | "customer_search";

export interface CustomerSource {
  value: string; // Giá trị lưu vào database
  label: string; // Nhãn hiển thị cho người dùng
  noteType: NoteType; // "Chỉ thị" cho UI
}

// DANH SÁCH NGUỒN KHÁCH HÀNG
export const CUSTOMER_SOURCES: CustomerSource[] = [
  // Nhóm Giới thiệu
  {
    value: "Nhân viên",
    label: "Nhân viên giới thiệu",
    noteType: "employee_search",
  },
  {
    value: "Khách cũ",
    label: "Khách cũ giới thiệu",
    noteType: "customer_search",
  },
  {
    value: "Hismile",
    label: "Hismile",
    noteType: "text_input",
  },

  // Nhóm Online
  { value: "Facebook", label: "Facebook", noteType: "text_input_optional" },
  { value: "Zalo", label: "Zalo", noteType: "text_input_optional" },
  { value: "Tiktok", label: "Tiktok", noteType: "text_input_optional" },
  { value: "Youtube", label: "Youtube", noteType: "text_input_optional" },
  { value: "Google Search", label: "Tìm kiếm Google", noteType: "none" },
  { value: "Google Maps", label: "Google Maps", noteType: "none" },
  { value: "Website", label: "Website Dr Dee", noteType: "none" },

  // Nhóm Offline & Sự kiện
  { value: "Voucher", label: "Voucher / Tờ rơi", noteType: "text_input" },
  { value: "Event", label: "Sự kiện / Hội thảo", noteType: "text_input" },
  {
    value: "Khách vãng lai",
    label: "Khách vãng lai",
    noteType: "none",
  },

  // Nguồn khác
  { value: "Khác", label: "Nguồn khác", noteType: "text_input_required" },
];

export const CUSTOMER_STATUS = [
  { label: "Mới", value: "new", color: "green" },
  { label: "Đang điều trị", value: "in_treatment", color: "blue" },
  { label: "Đã hoàn thành", value: "completed", color: "gold" },
  { label: "Huỷ", value: "cancelled", color: "red" },
];

// DANH SÁCH CÁC DỊCH VỤ QUAN TÂM
export const SERVICES_OF_INTEREST = [
  { label: "Implant", value: "Implant" },
  { label: "Răng sứ", value: "Răng sứ" },
  { label: "Niềng răng", value: "Niềng răng" },
  { label: "Mặt lưỡi", value: "Mặt lưỡi" },
  { label: "Invisalign", value: "Invisalign" },
  { label: "Tẩy trắng răng", value: "Tẩy trắng răng" },
  { label: "Nhổ răng khôn", value: "Nhổ răng khôn" },
  { label: "Cười hở lợi", value: "Cười hở lợi" },
  { label: "Khác", value: "Khác" },
];

export const OCCUPATIONS = [
  // Nhóm văn phòng/công sở
  "Nhân viên văn phòng",
  "Kế toán",
  "Nhân viên hành chính",
  "Thư ký",
  "Chuyên viên marketing",
  "Chuyên viên kinh doanh",
  "Lập trình viên",
  "Kỹ sư phần mềm",
  "Kỹ sư xây dựng",
  "Kiến trúc sư",
  "Nhân sự (HR)",
  "Thiết kế đồ họa",
  "Biên tập viên",
  "Phóng viên",
  "Phiên dịch viên/Biên dịch viên",
  "Trợ lý",
  "Giám đốc/Trưởng phòng",
  "Chuyên gia tài chính",
  "Nhân viên ngân hàng",

  // Nhóm dịch vụ/thương mại
  "Bán hàng",
  "Nhân viên siêu thị/cửa hàng",
  "Nhân viên thu ngân",
  "Nhân viên phục vụ (nhà hàng, quán ăn)",
  "Đầu bếp",
  "Quản lý nhà hàng/khách sạn",
  "Hướng dẫn viên du lịch",
  "Lễ tân",
  "Tài xế/Lái xe",
  "Nhân viên giao hàng",
  "Chủ cửa hàng/doanh nghiệp nhỏ",
  "Cắt tóc/Làm đẹp",
  "Thợ may",
  "Thợ sửa chữa (điện, nước, xe máy...)",
  "Nhân viên pha chế",
  "Môi giới bất động sản",
  "Môi giới chứng khoán",

  // Nhóm giáo dục/y tế
  "Giáo viên",
  "Giảng viên",
  "Học sinh/Sinh viên", // Mặc dù là học, nhưng thường được tính như một nhóm khách hàng
  "Bác sĩ",
  "Y tá/Điều dưỡng",
  "Dược sĩ",
  "Kỹ thuật viên y tế",

  // Nhóm sản xuất/công nghiệp
  "Công nhân",
  "Kỹ thuật viên sản xuất",
  "Giám sát sản xuất",
  "Nông dân",
  "Ngư dân",
  "Thủ công mỹ nghệ",

  // Nhóm tự do/khác
  "Freelancer",
  "Nội trợ",
  "Người về hưu",
  "Nghệ sĩ (ca sĩ, nhạc sĩ, họa sĩ...)",
  "Vận động viên",
  "Văn sĩ/Nhà thơ",
  "Youtuber/Streamer/Influencer",
  "Chủ hộ kinh doanh cá thể",
  "Lao động phổ thông",
  "Bảo vệ",
  "Thợ điện",
  "Thợ hàn",
  "Thợ mộc",
  "Thợ hồ",
  "Tài xế công nghệ (Grab, Gojek...)",
];
