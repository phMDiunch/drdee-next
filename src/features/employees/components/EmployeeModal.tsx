// src/features/employees/components/EmployeeModal.tsx
"use client";
import { Modal, Typography } from "antd";
import type { Employee } from "../type";
import EmployeeForm from "./EmployeeForm";
import dayjs from "dayjs";

const { Title } = Typography;

// Form data type for modal (with dayjs objects for DatePicker)
type EmployeeFormData = Omit<Employee, "dob" | "nationalIdIssueDate"> & {
  dob?: dayjs.Dayjs;
  nationalIdIssueDate?: dayjs.Dayjs;
};

type Props = {
  open: boolean;
  mode: "add" | "edit";
  data?: Partial<EmployeeFormData>;
  onCancel: () => void;
  onFinish: (values: any) => void;
  loading?: boolean;
};

export default function EmployeeModal({
  open,
  mode,
  data,
  onCancel,
  onFinish,
  loading,
}: Props) {
  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {mode === "edit" ? "Sửa thông tin nhân viên" : "Thêm nhân viên mới"}
        </Title>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnHidden
    >
      <EmployeeForm
        form={undefined} // hoặc truyền form instance nếu muốn
        initialValues={data || {}}
        onFinish={onFinish}
        loading={loading}
      />
    </Modal>
  );
}
