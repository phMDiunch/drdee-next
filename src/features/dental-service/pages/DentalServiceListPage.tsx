// src/features/dental-service/pages/DentalServiceListPage.tsx
"use client";
import { useState } from "react";
import { Button, Modal as AntdModal, Form } from "antd";
import type { DentalService } from "../type";
import DentalServiceTable from "../components/DentalServiceTable";
import DentalServiceModal from "../components/DentalServiceModal";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore"; // <--- Dùng store chung

type ModalState = {
  open: boolean;
  mode: "add" | "edit";
  data?: Partial<DentalService> | null;
};

export default function DentalServiceListPage() {
  // Lấy state và action từ Zustand
  const services = useAppStore((state) => state.dentalServices);
  const fetchDentalServices = useAppStore((state) => state.fetchDentalServices);
  const isLoadingDentalServices = useAppStore(
    (state) => state.isLoadingDentalServices
  );
  const employeeProfile = useAppStore((state) => state.employeeProfile);

  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: "add",
    data: null,
  });
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // ✅ REMOVE useEffect - data is auto-loaded on login
  // Services are already loaded via AuthContext, no need to fetch again

  const handleSave = async (values: Partial<DentalService>) => {
    if (!employeeProfile) {
      toast.error("Không tìm thấy thông tin nhân viên!");
      return;
    }
    setSaving(true);
    try {
      const processedValues = {
        ...values,
        price: Number(values.price),
        isActive: values.isActive ?? true,
        createdById: employeeProfile.id, // Sẽ được ghi đè ở backend nếu là edit
        updatedById: employeeProfile.id,
      };

      const url =
        modal.mode === "edit"
          ? `/api/dental-services/${modal.data?.id}`
          : "/api/dental-services";
      const method = modal.mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedValues),
      });

      if (res.ok) {
        toast.success(
          modal.mode === "edit"
            ? "Cập nhật thành công!"
            : "Thêm dịch vụ thành công!"
        );
        setModal({ ...modal, open: false });
        await fetchDentalServices(true); // <--- Tải lại dữ liệu vào store
      } else {
        const { error } = await res.json();
        toast.error(error || "Lỗi không xác định");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    }
    setSaving(false);
  };

  const handleEdit = (service: DentalService) => {
    setModal({ open: true, mode: "edit", data: service });
    form.setFieldsValue(service);
  };

  const handleDelete = async (service: DentalService) => {
    AntdModal.confirm({
      title: "Xoá dịch vụ?",
      content: `Bạn chắc chắn muốn xoá dịch vụ "${service.name}"?`,
      onOk: async () => {
        try {
          const res = await fetch(`/api/dental-services/${service.id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            toast.success("Đã xoá dịch vụ!");
            await fetchDentalServices(true); // <--- Tải lại dữ liệu
          } else {
            const { error } = await res.json();
            toast.error(error || "Lỗi xoá dịch vụ!");
          }
        } catch {
          toast.error("Lỗi xoá dịch vụ!");
        }
      },
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ flex: 1, margin: 0 }}>Danh sách dịch vụ</h2>
        <Button
          type="primary"
          onClick={() => {
            setModal({ open: true, mode: "add", data: { isActive: true } });
            form.resetFields();
          }}
        >
          Thêm dịch vụ
        </Button>
      </div>
      <DentalServiceTable
        data={services} // <--- Dữ liệu lấy từ store
        loading={isLoadingDentalServices} // <--- Use loading state from store
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <DentalServiceModal
        open={modal.open}
        mode={modal.mode}
        data={modal.data}
        onCancel={() => setModal({ ...modal, open: false })}
        onFinish={handleSave}
        loading={saving}
        form={form}
      />
    </div>
  );
}
