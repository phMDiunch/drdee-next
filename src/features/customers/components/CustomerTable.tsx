// src/features/customers/components/CustomerTable.tsx
import { Table, Tag, Space, Button, Typography } from "antd";
import type { Customer } from "../type";
import { BRANCHES } from "@/constants";
import { formatDateVN } from "@/utils/date";
import Link from "next/link";

type CustomerWithContact = Customer & {
  primaryContact?: {
    customerCode: string;
    fullName: string;
    phone: string;
  } | null;
};

type Props = {
  data: CustomerWithContact[];
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
      title: "Mã khách hàng",
      dataIndex: "customerCode",
      key: "customerCode",
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string, record: Customer) => (
        <Link href={`/customers/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => phone || "-",
    },
    {
      title: "Người liên hệ chính",
      dataIndex: "primaryContact",
      key: "primaryContact",
      render: (
        primaryContact: CustomerWithContact["primaryContact"],
        record: CustomerWithContact
      ) => {
        if (!primaryContact) {
          return <Typography.Text type="secondary">Không có</Typography.Text>;
        }
        return (
          <div>
            <Typography.Text strong>{primaryContact.fullName}</Typography.Text>
            <br />
            <Typography.Text type="secondary">
              ({record.relationshipToPrimary}) - {primaryContact.phone}
            </Typography.Text>
          </div>
        );
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
      render: (v: string) => (v ? formatDateVN(v) : ""),
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
