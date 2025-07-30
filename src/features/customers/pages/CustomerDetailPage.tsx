// src/features/customers/pages/CustomerDetailPage.tsx
"use client";
import { useEffect, useState } from "react";
import {
  Spin,
  Tabs,
  Typography,
  Descriptions,
  Card,
  TabsProps,
  Modal,
} from "antd"; // Thêm AntdModal
import { toast } from "react-toastify";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useAppStore } from "@/stores/useAppStore"; // Thêm import này
import ConsultedServiceTable from "@/features/consulted-service/components/ConsultedServiceTable";
import ConsultedServiceModal from "@/features/consulted-service/components/ConsultedServiceModal";
import type { ConsultedServiceWithDetails } from "@/features/consulted-service/type";

const { Title, Text } = Typography;

type CustomerDetails = any; // Sẽ định nghĩa chi tiết sau

type Props = {
  customerId: string;
};

export default function CustomerDetailPage({ customerId }: Props) {
  const [customer, setCustomer] = useState<CustomerDetails>(null);
  const [loading, setLoading] = useState(true);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState("1"); // Thêm state cho active tab

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Partial<ConsultedServiceWithDetails>;
  }>({ open: false, mode: "add" });

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
      const isEdit = modalState.mode === "edit";
      const url = isEdit
        ? `/api/consulted-services/${modalState.data?.id}`
        : "/api/consulted-services";
      const method = isEdit ? "PUT" : "POST";

      const selectedService = dentalServices.find(
        (s) => s.id === values.dentalServiceId
      );
      if (!selectedService) throw new Error("Không tìm thấy dịch vụ đã chọn.");

      const payload = {
        ...values,
        customerId: customer.id,
        clinicId: customer.clinicId,
        createdById: isEdit ? undefined : employeeProfile?.id,
        updatedById: employeeProfile?.id,
        debt: values.finalPrice - (values.amountPaid || 0),
        consultedServiceName: selectedService.name,
        consultedServiceUnit: selectedService.unit,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(
          error || `Lỗi khi ${isEdit ? "cập nhật" : "thêm"} dịch vụ`
        );
      }

      const responseData = await res.json();

      // Cập nhật state local thay vì refetch
      setCustomer((prev: any) => {
        const updatedCustomer = { ...prev };

        if (isEdit) {
          // Cập nhật service đã có
          updatedCustomer.consultedServices = prev.consultedServices.map(
            (service: any) =>
              service.id === modalState.data?.id ? responseData : service
          );
        } else {
          // Thêm service mới
          updatedCustomer.consultedServices = [
            responseData,
            ...prev.consultedServices,
          ];
        }

        return updatedCustomer;
      });

      toast.success(`${isEdit ? "Cập nhật" : "Thêm"} dịch vụ thành công!`);
      setModalState({ open: false, mode: "add" });

      // Không cần fetchDetails() nữa
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditService = (service: ConsultedServiceWithDetails) => {
    setModalState({ open: true, mode: "edit", data: service });
  };

  const handleDeleteService = async (service: ConsultedServiceWithDetails) => {
    console.log("handleDeleteService called with:", service);
    console.log("Service ID:", service?.id);

    if (!service || !service.id) {
      toast.error("Không thể xác định dịch vụ cần xóa");
      return;
    }

    const confirmed = window.confirm(
      `Bạn chắc chắn muốn xóa dịch vụ "${service.consultedServiceName}"?`
    );

    if (!confirmed) {
      console.log("Delete cancelled");
      return;
    }

    try {
      const res = await fetch(`/api/consulted-services/${service.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Xóa dịch vụ thất bại");
      }

      // Cập nhật state local thay vì refetch
      setCustomer((prev: any) => ({
        ...prev,
        consultedServices: prev.consultedServices.filter(
          (s: any) => s.id !== service.id
        ),
      }));

      toast.success("Đã xóa dịch vụ thành công!");

      // Không cần fetchDetails() nữa
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message);
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
      label: `Dịch vụ đã tư vấn (${customer?.consultedServices?.length || 0})`,
      children: (
        <ConsultedServiceTable
          data={customer?.consultedServices || []}
          loading={loading}
          onAdd={() => setModalState({ open: true, mode: "add" })}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
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

      <Tabs
        activeKey={activeTab} // Sử dụng activeKey thay vì defaultActiveKey
        onChange={setActiveTab} // Cập nhật state khi user chuyển tab
        items={items}
      />

      <ConsultedServiceModal
        open={modalState.open}
        mode={modalState.mode}
        initialData={modalState.data}
        onCancel={() => setModalState({ open: false, mode: "add" })}
        onFinish={handleFinishConsultedService}
        loading={saving}
      />
    </div>
  );
}
