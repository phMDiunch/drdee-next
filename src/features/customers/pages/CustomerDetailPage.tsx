// src/features/customers/pages/CustomerDetailPage.tsx
"use client";
import { useMemo, useState } from "react";
import {
  Spin,
  Tabs,
  Typography,
  TabsProps,
  Button,
  Alert,
  Card,
  Row,
  Col,
  Tag,
  // Statistic,
  Breadcrumb,
} from "antd";
import Link from "next/link";
import {
  ArrowLeftOutlined,
  // PlusOutlined,
  LoginOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  // EditOutlined,
} from "@ant-design/icons";
import { useAppStore } from "@/stores/useAppStore";
import dayjs from "dayjs";
import { formatCurrency } from "@/utils/date";
import { toast } from "react-toastify";

// Custom hooks
import { useCustomerDetail } from "../hooks/useCustomerDetail";
import { useConsultedService } from "../hooks/useConsultedService";
import { useAppointment } from "../hooks/useAppointment";
import { usePayment } from "../hooks/usePayment";

// Components
import CustomerInfo from "../components/CustomerInfo";
import AppointmentTable from "@/features/appointments/components/AppointmentTable";
import ConsultedServiceTable from "@/features/consulted-service/components/ConsultedServiceTable";
import ConsultedServiceModal from "@/features/consulted-service/components/ConsultedServiceModal";
import AppointmentModal from "@/features/appointments/components/AppointmentModal";
import PaymentVoucherTable from "@/features/payment/components/PaymentVoucherTable";
import PaymentVoucherModal from "@/features/payment/components/PaymentVoucherModal";
import CustomerModal from "../components/CustomerModal";
import TreatmentLogTab from "@/features/treatment-log/components/TreatmentLogTab";
import TreatmentCareTable from "@/features/treatment-care/components/TreatmentCareTable";
import TreatmentCareModal from "@/features/treatment-care/components/TreatmentCareModal";
import type { Customer } from "@/features/customers/type";
import type { ConsultedServiceWithDetails } from "@/features/consulted-service/type";
import type { Appointment as PrismaAppointment } from "@prisma/client";

const { Title, Text } = Typography;

type Props = {
  customerId: string;
};

export default function CustomerDetailPage({ customerId }: Props) {
  type CustomerFormValues = Partial<Omit<Customer, "dob">> & {
    dob?: import("dayjs").Dayjs | Date | string | null;
  };
  // Custom hooks
  const { customer, setCustomer, loading, refetch } =
    useCustomerDetail(customerId);
  const consultedServiceHook = useConsultedService(customer, setCustomer);
  const appointmentHook = useAppointment(customer, setCustomer);
  const paymentHook = usePayment(customer, setCustomer);

  // State for customer edit modal
  const [customerModal, setCustomerModal] = useState<{
    open: boolean;
    data?: CustomerFormValues;
  }>({ open: false });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  // Aftercare quick action
  const [aftercareOpen, setAftercareOpen] = useState(false);

  // Store
  const { employeeProfile, activeEmployees } = useAppStore();

  // Remove fetchActiveEmployees useEffect since data is auto-loaded on login

  // ✅ UPDATED: Sử dụng tất cả employees thay vì filter theo chức danh
  const allEmployees = useMemo(() => {
    return activeEmployees; // Không filter gì cả
  }, [activeEmployees]);

  const todayCheckinStatus = useMemo(() => {
    if (!customer?.appointments)
      return { hasCheckedIn: false, appointment: null };

    const today = dayjs().format("YYYY-MM-DD");
    type CustomerAppointmentLite = {
      appointmentDateTime: string;
      checkInTime: string | null;
    };
    const todayAppt = (
      customer.appointments as Array<CustomerAppointmentLite>
    ).find((appt) => {
      const apptDate = dayjs(appt.appointmentDateTime).format("YYYY-MM-DD");
      return apptDate === today && appt.checkInTime;
    });

    return {
      hasCheckedIn: !!todayAppt,
      appointment: todayAppt || null,
    };
  }, [customer?.appointments]);

  const financialSummary = useMemo(() => {
    type ConsultedLite = {
      serviceStatus: string;
      finalPrice: number;
      amountPaid?: number | null;
    };
    const confirmedServices =
      (customer?.consultedServices as Array<ConsultedLite> | undefined)?.filter(
        (service) => service.serviceStatus === "Đã chốt"
      ) || [];

    const totalAmount = confirmedServices.reduce(
      (sum: number, service: ConsultedLite) => sum + (service.finalPrice || 0),
      0
    );
    const amountPaid = confirmedServices.reduce(
      (sum: number, service: ConsultedLite) => sum + (service.amountPaid || 0),
      0
    );
    const debt = totalAmount - amountPaid;

    return { totalAmount, amountPaid, debt };
  }, [customer?.consultedServices]);

  // Handlers for editing customer
  const handleEditCustomer = () => {
    const data: CustomerFormValues = {
      ...(customer as Customer),
      dob: customer?.dob ? dayjs(customer.dob) : null,
    };
    setCustomerModal({ open: true, data });
  };

  const handleFinishEdit = async (values: CustomerFormValues) => {
    setIsSavingCustomer(true);
    try {
      if (values.dob && dayjs.isDayjs(values.dob)) {
        values.dob = dayjs(values.dob).toISOString();
      }

      const processedValues = {
        ...values,
        primaryContactId: values.primaryContactId || null,
        relationshipToPrimary: values.primaryContactId
          ? values.relationshipToPrimary
          : null,
        email: values.email || null,
        updatedById: employeeProfile?.id,
      };

      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedValues),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Cập nhật thông tin thất bại");
      }

      toast.success("Cập nhật thông tin khách hàng thành công!");
      setCustomerModal({ open: false });
      await refetch(); // Refetch all customer data
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật";
      toast.error(msg);
    } finally {
      setIsSavingCustomer(false);
    }
  };

  // Compute latest treatment date (YYYY-MM-DD) from customer's treatment logs
  const latestTreatmentDate: string | null = useMemo(() => {
    const logs =
      (customer?.treatmentLogs as
        | Array<{ treatmentDate: string | Date }>
        | undefined) || [];
    if (logs.length === 0) return null;
    // API orders by treatmentDate desc already, but ensure robustness
    const latest = logs
      .slice()
      .sort(
        (a, b) =>
          new Date(b.treatmentDate).getTime() -
          new Date(a.treatmentDate).getTime()
      )[0].treatmentDate;
    return dayjs(latest).format("YYYY-MM-DD");
  }, [customer]);

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

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Thông tin chung",
      children: (
        <CustomerInfo customer={customer} onEdit={handleEditCustomer} />
      ),
    },
    {
      key: "2",
      label: `Lịch hẹn (${
        (customer?.appointments as Array<unknown> | undefined)?.length || 0
      })`,
      children: (
        <AppointmentTable
          data={
            (customer?.appointments || []) as Array<
              PrismaAppointment & {
                customer: {
                  id: string;
                  customerCode: string | null;
                  fullName: string;
                  phone: string | null;
                  email: string | null;
                  address: string | null;
                };
                primaryDentist: { id: string; fullName: string };
                secondaryDentist?: { id: string; fullName: string } | null;
              }
            >
          }
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
      label: `Dịch vụ đã tư vấn (${
        (customer?.consultedServices as Array<unknown> | undefined)?.length || 0
      })`,
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
            data={
              (customer?.consultedServices ||
                []) as ConsultedServiceWithDetails[]
            }
            loading={loading}
            onAdd={consultedServiceHook.handleAddService}
            onEdit={consultedServiceHook.handleEditService}
            onDelete={consultedServiceHook.handleDeleteService}
            onConfirm={consultedServiceHook.handleConfirmService}
            onView={consultedServiceHook.handleViewService} // ✅ NEW: Add view handler
            disableAdd={!todayCheckinStatus.hasCheckedIn}
            isAdmin={employeeProfile?.role === "admin"} // ✅ NEW: Pass admin permission
          />
        </div>
      ),
    },
    {
      key: "4",
      label: "Lịch sử điều trị",
      children: <TreatmentLogTab customerId={customerId} />,
    },
    {
      key: "aftercare",
      label: "Chăm sóc sau điều trị",
      children: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="primary"
              onClick={() => setAftercareOpen(true)}
              disabled={!latestTreatmentDate}
            >
              Chăm sóc
            </Button>
          </div>
          <TreatmentCareTable customerId={customerId} />
        </div>
      ),
    },
    {
      key: "5",
      label: `Phiếu thu (${customer?.paymentVouchers?.length || 0})`,
      children: (
        <PaymentVoucherTable
          data={customer?.paymentVouchers || []}
          loading={loading}
          onAdd={paymentHook.handleAddPayment}
          onView={paymentHook.handleViewPayment}
          onDelete={paymentHook.handleDeletePayment}
          hideCustomerColumn={true}
          showHeader={true}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
        >
          <Link href="/customers">
            <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 16 }}>
              Quay về
            </Button>
          </Link>
          <Breadcrumb
            items={[{ title: "Khách hàng" }, { title: customer.fullName }]}
          />
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Card size="small">
              <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                👤 {customer.fullName}
              </Title>
              <Text
                type="secondary"
                style={{ display: "block", marginBottom: 8 }}
              >
                Mã KH: <Text strong>{customer.customerCode || "Chưa có"}</Text>
              </Text>
              {todayCheckinStatus.hasCheckedIn ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Đã check-in{" "}
                  {dayjs(todayCheckinStatus.appointment?.checkInTime).format(
                    "HH:mm"
                  )}
                </Tag>
              ) : (
                <Tag color="warning" icon={<ClockCircleOutlined />}>
                  Chưa check-in
                </Tag>
              )}
            </Card>
          </Col>

          <Col span={12}>
            {financialSummary.totalAmount > 0 ? (
              <Card size="small">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text type="secondary">💰 Tổng tiền:</Text>
                    <Text strong style={{ color: "#1890ff" }}>
                      {formatCurrency(financialSummary.totalAmount)}
                    </Text>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text type="secondary">✅ Đã trả:</Text>
                    <Text strong style={{ color: "#52c41a" }}>
                      {formatCurrency(financialSummary.amountPaid)}
                    </Text>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text type="secondary">⚠️ Còn nợ:</Text>
                    <Text
                      strong
                      style={{
                        color:
                          financialSummary.debt > 0 ? "#ff4d4f" : "#52c41a",
                      }}
                    >
                      {formatCurrency(financialSummary.debt)}
                    </Text>
                  </div>
                </div>
              </Card>
            ) : (
              <Card
                size="small"
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Text
                  type="secondary"
                  style={{ textAlign: "center", width: "100%" }}
                >
                  📋 Chưa có dịch vụ nào được chốt
                </Text>
              </Card>
            )}
          </Col>
        </Row>
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
        dentists={allEmployees}
      />

      <PaymentVoucherModal
        open={paymentHook.paymentModal.open}
        mode={paymentHook.paymentModal.mode}
        data={paymentHook.paymentModal.data}
        onCancel={() =>
          paymentHook.setPaymentModal({ open: false, mode: "add" })
        }
        onFinish={paymentHook.handleFinishPayment}
        loading={paymentHook.saving}
        availableServices={(
          customer?.consultedServices as
            | ConsultedServiceWithDetails[]
            | undefined
        )?.filter(
          (s) =>
            s.serviceStatus === "Đã chốt" &&
            (s.finalPrice || 0) > (s.amountPaid || 0)
        )}
        employees={activeEmployees}
        customerId={customerId} // ✅ THÊM PROP NÀY
        currentCustomer={
          customer
            ? {
                id: customer.id,
                fullName: customer.fullName,
                phone: customer.phone || "", // ✅ HANDLE NULL PHONE
              }
            : undefined
        } // ✅ TRUYỀN CURRENT CUSTOMER
      />

      {/* Customer Edit Modal */}
      <CustomerModal
        open={customerModal.open}
        mode="edit"
        data={customerModal.data}
        onCancel={() => setCustomerModal({ open: false })}
        onFinish={handleFinishEdit}
        loading={isSavingCustomer}
        customers={[]}
      />

      {/* Aftercare Quick Modal - reuse TreatmentCareModal */}
      {latestTreatmentDate && (
        <TreatmentCareModal
          open={aftercareOpen}
          onClose={() => setAftercareOpen(false)}
          customerId={customerId}
          treatmentDate={latestTreatmentDate}
        />
      )}
    </div>
  );
}
