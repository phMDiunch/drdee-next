// src/features/dental-service/components/DentalServiceList.tsx
"use client";
import { useEffect, useState } from "react";
import { Button, Spin, Modal as AntdModal, Form } from "antd";
import type { DentalService } from "../type";
import DentalServiceTable from "../components/DentalServiceTable";
import DentalServiceModal from "../components/DentalServiceModal";
import { useEmployeeProfile } from "@/features/auth/hooks/useAuth";
import { toast } from "react-toastify";

type ModalState = {
  open: boolean;
  mode: "add" | "edit";
  data?: Partial<DentalService> | null;
};

export default function DentalServiceList() {
  const [services, setServices] = useState<DentalService[]>([]);
  const [filteredServices, setFilteredServices] = useState<DentalService[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: "add",
    data: null,
  });
  const [saving, setSaving] = useState(false);

  const [form] = Form.useForm();
  const { employee } = useEmployeeProfile();

  // Lấy danh sách dịch vụ khi load page
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dental-services");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      toast.error("Không thể tải danh sách dịch vụ!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    setFilteredServices(services);
  }, [services]);

  // Thêm mới hoặc sửa dịch vụ
  const handleSave = async (values: Partial<DentalService>) => {
    if (!employee) {
      toast.error("Bạn chưa được cấu hình profile nhân viên!");
      return;
    }
    setSaving(true);
    try {
      const processedValues = {
        ...values,
        price: Number(values.price),
        isActive: values.isActive ?? true,
        createdById: employee.id,
        updatedById: employee.id,
      };
      if (modal.mode === "add") {
        const res = await fetch("/api/dental-services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(processedValues),
        });
        if (res.ok) {
          toast.success("Thêm dịch vụ thành công!");
          setModal({ ...modal, open: false });
          fetchServices();
        } else {
          const { error } = await res.json();
          toast.error(error || "Lỗi không xác định");
        }
      } else if (modal.mode === "edit" && modal.data) {
        const res = await fetch(`/api/dental-services/${modal.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(processedValues),
        });
        if (res.ok) {
          toast.success("Cập nhật thành công!");
          setModal({ ...modal, open: false });
          fetchServices();
        } else {
          const { error } = await res.json();
          toast.error(error || "Lỗi cập nhật");
        }
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
    setSaving(false);
  };

  // Mở modal sửa
  const handleEdit = (service: DentalService) => {
    setModal({
      open: true,
      mode: "edit",
      data: service,
    });
    form.setFieldsValue(service);
  };

  // Xử lý xóa dịch vụ
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
            fetchServices();
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

  // (Có thể bổ sung handleFilter nếu có TableFilter)

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
        data={filteredServices}
        loading={loading}
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
