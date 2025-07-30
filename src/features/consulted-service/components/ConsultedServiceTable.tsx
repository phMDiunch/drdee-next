// src/features/consulted-service/components/ConsultedServiceTable.tsx
"use client";
import { Table, Tag, Button, Space, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ConsultedServiceWithDetails } from "../type";
import { formatDateTimeVN } from "@/utils/date";

const { Title } = Typography;

type Props = {
  data: ConsultedServiceWithDetails[];
  loading: boolean;
  onAdd: () => void; // Hàm xử lý khi nhấn nút Thêm
  onEdit: (service: ConsultedServiceWithDetails) => void; // <-- Thêm prop
  onDelete: (service: ConsultedServiceWithDetails) => void; // <-- Thêm prop
};

export default function ConsultedServiceTable({
  data,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  console.log("ConsultedServiceTable data:", data);

  const columns = [
    // {
    //   title: "Tên dịch vụ",
    //   dataIndex: "dentalService",
    //   key: "serviceName",
    //   render: (dentalService: any) => dentalService?.name || "N/A",
    // },
    {
      title: "Tên dịch vụ",
      dataIndex: "consultedServiceName", // Lấy tên đã được sao chép
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
      title: "Trạng thái",
      dataIndex: "treatmentStatus",
      key: "treatmentStatus",
      render: (status: string) => <Tag>{status}</Tag>,
    },
    {
      title: "Ngày tư vấn",
      dataIndex: "consultationDate",
      key: "consultationDate",
      render: (date: string) => formatDateTimeVN(date),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: ConsultedServiceWithDetails) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Button size="small" danger onClick={() => onDelete(record)}>
            Xóa
          </Button>
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
