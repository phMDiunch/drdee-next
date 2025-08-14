// src/features/treatment-care/components/CareDetailDrawer.tsx
"use client";
import { Drawer, Descriptions, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { TreatmentCareRecord } from "../type";

const { Text } = Typography;

export default function CareDetailDrawer({
  open,
  onClose,
  record,
}: {
  open: boolean;
  onClose: () => void;
  record?: TreatmentCareRecord;
}) {
  return (
    <Drawer title="Chi tiết chăm sóc" open={open} onClose={onClose} width={520}>
      {!record ? null : (
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="Khách hàng">
            <Text strong>{record.customer?.fullName}</Text>{" "}
            <Text type="secondary">
              ({record.customer?.customerCode || ""})
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Thời điểm">
            {dayjs(record.careAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {record.careStatus}
          </Descriptions.Item>
          <Descriptions.Item label="Nội dung">
            {record.careContent}
          </Descriptions.Item>
          <Descriptions.Item label="Dịch vụ">
            <Space wrap>
              {record.treatmentServiceNames.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Bác sĩ">
            <Space wrap>
              {record.treatingDoctorNames.map((s) => (
                <Tag color="blue" key={s}>
                  {s}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Drawer>
  );
}
