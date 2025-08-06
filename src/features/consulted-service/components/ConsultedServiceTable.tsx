// src/features/consulted-service/components/ConsultedServiceTable.tsx
"use client";
import { Table, Button, Space, Tag, Typography, Tooltip } from "antd";
import { PlusOutlined, CheckOutlined, EyeOutlined } from "@ant-design/icons";
import type { ConsultedServiceWithDetails } from "../type";
import { formatCurrency, formatDateTimeVN } from "@/utils/date"; // ✅ SỬA: Đường dẫn đúng

const { Title } = Typography;

type Props = {
  data: ConsultedServiceWithDetails[];
  loading?: boolean;
  onAdd: () => void;
  onEdit: (service: ConsultedServiceWithDetails) => void;
  onDelete: (service: ConsultedServiceWithDetails) => void;
  onConfirm: (service: ConsultedServiceWithDetails) => void;
  onView: (service: ConsultedServiceWithDetails) => void; // ✅ NEW: View action
  disableAdd?: boolean;
  showCustomerColumn?: boolean; // ✅ NEW: Option to show customer info
  hideAddButton?: boolean; // ✅ NEW: Option to completely hide add button
  title?: string; // ✅ NEW: Custom title
};

export default function ConsultedServiceTable({
  data,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onConfirm,
  onView, // ✅ NEW: View handler
  disableAdd = false,
  showCustomerColumn = false,
  hideAddButton = false,
  title = "Danh sách dịch vụ đã tư vấn",
}: Props) {
  const columns = [
    // ✅ Customer column (conditional)
    ...(showCustomerColumn
      ? [
          {
            title: "Khách hàng",
            key: "customer",
            render: (_: unknown, record: ConsultedServiceWithDetails) => (
              <div>
                <div style={{ fontWeight: 500 }}>
                  {record.customer?.fullName || "N/A"}
                </div>
                <div style={{ marginTop: 4 }}>
                  <Tag
                    color="blue"
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      padding: "2px 8px",
                    }}
                  >
                    {record.customer?.customerCode}
                  </Tag>
                </div>
              </div>
            ),
            width: 200,
          },
        ]
      : []),
    {
      title: "Tên dịch vụ",
      dataIndex: "consultedServiceName",
      key: "serviceName",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => formatCurrency(price), // ✅ SỬA: Dùng formatCurrency
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Thành tiền",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (price: number) => formatCurrency(price), // ✅ SỬA: Dùng formatCurrency
    },
    {
      title: "Trạng thái dịch vụ",
      dataIndex: "serviceStatus",
      key: "serviceStatus",
      render: (status: string) => (
        <Tag color={status === "Đã chốt" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Trạng thái điều trị",
      dataIndex: "treatmentStatus",
      key: "treatmentStatus",
      render: (status: string) => (
        <Tag
          color={
            status === "Hoàn thành"
              ? "green"
              : status === "Đang điều trị"
              ? "blue"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Ngày tư vấn",
      dataIndex: "consultationDate",
      key: "consultationDate",
      render: (date: string) => formatDateTimeVN(date),
    },
    {
      title: "Ngày chốt",
      dataIndex: "serviceConfirmDate",
      key: "serviceConfirmDate",
      render: (date: string) => (date ? formatDateTimeVN(date) : "-"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: unknown, record: ConsultedServiceWithDetails) => (
        <Space>
          {/* Button Xem */}
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          >
            Xem
          </Button>

          {/* Button Chốt */}
          {record.serviceStatus !== "Đã chốt" && (
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => onConfirm(record)}
            >
              Chốt
            </Button>
          )}

          {/* ✅ SỬA: Disable edit nếu đã chốt */}
          <Button
            size="small"
            onClick={() => onEdit(record)}
            disabled={record.serviceStatus === "Đã chốt"}
          >
            Sửa
          </Button>

          {/* Button Xóa - chỉ hiện khi chưa chốt */}
          {record.serviceStatus !== "Đã chốt" && (
            <Button size="small" danger onClick={() => onDelete(record)}>
              Xóa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
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

        {/* ✅ Conditional Add Button */}
        {!hideAddButton && (
          <Tooltip
            title={
              disableAdd ? "Cần check-in trước khi tạo dịch vụ tư vấn" : ""
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onAdd}
              disabled={disableAdd}
            >
              Thêm dịch vụ tư vấn
            </Button>
          </Tooltip>
        )}
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
