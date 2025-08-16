# GlobalCustomerSearch Alignment & Limit Fix

## Vấn đề được sửa:

### 1. Alignment Issue trong AppHeader

**Vấn đề:** GlobalCustomerSearch bị lệch lên trên so với các component khác  
**Nguyên nhân:** Container div không có `alignItems: "center"`  
**Giải pháp:** Thêm flex alignment properties

**Changes in AppHeader.tsx:**

```tsx
// Before
<div style={{ flex: 1, padding: "0 24px" }}>

// After
<div style={{
  flex: 1,
  padding: "0 24px",
  display: "flex",
  alignItems: "center"
}}>
```

### 2. Giới hạn số lượng kết quả từ 100 xuống 10

**Changes in GlobalCustomerSearch.tsx:**

- Thêm `pageSize: "10"` vào API call
- Sửa text hiển thị từ "100 đầu tiên" thành "10 đầu tiên"

**Changes in API (/api/customers):**

- Sửa logic `takeLimit` để global search dùng pageSize thay vì fix 100
- Global search giờ sẽ respect pageSize parameter

## Files Changed:

1. `src/features/layouts/AppHeader.tsx` - Fixed alignment
2. `src/components/GlobalCustomerSearch.tsx` - Added pageSize limit
3. `src/app/api/customers/route.ts` - Updated takeLimit logic

## Result:

- ✅ GlobalCustomerSearch alignment fixed in header
- ✅ Global search now returns max 10 results
- ✅ Better UX with smaller dropdown list
