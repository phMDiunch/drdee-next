// src/features/payment/components/PaymentVoucherModal.tsx
"use client";
import { Modal, Typography } from "antd";
import PaymentVoucherForm from "./PaymentVoucherForm";
import PaymentVoucherDetail from "./PaymentVoucherDetail";

const { Title } = Typography;

type Props = {
  open: boolean;
  mode: "add" | "view" | "edit";
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
  const title =
    mode === "add"
      ? "Tạo phiếu thu mới"
      : mode === "edit"
      ? "Sửa phiếu thu"
      : "Chi tiết phiếu thu";

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={mode === "view" ? 800 : 1000}
      destroyOnClose
    >
      {mode === "view" ? (
        <PaymentVoucherDetail voucher={data} />
      ) : (
        <PaymentVoucherForm
          initialData={mode === "edit" ? data : undefined} // ✅ Pass data for edit
          onFinish={onFinish!}
          loading={loading}
          availableServices={availableServices}
          employees={employees}
        />
      )}
    </Modal>
  );
}
