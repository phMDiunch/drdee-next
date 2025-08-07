// src/features/treatment-log/components/TreatmentLogServiceCard.tsx
"use client";
import {
  Card,
  Typography,
  Badge,
  Table,
  Button,
  Popconfirm,
  Space,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { formatDateTimeVN } from "@/utils/date";
import type { TreatmentLogWithDetails } from "../type";

const { Text } = Typography;

type ServiceGroup = {
  consultedServiceId: string;
  consultedServiceName: string;
  consultedServiceUnit: string;
  treatingDoctorName: string;
  serviceStatus: "Chưa bắt đầu" | "Đang điều trị" | "Hoàn thành";
  treatmentLogs: TreatmentLogWithDetails[];
};

type Props = {
  serviceGroup: ServiceGroup;
  onEditTreatment: (log: TreatmentLogWithDetails) => void;
  onDeleteTreatment: (logId: string) => void;
};

const getStatusColor = (
  status: string
): "default" | "processing" | "success" => {
  switch (status) {
    case "Chưa bắt đầu":
      return "default";
    case "Đang điều trị":
      return "processing";
    case "Hoàn thành":
      return "success";
    default:
      return "default";
  }
};

export default function TreatmentLogServiceCard({
  serviceGroup,
  onEditTreatment,
  onDeleteTreatment,
}: Props) {
  const columns = [
    {
      title: "Ngày điều trị",
      dataIndex: "treatmentDate",
      key: "treatmentDate",
      render: (date: Date) => formatDateTimeVN(date, "DD/MM/YYYY"),
      width: 120,
    },
    {
      title: "Bác sĩ",
      dataIndex: "dentist",
      key: "dentist",
      render: (dentist: { fullName: string }) => dentist?.fullName || "N/A",
      width: 150,
    },
    {
      title: "Điều dưỡng 1",
      dataIndex: "assistant1",
      key: "assistant1",
      render: (assistant: { fullName: string } | null) =>
        assistant?.fullName || "-",
      width: 120,
    },
    {
      title: "Điều dưỡng 2",
      dataIndex: "assistant2",
      key: "assistant2",
      render: (assistant: { fullName: string } | null) =>
        assistant?.fullName || "-",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "treatmentStatus",
      key: "treatmentStatus",
      render: (status: string) => (
        <Badge status={getStatusColor(status)} text={status} />
      ),
      width: 140,
    },
    {
      title: "Ghi chú điều trị",
      dataIndex: "treatmentNotes",
      key: "treatmentNotes",
      ellipsis: true,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: unknown, record: TreatmentLogWithDetails) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEditTreatment(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xóa bản ghi điều trị?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => onDeleteTreatment(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              title="Xóa"
              danger
            />
          </Popconfirm>
        </Space>
      ),
      width: 100,
    },
  ];

  return (
    <Card
      style={{ marginBottom: 16 }}
      title={
        <Space>
          <MedicineBoxOutlined />
          <Text strong>{serviceGroup.consultedServiceName}</Text>
          <Text type="secondary">({serviceGroup.consultedServiceUnit})</Text>
          <Text type="secondary">- Bs. {serviceGroup.treatingDoctorName}</Text>
          <Badge
            status={getStatusColor(serviceGroup.serviceStatus)}
            text={serviceGroup.serviceStatus}
          />
        </Space>
      }
      size="small"
    >
      <Table
        columns={columns}
        dataSource={serviceGroup.treatmentLogs}
        rowKey="id"
        pagination={false}
        size="small"
        bordered
      />
    </Card>
  );
}
