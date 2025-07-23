// Vai trò
export const ROLE_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'Quản lý', value: 'manager' },
  { label: 'Nhân viên', value: 'employee' },
];

// Trạng thái làm việc
export const EMPLOYMENT_STATUS_OPTIONS = [
  {
    label: 'Đang làm việc',
    value: 'Đang làm việc',
    color: '#52c41a',        // Antd green
  },
  {
    label: 'Thử việc',
    value: 'Thử việc',
    color: '#faad14',      // Antd yellow
  },
  {
    label: 'Nghỉ việc',
    value: 'Nghỉ việc',
    color: '#bfbfbf',      // Antd gray
  },
];

// 1. Danh sách phòng ban (Department)
export const DEPARTMENTS = [
  { name: 'Ban Giám đốc' },
  { name: 'Phòng Back Office' },
  { name: 'Phòng Chuyên môn' },
  { name: 'Phòng Kinh doanh' },
  { name: 'Phòng Marketing' },
  { name: 'Phòng CSKH' }
];

// 2. Danh sách bộ phận (Division/Section) theo từng phòng ban
export const DIVISIONS = [
  { name: 'Tuyển dụng', department: 'Phòng Back Office' },
  { name: 'Hành chính nhân sự', department: 'Phòng Back Office' },
  { name: 'Kế toán', department: 'Phòng Back Office' },
  { name: 'Bảo vệ', department: 'Phòng Back Office' },
  { name: 'Tạp vụ', department: 'Phòng Back Office' },
  { name: 'Bác sĩ', department: 'Phòng Chuyên môn' },
  { name: 'Điều dưỡng', department: 'Phòng Chuyên môn' },
  { name: 'Lễ tân', department: 'Phòng Kinh doanh' },
  { name: 'Quầy', department: 'Phòng Kinh doanh' },
  { name: 'Sale offline', department: 'Phòng Kinh doanh' },
  { name: 'Sale online', department: 'Phòng Marketing' },
  { name: 'Content', department: 'Phòng Marketing' },
  { name: 'Thiết kế', department: 'Phòng Marketing' },
  { name: 'Quay dựng', department: 'Phòng Marketing' },
  { name: 'Chạy ads', department: 'Phòng Marketing' },
  { name: 'Group seeding', department: 'Phòng Marketing' },
  { name: 'Chăm sóc khách hàng', department: 'Phòng CSKH' }
];

// 3. Danh sách chức vụ (Position)
export const POSITIONS = [
  'Chủ tịch',
  'Giám đốc',
  'Trưởng phòng',
  'Trưởng nhóm',
  'Chuyên viên',
  'Nhân viên'
];

// 4. Danh sách chức danh (Title) (nghề nghiệp/chuyên môn)
export const TITLES = [
  'Bác sĩ',
  'Điều dưỡng',
  'Kế toán',
  'Hành chính nhân sự',
  'Tuyển dụng',
  'Lễ tân',
  'Sale offline',
  'Sale online',
  'Content',
  'Thiết kế',
  'Quay dựng',
  'Chạy ads',
  'Group seeding',
  'Chăm sóc khách hàng',
  'Bảo vệ',
  'Tạp vụ'
];