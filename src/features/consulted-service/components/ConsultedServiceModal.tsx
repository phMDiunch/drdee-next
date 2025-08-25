// src/features/consulted-service/components/ConsultedServiceModal.tsx
"use client";
import { Modal, Typography, Form } from "antd";
import ConsultedServiceForm from "./ConsultedServiceForm";
import ConsultedServiceView from "./ConsultedServiceView";
import { useAppStore } from "@/stores/useAppStore";
import { useEffect } from "react";
import type { ConsultedServiceWithDetails } from "../type";

const { Title } = Typography;

type Props = {
  open: boolean;
  mode: "add" | "edit" | "view"; // ✅ NEW: Add "view" mode
  initialData?: Partial<ConsultedServiceWithDetails>;
  onCancel: () => void;
  onFinish: (values: Record<string, unknown>) => void; // ✅ FIX: Replace any with Record<string, unknown>
  loading?: boolean;
};

export default function ConsultedServiceModal({
  open,
  mode,
  initialData,
  onCancel,
  onFinish,
  loading,
}: Props) {
  const [form] = Form.useForm();

  // Lấy dữ liệu cần thiết từ store
  const { dentalServices, activeEmployees } = useAppStore();

  useEffect(() => {
    if (open) {
      // ✅ REMOVE fetchDentalServices() - data is auto-loaded on login
      // Dental services are already available from AuthContext auto-loading

      // Nếu là chế độ sửa, điền dữ liệu vào form
      if (mode === "edit" && initialData) {
        // ✅ FIX: Only set editable fields to prevent sending readonly fields like clinicId
        const editableFields = {
          dentalServiceId: initialData.dentalServiceId,
          consultedServiceName: initialData.consultedServiceName,
          consultedServiceUnit: initialData.consultedServiceUnit,
          quantity: initialData.quantity,
          price: initialData.price,
          preferentialPrice: initialData.preferentialPrice,
          finalPrice: initialData.finalPrice,
          toothPositions: initialData.toothPositions,
          consultingDoctorId: initialData.consultingDoctorId,
          treatingDoctorId: initialData.treatingDoctorId,
          consultingSaleId: initialData.consultingSaleId,
          specificStatus: initialData.specificStatus,
        };
        form.setFieldsValue(editableFields);
      } else if (mode === "add") {
        form.resetFields();
      }
      // View mode không cần form logic
    } else {
      // Reset form khi modal đóng để tránh warnings
      form.resetFields();
    }
  }, [open, mode, initialData, form]);

  // ✅ NEW: Dynamic title based on mode
  const getTitle = () => {
    switch (mode) {
      case "add":
        return "Thêm dịch vụ tư vấn";
      case "edit":
        return "Sửa dịch vụ tư vấn";
      case "view":
        return "Chi tiết dịch vụ tư vấn";
      default:
        return "Dịch vụ tư vấn";
    }
  };

  // const handleOk = () => {
  //   form.submit();
  // };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {getTitle()}
        </Title>
      }
      open={open}
      onCancel={onCancel}
      // onOk={handleOk}
      confirmLoading={loading}
      footer={null}
      destroyOnHidden
      width={800}
    >
      {mode === "view" ? (
        <ConsultedServiceView
          service={initialData as ConsultedServiceWithDetails}
        />
      ) : (
        open && (
          <ConsultedServiceForm
            form={form}
            onFinish={onFinish}
            loading={loading}
            dentalServices={dentalServices}
            employees={activeEmployees}
            initialData={initialData}
          />
        )
      )}
    </Modal>
  );
}
