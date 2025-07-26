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
  total: number;
  page: number;
  pageSize: number;
  onEdit: (appt: Appointment) => void;
  onPageChange: (page: number, pageSize: number) => void;
};

export default function AppointmentTable({
  data,
  loading,
  total,
  page,
  pageSize,
  onEdit,
  onPageChange,
}: Props) {
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
      title: "Bác sĩ chính",
      dataIndex: "primaryDentist",
      key: "primaryDentist",
      render: (dentist: { fullName: string }) => dentist?.fullName || "-",
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
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      bordered
      size="middle"
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        onChange: onPageChange,
      }}
    />
  );
}
