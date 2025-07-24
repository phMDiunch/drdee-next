// src/features/appointments/components/AppointmentModal.tsx
import { Modal, Typography } from "antd";
import type { Appointment } from "../type";
import AppointmentForm from "./AppointmentForm";

const { Title } = Typography;

type Props = {
  open: boolean;
  mode: "add" | "edit";
  data?: Partial<Appointment>;
  onCancel: () => void;
  onFinish: (values: Partial<Appointment>) => void;
  loading?: boolean;
  customers?: any[];
  employees?: any[];
};

export default function AppointmentModal({
  open,
  mode,
  data,
  onCancel,
  onFinish,
  loading,
  customers = [],
  employees = [],
}: Props) {
  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {mode === "edit" ? "Sửa lịch hẹn" : "Thêm lịch hẹn mới"}
        </Title>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      destroyOnHidden
    >
      <AppointmentForm
        form={undefined}
        initialValues={data || {}}
        onFinish={onFinish}
        loading={loading}
        mode={mode}
        customers={customers}
        employees={employees}
      />
    </Modal>
  );
}
