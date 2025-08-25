// src/features/customers/hooks/useConsultedService.ts
import { useState } from "react";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore";
import type { ConsultedServiceWithDetails } from "@/features/consulted-service/type";
import { nowVN } from "@/utils/date";
import { useAuthHeaders } from "@/lib/authHeaders"; // ✅ NEW: Import auth headers

export function useConsultedService(customer: any, setCustomer: any) {
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "add" | "edit" | "view"; // ✅ ADD: Support view mode
    data?: Partial<ConsultedServiceWithDetails>;
  }>({ open: false, mode: "add" });

  const [saving, setSaving] = useState(false);
  const { employeeProfile } = useAppStore();

  // ✅ NEW: Get auth headers for API calls
  const authHeaders = useAuthHeaders();

  const handleAddService = () => {
    setModalState({ open: true, mode: "add" });
  };

  const handleEditService = (service: ConsultedServiceWithDetails) => {
    setModalState({ open: true, mode: "edit", data: service });
  };

  // ✅ NEW: Handle View Service
  const handleViewService = (service: ConsultedServiceWithDetails) => {
    setModalState({ open: true, mode: "view", data: service });
  };

  const handleFinishService = async (values: any) => {
    setSaving(true);
    try {
      const isEdit = modalState.mode === "edit";
      const url = isEdit
        ? `/api/consulted-services/${modalState.data?.id}`
        : "/api/consulted-services";
      const method = isEdit ? "PUT" : "POST";

      let payload = {
        ...values,
        customerId: customer.id,
        clinicId: employeeProfile?.clinicId,
        createdById: isEdit ? undefined : employeeProfile?.id,
        updatedById: employeeProfile?.id,
      };

      // ✅ FIX: Chỉ gửi employee fields nếu service đã chốt
      if (isEdit && modalState.data?.serviceStatus === "Đã chốt") {
        const employeeFields = [
          "consultingDoctorId",
          "treatingDoctorId",
          "consultingSaleId",
        ];
        const filteredPayload: any = {
          updatedById: employeeProfile?.id,
        };

        // Chỉ thêm employee fields nếu chúng có trong values
        employeeFields.forEach((field) => {
          if (field in values) {
            filteredPayload[field] = values[field];
          }
        });

        payload = filteredPayload;

        console.log("🔒 Service đã chốt - chỉ gửi employee fields:", {
          originalValues: values,
          filteredPayload: payload,
        });
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        // ✅ Hiển thị error message rõ ràng
        if (error.includes("đã chốt")) {
          throw new Error(error);
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
    const isAdmin = employeeProfile?.role === "admin";

    // Tạo thông báo xác nhận phù hợp
    let confirmMessage = `Bạn chắc chắn muốn xóa dịch vụ "${service.consultedServiceName}"?`;

    if (service.serviceStatus === "Đã chốt") {
      if (!isAdmin) {
        toast.error(
          "Không thể xóa dịch vụ đã chốt! Chỉ admin mới có quyền này."
        );
        return;
      }
      confirmMessage = `⚠️ ADMIN: ${confirmMessage}\n\nLưu ý: Đây là dịch vụ đã chốt, việc xóa có thể ảnh hưởng đến dữ liệu nghiệp vụ!`;
    }

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/consulted-services/${service.id}`, {
        method: "DELETE",
        headers: {
          ...authHeaders, // ✅ ADD: Include auth headers
        },
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Xóa dịch vụ thất bại");
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
          serviceConfirmDate: nowVN(),
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
    handleViewService, // ✅ NEW: Export view handler
    handleFinishService,
    handleDeleteService,
    handleConfirmService,
  };
}
