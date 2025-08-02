# CustomerListPage Refresh Issue Fix

## 🔍 **Vấn đề đã phát hiện:**

**CustomerListPage bị refresh liên tục vài phút một lần**

### **Nguyên nhân:**

1. **useEffect dependency issue**: `fetchCustomers` function được tạo lại mỗi render
2. **Missing dependency**: ESLint warning về missing `fetchCustomers` trong dependency array
3. **Object reference change**: `employeeProfile` object có thể thay đổi reference từ Zustand

### **Code có vấn đề:**

```tsx
// Trước khi fix
const fetchCustomers = async (pg = page, ps = pageSize, s = search) => {
  // function được tạo lại mỗi render
};

useEffect(() => {
  if (employeeProfile) {
    fetchCustomers(page, pageSize, search);
  }
}, [page, pageSize, search, employeeProfile]); // Missing fetchCustomers dependency
```

## ✅ **Giải pháp đã implement:**

### **1. Wrapped fetchCustomers với useCallback:**

```tsx
const fetchCustomers = useCallback(
  async (pg?: number, ps?: number, s?: string) => {
    const currentPage = pg ?? page;
    const currentPageSize = ps ?? pageSize;
    const currentSearch = s ?? search;

    // ... logic unchanged
  },
  [page, pageSize, search, employeeProfile?.clinicId]
); // Stable dependencies
```

### **2. Cải thiện useEffect:**

```tsx
useEffect(() => {
  if (employeeProfile?.clinicId) {
    fetchCustomers(page, pageSize, search);
  }
}, [page, pageSize, search, employeeProfile?.clinicId, fetchCustomers]); // Complete dependencies
```

### **3. Tối ưu dependency:**

- Chỉ depend vào `employeeProfile?.clinicId` thay vì toàn bộ object
- Tránh unnecessary re-creation khi other properties của employeeProfile thay đổi

## 📈 **Benefits:**

✅ **No more auto-refresh**: Function không bị tạo lại liên tục  
✅ **Stable dependencies**: useCallback với deps ổn định  
✅ **Performance**: Giảm unnecessary API calls  
✅ **ESLint compliance**: No missing dependency warnings

## 🔧 **Real-time Updates Strategy:**

**Vẫn giữ nguyên** cách hiện tại - **đây là cách đúng:**

```tsx
// Khi tạo customer mới
if (res?.ok) {
  const result = await res.json();
  toast.success(`Khách hàng được tạo thành công!`);

  // ✅ Manual refresh after successful operation
  fetchCustomers(modal.mode === "add" ? 1 : page, pageSize, search);
}
```

**Đây đã đủ** cho real-time updates! Không cần WebSocket hay polling.

## 🎯 **Kết quả:**

- ❌ **Trước**: Page refresh liên tục do useEffect loop
- ✅ **Sau**: Chỉ refresh khi cần thiết (page/search change, sau create/update)
- ✅ **UX**: Smooth, không có unexpected reloads
- ✅ **Performance**: Giảm unnecessary API calls
