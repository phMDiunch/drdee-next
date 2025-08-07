// src/features/treatment-log/components/TreatmentLogTable.tsx
"use client";
import { Table, Tag, Button, Popconfirm, Space, Typography } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { TreatmentLogWithDetails } from "../type";
import { TREATMENT_STATUS_OPTIONS } from "../constants";
import { formatDateTimeVN } from "@/utils/date";

const { Text } = Typography;

type Props = {
  data: TreatmentLogWithDetails[];
  loading?: boolean;
  onEdit: (record: TreatmentLogWithDetails) => void;
  onDelete: (id: string) => void;
};

export default function TreatmentLogTable({
  data,
  loading = false,
  onEdit,
  onDelete,
}: Props) {
  const columns = [
    {
      title: "Dịch vụ điều trị",
      dataIndex: ["consultedService", "consultedServiceName"],
      key: "serviceName",
      width: 200,
      render: (name: string, record: TreatmentLogWithDetails) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Đơn vị: {record.consultedService.consultedServiceUnit}
          </Text>
        </div>
      ),
    },
    {
      title: "Nội dung điều trị",
      dataIndex: "treatmentNotes",
      key: "treatmentNotes",
      width: 300,
      render: (notes: string) => (
        <Text
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {notes}
        </Text>
      ),
    },
    {
      title: "Bác sĩ điều trị",
      dataIndex: ["dentist", "fullName"],
      key: "dentist",
      width: 150,
    },
    {
      title: "Điều dưỡng 1",
      dataIndex: ["assistant1", "fullName"],
      key: "assistant1",
      width: 130,
      render: (name: string) => name || "-",
    },
    {
      title: "Điều dưỡng 2",
      dataIndex: ["assistant2", "fullName"],
      key: "assistant2",
      width: 130,
      render: (name: string) => name || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "treatmentStatus",
      key: "treatmentStatus",
      width: 140,
      render: (status: string) => {
        const statusConfig = TREATMENT_STATUS_OPTIONS.find(
          (s) => s.value === status
        );
        return (
          <Tag color={statusConfig?.color || "default"}>
            {statusConfig?.label || status}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => formatDateTimeVN(date, "DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      render: (_: unknown, record: TreatmentLogWithDetails) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            title="Sửa"
          />
          <Popconfirm
            title="Xóa lịch sử điều trị"
            description="Bạn có chắc chắn muốn xóa bản ghi này?"
            onConfirm={() => onDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              danger
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={false}
      size="small"
      scroll={{ x: 1000 }}
      locale={{
        emptyText: "Chưa có lịch sử điều trị nào",
      }}
    />
  );
}
