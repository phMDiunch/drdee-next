// src/features/dental-service/components/DentalServiceTable.tsx
import { Table, Button, Space } from "antd";
import type { DentalService } from "../type";

type Props = {
  data: DentalService[];
  loading: boolean;
  onEdit: (record: DentalService) => void;
  onDelete: (record: DentalService) => void;
};

export default function DentalServiceTable({
  data,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const columns = [
    { title: "Tên dịch vụ", dataIndex: "name", key: "name" },
    { title: "Nhóm", dataIndex: "serviceGroup", key: "serviceGroup" },
    { title: "Bộ môn", dataIndex: "department", key: "department" },
    { title: "Đơn vị", dataIndex: "unit", key: "unit" },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (v: number) => v?.toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (v: boolean) => (v ? "Hiện" : "Ẩn"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: DentalService) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Button size="small" danger onClick={() => onDelete(record)}>
            Xoá
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="id"
      loading={loading}
      bordered
      size="middle"
      pagination={{ pageSize: 10, showSizeChanger: true }}
    />
  );
}
