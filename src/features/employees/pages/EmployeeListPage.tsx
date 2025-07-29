// src/features/employees/pages/EmployeeListPage.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { Button, message } from "antd";
import EmployeeTable from "@/features/employees/components/EmployeeTable";
import EmployeeModal from "@/features/employees/components/EmployeeModal";
import EmployeeTableFilter from "../components/EmployeeTableFilter";
import type { Employee } from "@/features/employees/type";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { toISOStringUTC, parseDateFromISOString } from "@/utils/date";
import { useAppStore } from "@/stores/useAppStore";

// Filter state type
type Filters = {
  search?: string;
  clinicId?: string;
  title?: string;
  employmentStatus?: string;
};

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Employee;
  }>({ open: false, mode: "add" });

  // State cho filter và phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>({});

  const { employeeProfile } = useAppStore();

  // Lấy danh sách nhân viên từ API
  const fetchEmployees = useCallback(async () => {
    // Chỉ fetch khi có thông tin employeeProfile
    if (!employeeProfile) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search: filters.search || "",
        title: filters.title || "",
        employmentStatus: filters.employmentStatus || "",
        // Thêm thông tin người dùng request
        requestingUserId: employeeProfile.id,
        requestingUserRole: employeeProfile.role,
        requestingUserClinicId: employeeProfile.clinicId || "",
      });

      // Chỉ admin mới có thể filter theo clinicId từ UI
      if (employeeProfile.role === "admin" && filters.clinicId) {
        params.set("clinicId", filters.clinicId);
      }

      const res = await fetch(`/api/employees?${params.toString()}`);
      const data = await res.json();
      setEmployees(data.employees || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error("Không thể tải danh sách nhân viên");
    }
    setLoading(false);
  }, [page, pageSize, filters, employeeProfile]);
  useEffect(() => {
    // Chỉ fetch khi đã có thông tin người dùng
    if (employeeProfile) {
      fetchEmployees();
    }
  }, [fetchEmployees, employeeProfile]);

  const handleFilter = (newFilters: Filters) => {
    setPage(1); // Reset về trang 1 mỗi khi filter
    setFilters(newFilters);
  };

  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
  };

  // Thêm mới hoặc sửa nhân viên
  const handleFinish = async (values: any) => {
    try {
      if (values.dob?.$d) values.dob = dayjs(values.dob).toISOString();
      if (values.nationalIdIssueDate?.$d)
        values.nationalIdIssueDate = toISOStringUTC(values.nationalIdIssueDate);

      if (modal.mode === "add") {
        const res = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (res.ok) {
          toast.success("Thêm nhân viên thành công!");
          setModal({ ...modal, open: false });
          fetchEmployees();
        } else {
          const { error } = await res.json();
          toast.error(error || "Lỗi không xác định");
        }
      } else if (modal.mode === "edit" && modal.data) {
        const res = await fetch(`/api/employees/${modal.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (res.ok) {
          toast.success("Cập nhật thành công!");
          setModal({ ...modal, open: false });
          fetchEmployees();
        } else {
          const { error } = await res.json();
          toast.error(error || "Lỗi cập nhật");
        }
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
  };

  // Mở modal sửa
  const handleEdit = (emp: Employee) => {
    setModal({
      open: true,
      mode: "edit",
      data: {
        ...emp,
        dob: emp.dob ? dayjs(emp.dob) : undefined,
        nationalIdIssueDate: emp.nationalIdIssueDate
          ? parseDateFromISOString(emp.nationalIdIssueDate)
          : undefined,
      },
    });
  };

  // Xử lý chuyển trạng thái nhân viên
  const handleChangeStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employmentStatus: newStatus }),
      });
      if (res.ok) {
        toast.success("Chuyển trạng thái thành công!");
        fetchEmployees();
      } else {
        const { error } = await res.json();
        toast.error(error || "Lỗi chuyển trạng thái");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi chuyển trạng thái");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ flex: 1, margin: 0 }}>Danh sách nhân viên</h2>
        <Button
          type="primary"
          onClick={() =>
            setModal({
              open: true,
              mode: "add",
              data: { role: "employee", employmentStatus: "Thử việc" } as any,
            })
          }
        >
          Thêm nhân viên
        </Button>
      </div>
      <EmployeeTableFilter onFilter={handleFilter} />
      <EmployeeTable
        data={employees}
        loading={loading}
        onEdit={handleEdit}
        onChangeStatus={handleChangeStatus}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
      <EmployeeModal
        open={modal.open}
        mode={modal.mode}
        data={modal.data}
        onCancel={() => setModal({ ...modal, open: false })}
        onFinish={handleFinish}
      />
    </div>
  );
}
