# Dashboard Statistics Feature ✅ (React Query + Monthly Revenue)

## 🎯 Tổng quan

Dashboard với **2 cột thống kê tương tác** sử dụng **React Query**:

### 📊 Thống kê hôm nay:

1. **Tổng lịch hẹn hôm nay** (Blue) - Auto refetch mỗi 30s
2. **Tổng dịch vụ chưa chốt hôm qua** (Orange) - Cache 5 phút
3. **Tổng dịch vụ tư vấn hôm nay** (Green) - Auto refetch mỗi 1 phút

### 📈 Thống kê tháng này:

1. **Doanh số tư vấn tháng này** (Purple) - Chỉ tính dịch vụ đã chốt, group theo ngày

## ⚡ Tính năng chính

- **Personal Greeting**: `Xin chào: {tên user}` từ employeeProfile
- **2-Column Layout**: Desktop (2 cột ngang), Mobile (1 cột dọc)
- **React Query Integration**: Smart caching cho từng loại data
- **Monthly Revenue Tracking**: Tổng final price của dịch vụ đã chốt trong tháng
- **Grouped Revenue Table**: Group theo ngày với tổng tiền mỗi ngày

## 🏗️ Cấu trúc Code

```
src/features/dashboard/
├── components/
│   ├── DashboardGreeting.tsx
│   ├── DashboardStatistics.tsx          # 2-column layout với 4 cards
│   ├── DashboardDailyAppointment.tsx     # Table lịch hẹn
│   ├── DashboardUnconfirmedServices.tsx  # Table dịch vụ chưa chốt
│   ├── DashboardTodayServices.tsx        # Table dịch vụ hôm nay
│   └── DashboardMonthlyRevenue.tsx       # Table doanh số tháng (grouped by date)
├── hooks/ (React Query)
│   ├── useDashboardAppointments.ts       # useQuery với 30s refresh
│   ├── useDashboardUnconfirmedServices.ts # useQuery cached 5 phút
│   ├── useDashboardTodayServices.ts      # useQuery với 1 phút refresh
│   └── useDashboardMonthlyRevenue.ts     # useQuery cached 10 phút
└── pages/DashboardPage.tsx
```

## 🔧 API Endpoints

- `/api/appointments/today?doctorId={userId}` - Lịch hẹn theo bác sĩ
- `/api/consulted-services?consultingDoctorId={userId}&consultingSaleId={userId}` - Dịch vụ tư vấn

  - Client-side filter theo tháng hiện tại và status = "Đã chốt" cho monthly revenue## 🎨 UI Features

- **Time Format**: HH:mm cho check-in/out times
- **Visual Styling**: Completed appointments có gray background + 60% opacity
- **Clickable Links**: Customer names → `/customers/{id}`
- **Status Colors**: Color-coded status tags
- **Responsive Design**: Optimized column widths, scrollable tables

## 📊 React Query Configuration

**Smart Caching Strategy:**

- **Appointments**: `staleTime: 2min`, `refetchInterval: 30s` - Real-time updates
- **Yesterday's Unconfirmed**: `staleTime: 5min`, no auto-refetch - Static historical data
- **Today's Services**: `staleTime: 3min`, `refetchInterval: 1min` - Moderate updates

**Benefits:**

- ✅ Auto background sync - Data luôn fresh
- ✅ Intelligent caching - Giảm API calls không cần thiết
- ✅ Error retry logic - Auto retry 3 lần khi fail
- ✅ DevTools support - Debug dễ dàng với React Query DevTools

## 📊 Data Flow

1. **Page Load**: Fetch data cho cả 3 cards đồng thời
2. **Card Click**: Toggle hiển thị table tương ứng
3. **Loading**: Skeleton loading cho từng card
4. **Error Handling**: Graceful error states

## ✅ Status

**HOÀN THÀNH 100%** - Đã implement và test thành công

**Tech Stack**: Next.js 15.4.2 + TypeScript + Ant Design + **React Query v5.84.2**  
**Dev Server**: http://localhost:3001  
**Updated**: Aug 25, 2025 - **Migrated to React Query**
