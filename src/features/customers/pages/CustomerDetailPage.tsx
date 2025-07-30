// src/features/customers/pages/CustomerDetailPage.tsx
"use client";
import { useMemo } from "react";
import { Spin, Tabs, Typography, TabsProps, Button } from "antd";
import Link from "next/link";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { useAppStore } from "@/stores/useAppStore";

// Custom hooks
import { useCustomerDetail } from "../hooks/useCustomerDetail";
import { useConsultedService } from "../hooks/useConsultedService";
import { useAppointment } from "../hooks/useAppointment";

// Components
import CustomerInfo from "../components/CustomerInfo";
import AppointmentTable from "@/features/appointments/components/AppointmentTable";
import ConsultedServiceTable from "@/features/consulted-service/components/ConsultedServiceTable";
import ConsultedServiceModal from "@/features/consulted-service/components/ConsultedServiceModal";
import AppointmentModal from "@/features/appointments/components/AppointmentModal";

const { Title } = Typography;

type Props = {
  customerId: string;
};

export default function CustomerDetailPage({ customerId }: Props) {
  // Custom hooks
  const { customer, setCustomer, loading } = useCustomerDetail(customerId);
  const consultedServiceHook = useConsultedService(customer, setCustomer);
  const appointmentHook = useAppointment(customer, setCustomer);

  // Store
  const {
    employeeProfile,
    dentalServices,
    activeEmployees,
    fetchActiveEmployees,
  } = useAppStore();

  // Memoized dentists and nurses
  const dentistsAndNurses = useMemo(() => {
    return activeEmployees.filter(
      (emp) => emp.title === "Bác sĩ" || emp.title === "Điều dưỡng"
    );
  }, [activeEmployees]);

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Title level={4}>Không tìm thấy khách hàng</Title>
        <Link href="/customers">
          <Button type="primary">Quay về danh sách</Button>
        </Link>
      </div>
    );
  }

  // Tab items
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Thông tin chung",
      children: <CustomerInfo customer={customer} />,
    },
    {
      key: "2",
      label: `Lịch hẹn (${customer?.appointments?.length || 0})`,
      children: (
        <AppointmentTable
          data={customer?.appointments || []}
          loading={loading}
          onEdit={appointmentHook.handleEditAppointment}
          onDelete={appointmentHook.handleDeleteAppointment}
          hideCustomerColumn={true}
          showHeader={true} // Hiển thị header và nút Add
          onAdd={appointmentHook.handleAddAppointment} // Thêm prop này
          title="Danh sách lịch hẹn"
        />
      ),
    },
    {
      key: "3",
      label: `Dịch vụ đã tư vấn (${customer?.consultedServices?.length || 0})`,
      children: (
        <ConsultedServiceTable
          data={customer?.consultedServices || []}
          loading={loading}
          onAdd={consultedServiceHook.handleAddService}
          onEdit={consultedServiceHook.handleEditService}
          onDelete={consultedServiceHook.handleDeleteService}
          onConfirm={consultedServiceHook.handleConfirmService}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/customers">
          <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 16 }}>
            Quay về
          </Button>
        </Link>
        <Title level={3} style={{ margin: 0, display: "inline" }}>
          Chi tiết khách hàng: {customer.fullName}
        </Title>
      </div>

      {/* Tabs */}
      <Tabs items={items} />

      {/* Modals */}
      <ConsultedServiceModal
        open={consultedServiceHook.modalState.open}
        mode={consultedServiceHook.modalState.mode}
        initialData={consultedServiceHook.modalState.data}
        onCancel={() =>
          consultedServiceHook.setModalState({ open: false, mode: "add" })
        }
        onFinish={consultedServiceHook.handleFinishService}
        loading={consultedServiceHook.saving}
      />

      <AppointmentModal
        open={appointmentHook.appointmentModal.open}
        mode={appointmentHook.appointmentModal.mode}
        data={appointmentHook.appointmentModal.data}
        onCancel={() =>
          appointmentHook.setAppointmentModal({ open: false, mode: "add" })
        }
        onFinish={appointmentHook.handleFinishAppointment}
        loading={loading}
        dentists={dentistsAndNurses}
      />
    </div>
  );
}
