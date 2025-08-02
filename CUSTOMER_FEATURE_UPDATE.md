# Customer Feature Update Documentation

## Tóm tắt thay đổi

Đã cập nhật feature customer theo yêu cầu:

### 1. API Customer (/api/customers) - Updated

**File**: `src/app/api/customers/route.ts`

**Thay đổi chính:**

- Thay thế `includeToday` bằng `includeAppointments` để rõ ràng hơn
- Thêm `todayOnly` filter để lấy khách hàng được tạo trong ngày (theo `createdAt`)
- Thêm `globalSearch` flag để phân biệt global search vs local search
- Cập nhật logic pagination: global search và todayOnly sẽ trả về tối đa 100 records, không phân trang
- Added TypeScript types cho better type safety

**New Parameters:**

```typescript
- includeAppointments: "true" | "false" // Include today appointments
- todayOnly: "true" | "false" // Filter by today's created customers
- globalSearch: "true" | "false" // Global search flag (skip clinic filter)
```

**Logic mới:**

- Khi `todayOnly=true`: Filter theo `createdAt` từ 00:00:00 đến 23:59:59 hôm nay (GMT+7)
- Khi `globalSearch=true`: Bỏ qua filter `clinicId`, trả về tối đa 100 records
- Khi `includeAppointments=true`: Include appointment hôm nay trong kết quả

### 2. GlobalCustomerSearch Component - New

**File**: `src/components/GlobalCustomerSearch.tsx`

**Tính năng:**

- Search khách hàng toàn hệ thống (không phân theo clinic)
- Debounced search (300ms) để tối ưu performance
- Dropdown hiển thị kết quả với avatar, tên, mã KH, SĐT, clinic
- Navigate đến customer detail của clinic khách hàng
- Hiển thị tối đa 100 kết quả
- Loading state và empty state

**Usage:**

```tsx
<GlobalCustomerSearch
  placeholder="Tìm kiếm khách hàng..."
  style={{ maxWidth: 400 }}
/>
```

### 3. AppHeader Component - Updated

**File**: `src/features/layouts/AppHeader.tsx`

**Thay đổi:**

- Thay thế Input search cũ bằng GlobalCustomerSearch component
- Removed unused imports
- Fixed TypeScript menu types

### 4. CustomerListPage - Updated

**File**: `src/features/customers/pages/CustomerListPage.tsx`

**Thay đổi:**

- Mặc định: Load khách hàng được tạo trong ngày hôm nay của clinic (`todayOnly=true`)
- Search local: Tìm trong clinic của employee (`todayOnly=false`)
- Luôn include appointments (`includeAppointments=true`)
- Cập nhật UI header để phản ánh logic mới
- Không phân trang cho view mặc định (tối đa 100 records)

**New API calls:**

```typescript
// Mặc định - khách hàng mới hôm nay
/api/customers?clinicId=XXX&includeAppointments=true&todayOnly=true

// Search trong clinic
/api/customers?clinicId=XXX&includeAppointments=true&todayOnly=false&search=query
```

## User Experience

### 1. Header Global Search

- User gõ từ khóa trong search bar trên header
- Hiển thị dropdown với kết quả từ toàn hệ thống
- Click vào khách hàng → navigate đến trang detail của clinic khách hàng
- Không hiển thị appointment info trong global search

### 2. Customer List Page

- **Mặc định**: Hiển thị "Khách hàng mới hôm nay" - danh sách KH được tạo trong ngày
- **Search**: Gõ từ khóa → tìm trong clinic hiện tại, bao gồm appointment info
- Header động thay đổi giữa "Khách hàng mới hôm nay" và "Tìm kiếm khách hàng"

## Technical Notes

### Performance

- Global search limit 100 records để tránh quá tải
- Local search trong clinic vẫn dùng pagination
- Debounced search 300ms
- Existing searchKeywords array optimization vẫn được giữ

### Security & Access Control

- Backend: User có quyền truy cập tất cả khách hàng
- Frontend: Chỉ global search mới hiển thị cross-clinic data
- Các trang khác vẫn filter theo clinic của employee

### Timezone

- "Hôm nay" = 00:00:00 - 23:59:59 theo GMT+7 (Vietnam timezone)
- Sử dụng dayjs().startOf("day") và dayjs().endOf("day")

## Testing Checklist

- [ ] Global search trên header hoạt động đúng
- [ ] CustomerListPage mặc định load khách hàng hôm nay
- [ ] Local search trong CustomerListPage hoạt động
- [ ] Navigate từ global search đến đúng clinic
- [ ] Appointment info hiển thị đúng trong local search
- [ ] Performance test với 100+ records
- [ ] Timezone test - "hôm nay" theo GMT+7

## Files Changed

1. `src/app/api/customers/route.ts` - Updated API logic
2. `src/components/GlobalCustomerSearch.tsx` - New component
3. `src/features/layouts/AppHeader.tsx` - Updated header
4. `src/features/customers/pages/CustomerListPage.tsx` - Updated page logic
