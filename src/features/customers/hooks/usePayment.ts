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
    mode: "add" | "view" | "edit";
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

  // Hàm mở modal ở chế độ sửa
  const handleEditPayment = (voucher: any) => {
    setPaymentModal({ open: true, mode: "edit", data: voucher });
  };

  // Hàm xử lý xóa phiếu thu
  const handleDeletePayment = async (voucher: any) => {
    if (
      !window.confirm(
        `Bạn chắc chắn muốn XÓA phiếu thu ${voucher.paymentNumber}? Hành động này sẽ cập nhật lại công nợ của khách hàng.`
      )
    ) {
      return;
    }
    try {
      // Giả định API endpoint là /api/payment-vouchers/[id]
      const res = await fetch(`/api/payment-vouchers/${voucher.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Xóa phiếu thu thất bại");
      }
      toast.success("Đã xóa phiếu thu thành công!");
      if (customer) {
        const refreshRes = await fetch(`/api/customers/detail/${customer.id}`);
        if (refreshRes.ok) setCustomer(await refreshRes.json());
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Cập nhật hàm onFinish để xử lý cả Sửa và Thêm mới
  const handleFinishPayment = async (values: any) => {
    setSaving(true);
    try {
      const isEdit = paymentModal.mode === "edit";
      const url = isEdit
        ? `/api/payment-vouchers/${paymentModal.data?.id}`
        : "/api/payment-vouchers";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...values,
        customerId: customer?.id,
        // createdById chỉ cần khi tạo mới
        createdById: isEdit ? undefined : employeeProfile?.id,
        updatedById: employeeProfile?.id,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          isEdit
            ? "Cập nhật phiếu thu thành công!"
            : "Tạo phiếu thu thành công!"
        );
        setPaymentModal({ open: false, mode: "add" });

        // Làm mới lại dữ liệu khách hàng
        if (customer) {
          const refreshRes = await fetch(
            `/api/customers/detail/${customer.id}`
          );
          if (refreshRes.ok) {
            const refreshedCustomer = await refreshRes.json();
            setCustomer(refreshedCustomer);
          }
        }
      } else {
        const { error } = await res.json();
        toast.error(error || "Thao tác thất bại");
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
    handleEditPayment,
    handleDeletePayment,
    handleFinishPayment,
  };
};
