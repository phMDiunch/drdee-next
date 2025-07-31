// src/features/customers/hooks/useConsultedService.ts
import { useState } from "react";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore";
import type { ConsultedServiceWithDetails } from "@/features/consulted-service/type";

export function useConsultedService(customer: any, setCustomer: any) {
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Partial<ConsultedServiceWithDetails>;
  }>({ open: false, mode: "add" });

  const [saving, setSaving] = useState(false);
  const { employeeProfile } = useAppStore();

  const handleAddService = () => {
    setModalState({ open: true, mode: "add" });
  };

  const handleEditService = (service: ConsultedServiceWithDetails) => {
    setModalState({ open: true, mode: "edit", data: service });
  };

  const handleFinishService = async (values: any) => {
    setSaving(true);
    try {
      const isEdit = modalState.mode === "edit";
      const url = isEdit
        ? `/api/consulted-services/${modalState.data?.id}`
        : "/api/consulted-services";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...values,
        customerId: customer.id,
        clinicId: employeeProfile?.clinicId,
        createdById: isEdit ? undefined : employeeProfile?.id,
        updatedById: employeeProfile?.id,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        // ✅ Hiển thị error message rõ ràng
        if (error.includes("đã chốt")) {
          throw new Error("Dịch vụ đã chốt không thể chỉnh sửa!");
        }
        throw new Error(
          error || `Lỗi khi ${isEdit ? "cập nhật" : "tạo"} dịch vụ`
        );
      }

      const responseData = await res.json();

      // Update local state
      setCustomer((prev: any) => {
        const updated = { ...prev };
        if (isEdit) {
          updated.consultedServices = prev.consultedServices.map((s: any) =>
            s.id === modalState.data?.id ? responseData : s
          );
        } else {
          updated.consultedServices = [responseData, ...prev.consultedServices];
        }
        return updated;
      });

      // ✅ Refresh customer data
      if (customer) {
        const refreshRes = await fetch(
          `/api/customers/${customer.id}?includeDetails=true`
        );
        if (refreshRes.ok) {
          const refreshedCustomer = await refreshRes.json();
          setCustomer(refreshedCustomer);
        }
      }

      toast.success(`${isEdit ? "Cập nhật" : "Tạo"} dịch vụ thành công!`);
      setModalState({ open: false, mode: "add" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (service: ConsultedServiceWithDetails) => {
    const confirmed = window.confirm(
      `Bạn chắc chắn muốn xóa dịch vụ "${service.consultedServiceName}"?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/consulted-services/${service.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Xóa dịch vụ thất bại");
      }

      setCustomer((prev: any) => ({
        ...prev,
        consultedServices: prev.consultedServices.filter(
          (s: any) => s.id !== service.id
        ),
      }));

      // ✅ Refresh customer data
      if (customer) {
        const refreshRes = await fetch(
          `/api/customers/${customer.id}?includeDetails=true`
        );
        if (refreshRes.ok) {
          const refreshedCustomer = await refreshRes.json();
          setCustomer(refreshedCustomer);
        }
      }

      toast.success("Đã xóa dịch vụ thành công!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleConfirmService = async (service: ConsultedServiceWithDetails) => {
    const confirmed = window.confirm(
      `Bạn chắc chắn muốn chốt dịch vụ "${service.consultedServiceName}"?\n\nSau khi chốt, dịch vụ sẽ chính thức được xác nhận và phát sinh nghiệp vụ tài chính.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/consulted-services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceStatus: "Đã chốt",
          serviceConfirmDate: new Date().toISOString(),
          updatedById: employeeProfile?.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Chốt dịch vụ thất bại");
      }

      const updatedService = await res.json();

      setCustomer((prev: any) => ({
        ...prev,
        consultedServices: prev.consultedServices.map((s: any) =>
          s.id === service.id ? updatedService : s
        ),
      }));

      toast.success("Đã chốt dịch vụ thành công!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    modalState,
    setModalState,
    saving,
    handleAddService,
    handleEditService,
    handleFinishService,
    handleDeleteService,
    handleConfirmService,
  };
}
