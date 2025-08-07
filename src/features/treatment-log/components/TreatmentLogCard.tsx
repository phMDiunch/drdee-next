// src/features/treatment-log/components/TreatmentLogCard.tsx
"use client";
import { Card, Button, Typography, Empty } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { AppointmentForTreatment, TreatmentLogWithDetails } from "../type";
import { formatDateTimeVN } from "@/utils/date";
import TreatmentLogTable from "./TreatmentLogTable";

const { Title } = Typography;

type Props = {
  appointment: AppointmentForTreatment;
  onAddTreatment: (appointmentId: string) => void;
  onEditTreatment: (treatmentLog: TreatmentLogWithDetails) => void;
  onDeleteTreatment: (treatmentLogId: string) => void;
  loading?: boolean;
};

export default function TreatmentLogCard({
  appointment,
  onAddTreatment,
  onEditTreatment,
  onDeleteTreatment,
  loading = false,
}: Props) {
  const appointmentDate = formatDateTimeVN(
    appointment.appointmentDateTime,
    "DD/MM/YYYY"
  );

  return (
    <Card
      style={{ marginBottom: 16 }}
      loading={loading}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Ngày điều trị: {appointmentDate}
            </Title>
          </div>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => onAddTreatment(appointment.id)}
          >
            Thêm điều trị
          </Button>
        </div>
      }
    >
      {appointment.treatmentLogs && appointment.treatmentLogs.length > 0 ? (
        <TreatmentLogTable
          data={appointment.treatmentLogs}
          onEdit={onEditTreatment}
          onDelete={onDeleteTreatment}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có lịch sử điều trị nào"
          style={{ margin: "20px 0" }}
        />
      )}
    </Card>
  );
}
