// src/features/payment/components/PaymentVoucherTable.tsx
"use client";
import { Table, Button, Space, Tag, Typography } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import type { PaymentVoucherWithDetails } from "../type";
import { formatCurrency, formatDateTimeVN } from "@/utils/date";
import { useAppStore } from "@/stores/useAppStore";
import PrintModal from "./PrintModal";

const { Title } = Typography;

type Props = {
  data: PaymentVoucherWithDetails[];
  loading?: boolean;
  total?: number; // ✅ THÊM
  page?: number; // ✅ THÊM
  pageSize?: number; // ✅ THÊM
  onAdd: () => void;
  onView: (voucher: PaymentVoucherWithDetails) => void;
  onDelete: (voucher: any) => void;
  onPageChange?: (page: number, pageSize: number) => void; // ✅ THÊM
  showHeader?: boolean; // ✅ THÊM
  title?: string; // ✅ THÊM
  hideCustomerColumn?: boolean;
};

export default function PaymentVoucherTable({
  data,
  loading = false,
  total,
  page,
  pageSize,
  onAdd,
  onView,
  onDelete,
  onPageChange,
  showHeader = false,
  title = "Danh sách phiếu thu",
  hideCustomerColumn = false,
}: Props) {
  const { employeeProfile } = useAppStore();

  // Print modal state
  const [printModal, setPrintModal] = useState({
    open: false,
    voucher: null as PaymentVoucherWithDetails | null,
  });

  const handlePrint = (voucher: PaymentVoucherWithDetails) => {
    setPrintModal({
      open: true,
      voucher: voucher,
    });
  };

  // ✅ THÊM: Render expandable row content
  const expandedRowRender = (record: PaymentVoucherWithDetails) => {
    const detailColumns = [
      {
        title: "Dịch vụ",
        dataIndex: ["consultedService"],
        key: "serviceName",
        render: (consultedService: any) => {
          const serviceName =
            consultedService?.consultedServiceName ||
            consultedService?.dentalService?.name ||
            "Không xác định";
          return serviceName;
        },
      },
      {
        title: "Giá dịch vụ",
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

    return (
      <div style={{ padding: "0 16px 16px" }}>
        <Typography.Title level={5} style={{ marginBottom: 12 }}>
          Chi tiết thanh toán ({record.details?.length || 0} dịch vụ)
        </Typography.Title>

        {record.details && record.details.length > 0 ? (
          <Table
            columns={detailColumns}
            dataSource={record.details}
            rowKey="id"
            pagination={false}
            size="small"
            bordered={false}
            showHeader={true}
          />
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#999",
              fontStyle: "italic",
            }}
          >
            Không có chi tiết thanh toán
          </div>
        )}

        {record.notes && (
          <div
            style={{
              marginTop: 12,
              padding: 8,
              backgroundColor: "#f5f5f5",
              borderRadius: 4,
            }}
          >
            <Typography.Text type="secondary">
              <strong>Ghi chú:</strong> {record.notes}
            </Typography.Text>
          </div>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: "Số phiếu",
      dataIndex: "paymentNumber",
      key: "paymentNumber",
      render: (text: string) => (
        <Typography.Text strong style={{ color: "#1890ff" }}>
          {text}
        </Typography.Text>
      ),
    },
    ...(hideCustomerColumn
      ? []
      : [
          {
            title: "Khách hàng",
            dataIndex: ["customer", "fullName"],
            key: "customerName",
            render: (text: string, record: PaymentVoucherWithDetails) => (
              <div>
                <div>{text}</div>
                {record.customer?.customerCode && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {record.customer.customerCode}
                  </Typography.Text>
                )}
              </div>
            ),
          },
        ]),
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
      render: (amount: number) => (
        <Tag color="red" style={{ fontSize: 13, fontWeight: "bold" }}>
          {formatCurrency(amount)}
        </Tag>
      ),
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
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record)}
            title="In phiếu thu"
          >
            In
          </Button>

          {employeeProfile?.role === "admin" && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
            >
              Xóa
            </Button>
          )}
        </Space>
      ),
    },
  ].filter(Boolean);

  return (
    <div>
      {/* ✅ THÊM: Conditional header */}
      {showHeader && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            {title}
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            Tạo phiếu thu
          </Button>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        bordered
        size="middle"
        pagination={
          onPageChange
            ? {
                current: page,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} phiếu thu`,
                onChange: onPageChange,
              }
            : { pageSize: 10 }
        }
        expandable={{
          expandedRowRender,
          rowExpandable: (record) =>
            Boolean(record.details && record.details.length > 0),
          expandRowByClick: false,
          expandIcon: ({ expanded, onExpand, record }) =>
            record.details && record.details.length > 0 ? (
              <Button
                type="link"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(record, e);
                }}
                style={{ padding: 0 }}
              >
                {expanded ? "▼" : "▶"} Chi tiết
              </Button>
            ) : null,
        }}
      />

      {/* Print Modal */}
      <PrintModal
        open={printModal.open}
        voucher={printModal.voucher}
        onCancel={() => setPrintModal({ open: false, voucher: null })}
      />
    </div>
  );
}
