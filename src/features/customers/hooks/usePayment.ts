// src/features/customers/hooks/usePayment.ts
import { useState } from "react";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore";
import type { Customer } from "../type";

export const usePayment = (
  customer: Customer | null,
  setCustomer: (customer: Customer) => void
) => {
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    mode: "add" | "view";
    data?: any;
  }>({ open: false, mode: "add" });

  const [saving, setSaving] = useState(false);
  const { employeeProfile } = useAppStore();

  const handleAddPayment = () => {
    setPaymentModal({
      open: true,
      mode: "add",
      data: { customerId: customer?.id },
    });
  };

  const handleViewPayment = (voucher: any) => {
    setPaymentModal({
      open: true,
      mode: "view",
      data: voucher,
    });
  };

  const handleFinishPayment = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        customerId: customer?.id,
        createdById: employeeProfile?.id,
        updatedById: employeeProfile?.id,
      };

      const res = await fetch("/api/payment-vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Tạo phiếu thu thành công!");
        setPaymentModal({ open: false, mode: "add" });

        // Refresh customer data
        if (customer) {
          const refreshRes = await fetch(`/api/customers/${customer.id}`);
          if (refreshRes.ok) {
            const refreshedCustomer = await refreshRes.json();
            setCustomer(refreshedCustomer);
          }
        }
      } else {
        const { error } = await res.json();
        toast.error(error || "Tạo phiếu thu thất bại");
      }
    } catch (error: any) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return {
    paymentModal,
    setPaymentModal,
    saving,
    handleAddPayment,
    handleViewPayment,
    handleFinishPayment,
  };
};
