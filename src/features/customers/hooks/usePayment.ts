// src/features/customers/hooks/usePayment.ts
import { useState } from "react";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore";
import type { Customer } from "../type";
import { nowVN } from "@/utils/date";

export const usePayment = (
  customer: Customer | null,
  setCustomer: (customer: Customer) => void
) => {
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    mode: "add" | "view"; // ✅ BỎ "edit" mode
    data?: any;
  }>({ open: false, mode: "add" });

  const [saving, setSaving] = useState(false);
  const { employeeProfile } = useAppStore();

  const handleAddPayment = () => {
    setPaymentModal({ open: true, mode: "add" });
  };

  const handleViewPayment = (voucher: any) => {
    // Enrich voucher data
    const enrichedVoucher = {
      ...voucher,
      customer: voucher.customer || {
        id: customer?.id,
        fullName: customer?.fullName,
        customerCode: customer?.customerCode,
      },
    };

    setPaymentModal({
      open: true,
      mode: "view",
      data: enrichedVoucher,
    });
  };

  const handleDeletePayment = async (voucher: any) => {
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
      const res = await fetch(`/api/payment-vouchers/${voucher.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Xóa phiếu thu thành công!");

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

  const handleFinishPayment = async (values: any) => {
    setSaving(true);
    try {
      const processedValues = {
        ...values,
        customerId: customer?.id, // ✅ ĐẢM BẢO customerId được set
        paymentDate: values.paymentDate
          ? values.paymentDate.toISOString()
          : nowVN(), // ✅ SỬA: Handle undefined paymentDate
        createdById: employeeProfile?.id,
        updatedById: employeeProfile?.id, // ✅ THÊM updatedById
        cashierId: employeeProfile?.id, // ✅ ĐẢM BẢO cashierId được set từ employeeProfile
      };

      // ✅ DEBUG: Log data being sent to API
      console.log("usePayment - handleFinishPayment:", {
        processedValues,
        customer: customer?.id,
        employeeProfile: employeeProfile?.id,
      });

      const res = await fetch("/api/payment-vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedValues),
      });

      // ✅ DEBUG: Log response
      console.log("API Response:", { status: res.status, ok: res.ok });

      if (res.ok) {
        toast.success("Tạo phiếu thu thành công!");
        setPaymentModal({ open: false, mode: "add" });

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
        console.error("API Error:", error); // ✅ DEBUG: Log API error
        toast.error(error || "Tạo phiếu thu thất bại");
      }
    } catch (error: any) {
      console.error("usePayment error:", error); // ✅ DEBUG: Log catch error
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
    handleDeletePayment,
    handleFinishPayment,
  };
};
