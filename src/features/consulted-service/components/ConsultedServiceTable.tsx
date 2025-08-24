// src/features/consulted-service/components/ConsultedServiceTable.tsx
"use client";
import { Table, Button, Space, Tag, Typography, Tooltip } from "antd";
import {
  PlusOutlined,
  CheckOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
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
  isAdmin?: boolean; // ✅ NEW: Admin permission flag
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
  isAdmin = false, // ✅ NEW: Admin permission flag
}: Props) {
  // ✅ UPDATE: Function to check if user can delete a service
  const canDeleteService = (service: ConsultedServiceWithDetails): boolean => {
    // Admin có quyền xóa tất cả dịch vụ, kể cả đã chốt
    if (isAdmin) {
      console.log("🗑️ Admin delete permission:", {
        serviceId: service.id,
        serviceName: service.consultedServiceName,
        serviceStatus: service.serviceStatus,
        canDelete: true,
        reason: "Admin có quyền xóa tất cả dịch vụ",
      });
      return true;
    }

    // Non-admin không được xóa dịch vụ đã chốt
    if (service.serviceStatus === "Đã chốt") {
      console.log("🗑️ Delete permission denied:", {
        serviceId: service.id,
        serviceName: service.consultedServiceName,
        serviceStatus: service.serviceStatus,
        canDelete: false,
        reason: "Dịch vụ đã chốt, chỉ admin mới có quyền xóa",
      });
      return false;
    }

    console.log("🗑️ Delete permission check:", {
      serviceId: service.id,
      serviceName: service.consultedServiceName,
      serviceStatus: service.serviceStatus,
      canDelete: true,
    });

    return true;
  };
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
      title: "Bác sĩ tư vấn",
      key: "consultingDoctor",
      render: (_: unknown, record: ConsultedServiceWithDetails) => (
        <span>{record.consultingDoctor?.fullName || "-"}</span>
      ),
    },
    {
      title: "Sale tư vấn",
      key: "consultingSale",
      render: (_: unknown, record: ConsultedServiceWithDetails) => (
        <span>{record.consultingSale?.fullName || "-"}</span>
      ),
    },
    {
      title: "Bác sĩ điều trị",
      key: "treatingDoctor",
      render: (_: unknown, record: ConsultedServiceWithDetails) => (
        <span>{record.treatingDoctor?.fullName || "-"}</span>
      ),
    },
    {
      title: "Trạng thái dịch vụ",
      dataIndex: "serviceStatus",
      key: "serviceStatus",
      render: (status: string, record: ConsultedServiceWithDetails) => (
        <Tooltip
          title={
            status === "Đã chốt" && record.serviceConfirmDate
              ? `Ngày chốt: ${formatDateTimeVN(record.serviceConfirmDate)}`
              : status === "Đã chốt"
              ? "Đã chốt (chưa có ngày chốt)"
              : "Chưa chốt"
          }
        >
          <Tag color={status === "Đã chốt" ? "green" : "orange"}>{status}</Tag>
        </Tooltip>
      ),
    },
    // {
    //   title: "Trạng thái điều trị",
    //   dataIndex: "treatmentStatus",
    //   key: "treatmentStatus",
    //   render: (status: string) => (
    //     <Tag
    //       color={
    //         status === "Hoàn thành"
    //           ? "green"
    //           : status === "Đang điều trị"
    //           ? "blue"
    //           : "default"
    //       }
    //     >
    //       {status}
    //     </Tag>
    //   ),
    // },
    {
      title: "Ngày tư vấn",
      dataIndex: "consultationDate",
      key: "consultationDate",
      render: (date: string) => formatDateTimeVN(date),
    },
    // ✅ ẨNĐI: Cột ngày chốt (thông tin này sẽ hiển thị trong tooltip của trạng thái)
    // {
    //   title: "Ngày chốt",
    //   dataIndex: "serviceConfirmDate",
    //   key: "serviceConfirmDate",
    //   render: (date: string) => (date ? formatDateTimeVN(date) : "-"),
    // },
    {
      title: "Thao tác",
      key: "action",
      render: (_: unknown, record: ConsultedServiceWithDetails) => (
        <Space size="small">
          {/* Button Xem - chỉ icon */}
          <Tooltip title="Xem">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>

          {/* Button Chốt - giữ nguyên text */}
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

          {/* Button Sửa - chỉ icon */}
          <Tooltip title="Sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>

          {/* Button Xóa - chỉ icon */}
          {canDeleteService(record) && (
            <Tooltip title="Xóa">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record)}
              />
            </Tooltip>
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
