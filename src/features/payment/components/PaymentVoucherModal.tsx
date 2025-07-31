// src/features/payment/components/PaymentVoucherModal.tsx
"use client";
import { Modal, Typography } from "antd";
import PaymentVoucherForm from "./PaymentVoucherForm";
import PaymentVoucherDetail from "./PaymentVoucherDetail";

const { Title } = Typography;

type Props = {
  open: boolean;
  mode: "add" | "view";
  data?: any;
  onCancel: () => void;
  onFinish?: (values: any) => void;
  loading?: boolean;
  availableServices?: any[];
  employees?: any[];
};

export default function PaymentVoucherModal({
  open,
  mode,
  data,
  onCancel,
  onFinish,
  loading = false,
  availableServices = [],
  employees = [],
}: Props) {
  const title = mode === "add" ? "Tạo phiếu thu mới" : "Chi tiết phiếu thu";

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={mode === "view" ? 800 : 1000}
      destroyOnHidden
    >
      {mode === "add" ? (
        <PaymentVoucherForm
          onFinish={onFinish!}
          loading={loading}
          availableServices={availableServices}
          employees={employees}
        />
      ) : (
        <PaymentVoucherDetail voucher={data} />
      )}
    </Modal>
  );
}
