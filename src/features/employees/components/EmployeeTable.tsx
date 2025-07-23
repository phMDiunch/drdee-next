// src/features/employees/components/EmployeeTable.tsx

import { Button, Space, Table, Tag } from "antd";
import type { Employee } from "../type"; // Best-practice: import type từ type.ts
import { BRANCHES } from "@/constants";
import { EMPLOYMENT_STATUS_OPTIONS, TITLES } from "../constants";
import { formatDateTimeVN } from "@/utils/date";
import EmployeeStatusSwitcher from "./EmployeeStatusSwitcher";

type Props = {
  data: Employee[];
  loading: boolean;
  onEdit: (employee: Employee) => void;
  onChangeStatus: (id: string, newStatus: string) => Promise<void>;
};

export default function EmployeeTable({
  data,
  loading,
  onEdit,
  onChangeStatus,
}: Props) {
  const columns = [
    { title: "Tên nhân viên", dataIndex: "fullName", key: "fullName" },
    {
      title: "Chi nhánh",
      dataIndex: "clinicId",
      key: "clinicId",
      filters: BRANCHES.map((b) => ({ text: b.label, value: b.value })),
      onFilter: (value, record) => record.clinicId === value,
      render: (v: string) => {
        const branch = BRANCHES.find((b) => b.value === v);
        return branch ? <Tag color={branch.color}>{branch.value}</Tag> : null;
      },
    },
    {
      title: "Chức danh",
      dataIndex: "title",
      key: "title",
      filters: TITLES.map((t) => ({ text: t, value: t })),
      onFilter: (value, record) => record.title === value,
    },
    {
      title: "Trạng thái",
      dataIndex: "employmentStatus",
      key: "employmentStatus",
      filters: EMPLOYMENT_STATUS_OPTIONS.map((s) => ({
        text: s.label,
        value: s.value,
      })),
      onFilter: (value, record) => record.employmentStatus === value,
      render: (v: string) => {
        const status = EMPLOYMENT_STATUS_OPTIONS.find(
          (item) => item.value === v
        );
        return status ? <Tag color={status.color}>{status.label}</Tag> : null;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => formatDateTimeVN(v),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Employee) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <EmployeeStatusSwitcher
            employee={record}
            onStatusChange={onChangeStatus}
          />
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
      pagination={{ pageSize: 10, showSizeChanger: true }}
    />
  );
}
