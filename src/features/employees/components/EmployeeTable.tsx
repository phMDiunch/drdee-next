// src/features/employees/components/EmployeeTable.tsx
"use client";
import { Button, Space, Table, Tag } from "antd";
import type { Employee } from "../type";
import { BRANCHES } from "@/constants";
import { EMPLOYMENT_STATUS_OPTIONS, TITLES, ROLE_OPTIONS } from "../constants";
import { formatDateVN } from "@/utils/date"; // Thay đổi nhỏ: chỉ cần ngày
import EmployeeStatusSwitcher from "./EmployeeStatusSwitcher";

type Props = {
  data: Employee[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onEdit: (employee: Employee) => void;
  onChangeStatus: (id: string, newStatus: string) => Promise<void>;
  onPageChange: (page: number, pageSize: number) => void;
};

export default function EmployeeTable({
  data,
  loading,
  total,
  page,
  pageSize,
  onEdit,
  onChangeStatus,
  onPageChange,
}: Props) {
  const columns = [
    { title: "Tên nhân viên", dataIndex: "fullName", key: "fullName" },
    {
      title: "Chi nhánh",
      dataIndex: "clinicId",
      key: "clinicId",
      render: (v: string) => {
        const branch = BRANCHES.find((b) => b.value === v);
        return branch ? <Tag color={branch.color}>{branch.value}</Tag> : "-";
      },
    },
    {
      title: "Chức danh",
      dataIndex: "title",
      key: "title",
      render: (v: string) => {
        const title = TITLES.find((t) => t.value === v);
        return title ? <Tag color={title.color}>{title.label}</Tag> : v;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "employmentStatus",
      key: "employmentStatus",
      render: (v: string) => {
        const status = EMPLOYMENT_STATUS_OPTIONS.find(
          (item) => item.value === v
        );
        return status ? <Tag color={status.color}>{status.label}</Tag> : v;
      },
    },
    {
      title: "vai trò",
      dataIndex: "role",
      key: "role",
      render: (v: string) => {
        const role = ROLE_OPTIONS.find((item) => item.value === v);
        return role ? <Tag color="blue">{role.label}</Tag> : v;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => formatDateVN(v),
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
