// src/features/customers/pages/CustomerDetailPage.tsx
"use client";
import { useEffect, useState } from "react";
import { Spin, Tabs, Typography, Descriptions, Card, TabsProps } from "antd";
import { toast } from "react-toastify";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useAppStore } from "@/stores/useAppStore"; // Thêm import này
import ConsultedServiceTable from "@/features/consulted-service/components/ConsultedServiceTable";
import ConsultedServiceModal from "@/features/consulted-service/components/ConsultedServiceModal";

const { Title, Text } = Typography;

type CustomerDetails = any; // Sẽ định nghĩa chi tiết sau

type Props = {
  customerId: string;
};

export default function CustomerDetailPage({ customerId }: Props) {
  const [customer, setCustomer] = useState<CustomerDetails>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { employeeProfile, dentalServices } = useAppStore();

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/detail/${customerId}`);
      if (!res.ok) {
        throw new Error("Không thể tải thông tin khách hàng");
      }
      const data = await res.json();
      setCustomer(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchDetails();
    }
  }, [customerId]);

  const handleFinishConsultedService = async (values: any) => {
    setSaving(true);
    try {
      // 1. Tìm thông tin chi tiết của dịch vụ đã chọn từ trong store
      const selectedService = dentalServices.find(
        (s) => s.id === values.dentalServiceId
      );
      if (!selectedService) {
        throw new Error("Không tìm thấy thông tin dịch vụ đã chọn.");
      }

      // 2. Tính toán công nợ
      const debt = values.finalPrice - (values.amountPaid || 0);

      // 3. Tạo payload hoàn chỉnh với các trường riêng lẻ
      const payload = {
        ...values,
        customerId: customer.id,
        clinicId: customer.clinicId,
        createdById: employeeProfile?.id,
        updatedById: employeeProfile?.id,
        debt: debt,
        // Thêm các trường đã được "phi chuẩn hóa" (denormalized)
        consultedServiceName: selectedService.name,
        consultedServiceUnit: selectedService.unit,
      };

      const res = await fetch("/api/consulted-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Lỗi khi thêm dịch vụ tư vấn");
      }

      toast.success("Thêm dịch vụ tư vấn thành công!");
      setIsModalOpen(false);
      fetchDetails(); // Tải lại dữ liệu để cập nhật bảng
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spin style={{ display: "block", margin: "100px auto" }} />;
  }

  if (!customer) {
    return <Title level={3}>Không tìm thấy thông tin khách hàng.</Title>;
  }

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Thông tin chung",
      children: (
        <Card>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Họ tên">
              {customer.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {customer.phone || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {customer.dob
                ? new Date(customer.dob).toLocaleDateString("vi-VN")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {customer.gender || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {customer.email || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {customer.address || "N/A"}
            </Descriptions.Item>
            {customer.primaryContact && (
              <Descriptions.Item label="Người liên hệ chính">
                {`${customer.primaryContact.fullName} (${customer.relationshipToPrimary}) - ${customer.primaryContact.phone}`}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      ),
    },
    {
      key: "2",
      label: `Dịch vụ đã tư vấn (${customer.consultedServices.length})`,
      children: (
        <ConsultedServiceTable
          data={customer.consultedServices}
          loading={loading}
          onAdd={() => setIsModalOpen(true)}
        />
      ),
    },
    {
      key: "3",
      label: `Lịch sử điều trị (${customer.treatmentLogs.length})`,
      children: <p>Nội dung cho Lịch sử điều trị sẽ được xây dựng ở đây.</p>,
    },
    {
      key: "4",
      label: `Lịch sử thanh toán (${customer.paymentVouchers.length})`,
      children: <p>Nội dung cho Lịch sử thanh toán sẽ được xây dựng ở đây.</p>,
    },
    {
      key: "5",
      label: `Lịch hẹn (${customer.appointments.length})`,
      children: <p>Nội dung cho Lịch hẹn sẽ được xây dựng ở đây.</p>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Link
        href="/customers"
        style={{ marginBottom: 16, display: "inline-block" }}
      >
        <ArrowLeftOutlined /> Quay lại danh sách
      </Link>
      <Title level={2}>
        {customer.fullName} -{" "}
        <Text type="secondary">{customer.customerCode}</Text>
      </Title>

      <Tabs defaultActiveKey="1" items={items} />

      <ConsultedServiceModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onFinish={handleFinishConsultedService}
        loading={saving}
      />
    </div>
  );
}
