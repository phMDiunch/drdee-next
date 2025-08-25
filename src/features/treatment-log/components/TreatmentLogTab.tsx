// src/features/treatment-log/components/TreatmentLogTab.tsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { Spin, Empty, Typography, Space, Switch } from "antd";
import { CalendarOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { formatDateTimeVN } from "@/utils/date";
import { useTreatmentLog } from "../hooks/useTreatmentLog";
import type { TreatmentLogWithDetails } from "../type";
import TreatmentLogCard from "./TreatmentLogCard";
import TreatmentLogServiceCard from "./TreatmentLogServiceCard";
import TreatmentLogModal from "./TreatmentLogModal";

const { Title, Text } = Typography;

type ViewMode = "by-date" | "by-service";

type ServiceGroup = {
  consultedServiceId: string;
  consultedServiceName: string;
  consultedServiceUnit: string;
  treatingDoctorName: string; // ✅ Bác sĩ điều trị chính từ consultedService
  serviceStatus: "Chưa bắt đầu" | "Đang điều trị" | "Hoàn thành";
  treatmentLogs: TreatmentLogWithDetails[]; // ✅ Flatten thành array đơn giản
};

type Props = {
  customerId: string;
};

export default function TreatmentLogTab({ customerId }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("by-date");
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    appointmentId?: string;
    appointmentDate?: string;
    initialData?: Partial<TreatmentLogWithDetails>;
  }>({
    open: false,
    mode: "add",
  });

  const [saving, setSaving] = useState(false);

  const {
    loading,
    appointments,
    fetchCheckedInAppointments,
    createTreatmentLog,
    updateTreatmentLog,
    deleteTreatmentLog,
  } = useTreatmentLog();

  // ✅ Extract consulted services from existing appointments data
  const consultedServices = useMemo(() => {
    const serviceMap = new Map();

    appointments.forEach((appointment) => {
      appointment.treatmentLogs?.forEach((log) => {
        const service = log.consultedService;
        if (service && !serviceMap.has(service.id)) {
          serviceMap.set(service.id, {
            id: service.id,
            consultedServiceName: service.consultedServiceName,
            consultedServiceUnit: service.consultedServiceUnit,
            serviceStatus: service.serviceStatus,
          });
        }
      });
    });

    return Array.from(serviceMap.values()).filter(
      (service: { serviceStatus: string }) =>
        service.serviceStatus === "Đã chốt"
    );
  }, [appointments]);

  // Load appointments khi component mount
  useEffect(() => {
    if (customerId) {
      fetchCheckedInAppointments(customerId).catch((error) => {
        console.error("Error fetching appointments:", error);
        toast.error("Lỗi khi tải danh sách lịch hẹn");
      });
    }
  }, [customerId, fetchCheckedInAppointments]);

  // ✅ Helper function: Group data theo dịch vụ
  const groupByService = (): ServiceGroup[] => {
    const serviceMap = new Map<string, ServiceGroup>();

    appointments.forEach((appointment) => {
      // Lấy tất cả treatment logs từ appointment
      appointment.treatmentLogs?.forEach((log) => {
        const serviceId = log.consultedService.id;
        const serviceName = log.consultedService.consultedServiceName;
        const serviceUnit = log.consultedService.consultedServiceUnit;
        const treatingDoctorName =
          log.consultedService.treatingDoctor?.fullName || "N/A";

        if (!serviceMap.has(serviceId)) {
          serviceMap.set(serviceId, {
            consultedServiceId: serviceId,
            consultedServiceName: serviceName,
            consultedServiceUnit: serviceUnit,
            treatingDoctorName,
            serviceStatus: "Chưa bắt đầu",
            treatmentLogs: [],
          });
        }

        const serviceGroup = serviceMap.get(serviceId)!;
        serviceGroup.treatmentLogs.push(log);
      });
    });

    // Tính trạng thái tổng thể cho mỗi dịch vụ và sắp xếp treatment logs
    serviceMap.forEach((serviceGroup) => {
      const allLogs = serviceGroup.treatmentLogs;

      if (allLogs.length === 0) {
        serviceGroup.serviceStatus = "Chưa bắt đầu";
      } else if (
        allLogs.some((log) => log.treatmentStatus !== "Hoàn tất dịch vụ")
      ) {
        serviceGroup.serviceStatus = "Đang điều trị";
      } else {
        serviceGroup.serviceStatus = "Hoàn thành";
      }

      // Sắp xếp treatment logs theo ngày (cũ nhất trước)
      serviceGroup.treatmentLogs.sort(
        (a, b) =>
          new Date(a.treatmentDate).getTime() -
          new Date(b.treatmentDate).getTime()
      );
    });

    // Convert Map to Array và sắp xếp theo tên dịch vụ A-Z
    return Array.from(serviceMap.values()).sort((a, b) =>
      a.consultedServiceName.localeCompare(b.consultedServiceName, "vi")
    );
  };

  // Mở modal thêm treatment log
  const handleAddTreatment = (appointmentId: string) => {
    const appointment = appointments.find((app) => app.id === appointmentId);
    if (!appointment) return;

    const appointmentDate = formatDateTimeVN(
      appointment.appointmentDateTime,
      "DD/MM/YYYY"
    );

    setModal({
      open: true,
      mode: "add",
      appointmentId,
      appointmentDate,
    });
  };

  // Mở modal sửa treatment log
  const handleEditTreatment = (treatmentLog: TreatmentLogWithDetails) => {
    console.log("✏️ handleEditTreatment called with:", {
      id: treatmentLog.id,
      consultedServiceId: treatmentLog.consultedServiceId,
      treatmentNotes: treatmentLog.treatmentNotes,
      nextStepNotes: treatmentLog.nextStepNotes,
      treatmentStatus: treatmentLog.treatmentStatus,
      dentistId: treatmentLog.dentistId,
      assistant1Id: treatmentLog.assistant1Id,
      assistant2Id: treatmentLog.assistant2Id,
      clinicId: treatmentLog.clinicId,
      appointmentId: treatmentLog.appointmentId,
      appointment: treatmentLog.appointment,
    });

    const appointmentDate = treatmentLog.appointment
      ? formatDateTimeVN(
          treatmentLog.appointment.appointmentDateTime,
          "DD/MM/YYYY"
        )
      : undefined;

    setModal({
      open: true,
      mode: "edit",
      appointmentId: treatmentLog.appointmentId,
      appointmentDate,
      initialData: treatmentLog,
    });
  };

  // Xử lý submit form
  const handleFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (modal.mode === "add") {
        await createTreatmentLog(values);
        toast.success("Thêm lịch sử điều trị thành công");
      } else if (modal.mode === "edit" && modal.initialData?.id) {
        await updateTreatmentLog(modal.initialData.id, values);
        toast.success("Cập nhật lịch sử điều trị thành công");
      }

      setModal({ open: false, mode: "add" });

      // Reload appointments để cập nhật UI
      await fetchCheckedInAppointments(customerId);
    } catch (error) {
      console.error("Error saving treatment log:", error);
      toast.error("Lỗi khi lưu lịch sử điều trị");
    } finally {
      setSaving(false);
    }
  };

  // Xử lý xóa treatment log
  const handleDeleteTreatment = async (treatmentLogId: string) => {
    try {
      await deleteTreatmentLog(treatmentLogId);
      toast.success("Xóa lịch sử điều trị thành công");

      // Reload appointments để cập nhật UI
      await fetchCheckedInAppointments(customerId);
    } catch (error) {
      console.error("Error deleting treatment log:", error);
      toast.error("Lỗi khi xóa lịch sử điều trị");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải lịch sử điều trị...</div>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space direction="vertical">
            <Title level={5} type="secondary">
              Chưa có lịch sử điều trị
            </Title>
            <span>Bạn có thể thêm lịch sử điều trị khi cần.</span>
          </Space>
        }
        style={{ padding: "50px 0" }}
      />
    );
  }

  const serviceGroups = groupByService();

  return (
    <div>
      {/* ✅ Header với Title và Toggle Switch */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Lịch sử điều trị (
          {viewMode === "by-date"
            ? appointments.length + " ngày hẹn"
            : serviceGroups.length + " dịch vụ"}
          )
        </Title>

        <Space align="center">
          <CalendarOutlined />
          <Text>Theo ngày</Text>
          <Switch
            checked={viewMode === "by-service"}
            onChange={(checked) =>
              setViewMode(checked ? "by-service" : "by-date")
            }
            size="default"
          />
          <Text>Theo dịch vụ</Text>
          <MedicineBoxOutlined />
        </Space>
      </div>

      {/* ✅ Conditional Content */}
      <div>
        {viewMode === "by-date"
          ? // Chế độ hiển thị theo ngày (hiện tại)
            appointments.map((appointment) => (
              <TreatmentLogCard
                key={appointment.id}
                appointment={appointment}
                onAddTreatment={handleAddTreatment}
                onEditTreatment={handleEditTreatment}
                onDeleteTreatment={handleDeleteTreatment}
              />
            ))
          : // Chế độ hiển thị theo dịch vụ (mới)
            serviceGroups.map((serviceGroup) => (
              <TreatmentLogServiceCard
                key={serviceGroup.consultedServiceId}
                serviceGroup={serviceGroup}
                onEditTreatment={handleEditTreatment}
                onDeleteTreatment={handleDeleteTreatment}
              />
            ))}
      </div>

      <TreatmentLogModal
        open={modal.open}
        mode={modal.mode}
        appointmentId={modal.appointmentId}
        customerId={customerId}
        appointmentDate={modal.appointmentDate}
        initialData={modal.initialData}
        consultedServices={consultedServices}
        onCancel={() => setModal({ open: false, mode: "add" })}
        onFinish={handleFinish}
        loading={saving}
      />
    </div>
  );
}
