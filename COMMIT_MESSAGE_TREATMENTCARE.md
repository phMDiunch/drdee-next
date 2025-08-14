# Commit Message

```
feat: Triển khai tính năng Chăm sóc sau điều trị (TreatmentCare) v1

- Thêm model TreatmentCare với enum TreatmentCareStatus và quan hệ với Employee, Customer
- Tạo migration an toàn cho production (baseline + additive approach)
- API endpoints: candidates, records (grouped/by-customer), create, delete với scoping theo clinic
- Frontend: trang /treatment-care với 2 tab (Khách hàng cần chăm sóc, Nhật ký chăm sóc)
- UX cải tiến: 
  + Tab Candidates: link tên KH, icon điện thoại với tooltip, mặc định ngày hôm qua
  + Form chăm sóc: thời điểm không chọn được, trạng thái dạng radio buttons
  + Tab Records: group theo ngày, detail drawer, onlyMine filter
- Tích hợp Customer Detail: tab "Chăm sóc sau điều trị" + nút "Chăm sóc" nhanh
- Di chuyển menu "Chăm sóc sau điều trị" xuống dưới "Phiếu thu" trong sidebar
- Đơn giản hóa constants theo style project (value/label/color objects)
- Timezone: Asia/Ho_Chi_Minh cho tất cả logic ngày
- Headers scoping: x-employee-id, x-employee-role, x-clinic-id
```

Để commit:
```bash
git add .
git commit -m "feat: Triển khai tính năng Chăm sóc sau điều trị (TreatmentCare) v1

- Thêm model TreatmentCare với enum TreatmentCareStatus và quan hệ với Employee, Customer
- Tạo migration an toàn cho production (baseline + additive approach)
- API endpoints: candidates, records (grouped/by-customer), create, delete với scoping theo clinic
- Frontend: trang /treatment-care với 2 tab (Khách hàng cần chăm sóc, Nhật ký chăm sóc)
- UX cải tiến: Tab Candidates link tên KH, icon điện thoại, Form chăm sóc với radio status
- Tích hợp Customer Detail: tab chăm sóc + nút chăm sóc nhanh tái sử dụng modal
- Di chuyển menu xuống dưới Phiếu thu, đơn giản hóa constants theo style project
- Timezone Asia/Ho_Chi_Minh, headers scoping x-employee-id/role/clinic-id"
```
