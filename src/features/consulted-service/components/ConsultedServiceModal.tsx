// src/features/consulted-service/components/ConsultedServiceModal.tsx
"use client";
import { Modal, Typography, Form } from "antd";
import ConsultedServiceForm from "./ConsultedServiceForm";
import { useAppStore } from "@/stores/useAppStore";
import { useEffect } from "react";
import type { ConsultedServiceWithDetails } from "../type";

const { Title } = Typography;

type Props = {
  open: boolean;
  mode: "add" | "edit";
  initialData?: Partial<ConsultedServiceWithDetails>;
  onCancel: () => void;
  onFinish: (values: any) => void;
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
        form.setFieldsValue(initialData);
      } else {
        form.resetFields();
      }
    }
  }, [open, mode, initialData, form]);

  // const handleOk = () => {
  //   form.submit();
  // };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {mode === "edit" ? "Sửa dịch vụ tư vấn" : "Thêm dịch vụ tư vấn"}
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
      <ConsultedServiceForm
        form={form}
        onFinish={onFinish}
        loading={loading}
        dentalServices={dentalServices}
        employees={activeEmployees}
      />
    </Modal>
  );
}
