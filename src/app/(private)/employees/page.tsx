"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Typography, message } from "antd";
import EmployeeTable from "@/features/employees/components/EmployeeTable";
import EmployeeForm from "@/features/employees/components/EmployeeForm";
import { Employee } from "@/features/employees/types";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { toISOStringUTC, parseDateFromISOString } from "@/utils/date";

const { Title } = Typography;

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
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
      message.error("Không thể tải danh sách nhân viên");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Thêm mới hoặc sửa nhân viên
  const handleFinish = async (values: any) => {
    try {
      // Convert ngày sang ISO string
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
      <EmployeeTable
        data={employees}
        loading={loading}
        onEdit={handleEdit}
        onChangeStatus={handleChangeStatus}
      />

      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            {modal.mode === "edit"
              ? "Sửa thông tin nhân viên"
              : "Thêm nhân viên mới"}
          </Title>
        }
        open={modal.open}
        onCancel={() => setModal({ ...modal, open: false })}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <EmployeeForm
          form={undefined} // hoặc truyền form instance nếu muốn
          initialValues={modal.data || {}}
          onFinish={handleFinish}
        />
      </Modal>
    </div>
  );
}
