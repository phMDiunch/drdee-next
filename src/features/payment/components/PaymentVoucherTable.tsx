// src/features/payment/components/PaymentVoucherTable.tsx
"use client";
import { Table, Button, Space, Tag, Typography } from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import type { PaymentVoucherWithDetails } from "../type";
import { formatCurrency, formatDateTimeVN } from "@/utils/date";

const { Title } = Typography;

type Props = {
  data: PaymentVoucherWithDetails[];
  loading?: boolean;
  onAdd: () => void;
  onView: (voucher: PaymentVoucherWithDetails) => void;
  hideCustomerColumn?: boolean;
};

export default function PaymentVoucherTable({
  data,
  loading = false,
  onAdd,
  onView,
  hideCustomerColumn = false,
}: Props) {
  const columns = [
    {
      title: "Số phiếu",
      dataIndex: "paymentNumber",
      key: "paymentNumber",
    },
    !hideCustomerColumn && {
      title: "Khách hàng",
      dataIndex: ["customer", "fullName"],
      key: "customerName",
    },
    {
      title: "Ngày thu",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (date: string) => formatDateTimeVN(date),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Thu ngân",
      dataIndex: ["cashier", "fullName"],
      key: "cashierName",
    },
    {
      title: "Số dịch vụ",
      dataIndex: "details",
      key: "detailsCount",
      render: (details: any[]) => (
        <Tag color="blue">{details?.length || 0} dịch vụ</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: PaymentVoucherWithDetails) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ].filter(Boolean);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Danh sách phiếu thu
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Tạo phiếu thu
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        bordered
        size="middle"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
