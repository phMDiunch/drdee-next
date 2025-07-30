// src/features/appointments/components/AppointmentTable.tsx
import { Table, Tag, Space, Button } from "antd";
import type { Appointment } from "../type";
import { BRANCHES } from "@/constants";
import { formatDateTimeVN } from "@/utils/date";
import { APPOINTMENT_STATUS_OPTIONS } from "../constants";

// Kiểu dữ liệu nhận vào giờ đã bao gồm object con
type AppointmentWithIncludes = Appointment & {
  customer: { fullName: string };
  primaryDentist: { fullName: string };
};

type Props = {
  data: AppointmentWithIncludes[];
  loading: boolean;
  total?: number; // Làm optional cho customer detail page
  page?: number; // Làm optional cho customer detail page
  pageSize?: number; // Làm optional cho customer detail page
  onEdit: (appt: Appointment) => void;
  onDelete: (appt: Appointment) => void; // Thêm prop này
  onPageChange?: (page: number, pageSize: number) => void; // Làm optional
  hideCustomerColumn?: boolean;
};

export default function AppointmentTable({
  data,
  loading,
  total,
  page,
  pageSize,
  onEdit,
  onDelete,
  onPageChange,
  hideCustomerColumn = false,
}: Props) {
  console.log("AppointmentTable data:", data);
  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (customer: { fullName: string }) => customer?.fullName || "-",
    },
    {
      title: "Thời gian hẹn",
      dataIndex: "appointmentDateTime",
      key: "appointmentDateTime",
      render: (v: string) => (v ? formatDateTimeVN(v, "HH:mm DD/MM/YYYY") : ""),
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => `${duration} phút`,
    },
    {
      title: "Bác sĩ chính",
      dataIndex: "primaryDentist",
      key: "primaryDentist",
      render: (dentist: { fullName: string }) => dentist?.fullName || "-",
    },
    {
      title: "Bác sĩ phụ",
      dataIndex: "secondaryDentist",
      key: "secondaryDentist",
      render: (dentist: { fullName: string } | null) =>
        dentist?.fullName || "-",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => notes || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: string) => {
        const status = APPOINTMENT_STATUS_OPTIONS.find(
          (opt) => opt.value === v
        );
        return <Tag color={status?.color}>{status?.label || v}</Tag>;
      },
    },

    {
      title: "Chi nhánh",
      dataIndex: "clinicId",
      key: "clinicId",
      render: (v: string) => {
        const branch = BRANCHES.find((b) => b.value === v);
        return branch ? <Tag color={branch.color}>{branch.label}</Tag> : null;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Appointment) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Button size="small" danger onClick={() => onDelete(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];
  const showColumns = hideCustomerColumn
    ? columns.filter((col) => col.key !== "customer")
    : columns;

  return (
    <Table
      columns={showColumns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      bordered
      size="middle"
      pagination={
        total !== undefined && page !== undefined && pageSize !== undefined
          ? {
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              onChange: onPageChange,
            }
          : false // Không có pagination cho customer detail page
      }
    />
  );
}
