// src/features/dental-service/components/DentalServiceModal.tsx
import { Modal } from "antd";
import DentalServiceForm from "./DentalServiceForm";
import type { DentalService } from "../type";

type Props = {
  open: boolean;
  record?: Partial<DentalService> | null;
  onCancel: () => void;
  onFinish: (values: Partial<DentalService>) => void;
  loading?: boolean;
};

export default function DentalServiceModal({
  open,
  record,
  onCancel,
  onFinish,
  loading,
}: Props) {
  return (
    <Modal
      title={record ? "Sửa dịch vụ" : "Thêm dịch vụ"}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      width={700}
    >
      <DentalServiceForm
        initialValues={record || {}}
        onFinish={onFinish}
        loading={loading}
      />
    </Modal>
  );
}
