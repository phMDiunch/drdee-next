// src/features/consulted-service/pages/ConsultedServiceDailyPage.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  DatePicker,
  Space,
  Tabs,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import ConsultedServiceTable from "../components/ConsultedServiceTable";
import ConsultedServiceModal from "../components/ConsultedServiceModal";
import { useAppStore } from "@/stores/useAppStore";
import type { ConsultedServiceWithDetails } from "../type";
import { formatCurrency, formatDateTimeVN } from "@/utils/date";
import dayjs from "dayjs";

const { Title } = Typography;

export default function ConsultedServiceDailyPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [consultedServices, setConsultedServices] = useState<
    ConsultedServiceWithDetails[]
  >([]);
  const [loading, setLoading] = useState(false);

  // ✅ ADD: Clinic management for admin (like DailyAppointmentsPage)
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");

  // Modal states for edit and view (no add from this page)
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "edit" | "view"; // ✅ ADD: Support view mode
    data?: Partial<ConsultedServiceWithDetails>;
  }>({ open: false, mode: "edit" });

  const { employeeProfile } = useAppStore();

  // ✅ UPDATED: Clinic scope logic like DailyAppointmentsPage
  const activeClinicScope =
    employeeProfile?.role === "admin"
      ? selectedClinicId || employeeProfile?.clinicId || ""
      : employeeProfile?.clinicId || "";

  // ✅ UPDATED: Fetch consulted services with clinic scope
  const fetchConsultedServicesByDate = useCallback(
    async (date: dayjs.Dayjs) => {
      try {
        setLoading(true);
        const dateStr = date.format("YYYY-MM-DD");

        const params = new URLSearchParams({ date: dateStr });
        if (activeClinicScope) {
          params.set("clinicId", activeClinicScope);
        }

        const res = await fetch(`/api/consulted-services?${params.toString()}`);

        if (!res.ok) {
          throw new Error("Không thể tải danh sách dịch vụ tư vấn");
        }

        const data = await res.json();
        setConsultedServices(data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Fetch consulted services error:", error);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [activeClinicScope]
  );

  useEffect(() => {
    if (activeClinicScope) {
      fetchConsultedServicesByDate(selectedDate);
    }
  }, [activeClinicScope, selectedDate, fetchConsultedServicesByDate]);

  // ✅ ADD: Fetch clinics for admin (like DailyAppointmentsPage)
  useEffect(() => {
    const loadClinics = async () => {
      if (employeeProfile?.role !== "admin") return;
      try {
        const res = await fetch("/api/clinics");
        if (!res.ok) throw new Error("Không thể tải danh sách cơ sở");
        let data: { id: string; name: string }[] = await res.json();
        if (!Array.isArray(data)) data = [];

        // Ensure admin's clinic id present
        if (
          employeeProfile.clinicId &&
          !data.find((c) => c.id === employeeProfile.clinicId)
        ) {
          data.push({
            id: employeeProfile.clinicId,
            name: employeeProfile.clinicId,
          });
        }

        setClinics(data);
        // Default selection: keep current or use admin's clinic
        if (!selectedClinicId) {
          setSelectedClinicId(employeeProfile.clinicId || data[0]?.id || "");
        }
      } catch (e) {
        console.error(e);
        toast.error("Lỗi tải danh sách cơ sở");
      }
    };
    loadClinics();
  }, [employeeProfile?.role, employeeProfile?.clinicId, selectedClinicId]);

  // ✅ ADD: Initialize selectedClinicId early for admin
  useEffect(() => {
    if (
      employeeProfile?.role === "admin" &&
      !selectedClinicId &&
      employeeProfile?.clinicId
    ) {
      setSelectedClinicId(employeeProfile.clinicId);
    }
  }, [employeeProfile?.role, employeeProfile?.clinicId, selectedClinicId]);

  // ✅ Điều hướng ngày
  const goToPreviousDay = () => {
    const prevDay = selectedDate.subtract(1, "day");
    setSelectedDate(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = selectedDate.add(1, "day");
    setSelectedDate(nextDay);
  };

  const goToToday = () => {
    setSelectedDate(dayjs());
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // ✅ Kiểm tra có phải hôm nay không
  const isToday = selectedDate.isSame(dayjs(), "day");
  const isYesterday = selectedDate.isSame(dayjs().subtract(1, "day"), "day");
  const isTomorrow = selectedDate.isSame(dayjs().add(1, "day"), "day");

  // ✅ Hiển thị label cho ngày
  const getDateLabel = () => {
    if (isToday) return "Hôm nay";
    if (isYesterday) return "Hôm qua";
    if (isTomorrow) return "Ngày mai";
    return selectedDate.format("DD/MM/YYYY");
  };

  // ✅ Summary calculations
  const totalServices = consultedServices.length;
  const confirmedServices = consultedServices.filter(
    (s) => s.serviceStatus === "Đã chốt"
  ).length;
  const pendingServices = consultedServices.filter(
    (s) => s.serviceStatus !== "Đã chốt"
  ).length;
  const totalValue = consultedServices
    .filter((s) => s.serviceStatus === "Đã chốt")
    .reduce((sum, s) => sum + s.finalPrice, 0);

  // ✅ Handle Edit
  const handleEdit = async (service: ConsultedServiceWithDetails) => {
    try {
      const res = await fetch(`/api/consulted-services/${service.id}`);

      if (!res.ok) {
        throw new Error("Không thể tải thông tin dịch vụ");
      }

      const freshData = await res.json();

      setModal({
        open: true,
        mode: "edit",
        data: freshData,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to fetch fresh service data:", error);
      toast.error(errorMessage);

      // Fallback to stale data
      setModal({
        open: true,
        mode: "edit",
        data: service,
      });
    }
  };

  // ✅ NEW: Handle View
  const handleView = async (service: ConsultedServiceWithDetails) => {
    try {
      const res = await fetch(`/api/consulted-services/${service.id}`);

      if (!res.ok) {
        throw new Error("Không thể tải thông tin dịch vụ");
      }

      const freshData = await res.json();

      setModal({
        open: true,
        mode: "view",
        data: freshData,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to fetch fresh service data:", error);
      toast.error(errorMessage);

      // Fallback to stale data
      setModal({
        open: true,
        mode: "view",
        data: service,
      });
    }
  };

  // ✅ Handle Delete
  const handleDelete = async (service: ConsultedServiceWithDetails) => {
    if (service.serviceStatus === "Đã chốt") {
      toast.error("Không thể xóa dịch vụ đã chốt!");
      return;
    }

    const confirmed = window.confirm(
      `Bạn chắc chắn muốn xóa dịch vụ "${
        service.consultedServiceName
      }" của khách hàng "${service.customer?.fullName}" vào ${formatDateTimeVN(
        service.consultationDate
      )}?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/consulted-services/${service.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Xóa dịch vụ thất bại");
      }

      toast.success("Đã xóa dịch vụ thành công!");
      fetchConsultedServicesByDate(selectedDate);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Delete service error:", error);
      toast.error(errorMessage);
    }
  };

  // ✅ Handle Confirm Service
  const handleConfirm = async (service: ConsultedServiceWithDetails) => {
    if (service.serviceStatus === "Đã chốt") {
      toast.info("Dịch vụ đã được chốt trước đó!");
      return;
    }

    const confirmed = window.confirm(
      `Bạn chắc chắn muốn chốt dịch vụ "${service.consultedServiceName}" của khách hàng "${service.customer?.fullName}"?\n\nSau khi chốt, dịch vụ sẽ chính thức được xác nhận và phát sinh nghiệp vụ tài chính.`
    );

    if (!confirmed) return;

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

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Chốt dịch vụ thất bại");
      }

      toast.success(
        `Đã chốt dịch vụ cho ${service.customer?.fullName} thành công!`
      );
      fetchConsultedServicesByDate(selectedDate);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  // ✅ Handle Modal Submit
  const handleFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/consulted-services/${modal.data?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          updatedById: employeeProfile?.id,
        }),
      });

      if (res.ok) {
        toast.success("Cập nhật dịch vụ thành công!");
        setModal({ open: false, mode: "edit" });
        fetchConsultedServicesByDate(selectedDate);
      } else {
        const { error } = await res.json();
        toast.error(error || "Lỗi không xác định");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (loading && consultedServices.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Card loading={true} />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* ✅ Header với điều hướng ngày */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              🦷 Dịch vụ tư vấn - {getDateLabel()}
            </Title>
            <Typography.Text type="secondary">
              {selectedDate.format("dddd, DD/MM/YYYY")}
            </Typography.Text>
          </Col>

          <Col>
            <Row gutter={8} align="middle">
              {/* Date Picker */}
              <Col>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  suffixIcon={<CalendarOutlined />}
                />
              </Col>

              {/* Navigation Buttons */}
              <Col>
                <Space.Compact>
                  <Button
                    icon={<LeftOutlined />}
                    onClick={goToPreviousDay}
                    title="Ngày trước"
                  />
                  <Button
                    onClick={goToToday}
                    type={isToday ? "primary" : "default"}
                    title="Hôm nay"
                  >
                    Hôm nay
                  </Button>
                  <Button
                    icon={<RightOutlined />}
                    onClick={goToNextDay}
                    title="Ngày sau"
                  />
                </Space.Compact>
              </Col>

              {/* Refresh Button */}
              <Col>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchConsultedServicesByDate(selectedDate)}
                  loading={loading}
                  title="Làm mới"
                />
              </Col>
            </Row>
          </Col>
        </Row>

        {/* ✅ ADD: Admin clinic tabs (like DailyAppointmentsPage) */}
        {employeeProfile?.role === "admin" && (
          <div style={{ marginBottom: 16 }}>
            <Tabs
              size="small"
              activeKey={selectedClinicId}
              onChange={(key) => {
                setSelectedClinicId(key);
                // Data will refetch automatically via useEffect dependency
              }}
              items={clinics.map((c) => ({ key: c.id, label: c.name }))}
            />
          </div>
        )}

        {/* ✅ Thống kê nhanh */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Typography.Title
                level={3}
                style={{ margin: 0, color: "#1890ff" }}
              >
                {totalServices}
              </Typography.Title>
              <Typography.Text type="secondary">
                Tổng dịch vụ tư vấn
              </Typography.Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Typography.Title
                level={3}
                style={{ margin: 0, color: "#52c41a" }}
              >
                {confirmedServices}
              </Typography.Title>
              <Typography.Text type="secondary">Đã chốt</Typography.Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Typography.Title
                level={3}
                style={{ margin: 0, color: "#faad14" }}
              >
                {pendingServices}
              </Typography.Title>
              <Typography.Text type="secondary">Chưa chốt</Typography.Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Typography.Title
                level={3}
                style={{ margin: 0, color: "#722ed1" }}
              >
                {formatCurrency(totalValue)}
              </Typography.Title>
              <Typography.Text type="secondary">
                Tổng giá trị đã chốt
              </Typography.Text>
            </Card>
          </Col>
        </Row>

        {/* ✅ Bảng dịch vụ tư vấn */}
        <ConsultedServiceTable
          data={consultedServices}
          loading={loading}
          onAdd={() => {}} // No add function - empty callback
          onEdit={handleEdit}
          onDelete={handleDelete}
          onConfirm={handleConfirm}
          onView={handleView} // ✅ NEW: Add view handler
          disableAdd={true} // Always disable add button
          showCustomerColumn={true} // ✅ Show customer info for daily view
          hideAddButton={true} // ✅ Completely hide add button
          title={`${consultedServices.length} dịch vụ tư vấn trong ngày`}
        />
      </Card>

      {/* Modal Edit */}
      <ConsultedServiceModal
        open={modal.open}
        mode={modal.mode}
        initialData={modal.data}
        onCancel={() => setModal({ open: false, mode: "edit" })}
        onFinish={handleFinish}
        loading={loading}
      />
    </div>
  );
}
