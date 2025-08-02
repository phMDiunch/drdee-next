// src/features/payment/components/PaymentVoucherModal.tsx
"use client";
import { Modal, Typography } from "antd";
import PaymentVoucherForm from "./PaymentVoucherForm";
import PaymentVoucherDetail from "./PaymentVoucherDetail";

const { Title } = Typography;

interface PaymentVoucherModalProps {
  open: boolean;
  mode: "add" | "view";
  data?: any;
  onCancel: () => void;
  onFinish: (values: any) => void;
  loading?: boolean;
  availableServices?: any[];
  employees?: any[];
  customerId?: string; // ✅ THÊM PROP NÀY
  currentCustomer?: { id: string; fullName: string; phone: string }; // ✅ THÊM CURRENT CUSTOMER
}

export default function PaymentVoucherModal({
  open,
  mode,
  data,
  onCancel,
  onFinish,
  loading = false,
  availableServices = [],
  employees = [],
  customerId, // ✅ THÊM PROP NÀY
  currentCustomer, // ✅ THÊM PROP MỚI
}: PaymentVoucherModalProps) {
  const title = mode === "add" ? "Tạo phiếu thu mới" : "Chi tiết phiếu thu";

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnHidden
    >
      {mode === "view" ? (
        <PaymentVoucherDetail voucher={data} />
      ) : (
        <PaymentVoucherForm
          mode={mode}
          initialData={data}
          onFinish={onFinish}
          onCancel={onCancel}
          loading={loading}
          availableServices={availableServices}
          employees={employees}
          customerId={customerId} // ✅ TRUYỀN PROP NÀY
          currentCustomer={currentCustomer} // ✅ TRUYỀN CURRENT CUSTOMER
        />
      )}
    </Modal>
  );
}
