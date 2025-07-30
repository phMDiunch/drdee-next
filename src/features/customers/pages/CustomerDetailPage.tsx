// src/features/customers/pages/CustomerDetailPage.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Spin,
  Tabs,
  Typography,
  Descriptions,
  Card,
  TabsProps,
  Button,
} from "antd"; // Thêm AntdModal
import { toast } from "react-toastify";
import Link from "next/link";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { useAppStore } from "@/stores/useAppStore"; // Thêm import này
import ConsultedServiceTable from "@/features/consulted-service/components/ConsultedServiceTable";
import ConsultedServiceModal from "@/features/consulted-service/components/ConsultedServiceModal";
import type { ConsultedServiceWithDetails } from "@/features/consulted-service/type";

import AppointmentTable from "@/features/appointments/components/AppointmentTable";
import AppointmentModal from "@/features/appointments/components/AppointmentModal";
import type { Appointment } from "@/features/appointments/type";
import dayjs from "dayjs";
import { formatDateTimeVN } from "@/utils/date";

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

  // Thêm state cho appointment modal
  const [appointmentModal, setAppointmentModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Partial<Appointment>;
  }>({ open: false, mode: "add" });

  const {
    employeeProfile,
    dentalServices,
    activeEmployees,
    fetchActiveEmployees,
  } = useAppStore();

  // Lọc ra bác sĩ và điều dưỡng
  const dentistsAndNurses = useMemo(() => {
    return activeEmployees.filter(
      (emp) => emp.title === "Bác sĩ" || emp.title === "Điều dưỡng"
    );
  }, [activeEmployees]);

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
    if (employeeProfile) {
      fetchActiveEmployees(employeeProfile);
    }
  }, [customerId, employeeProfile, fetchActiveEmployees]);

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
        serviceStatus: isEdit ? values.serviceStatus : "Chưa chốt",
        treatmentStatus: isEdit ? values.treatmentStatus : "Chưa điều trị",
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

  const handleAddAppointment = () => {
    setAppointmentModal({
      open: true,
      mode: "add",
      data: { customerId }, // Pre-fill customerId
    });
  };

  const handleEditAppointment = (appointment: any) => {
    setAppointmentModal({
      open: true,
      mode: "edit",
      data: appointment,
    });
  };

  const handleFinishAppointment = async (values: any) => {
    try {
      const isEdit = appointmentModal.mode === "edit";
      const url = isEdit
        ? `/api/appointments/${appointmentModal.data?.id}`
        : "/api/appointments";
      const method = isEdit ? "PUT" : "POST";

      // Convert dayjs to ISO string
      if (values.appointmentDateTime?.$d) {
        values.appointmentDateTime = dayjs(
          values.appointmentDateTime
        ).toISOString();
      }

      const payload = {
        ...values,
        customerId, // Ensure customerId is set
        clinicId: employeeProfile?.clinicId,
        createdById: isEdit ? undefined : employeeProfile?.id,
        updatedById: employeeProfile?.id,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(
          error || `Lỗi khi ${isEdit ? "cập nhật" : "tạo"} lịch hẹn`
        );
      }

      const responseData = await res.json();

      // Cập nhật state local
      setCustomer((prev: any) => {
        const updatedCustomer = { ...prev };

        if (isEdit) {
          // Cập nhật appointment đã có
          updatedCustomer.appointments = prev.appointments.map((appt: any) =>
            appt.id === appointmentModal.data?.id ? responseData : appt
          );
        } else {
          // Thêm appointment mới
          updatedCustomer.appointments = [responseData, ...prev.appointments];
        }

        return updatedCustomer;
      });

      toast.success(`${isEdit ? "Cập nhật" : "Tạo"} lịch hẹn thành công!`);
      setAppointmentModal({ open: false, mode: "add" });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteAppointment = async (appointment: any) => {
    const confirmed = window.confirm(
      `Bạn chắc chắn muốn xóa lịch hẹn "${
        appointment.primaryDentist?.fullName
      }" vào ${formatDateTimeVN(appointment.appointmentDateTime)}?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Xóa lịch hẹn thất bại");
      }

      // Cập nhật state local
      setCustomer((prev: any) => ({
        ...prev,
        appointments: prev.appointments.filter(
          (appt: any) => appt.id !== appointment.id
        ),
      }));

      toast.success("Đã xóa lịch hẹn thành công!");
    } catch (error: any) {
      console.error("Delete appointment error:", error);
      toast.error(error.message);
    }
  };

  if (loading) {
    return <Spin style={{ display: "block", margin: "100px auto" }} />;
  }

  if (!customer) {
    return <Title level={3}>Không tìm thấy thông tin khách hàng.</Title>;
  }

  const handleConfirmService = async (service: ConsultedServiceWithDetails) => {
    console.log("handleConfirmService called with:", service);

    if (!service || !service.id) {
      toast.error("Không thể xác định dịch vụ cần chốt");
      return;
    }

    console.log(
      "About to show confirm modal for service:",
      service.consultedServiceName
    );

    // Tạm thời sử dụng window.confirm để test
    const confirmed = window.confirm(
      `Bạn chắc chắn muốn chốt dịch vụ "${service.consultedServiceName}"?\n\nSau khi chốt, dịch vụ sẽ chính thức được xác nhận và phát sinh nghiệp vụ tài chính.`
    );

    if (!confirmed) {
      console.log("Confirm cancelled");
      return;
    }

    console.log("Proceeding with confirm service...");

    try {
      const res = await fetch(`/api/consulted-services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceStatus: "Đã chốt",
          serviceConfirmDate: new Date().toISOString(),
          updatedById: employeeProfile?.id,
        }),
      });

      console.log("API response status:", res.status);
      console.log("API response ok:", res.ok);

      if (!res.ok) {
        const errorText = await res.text();
        console.log("API error response:", errorText);
        throw new Error("Chốt dịch vụ thất bại");
      }

      const updatedService = await res.json();
      console.log("Updated service:", updatedService);

      // Cập nhật state local
      setCustomer((prev: any) => ({
        ...prev,
        consultedServices: prev.consultedServices.map((s: any) =>
          s.id === service.id ? updatedService : s
        ),
      }));

      toast.success("Đã chốt dịch vụ thành công!");
    } catch (error: any) {
      console.error("Confirm service error:", error);
      toast.error(error.message);
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Thông tin chung",
      children: (
        <Card>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã khách hàng">
              {customer.customerCode}
            </Descriptions.Item>
            <Descriptions.Item label="Họ và tên">
              {customer.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {customer.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {customer.email}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {customer.address}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {customer.notes || "Không có"}
            </Descriptions.Item>

            {customer.primaryContact?.fullName && (
              <>
                <Descriptions.Item label="Tên Primary Contact">
                  {customer.primaryContact.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="SĐT Primary Contact">
                  {customer.primaryContact?.phone || "Không có"}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Card>
      ),
    },
    {
      key: "2",
      label: `Lịch hẹn (${customer?.appointments?.length || 0})`,
      children: (
        <div>
          {/* Header với nút Thêm lịch hẹn */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              Danh sách lịch hẹn
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddAppointment}
            >
              Thêm lịch hẹn
            </Button>
          </div>

          {/* Table lịch hẹn */}
          <AppointmentTable
            data={customer?.appointments || []}
            loading={loading}
            onEdit={handleEditAppointment}
            onDelete={handleDeleteAppointment}
            hideCustomerColumn={true}
          />
        </div>
      ),
    },
    {
      key: "3",
      label: `Dịch vụ đã tư vấn (${customer?.consultedServices?.length || 0})`,
      children: (
        <ConsultedServiceTable
          data={customer?.consultedServices || []}
          loading={loading}
          onAdd={() => setModalState({ open: true, mode: "add" })}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
          onConfirm={handleConfirmService}
        />
      ),
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

      <AppointmentModal
        open={appointmentModal.open}
        mode={appointmentModal.mode}
        data={appointmentModal.data}
        onCancel={() => setAppointmentModal({ open: false, mode: "add" })}
        onFinish={handleFinishAppointment}
        loading={loading}
        dentists={dentistsAndNurses}
      />
    </div>
  );
}
