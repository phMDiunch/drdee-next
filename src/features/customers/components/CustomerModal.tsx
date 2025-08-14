// src/features/customers/components/CustomerModal.tsx
import { Modal, Typography } from "antd";
import type { Customer } from "../type";
import CustomerForm from "./CustomerForm";

const { Title } = Typography;

type Props = {
  open: boolean;
  mode: "add" | "edit";
  data?: Record<string, unknown>;
  onCancel: () => void;
  onFinish: (values: Partial<Customer>) => void;
  loading?: boolean;
  customers?: Array<{ id: string; fullName: string; phone?: string | null }>;
};

export default function CustomerModal({
  open,
  mode,
  data,
  onCancel,
  onFinish,
  loading,
  customers,
}: Props) {
  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {mode === "edit" ? "Sửa thông tin khách hàng" : "Thêm khách hàng mới"}
        </Title>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnHidden
    >
      <CustomerForm
        form={undefined}
        initialValues={data || {}}
        onFinish={onFinish}
        loading={loading}
        customers={customers}
      />
    </Modal>
  );
}
