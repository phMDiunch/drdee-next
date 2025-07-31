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
      dataIndex: ["consultedService"],
      key: "serviceName",
      render: (consultedService: any) => {
        // ✅ SỬA: Nhiều fallback options cho tên dịch vụ
        const serviceName =
          consultedService?.consultedServiceName ||
          consultedService?.dentalService?.name ||
          consultedService?.serviceName ||
          "Không xác định";

        return (
          <div>
            <div style={{ fontWeight: 500 }}>{serviceName}</div>
            {consultedService?.dentalService?.name &&
              consultedService?.consultedServiceName !==
                consultedService?.dentalService?.name && (
                <div style={{ fontSize: 12, color: "#666" }}>
                  ({consultedService.dentalService.name})
                </div>
              )}
          </div>
        );
      },
    },
    {
      title: "Giá dịch vụ", // ✅ THÊM: Hiển thị giá gốc
      dataIndex: ["consultedService", "finalPrice"],
      key: "servicePrice",
      render: (price: number) => (
        <Tag color="blue">{formatCurrency(price || 0)}</Tag>
      ),
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
      render: (method: string) => (
        <Tag color="orange">{method || "Tiền mặt"}</Tag>
      ),
    },
  ];

  // ✅ DEBUG: Console log để kiểm tra data structure
  console.log("Voucher details:", voucher?.details);

  return (
    <div>
      <Descriptions title="Thông tin phiếu thu" bordered column={2}>
        <Descriptions.Item label="Số phiếu">
          <Tag color="purple">{voucher.paymentNumber}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày thu">
          {formatDateTimeVN(voucher.paymentDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Khách hàng">
          <strong>{voucher.customer?.fullName}</strong>
          {voucher.customer?.customerCode && (
            <Tag style={{ marginLeft: 8 }}>{voucher.customer.customerCode}</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Thu ngân">
          {voucher.cashier?.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền" span={2}>
          <Tag color="blue" style={{ fontSize: 16, padding: "8px 12px" }}>
            {formatCurrency(voucher.totalAmount)}
          </Tag>
        </Descriptions.Item>
        {voucher.notes && (
          <Descriptions.Item label="Ghi chú" span={2}>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "8px",
                borderRadius: "4px",
                fontStyle: "italic",
              }}
            >
              {voucher.notes}
            </div>
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Chi tiết thanh toán
        </Title>
        <Tag color="blue">{voucher.details?.length || 0} dịch vụ</Tag>
      </div>

      {/* ✅ THÊM: Thông báo nếu không có chi tiết */}
      {!voucher.details || voucher.details.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#999",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
          }}
        >
          Không có chi tiết thanh toán
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={voucher.details}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
          summary={(pageData) => {
            const total = pageData.reduce(
              (sum, record) => sum + (record.amount || 0),
              0
            );
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Tag
                      color="red"
                      style={{ fontSize: 14, padding: "4px 8px" }}
                    >
                      {formatCurrency(total)}
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}></Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      )}
    </div>
  );
}
