// src/features/payment/components/PaymentVoucherDetail.tsx
"use client";
import { Descriptions, Table, Typography, Tag, Divider } from "antd";
import { formatCurrency, formatDateTimeVN } from "@/utils/date";

const { Title } = Typography;

type Props = {
  voucher: any;
};

export default function PaymentVoucherDetail({ voucher }: Props) {
  const columns = [
    {
      title: "Dịch vụ",
      dataIndex: ["consultedService", "consultedServiceName"],
      key: "serviceName",
    },
    {
      title: "Số tiền thu",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Tag color="green">{formatCurrency(amount)}</Tag>
      ),
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => <Tag>{method}</Tag>,
    },
  ];

  return (
    <div>
      <Descriptions title="Thông tin phiếu thu" bordered column={2}>
        <Descriptions.Item label="Số phiếu">
          {voucher.paymentNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày thu">
          {formatDateTimeVN(voucher.paymentDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Khách hàng">
          {voucher.customer?.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Thu ngân">
          {voucher.cashier?.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền" span={2}>
          <Tag color="blue" style={{ fontSize: 16, padding: "4px 8px" }}>
            {formatCurrency(voucher.totalAmount)}
          </Tag>
        </Descriptions.Item>
        {voucher.notes && (
          <Descriptions.Item label="Ghi chú" span={2}>
            {voucher.notes}
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider />

      <Title level={5}>Chi tiết thanh toán</Title>
      <Table
        columns={columns}
        dataSource={voucher.details || []}
        rowKey="id"
        pagination={false}
        size="small"
        bordered
      />
    </div>
  );
}
