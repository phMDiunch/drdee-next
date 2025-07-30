// src/features/customers/components/CustomerTable.tsx
"use client";
import { Table, Tag, Button, Typography } from "antd";
import type { Customer } from "../type";
import { formatDateTimeVN, calculateAge } from "@/utils/date";
import { LoginOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Text } = Typography;

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
  onPageChange: (page: number, pageSize: number) => void;
  onCheckIn?: (customer: Customer) => void;
};

export default function CustomerTable({
  data,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onCheckIn,
}: Props) {
  const columns = [
    {
      title: "Mã KH",
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
      key: "primaryContact",
      render: (_: any, record: CustomerWithContact) => {
        if (!record.primaryContact) {
          return <Text type="secondary">Không có</Text>;
        }
        return (
          <div>
            <Text strong>{record.primaryContact.fullName}</Text>
            <br />
            <Text type="secondary">
              ({record.relationshipToPrimary}) - {record.primaryContact.phone}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Tuổi",
      key: "age",
      render: (_: any, record: Customer) => (
        <div>{record.dob ? calculateAge(record.dob) + " tuổi" : "N/A"}</div>
      ),
    },
    {
      title: "Lịch hẹn hôm nay",
      key: "todayAppointment",
      render: (_: any, record: Customer) => {
        if (!record.todayAppointment) {
          return <Text type="secondary">Chưa có lịch</Text>;
        }

        const appt = record.todayAppointment;
        const isCheckedIn = !!appt.checkInTime;

        return (
          <div>
            <div>
              <Tag
                size="small"
                color={
                  isCheckedIn
                    ? "green"
                    : appt.status === "Đã xác nhận"
                    ? "blue"
                    : appt.status === "Chờ xác nhận"
                    ? "orange"
                    : "red"
                }
              >
                {appt.status}
              </Tag>
            </div>
            {isCheckedIn && (
              <div style={{ marginTop: 4 }}>
                <Text type="success" style={{ fontSize: 12 }}>
                  ✅ Check-in: {formatDateTimeVN(appt.checkInTime!, "HH:mm")}
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Nguồn khách",
      dataIndex: "source",
      key: "source",
      render: (source: string) => source || "-",
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right" as const,
      render: (_: any, record: Customer) =>
        onCheckIn ? (
          <Button
            size="small"
            type={record.todayAppointment?.checkInTime ? "default" : "primary"}
            icon={<LoginOutlined />}
            onClick={() => onCheckIn(record)}
            disabled={!!record.todayAppointment?.checkInTime}
          >
            {record.todayAppointment?.checkInTime ? "Đã check-in" : "Check-in"}
          </Button>
        ) : null,
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
