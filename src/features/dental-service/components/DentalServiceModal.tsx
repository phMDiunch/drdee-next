// src/features/dental-service/components/DentalServiceModal.tsx
"use client";
import { Modal, Typography } from "antd";
import DentalServiceForm from "./DentalServiceForm";
import type { DentalService } from "../type";

const { Title } = Typography;

type Props = {
  open: boolean;
  mode: "add" | "edit";
  data?: Partial<DentalService> | null;
  onCancel: () => void;
  onFinish: (values: Partial<DentalService>) => void;
  loading?: boolean;
  form: any;
};

export default function DentalServiceModal({
  open,
  mode,
  data,
  onCancel,
  onFinish,
  loading,
  form,
}: Props) {
  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {mode === "edit" ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}
        </Title>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      width={800}
    >
      <DentalServiceForm
        form={form}
        initialValues={data || {}}
        onFinish={onFinish}
        loading={loading}
      />
    </Modal>
  );
}
