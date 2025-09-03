# Báo cáo Doanh thu Điều trị Bác sĩ - Implementation Plan

## 🎯 Mục tiêu

Tạo tab mới "💰 Doanh thu điều trị bác sĩ" trong Reports với các cột:

- Bác sĩ điều trị
- Dịch vụ
- Mã khách hàng
- Khách hàng (clickable → navigate to customer detail)
- Số tiền thu (từ payment)
- Ngày thu tiền (từ payment)

## 🏗️ Implementation Plan

### 1. API Route Mới

**File**: `src/app/api/reports/treatment-revenue-doctor/route.ts`

**Logic**:

```typescript
// Query: PaymentVoucherDetail → PaymentVoucher → ConsultedService → Customer + Employee
// Filter: paymentDate trong khoảng thời gian
// Join: lấy treatmentDoctor từ ConsultedService
// Response: Format tương tự sales API với comparison data
```

**Response Structure**:

```typescript
interface TreatmentRevenueDetailData {
  id: string; // PaymentVoucherDetail ID
  customerId: string;
  customerCode: string | null;
  customerName: string;
  serviceName: string; // consultedServiceName
  treatingDoctorId: string | null;
  treatingDoctorName: string | null;
  amountReceived: number; // detail.amount
  paymentDate: string; // voucher.paymentDate
  paymentMethod: string;
  clinicId: string;
}

interface TreatmentRevenueResponse {
  totalRevenue: number;
  totalPayments: number;
  details: TreatmentRevenueDetailData[];
}
```

### 2. Type Definitions

**File**: `src/features/reports/type.ts`

- Thêm `TreatmentRevenueDetailData` interface
- Thêm `TreatmentRevenueResponse` interface

### 3. Hook

**File**: `src/features/reports/hooks/useTreatmentRevenueDoctorData.ts`

- Tương tự `useSalesReportsData` và `useSimplifiedReportsData`
- Query key: `['treatment-revenue-doctor', filters]`
- Cache strategy: Giống sales reports
- **Chung filters**: Sử dụng cùng `ReportsFilters` type từ page

### 4. Component

**File**: `src/features/reports/components/TreatmentRevenueDoctorTable.tsx`

- Cấu trúc tương tự `SalesByDoctorTable`
- **Props**: `{ data: TreatmentRevenueDetailData[], loading: boolean }`
- Columns: [Bác sĩ điều trị, Dịch vụ, Mã KH, Khách hàng*, Số tiền thu, Ngày thu]
- Filter theo bác sĩ điều trị (local filter trong component)
- Không có pagination
- Khách hàng column: Clickable button navigate to `/customers/{customerId}`

### 5. Tab Menu Integration

**File**: `src/features/reports/pages/ReportsOverviewPage.tsx`

**Thêm hook call**:

```typescript
const {
  data: treatmentRevenueResponse,
  loading: treatmentRevenueLoading,
  refetch: refetchTreatmentRevenue,
} = useTreatmentRevenueDoctorData(filters);

const treatmentRevenueData = treatmentRevenueResponse?.details;
```

**Thêm vào tabItems**:

```typescript
{
  key: "treatment-revenue-doctor",
  label: "💰 Doanh thu điều trị bác sĩ",
  children: (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24}>
        <TreatmentRevenueDoctorTable
          data={treatmentRevenueData || []}
          loading={treatmentRevenueLoading}
        />
      </Col>
    </Row>
  ),
},
```

**Cập nhật handleRefresh**:

```typescript
const handleRefresh = () => {
  refetchRevenue();
  refetchSales();
  refetchTreatmentRevenue(); // ← ADD THIS
};
```

**Cập nhật loading state**:

```typescript
const loading = revenueLoading || salesLoading || treatmentRevenueLoading;
```

### 6. Export

**File**: `src/features/reports/index.ts`

- Export `TreatmentRevenueDoctorTable`
- Export hook và types

## 🔧 Key Integration Points

### Shared Filter System:

- **Filters**: Sử dụng chung `RevenueFilters` component từ page level
- **State**: `filters` state được manage ở `ReportsOverviewPage`
- **Data Flow**: filters → hooks → API → components
- **Consistency**: Tất cả tabs đều phản ánh cùng timeRange/clinic filter

### API Query Logic:

```sql
SELECT
  pvd.id, pvd.amount, pvd.paymentMethod,
  pv.paymentDate, pv.customerId,
  c.fullName as customerName, c.customerCode,
  cs.consultedServiceName,
  cs.treatingDoctorId,
  e.fullName as treatingDoctorName
FROM PaymentVoucherDetail pvd
JOIN PaymentVoucher pv ON pvd.paymentVoucherId = pv.id
JOIN ConsultedService cs ON pvd.consultedServiceId = cs.id
JOIN Customer c ON pv.customerId = c.id
LEFT JOIN Employee e ON cs.treatingDoctorId = e.id
WHERE pv.paymentDate BETWEEN ? AND ?
  AND cs.treatingDoctorId IS NOT NULL -- chỉ lấy có bác sĩ điều trị
  [AND clinic filter if provided]
```

### Filter & Response Logic:

- **Time Range**: `timeRange=month` → current month, `timeRange=range` → custom range
- **Clinic Filter**: Optional `clinicId` parameter
- **Employee Scoping**: Admin thấy tất cả, non-admin chỉ thấy clinic của họ

### Component Features:

- **Global Filters**: Sử dụng chung bộ lọc thời gian/cơ sở từ page level
- **Local Filter**: Dropdown filter theo tên bác sĩ điều trị (trong component)
- **Sort**: Tất cả columns có thể sort
- **Navigation**: Click tên khách hàng → `/customers/{customerId}`
- **No Pagination**: Hiển thị tất cả records
- **Loading**: Share loading state với các tab khác

## 📊 Tab Layout Result:

```
[💰 Doanh thu theo ngày] [📊 Doanh số theo nguồn] [👨‍⚕️ Doanh số tư vấn bác sĩ] [👤 Doanh số tư vấn Sales] [💰 Doanh thu điều trị bác sĩ] ← NEW
```

## 🚨 Notes:

- **Shared Architecture**: Sử dụng cùng pattern với existing tabs (revenue, sales)
- **Filter Integration**: Chung bộ lọc thời gian/cơ sở với tất cả tabs
- **Data Flow**: Page level hooks → component props (không có direct API calls trong component)
- **Không ảnh hưởng** route cũ `/api/reports/treatment-revenue` (dành cho Dashboard)
- **Consistent** với architecture của sales reports
- **Type safety** đầy đủ với TypeScript
