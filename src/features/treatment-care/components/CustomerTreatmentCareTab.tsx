// src/features/treatment-care/components/CustomerTreatmentCareTab.tsx
"use client";
import { Empty, Space, Tag, Typography, Timeline, Popconfirm } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  useCustomerTreatmentCares,
  useDeleteTreatmentCare,
} from "../hooks/useTreatmentCares";
import { CARE_STATUS_COLOR_MAP } from "../constants";

dayjs.extend(utc);
dayjs.extend(timezone);
const VN_TZ = "Asia/Ho_Chi_Minh";

const { Text } = Typography;

export default function CustomerTreatmentCareTab({
  customerId,
}: {
  customerId: string;
}) {
  const { data, isLoading } = useCustomerTreatmentCares(customerId);
  const deleteMut = useDeleteTreatmentCare();

  // Use shared color map

  if (isLoading) return <Text>Đang tải...</Text>;
  const items = (data || []).map((r) => ({
    color: "blue",
    children: (
      <div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Text strong>
            {dayjs(r.careAt).tz(VN_TZ).format("DD/MM/YYYY HH:mm")}
          </Text>
          <Tag color={CARE_STATUS_COLOR_MAP[r.careStatus] || "blue"}>
            {r.careStatus}
          </Tag>
          {r.careStaff?.fullName && (
            <Text type="secondary">• NV: {r.careStaff.fullName}</Text>
          )}
        </div>
        <div style={{ marginTop: 4 }}>{r.careContent}</div>
        <div style={{ marginTop: 6 }}>
          <Space wrap>
            {r.treatmentServiceNames.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
            {r.treatingDoctorNames.map((s) => (
              <Tag color="blue" key={s}>
                {s}
              </Tag>
            ))}
          </Space>
        </div>
        <div style={{ marginTop: 8 }}>
          <Space size={8}>
            <Popconfirm
              title="Xóa ghi nhận chăm sóc?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => deleteMut.mutateAsync(r.id)}
            >
              <a>Xóa</a>
            </Popconfirm>
          </Space>
        </div>
      </div>
    ),
  }));

  return items.length === 0 ? (
    <Empty description="Chưa có chăm sóc" />
  ) : (
    <Timeline items={items} />
  );
}
