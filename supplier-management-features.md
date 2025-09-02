# Tài liệu Tính năng Quản lý Nhà cung cấp

## 1. Tổng quan

Xây dựng module quản lý nhà cung cấp hoàn chỉnh cho hệ thống quản lý phòng khám nha khoa với khả năng quản lý động các loại nhà cung cấp.

## 2. Cấu trúc Database

### 2.1 Model Supplier (đơn giản hóa)

```prisma
model Supplier {
  id           String  @id @default(uuid())
  supplierCode String? @unique // Mã nhà cung cấp tự động
  name         String  // Tên nhà cung cấp

  // Thông tin phân loại - dùng constants
  categoryType String  // "medical_equipment", "consumables", "pharmaceuticals"

  // Thông tin liên hệ
  phone        String?
  email        String?
  website      String?
  address      String?
  contactPerson String? // Người liên hệ chính
  contactPhone String?  // SĐT người liên hệ

  // Thông tin pháp lý
  taxId           String? @unique // Mã số thuế
  businessLicense String? // Số giấy phép KD
  bankName        String?
  bankAccount    String?  // Simplified field name

  // Thông tin đánh giá
  rating     Float    @default(5.0) // 1-5 sao, default 5
  ratingNote String? // Ghi chú đánh giá

  // Thông tin khác
  description String? // Mô tả, ghi chú
  isActive    Boolean @default(true)

  // Metadata
  createdAt DateTime @default(now()) @db.Timestamptz
  updatedAt DateTime @updatedAt @db.Timestamptz

  createdById String
  updatedById String
  createdBy   Employee @relation("CreatedSuppliers", fields: [createdById], references: [id])
  updatedBy   Employee @relation("UpdatedSuppliers", fields: [updatedById], references: [id])
}
```

## 3. Roadmap Implementation ✅

### Phase 1: Database & Backend APIs ✅

- [x] **Bước 1.1**: Tạo migration cho Supplier model (constants approach)
- [x] **Bước 1.2**: Tạo constants cho supplier categories (10 categories)
- [x] **Bước 1.3**: Tạo API routes cho Supplier CRUD (/api/suppliers)
- [x] **Bước 1.4**: Tạo API tìm kiếm và filter với pagination
- [x] **Bước 1.5**: Auto-generated supplier codes (SUP001, SUP002...)

### Phase 2: Frontend Components & Types ✅

- [x] **Bước 2.1**: Tạo TypeScript types cho Supplier
- [x] **Bước 2.2**: Tạo constants và validation schemas
- [x] **Bước 2.3**: Tạo React Query hooks cho data fetching và mutations
- [x] **Bước 2.4**: Tạo components cơ bản (Table, Form, Modal, Filters)

### Phase 3: UI Implementation ✅

- [x] **Bước 3.1**: Quản lý loại nhà cung cấp với CategorySelect component
- [x] **Bước 3.2**: Danh sách nhà cung cấp với pagination và actions
- [x] **Bước 3.3**: Form thêm/sửa nhà cung cấp với validation
- [x] **Bước 3.4**: Tìm kiếm và filter theo tên, category, rating
- [x] **Bước 3.5**: Tích hợp vào navigation (Settings menu)

### Phase 4: Advanced Features (Chưa implement)

- [ ] **Bước 4.1**: Import/Export Excel
- [ ] **Bước 4.2**: Báo cáo thống kê
- [ ] **Bước 4.3**: Lịch sử thay đổi (có audit fields)
- [ ] **Bước 4.4**: Notifications và advanced validations

## 4. Implemented Components

### 4.1 File Structure ✅

```
src/features/suppliers/
├── constants.ts              # 10 supplier categories với colors
├── type.ts                   # TypeScript interfaces
├── hooks/
│   └── useSuppliers.ts      # React Query hooks
├── components/
│   ├── CategorySelect.tsx    # Category dropdown
│   ├── SupplierTable.tsx     # Data table với actions
│   ├── SupplierFilters.tsx   # Search và filter form
│   └── SupplierForm.tsx      # Add/Edit modal form
└── pages/
    └── SuppliersPage.tsx     # Main page component
```

### 4.2 API Routes ✅

- `GET /api/suppliers` - List với pagination, search, filters
- `GET /api/suppliers/[id]` - Get single supplier
- `POST /api/suppliers` - Create với auto-generated code
- `PUT /api/suppliers/[id]` - Update supplier
- `DELETE /api/suppliers/[id]` - Soft delete

### 4.3 Features Implemented ✅

- ✅ CRUD operations với React Query
- ✅ Auto-generated supplier codes (SUP001, SUP002...)
- ✅ Pagination và sorting
- ✅ Search by name
- ✅ Filter by category và rating
- ✅ Soft delete (isActive flag)
- ✅ Audit trail (createdBy, updatedBy)
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Navigation integration

### 4.4 Navigation ✅

Truy cập qua: **Settings** → **Suppliers** (`/suppliers`)

## 5. Chi tiết từng bước đã hoàn thành

### Bước 1: Database Migration ✅

#### 1.1 Cập nhật Prisma Schema ✅

Added Supplier model với constants approach thay vì relations.

#### 1.2 Tạo migration ✅

```bash
npx prisma db push  # Đã chạy thành công
```

#### 1.3 Tạo constants cho supplier categories ✅

10 categories trong `src/features/suppliers/constants.ts`

Tạo file constants với các loại nhà cung cấp:

```typescript
// src/features/suppliers/constants.ts
export const SUPPLIER_CATEGORIES = [
  { value: "medical_equipment", label: "Thiết bị y tế" },
  { value: "consumables", label: "Vật tư tiêu hao" },
  { value: "pharmaceuticals", label: "Dược phẩm" },
  { value: "office_equipment", label: "Thiết bị văn phòng" },
  { value: "maintenance_service", label: "Dịch vụ bảo trì" },
  { value: "other", label: "Khác" },
] as const;
```

**Ưu điểm approach này:**

- ✅ Dễ thêm/sửa/xóa loại trong constants
- ✅ Không cần database migration khi thay đổi
- ✅ Type-safe với TypeScript
- ✅ Consistent với pattern hiện tại trong project

### Bước 2: API Routes

#### 2.2 Supplier APIs

- `GET /api/suppliers` - Lấy danh sách (có pagination, search, filter)
- `GET /api/suppliers/[id]` - Lấy chi tiết
- `POST /api/suppliers` - Tạo mới
- `PUT /api/suppliers/[id]` - Cập nhật
- `DELETE /api/suppliers/[id]` - Xóa/vô hiệu hóa

### Bước 3: Frontend Structure

```
src/features/suppliers/
├── constants.ts              # Constants và enums
├── type.ts                   # TypeScript interfaces
├── components/
│   ├── SupplierTable.tsx     # Bảng danh sách
│   ├── SupplierForm.tsx      # Form thêm/sửa
│   ├── SupplierDetail.tsx    # Chi tiết nhà cung cấp
│   ├── CategorySelect.tsx    # Dropdown chọn loại
│   └── SupplierFilters.tsx   # Filters và search
├── hooks/
│   └── useSuppliers.ts       # React Query hooks cho suppliers
└── pages/
    ├── SuppliersPage.tsx     # Trang chính
    └── SupplierDetailPage.tsx # Trang chi tiết
```

### Bước 4: UI/UX Features

#### 4.1 Quản lý loại nhà cung cấp

- Giao diện quản lý SupplierCategory
- Admin có thể thêm/sửa/xóa loại
- User chọn từ dropdown khi tạo supplier

#### 4.2 Danh sách nhà cung cấp

- Table với columns: Mã, Tên, Loại, Người liên hệ, SĐT, Trạng thái
- Pagination, Search, Sort
- Filters theo loại, trạng thái, đánh giá

#### 4.3 Form thêm/sửa

- Validation đầy đủ
- Auto-generate supplier code
- Dropdown chọn loại động
- Upload logo/avatar

#### 4.4 Tính năng nâng cao

- Export Excel danh sách
- Import Excel bulk create
- Rating system với stars
- History log thay đổi

## 5. Technical Considerations

### 5.1 Validation

- Email format validation
- Phone number format
- Tax ID uniqueness
- Required fields validation

### 5.2 Performance

- Pagination cho large datasets
- Debounced search
- Lazy loading cho dropdown options
- Caching cho categories

### 5.3 Security

- Role-based access control
- Input sanitization
- SQL injection prevention

### 5.4 Error Handling

- User-friendly error messages
- Network error handling
- Form validation errors
- Loading states

## 6. Testing Strategy

### 6.1 Backend Tests

- Unit tests cho API endpoints
- Integration tests cho database operations
- Validation tests

### 6.2 Frontend Tests

- Component unit tests
- Hook tests
- E2E tests cho user workflows

## 7. Deployment Notes

- Database migration cần chạy trước
- Seed data cho categories
- Environment variables configuration
- Rollback plan nếu cần

## 8. Implementation Summary ✅

### Status: **COMPLETED**

- **Database**: Supplier model với constants approach ✅
- **Backend**: Full CRUD API routes ✅
- **Frontend**: Complete UI với React Query ✅
- **Integration**: Navigation và authentication ✅

### Key Design Decisions:

1. **Constants vs Relations**: Chọn constants approach cho categories để đơn giản
2. **Soft Delete**: Sử dụng `isActive` flag thay vì hard delete
3. **Auto-generated Codes**: SUP001, SUP002... format
4. **Default Rating**: 5.0 stars thay vì 3.0
5. **Simplified Fields**: `bankAccount` thay vì `bankAccountNumber`

### Access:

- URL: `http://localhost:3000/suppliers`
- Navigation: **Settings** → **Suppliers**
- Permissions: Authenticated employees only

### Ready for Production:

- [x] Database migration safe
- [x] API validation complete
- [x] UI/UX implemented
- [x] Error handling
- [x] TypeScript types

## 9. Future Enhancements

- Supplier performance tracking
- Contract management
- Purchase order integration
- Vendor evaluation system
- Mobile responsive design
- Multi-language support
