// src/features/treatment-log/components/TreatmentLogTable.tsx
"use client";
import {
  Table,
  Tag,
  Button,
  Popconfirm,
  Space,
  Typography,
  Tooltip,
} from "antd";
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
      // Slightly narrower and ellipsis to avoid horizontal scroll
      width: 160,
      ellipsis: true as const,
      render: (name: string, record: TreatmentLogWithDetails) => (
        <div>
          <Text
            strong
            style={{
              display: "inline-block",
              maxWidth: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={name}
          >
            {name}
          </Text>
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
      // Let table handle truncation similar to by-service view
      ellipsis: true as const,
      render: (notes: string, record: TreatmentLogWithDetails) => (
        <Tooltip
          overlayStyle={{ maxWidth: 600 }}
          title={
            <div style={{ whiteSpace: "pre-wrap" }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Nội dung điều trị
              </div>
              <div style={{ marginBottom: 8 }}>{notes || "-"}</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Nội dung điều trị kế tiếp
              </div>
              <div>{record.nextStepNotes || "-"}</div>
            </div>
          }
        >
          <Text title={notes}>{notes}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Bác sĩ điều trị",
      dataIndex: ["dentist", "fullName"],
      key: "dentist",
      width: 140,
    },
    {
      title: "Điều dưỡng 1",
      dataIndex: ["assistant1", "fullName"],
      key: "assistant1",
      width: 120,
      render: (name: string) => name || "-",
    },
    {
      title: "Điều dưỡng 2",
      dataIndex: ["assistant2", "fullName"],
      key: "assistant2",
      width: 120,
      render: (name: string) => name || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "treatmentStatus",
      key: "treatmentStatus",
      width: 120,
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
      width: 90,
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
      locale={{
        emptyText: "Chưa có lịch sử điều trị nào",
      }}
    />
  );
}
