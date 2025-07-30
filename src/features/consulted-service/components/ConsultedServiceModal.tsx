// src/features/consulted-service/components/ConsultedServiceModal.tsx
"use client";
import { Modal, Typography, Form } from "antd";
import ConsultedServiceForm from "./ConsultedServiceForm";
import { useAppStore } from "@/stores/useAppStore";
import { useEffect } from "react";

const { Title } = Typography;

type Props = {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  loading?: boolean;
};

export default function ConsultedServiceModal({
  open,
  onCancel,
  onFinish,
  loading,
}: Props) {
  const [form] = Form.useForm();

  // Lấy dữ liệu cần thiết từ store
  const {
    dentalServices,
    fetchDentalServices,
    activeEmployees,
    fetchActiveEmployees,
  } = useAppStore();

  useEffect(() => {
    if (open) {
      // Khi modal mở, đảm bảo đã có dữ liệu từ store
      fetchDentalServices();
      fetchActiveEmployees();
    }
  }, [open, fetchDentalServices, fetchActiveEmployees]);

  const handleOk = () => {
    form.submit();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          Thêm dịch vụ tư vấn
        </Title>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
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
