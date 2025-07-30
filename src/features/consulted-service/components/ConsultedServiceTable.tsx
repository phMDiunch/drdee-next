// src/features/consulted-service/components/ConsultedServiceTable.tsx
"use client";
import { Table, Tag, Button, Space, Typography } from "antd";
import { PlusOutlined, CheckOutlined } from "@ant-design/icons";
import type { ConsultedServiceWithDetails } from "../type";
import { formatDateTimeVN } from "@/utils/date";

const { Title } = Typography;

type Props = {
  data: ConsultedServiceWithDetails[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (service: ConsultedServiceWithDetails) => void;
  onDelete: (service: ConsultedServiceWithDetails) => void;
  onConfirm: (service: ConsultedServiceWithDetails) => void; // Thêm prop này
};

export default function ConsultedServiceTable({
  data,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onConfirm, // Nhận prop này
}: Props) {
  console.log("ConsultedServiceTable data:", data);

  const columns = [
    {
      title: "Tên dịch vụ",
      dataIndex: "consultedServiceName",
      key: "serviceName",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => price?.toLocaleString("vi-VN") + " đ",
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
      render: (price: number) => price?.toLocaleString("vi-VN") + " đ",
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
      render: (_: any, record: ConsultedServiceWithDetails) => (
        <Space>
          {/* Button Chốt - chỉ hiện khi chưa chốt */}
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

          <Button size="small" onClick={() => onEdit(record)}>
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
          Danh sách dịch vụ đã tư vấn
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Thêm dịch vụ tư vấn
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        bordered
        size="small"
        pagination={false}
      />
    </div>
  );
}
