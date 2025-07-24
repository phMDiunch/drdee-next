// src/features/appointments/components/AppointmentTable.tsx
import { Table, Tag, Space, Button } from "antd";
import type { Appointment } from "../type";
import { BRANCHES } from "@/constants";
import { formatDateTimeVN } from "@/utils/date";
import { APPOINTMENT_STATUS_OPTIONS } from "../constants";

type Props = {
  data: Appointment[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onEdit: (appt: Appointment) => void;
  onPageChange: (page: number, pageSize: number) => void;
  customers?: any[];
  employees?: any[];
};

export default function AppointmentTable({
  data,
  loading,
  total,
  page,
  pageSize,
  onEdit,
  onPageChange,
  customers = [],
  employees = [],
}: Props) {
  const getCustomerName = (id: string) => {
    const c = customers.find((c) => c.id === id);
    return c ? c.fullName : "-";
  };
  const getEmployeeName = (id: string) => {
    const e = employees.find((e) => e.id === id);
    return e ? e.fullName : "-";
  };
  const getStatusLabel = (value: string) => {
    const s = APPOINTMENT_STATUS_OPTIONS.find((opt) => opt.value === value);
    return s ? s.label : value;
  };

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "customerId",
      key: "customerId",
      render: (id: string) => getCustomerName(id),
    },
    {
      title: "Thời gian hẹn",
      dataIndex: "appointmentDateTime",
      key: "appointmentDateTime",
      render: (v: string) => (v ? formatDateTimeVN(v, "HH:mm DD/MM/YYYY") : ""),
    },
    {
      title: "Bác sĩ chính",
      dataIndex: "primaryDentistId",
      key: "primaryDentistId",
      render: (id: string) => getEmployeeName(id),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: string) => <Tag>{getStatusLabel(v)}</Tag>,
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
