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
};

export default function ConsultedServiceTable({ data, loading, onAdd }: Props) {
  const columns = [
    {
      title: "Tên dịch vụ",
      dataIndex: "dentalService",
      key: "serviceName",
      render: (dentalService: any) => dentalService?.name || "N/A",
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
          <Button size="small">Sửa</Button>
          <Button size="small" danger>
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
