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
    mode: "add" | "view" | "edit"; // ✅ Thêm mode edit
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

  const handleEditPayment = (voucher: any) => {
    setPaymentModal({
      open: true,
      mode: "edit",
      data: voucher,
    });
  };

  // Hàm xử lý xóa phiếu thu
  const handleDeletePayment = async (voucher: any) => {
    // ✅ Kiểm tra quyền Admin
    if (employeeProfile?.role !== "admin") {
      toast.error("Chỉ Admin mới có quyền xóa phiếu thu!");
      return;
    }

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

      if (res.ok) {
        toast.success("Xóa phiếu thu thành công!");

        // ✅ SỬA: Refresh với includeDetails=true
        if (customer) {
          const refreshRes = await fetch(
            `/api/customers/${customer.id}?includeDetails=true`
          );
          if (refreshRes.ok) {
            const refreshedCustomer = await refreshRes.json();
            setCustomer(refreshedCustomer);
          }
        }
      } else {
        const { error } = await res.json();
        toast.error(error || "Xóa phiếu thu thất bại");
      }
    } catch (error: any) {
      toast.error("Có lỗi xảy ra khi xóa phiếu thu");
    }
  };

  // Cập nhật hàm onFinish để xử lý cả Sửa và Thêm mới
  const handleFinishPayment = async (values: any) => {
    // ✅ Kiểm tra quyền Edit cho mode edit
    if (paymentModal.mode === "edit" && employeeProfile?.role !== "admin") {
      toast.error("Chỉ Admin mới có quyền sửa phiếu thu!");
      return;
    }

    setSaving(true);
    try {
      const isEdit = paymentModal.mode === "edit";
      const payload = {
        ...values,
        customerId: customer?.id,
        clinicId: customer?.clinicId || employeeProfile?.clinicId, // ✅ THÊM clinicId
        createdById: employeeProfile?.id,
        updatedById: employeeProfile?.id,
      };

      const url = isEdit
        ? `/api/payment-vouchers/${paymentModal.data.id}`
        : "/api/payment-vouchers";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`${isEdit ? "Cập nhật" : "Tạo"} phiếu thu thành công!`);
        setPaymentModal({ open: false, mode: "add" });

        // ✅ SỬA: Refresh với includeDetails=true
        if (customer) {
          const refreshRes = await fetch(
            `/api/customers/${customer.id}?includeDetails=true`
          );
          if (refreshRes.ok) {
            const refreshedCustomer = await refreshRes.json();
            setCustomer(refreshedCustomer);
          }
        }
      } else {
        const { error } = await res.json();
        toast.error(
          error || `${isEdit ? "Cập nhật" : "Tạo"} phiếu thu thất bại`
        );
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
    handleEditPayment, // ✅ Export handler mới
    handleDeletePayment, // ✅ Export handler mới
    handleFinishPayment,
  };
};
