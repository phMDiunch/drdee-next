// src/features/customers/pages/CustomerDetailPage.tsx
"use client";
import { useMemo, useEffect } from "react"; // ✅ THÊM useEffect
import { Spin, Tabs, Typography, TabsProps, Button, Alert } from "antd";
import Link from "next/link";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { useAppStore } from "@/stores/useAppStore";
import dayjs from "dayjs";

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

  // ✅ THÊM useEffect để fetch activeEmployees
  useEffect(() => {
    if (employeeProfile?.clinicId && activeEmployees.length === 0) {
      console.log("Fetching active employees...");
      fetchActiveEmployees(employeeProfile);
    }
  }, [employeeProfile?.clinicId, fetchActiveEmployees, activeEmployees.length]);

  // Memoized dentists and nurses
  const dentistsAndNurses = useMemo(() => {
    console.log("Active employees:", activeEmployees); // ✅ DEBUG
    const filtered = activeEmployees.filter(
      (emp) => emp.title === "Bác sĩ" || emp.title === "Điều dưỡng"
    );
    console.log("Dentists and nurses:", filtered); // ✅ DEBUG
    return filtered;
  }, [activeEmployees]);

  // ✅ Kiểm tra customer đã check-in hôm nay chưa
  const todayCheckinStatus = useMemo(() => {
    if (!customer?.appointments)
      return { hasCheckedIn: false, appointment: null };

    const today = dayjs().format("YYYY-MM-DD");
    const todayAppt = customer.appointments.find((appt) => {
      const apptDate = dayjs(appt.appointmentDateTime).format("YYYY-MM-DD");
      return apptDate === today && appt.checkInTime;
    });

    return {
      hasCheckedIn: !!todayAppt,
      appointment: todayAppt || null,
    };
  }, [customer?.appointments]);

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

  // ✅ DEBUG: Log dentists data trước khi pass vào modal
  console.log("Passing dentists to AppointmentModal:", dentistsAndNurses);

  // ✅ Tab items với check-in validation
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
          showHeader={true}
          onAdd={appointmentHook.handleAddAppointment}
          title="Danh sách lịch hẹn"
          showCheckInOut={true}
          onCheckIn={appointmentHook.handleCheckIn}
          onCheckOut={appointmentHook.handleCheckOut}
        />
      ),
    },
    {
      key: "3",
      label: `Dịch vụ đã tư vấn (${customer?.consultedServices?.length || 0})`,
      children: (
        <div>
          {!todayCheckinStatus.hasCheckedIn && (
            <Alert
              message="Chưa check-in hôm nay"
              description="Khách hàng cần check-in trước khi có thể tạo dịch vụ tư vấn. Vui lòng check-in trong tab 'Lịch hẹn' trước."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              action={
                <Button
                  size="small"
                  icon={<LoginOutlined />}
                  onClick={() => {
                    const tabsElement = document.querySelector(
                      '[role="tablist"] .ant-tabs-tab:nth-child(2)'
                    ) as HTMLElement;
                    tabsElement?.click();
                  }}
                >
                  Đi check-in
                </Button>
              }
            />
          )}

          <ConsultedServiceTable
            data={customer?.consultedServices || []}
            loading={loading}
            onAdd={consultedServiceHook.handleAddService}
            onEdit={consultedServiceHook.handleEditService}
            onDelete={consultedServiceHook.handleDeleteService}
            onConfirm={consultedServiceHook.handleConfirmService}
            disableAdd={!todayCheckinStatus.hasCheckedIn}
          />
        </div>
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

        {/* ✅ Check-in Status Badge - ĐÃ CÓ Ở ĐÂY */}
        <div style={{ marginTop: 8 }}>
          {todayCheckinStatus.hasCheckedIn ? (
            <span style={{ color: "green", fontSize: 14 }}>
              ✅ Đã check-in hôm nay lúc{" "}
              {dayjs(todayCheckinStatus.appointment?.checkInTime).format(
                "HH:mm"
              )}
            </span>
          ) : (
            <span style={{ color: "orange", fontSize: 14 }}>
              ⏳ Chưa check-in hôm nay
            </span>
          )}
        </div>
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
        dentists={dentistsAndNurses} // ✅ Đã có data sau khi fetch
      />
    </div>
  );
}
