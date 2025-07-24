// src/features/employees/pages/EmployeeList.tsx
"use client";
import { useEffect, useState } from "react";
import { Button, message } from "antd";
import EmployeeTable from "@/features/employees/components/EmployeeTable";
import EmployeeModal from "@/features/employees/components/EmployeeModal";
import { Employee } from "@/features/employees/type";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { toISOStringUTC, parseDateFromISOString } from "@/utils/date";
import EmployeeTableFilter from "../components/EmployeeTableFilter";

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Employee;
  }>({ open: false, mode: "add" });

  // Lấy list employee khi load page
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      toast.error("Không thể tải danh sách nhân viên");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

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
      message.error("Có lỗi xảy ra");
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

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const handleFilter = (filters) => {
    let list = [...employees];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (emp) =>
          emp.fullName?.toLowerCase().includes(s) ||
          emp.email?.toLowerCase().includes(s) ||
          emp.phone?.includes(s) ||
          emp.employeeCode?.toLowerCase().includes(s)
      );
    }
    if (filters.clinicId)
      list = list.filter((emp) => emp.clinicId === filters.clinicId);
    if (filters.title) list = list.filter((emp) => emp.title === filters.title);
    if (filters.employmentStatus)
      list = list.filter(
        (emp) => emp.employmentStatus === filters.employmentStatus
      );

    setFilteredEmployees(list);
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
              data: { role: "employee", employmentStatus: "Thử việc" },
            })
          }
        >
          Thêm nhân viên
        </Button>
      </div>
      <EmployeeTableFilter onFilter={handleFilter} />
      <EmployeeTable
        data={filteredEmployees}
        loading={loading}
        onEdit={handleEdit}
        onChangeStatus={handleChangeStatus}
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
