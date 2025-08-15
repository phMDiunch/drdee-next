# TreatmentCare (Chăm sóc sau điều trị) — Spec v1 (Final)

Mục tiêu: tài liệu ngắn gọn, đủ để implement đồng bộ FE + API + DB cho phiên bản v1.

## 1) Model & Ràng buộc

- Tên model: TreatmentCare
- Enum: TreatmentCareStatus = { STABLE, UNREACHABLE, NEEDS_FOLLOW_UP }
- Trường chính:
  - id (uuid)
  - customerId (ref Customer)
  - clinicId (theo nhân viên chăm sóc — careStaff)
  - careStaffId (ref Employee)
  - treatmentDate (Date-only)
  - careAt (Timestamptz)
  - careStatus (enum)
  - careContent (string)
  - Snapshot: treatmentServiceNames (string[]), treatingDoctorNames (string[])
  - (optional) treatingDoctorIds (string[]), treatmentClinicIds (string[])
  - Audit: createdById, updatedById, createdAt, updatedAt
- Index: (clinicId, treatmentDate), (clinicId, careAt), (careStaffId, careAt), (customerId, treatmentDate)
- Ràng buộc:
  - Chỉ tạo khi có >= 1 TreatmentLog của customerId trong ngày treatmentDate (theo Asia/Ho_Chi_Minh).
  - date(careAt, VN) >= treatmentDate (cho phép cùng ngày).
  - clinicId của TreatmentCare lấy theo careStaff (người thao tác).

## 2) Phân quyền & Scope

- Non-admin:
  - Xem trong phạm vi clinicId của profile.
  - Tạo bản ghi.
  - Xoá: chỉ với bản ghi do chính mình tạo (careStaffId = tôi) và cùng ngày (date(now,VN) = date(careAt,VN)).
  - Không có quyền sửa.
- Admin:
  - Xem tất cả (có filter clinic).
  - Xoá/Sửa mọi bản ghi (v1 không làm sửa).

## 3) Timezone & Ngày

- Chuẩn so sánh ngày theo Asia/Ho_Chi_Minh (dayjs.tz).
- treatmentDate: Date-only theo VN.
- Group theo ngày (ở Records): date(careAt) theo VN.

## 4) Frontend (Next.js + AntD + React Query + Zustand)

- Route: /treatment-care (thêm mục “Chăm sóc” ở Sidebar)
- Thư mục: src/features/treatment-care/
  - pages/TreatmentCarePage.tsx
  - constants.ts (TREATMENT_CARE_STATUS_OPTIONS, CARE_STATUS_COLOR_MAP)
  - components/
  - TreatmentCareCustomerTable.tsx
  - RecordsList.tsx
  - CreateCareModal.tsx
  - CareDetailDrawer.tsx
  - CustomerTreatmentCareTab.tsx
  - hooks/
  - useTreatmentCareCustomers.ts
  - useTreatmentCares.ts (useTreatmentCares, useCreateTreatmentCare, useDeleteTreatmentCare, useCustomerTreatmentCares)
  - type.ts

### 4.1 Tab Khách hàng cần chăm sóc (nguồn TreatmentLog)

- Điều hướng ngày: Prev/Next + DatePicker (giới hạn 35 ngày gần nhất mặc định).
- Mặc định ngày = hôm qua (theo VN). Khi xoá chọn trong DatePicker sẽ quay về hôm qua.
- Cột: Ngày điều trị, Mã KH, Tên KH, Điện thoại, Dịch vụ (gộp), Bác sĩ (gộp), Action.
- Không hiển thị “source clinics”.
- Nút “Chăm sóc” mở CreateCareModal (prefill customerId, treatmentDate, snapshot đọc-only).
- Badge: “Đã chăm sóc X lần hôm nay” (đếm TreatmentCare theo KH và treatmentDate).
- Liên hệ: hiển thị icon điện thoại (nếu có số), tooltip = số; click gọi tel:.

Hook: useTreatmentCareCustomers

- Input: { treatmentDate, clinicId? (admin), keyword? }
- Scope: non-admin ép clinicId = profile.clinicId.
- Output: TreatmentCareCustomer[] = { customerId, customerCode, customerName, phone, treatmentDate, treatmentServiceNames[], treatingDoctorNames[] }

### 4.2 Tab Bản ghi (Records — 35 ngày gần nhất, group theo ngày)

- Mặc định from=today-34, to=today (VN), group theo ngày; có thể đổi range nhưng tối đa 35 ngày.
- Bộ lọc: careStatus, keyword, onlyMine (mặc định OFF), clinic (admin-only).
- Cột: Ngày điều trị, careAt, KH (mã/tên/điện thoại), Dịch vụ, Bác sĩ, careStatus, careContent, careStaff, Action.
- Click hàng: mở CareRecordDetailDrawer.
- Delete: theo quyền như mục Phân quyền.

Hook: useTreatmentCares

- Input: { from, to, careStatus?, onlyMine?, clinicId?, keyword?, groupBy: 'day' }
- Output (groupBy=day): Array<{ day: 'YYYY-MM-DD', items: CareRecord[] }>

Hook: useCreateTreatmentCareMutation

- Input: { customerId, treatmentDate (YYYY-MM-DD), careAt (ISO), careStatus, careContent }
- On success: invalidate Customers (ngày hiện tại) + Records (range liên quan).

Hook: useDeleteTreatmentCareMutation

- Input: { id }
- On success: invalidate Customers/Records.

### 4.3 Tab “Chăm sóc” trong Customer Detail

- Bảng lịch sử TreatmentCare của KH (toàn bộ thời gian).
- Bộ lọc: careStatus, khoảng thời gian, keyword (nội dung) — tuỳ chọn v1.
- Click hàng → Drawer; Delete theo quyền.
- Hook: useCustomerTreatmentCaresQuery (customerId, from?, to?, careStatus?, page?, pageSize?).

Màu trạng thái (CARE_STATUS_COLOR_MAP)

- UNREACHABLE: red (Không liên lạc được)
- NEEDS_FOLLOW_UP: gold (Cần chăm sóc thêm)
- STABLE: green (Đã ổn)

So sánh nhanh với các tab khác trong Customer Detail

- Thông tin chung/Điều trị/Thanh toán: vừa xem vừa thao tác (thêm/sửa). Tab “Chăm sóc” hiện tại là xem + xoá (v1), chưa có tạo mới.
- Lịch hẹn/Dịch vụ tư vấn: dữ liệu nguồn riêng (Appointment/ConsultedService) và có action tạo theo ngữ cảnh. “Chăm sóc” phụ thuộc TreatmentLog + quy tắc ngày điều trị.

Nút “Chăm sóc” tại tab này (đã triển khai, tái sử dụng modal)

- Mục tiêu: tạo nhanh bản ghi chăm sóc cho đúng KH ngay trong chi tiết KH.
- Cách làm: tái sử dụng `CreateCareModal`, truyền `customerId` và `treatmentDate` mặc định = ngày điều trị mới nhất (từ TreatmentLog của KH). Không tạo component mới.
- Nếu KH không có TreatmentLog: nút bị vô hiệu hóa.
- Quy tắc ràng buộc và snapshot giữ nguyên như ở Customers/Records (BE đã kiểm tra tồn tại TreatmentLog trong ngày và careAt(VN) ≥ treatmentDate).

## 5) Backend — API

Headers (tạm v1): x-employee-id, x-employee-role, x-clinic-id.

- GET /api/treatment-cares/customers?date=YYYY-MM-DD&clinicId?&keyword?&page?&pageSize?

  - Non-admin: ép clinicId từ header.
  - Trả về TreatmentCareCustomer[] (gộp theo customer trong đúng treatmentDate VN).

- GET /api/treatment-cares?clinicId?&from=YYYY-MM-DD&to=YYYY-MM-DD&careStatus?&onlyMine?=1&keyword?&groupBy=day

  - Non-admin: ép clinicId từ header; onlyMine → careStaffId = current employee.
  - Mặc định (thiếu from/to): 35 ngày gần nhất, groupBy=day.
  - Trả về: Array<{ day: string, items: CareRecord[] }> khi groupBy=day; ngược lại Array<CareRecord>.

- GET /api/treatment-cares?customerId=...&from?&to?&careStatus?&page?&pageSize?

  - Cho tab Customer Detail; order by careAt desc.

- POST /api/treatment-cares

  - Body: { customerId, treatmentDate: 'YYYY-MM-DD', careAt: ISO, careStatus, careContent }
  - Server gán: careStaffId, clinicId, createdById, updatedById từ header.
  - Validate:
    1. Có >=1 TreatmentLog của customerId trong ngày treatmentDate (VN).
    2. date(careAt,VN) >= treatmentDate.
  - Snapshot (từ TreatmentLog trong ngày): treatmentServiceNames (unique), treatingDoctorNames (unique).

- DELETE /api/treatment-cares/:id
  - Non-admin: chỉ khi careStaffId = tôi và date(now,VN) = date(careAt,VN).
  - Admin: xoá bất kỳ.

CareRecord (response tối thiểu)

- { id, customerId, customerCode?, customerName?, phone?, clinicId, careStaffId, careStaffName?, treatmentDate: 'YYYY-MM-DD', careAt: ISO, careStatus, careContent, treatmentServiceNames: string[], treatingDoctorNames: string[] }

Lỗi chuẩn

- 400 INVALID_INPUT | INVALID_DATE | NO_TREATMENT_LOG
- 403 FORBIDDEN
- 500 INTERNAL_ERROR

## 6) Ghi chú implement

- Prisma client: `@/services/prismaClient`.
- Date helpers: `src/utils/date.ts` (dayjs tz VN) để build khoảng ngày gte/lte, format ngày group.
- Không làm Edit v1; cân nhắc v2.

## Backend — API & Validation

Mục tiêu: bám pattern API Next.js hiện có (NextRequest/NextResponse + prisma), đảm bảo rule nghiệp vụ và timezone VN.

### Danh tính & scope (v1)

- Yêu cầu FE gửi tối thiểu: x-employee-id, x-employee-role, x-clinic-id (header) để:
  - Gán careStaffId, createdById, updatedById khi tạo.
  - Hạn chế dữ liệu theo clinic (non-admin).
  - Kiểm tra quyền xoá (của chính tôi + cùng ngày).
- Lâu dài có thể thay bằng Supabase Auth phía server (map uid → Employee).

### Quy ước ngày & timezone

- Chuẩn so sánh theo Asia/Ho_Chi_Minh (sử dụng dayjs.tz và helper trong `src/utils/date.ts`).
- Group theo ngày của Records: dùng date(careAt) theo VN.
- Customers dựa treatmentDate theo VN.

### Endpoints

- GET `/api/treatment-cares/customers?date=YYYY-MM-DD&clinicId?&keyword?&page?&pageSize?`
  - Scope: non-admin ép clinicId (từ header).
  - Trả về mảng TreatmentCareCustomer gộp theo customer cho đúng treatmentDate.
  - TreatmentCareCustomer: { customerId, customerCode, customerName, phone, treatmentDate: 'YYYY-MM-DD', treatmentServiceNames: string[], treatingDoctorNames: string[], careCount?: number }
- GET `/api/treatment-cares?clinicId?&from=YYYY-MM-DD&to=YYYY-MM-DD&careStatus?&onlyMine?=1&keyword?&groupBy=day`
  - Scope: non-admin ép clinicId (từ header). onlyMine → careStaffId = current employee.
  - Mặc định nếu thiếu from/to: from=today-34, to=today (VN), groupBy=day.
  - groupBy=day → { days: Array<{ date: 'YYYY-MM-DD', total: number, items: CareRecord[] }> }
  - Không groupBy → Array<CareRecord> (phục vụ bảng phẳng hoặc Customer Detail nếu muốn).
- GET `/api/treatment-cares?customerId=...&from?&to?&careStatus?&page?&pageSize?`
  - Tab Customer Detail: trả về danh sách phân trang, order by careAt desc.
- POST `/api/treatment-cares`
  - Body: { customerId, treatmentDate: 'YYYY-MM-DD', careAt: ISO, careStatus: 'STABLE'|'UNREACHABLE'|'NEEDS_FOLLOW_UP', careContent }
  - Server gán: careStaffId = current employee, clinicId = header clinic, createdById/updatedById = current employee id.
  - Validation:
    1. Có ít nhất 1 TreatmentLog của customerId trong ngày treatmentDate (VN start/end of day).
    2. date(careAt, VN) >= treatmentDate.
  - Snapshot trong ngày treatmentDate (unique):
    - treatmentServiceNames: từ consultedService.consultedServiceName của các TreatmentLog.
    - treatingDoctorNames: từ TreatmentLog.dentist.fullName (hoặc consultedService.treatingDoctor.fullName nếu hợp lý nghiệp vụ).
    - treatmentClinicIds (optional): lấy từ TreatmentLog.clinicId nếu cần tra cứu.
- DELETE `/api/treatment-cares/:id`
  - Non-admin: chỉ xoá khi careStaffId = current employee.id và date(now, VN) = date(careAt, VN).
  - Admin: xoá bất kỳ.

### CareRecord (response)

- { id, customerId, customerCode?, customerName?, phone?, clinicId, careStaffId, careStaffName?, treatmentDate: 'YYYY-MM-DD', careAt: ISO, careStatus, careContent, treatmentServiceNames: string[], treatingDoctorNames: string[] }
- Gợi ý include: customer { customerCode, fullName, phone }, careStaff { fullName } để render nhanh.

### Tìm kiếm & phân trang

- Keyword Records: tìm theo customerCode/fullName/phone và careContent (insensitive).
- Customers: tìm theo customerCode/fullName/phone.
- Pagination: Customers (tuỳ, v1 có thể không); Records (Customer Detail) có page/pageSize, order by careAt desc.

### Lỗi (đề xuất)

- 400: INVALID_INPUT (thiếu dữ liệu), INVALID_DATE (careAt trước treatmentDate), NO_TREATMENT_LOG.
- 403: FORBIDDEN (sai scope/role, xoá không phải của tôi).
- 500: INTERNAL_ERROR.

### Ghi chú triển khai

- Dùng prisma từ `@/services/prismaClient` và helpers `src/utils/date.ts` (tz VN) để build khoảng ngày gte/lte.
- Đảm bảo index đã có: (clinicId, treatmentDate), (clinicId, careAt), (careStaffId, careAt), (customerId, treatmentDate).
