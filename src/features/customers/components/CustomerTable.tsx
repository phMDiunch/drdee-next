// src/features/customers/components/CustomerTable.tsx
import { Table, Tag, Space, Button } from "antd";
import type { Customer } from "../type";
import { BRANCHES } from "@/constants";
import { formatDateTimeVN } from "@/utils/date";

type Props = {
  data: Customer[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onEdit: (customer: Customer) => void;
  onPageChange: (page: number, pageSize: number) => void;
};

export default function CustomerTable({
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
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
      render: (v: string) => (v ? formatDateTimeVN(v, "DD/MM/YYYY") : ""),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (v: string) => v || "-",
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
      title: "Nguồn khách",
      dataIndex: "source",
      key: "source",
      render: (v: string) => v || "-",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Customer) => (
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
