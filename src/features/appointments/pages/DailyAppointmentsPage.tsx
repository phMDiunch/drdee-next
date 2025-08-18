// src/features/appointments/pages/DailyAppointmentsPage.tsx // ✅ SỬA COMMENT
"use client";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  DatePicker,
  Space,
  Input,
  Tabs,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import AppointmentTable from "../components/AppointmentTable";
import AppointmentModal from "../components/AppointmentModal";
import { useAppStore } from "@/stores/useAppStore";
import type { Appointment } from "../type";
import { formatDateTimeVN, toISOStringVN } from "@/utils/date";
import dayjs from "dayjs";

const { Title } = Typography;

type AppointmentWithIncludes = Appointment & {
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
};

export default function DailyAppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs()); // ✅ State cho ngày được chọn
  // Removed manual appointments state; now managed by React Query
  const [loading, setLoading] = useState(false); // still used for create/edit submit & optimistic actions
  const [search, setSearch] = useState(""); // từ khóa tìm kiếm khách hàng / mã

  // Modal states
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Partial<AppointmentWithIncludes>;
  }>({ open: false, mode: "add" });

  const { employeeProfile, activeEmployees } = useAppStore();
  // Clinics (admin only)
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>(""); // actual clinic id for admin

  // ✅ UPDATED: Sử dụng tất cả employees thay vì filter theo chức danh
  const allEmployees = activeEmployees; // Không filter gì cả

  // React Query: lấy lịch hẹn theo ngày + clinic scope
  const dateStr = selectedDate.format("YYYY-MM-DD");
  // Fallback: nếu admin chưa chọn clinic (đang chờ fetch clinics) dùng ngay clinicId của profile để không chờ thêm vòng
  const activeClinicScope =
    employeeProfile?.role === "admin"
      ? selectedClinicId || employeeProfile?.clinicId || ""
      : employeeProfile?.clinicId || "";
  const queryClient = useQueryClient();

  const {
    data: appointments = [] as AppointmentWithIncludes[],
    isLoading: appointmentsLoading,
    isFetching: appointmentsFetching,
    refetch: refetchAppointments,
  } = useQuery<AppointmentWithIncludes[]>({
    queryKey: ["appointments-daily", dateStr, activeClinicScope],
    enabled:
      !!employeeProfile &&
      (!!activeClinicScope || employeeProfile?.role !== "admin"),
    queryFn: async () => {
      const params = new URLSearchParams({ date: dateStr });
      if (activeClinicScope) params.set("clinicId", activeClinicScope);
      const res = await fetch(`/api/appointments/today?${params.toString()}`);
      if (!res.ok) throw new Error("Không thể tải danh sách lịch hẹn");
      return await res.json();
    },
    staleTime: 60_000,
    // React Query v5: dùng placeholderData để giữ dữ liệu cũ
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });

  // Prefetch adjacent days & limited other clinics
  useEffect(() => {
    if (!employeeProfile) return;
    const prefetchFetch = async (dStr: string, scope: string) => {
      if (!scope) return;
      await queryClient.prefetchQuery({
        queryKey: ["appointments-daily", dStr, scope],
        queryFn: async () => {
          const params = new URLSearchParams({ date: dStr });
          params.set("clinicId", scope);
          const res = await fetch(
            `/api/appointments/today?${params.toString()}`
          );
          if (!res.ok) throw new Error("Prefetch lịch hẹn thất bại");
          return await res.json();
        },
        staleTime: 60_000,
      });
    };
    const nextDay = selectedDate.add(1, "day").format("YYYY-MM-DD");
    const prevDay = selectedDate.subtract(1, "day").format("YYYY-MM-DD");
    if (employeeProfile.role === "admin") {
      if (selectedClinicId) {
        prefetchFetch(nextDay, selectedClinicId);
        prefetchFetch(prevDay, selectedClinicId);
      }
      clinics
        .filter((c) => c.id !== selectedClinicId)
        .slice(0, 2)
        .forEach((c) => prefetchFetch(dateStr, c.id));
    } else if (activeClinicScope) {
      prefetchFetch(nextDay, activeClinicScope);
      prefetchFetch(prevDay, activeClinicScope);
    }
  }, [
    employeeProfile,
    selectedClinicId,
    clinics,
    selectedDate,
    dateStr,
    activeClinicScope,
    queryClient,
  ]);

  // Refetch when selectedClinicId changes (admin) handled automatically by queryKey
  useEffect(() => {
    // noop: side-effects removed; query handles dependencies
  }, [selectedClinicId, selectedDate]);

  // Fetch clinics for admin; default select their clinic id
  useEffect(() => {
    const loadClinics = async () => {
      if (employeeProfile?.role !== "admin") return;
      try {
        const res = await fetch("/api/clinics");
        if (!res.ok) throw new Error("Không thể tải danh sách cơ sở");
        let data: { id: string; name: string }[] = await res.json();
        if (!Array.isArray(data)) data = [];
        // ensure admin's clinic id present
        if (
          employeeProfile.clinicId &&
          !data.find(
            (c: { id: string; name: string }) =>
              c.id === employeeProfile.clinicId
          )
        ) {
          data.push({
            id: employeeProfile.clinicId,
            name: employeeProfile.clinicId,
          });
        }
        setClinics(data);
        // default selection ưu tiên giữ selected hiện tại nếu đã có
        if (!selectedClinicId) {
          setSelectedClinicId(
            selectedClinicId || employeeProfile.clinicId || data[0]?.id || ""
          );
        }
      } catch (e) {
        console.error(e);
        toast.error("Lỗi tải danh sách cơ sở");
      }
    };
    loadClinics();
  }, [employeeProfile?.role, employeeProfile?.clinicId, selectedClinicId]);

  // Khởi tạo nhanh selectedClinicId khi có employeeProfile (trước khi fetch clinics) để kích hoạt query sớm
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

  // Lọc danh sách theo tên khách hoặc mã khách (case-insensitive, trim)
  const filteredAppointments = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return appointments;
    return appointments.filter((a) => {
      const name = a.customer?.fullName?.toLowerCase() || "";
      const code = a.customer?.customerCode?.toLowerCase() || "";
      return name.includes(kw) || code.includes(kw);
    });
  }, [appointments, search]);

  // ✅ Handle Confirm - Xác nhận lịch hẹn
  const confirmMutation = useMutation({
    mutationFn: async (appointment: AppointmentWithIncludes) => {
      const res = await fetch(`/api/appointments/${appointment.id}/confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedById: employeeProfile?.id }),
      });
      if (!res.ok)
        throw new Error(
          (await res.json()).error || "Xác nhận lịch hẹn thất bại"
        );
      return (await res.json()) as AppointmentWithIncludes;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<AppointmentWithIncludes[]>(
        ["appointments-daily", dateStr, activeClinicScope],
        (old) =>
          old ? old.map((a) => (a.id === updated.id ? updated : a)) : [updated]
      );
      toast.success(`Đã xác nhận lịch hẹn cho ${updated.customer?.fullName}!`);
    },
    onError: (e: unknown) => {
      toast.error(
        e instanceof Error ? e.message : "Xác nhận lịch hẹn thất bại"
      );
    },
  });
  const handleConfirm = (appointment: AppointmentWithIncludes) =>
    confirmMutation.mutate(appointment);

  // ✅ Handle No Show - Đánh dấu không đến
  const noShowMutation = useMutation({
    mutationFn: async (appointment: AppointmentWithIncludes) => {
      const res = await fetch(`/api/appointments/${appointment.id}/no-show`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedById: employeeProfile?.id }),
      });
      if (!res.ok)
        throw new Error(
          (await res.json()).error || "Đánh dấu không đến thất bại"
        );
      return (await res.json()) as AppointmentWithIncludes;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<AppointmentWithIncludes[]>(
        ["appointments-daily", dateStr, activeClinicScope],
        (old) =>
          old ? old.map((a) => (a.id === updated.id ? updated : a)) : [updated]
      );
      toast.success(`Đã đánh dấu không đến cho ${updated.customer?.fullName}!`);
    },
    onError: (e: unknown) =>
      toast.error(
        e instanceof Error ? e.message : "Đánh dấu không đến thất bại"
      ),
  });
  const handleNoShow = (appointment: AppointmentWithIncludes) =>
    noShowMutation.mutate(appointment);

  // Handle Check-in
  const checkInMutation = useMutation({
    mutationFn: async (appointment: AppointmentWithIncludes) => {
      const res = await fetch(`/api/appointments/${appointment.id}/checkin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedById: employeeProfile?.id }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Check-in thất bại");
      return (await res.json()) as AppointmentWithIncludes;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<AppointmentWithIncludes[]>(
        ["appointments-daily", dateStr, activeClinicScope],
        (old) =>
          old ? old.map((a) => (a.id === updated.id ? updated : a)) : [updated]
      );
      toast.success(`Đã check-in cho ${updated.customer?.fullName}!`);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Check-in thất bại"),
  });
  const handleCheckIn = (appointment: AppointmentWithIncludes) =>
    checkInMutation.mutate(appointment);

  // Handle Check-out
  const checkOutMutation = useMutation({
    mutationFn: async (appointment: AppointmentWithIncludes) => {
      const res = await fetch(`/api/appointments/${appointment.id}/checkout`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedById: employeeProfile?.id }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Check-out thất bại");
      return (await res.json()) as AppointmentWithIncludes;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<AppointmentWithIncludes[]>(
        ["appointments-daily", dateStr, activeClinicScope],
        (old) =>
          old ? old.map((a) => (a.id === updated.id ? updated : a)) : [updated]
      );
      toast.success(`Đã check-out cho ${updated.customer?.fullName}!`);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Check-out thất bại"),
  });
  const handleCheckOut = (appointment: AppointmentWithIncludes) =>
    checkOutMutation.mutate(appointment);

  // Handle Edit
  const handleEdit = async (appt: AppointmentWithIncludes) => {
    try {
      const res = await fetch(`/api/appointments/${appt.id}`);

      if (!res.ok) {
        throw new Error("Không thể tải thông tin lịch hẹn");
      }

      const freshData = await res.json();

      setModal({
        open: true,
        mode: "edit",
        data: {
          ...freshData,
          appointmentDateTime: freshData.appointmentDateTime
            ? dayjs(freshData.appointmentDateTime)
            : undefined,
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to fetch fresh appointment data:", error);
      toast.error(errorMessage);

      setModal({
        open: true,
        mode: "edit",
        data: {
          ...appt,
          appointmentDateTime: appt.appointmentDateTime
            ? dayjs(appt.appointmentDateTime).toDate()
            : undefined,
        },
      });
    }
  };

  // Handle Delete
  const handleDelete = async (appt: AppointmentWithIncludes) => {
    const confirmed = window.confirm(
      `Bạn chắc chắn muốn xóa lịch hẹn của "${
        appt.customer?.fullName
      }" vào ${formatDateTimeVN(appt.appointmentDateTime)}?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/appointments/${appt.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Xóa lịch hẹn thất bại");
      }

      const result = await res.json();
      toast.success(result.message || "Đã xóa lịch hẹn thành công!");

      refetchAppointments();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Delete appointment error:", error);
      toast.error(errorMessage);
    }
  };

  // Handle Modal Submit
  const handleFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      if (
        values.appointmentDateTime &&
        typeof values.appointmentDateTime === "object" &&
        "$d" in values.appointmentDateTime
      ) {
        const dateValue = values.appointmentDateTime as { $d: Date };
        values.appointmentDateTime = toISOStringVN(dateValue.$d);
      }

      const isEdit = modal.mode === "edit";
      const url = isEdit
        ? `/api/appointments/${modal.data?.id}`
        : "/api/appointments";
      const method = isEdit ? "PUT" : "POST";

      const payload: Partial<Appointment> = {
        ...values,
        updatedById: employeeProfile?.id,
      };

      if (!isEdit) {
        payload.createdById = employeeProfile?.id;
        if (employeeProfile?.role === "admin") {
          if (selectedClinicId) payload.clinicId = selectedClinicId;
        } else {
          payload.clinicId = employeeProfile?.clinicId || "";
        }
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          isEdit
            ? "Cập nhật lịch hẹn thành công!"
            : "Đã tạo lịch hẹn thành công!"
        );
        setModal({ open: false, mode: "add" });
        refetchAppointments();
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

  if (
    (appointmentsLoading || appointmentsFetching) &&
    appointments.length === 0
  ) {
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
            <Title
              level={4}
              style={{
                margin: 0,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span>📅 Lịch hẹn - {getDateLabel()}</span>
              {appointmentsFetching && !appointmentsLoading && (
                <span style={{ fontSize: 12, color: "#999" }}>
                  Đang cập nhật…
                </span>
              )}
            </Title>
            <Typography.Text type="secondary">
              {selectedDate.format("dddd, DD/MM/YYYY")}
            </Typography.Text>
          </Col>

          <Col>
            <Row gutter={8} align="middle" wrap={false}>
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
                  {" "}
                  {/* ✅ THAY Button.Group bằng Space.Compact */}
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
              {/* Ô search đã chuyển xuống header bảng */}
            </Row>
          </Col>
        </Row>

        {/* Admin clinic tabs */}
        {employeeProfile?.role === "admin" && (
          <div style={{ marginBottom: 16 }}>
            <Tabs
              size="small"
              activeKey={selectedClinicId}
              onChange={(key) => {
                setSelectedClinicId(key);
                // Query refetch auto via key change; force refetch for immediacy
                refetchAppointments();
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
                {appointments.length}
              </Typography.Title>
              <Typography.Text type="secondary">Tổng lịch hẹn</Typography.Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Typography.Title
                level={3}
                style={{ margin: 0, color: "#52c41a" }}
              >
                {appointments.filter((a) => a.checkInTime).length}
              </Typography.Title>
              <Typography.Text type="secondary">Đã check-in</Typography.Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Typography.Title
                level={3}
                style={{ margin: 0, color: "#faad14" }}
              >
                {
                  appointments.filter((a) => a.checkInTime && !a.checkOutTime)
                    .length
                }
              </Typography.Title>
              <Typography.Text type="secondary">Đang khám</Typography.Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Typography.Title
                level={3}
                style={{ margin: 0, color: "#ff4d4f" }}
              >
                {
                  appointments.filter(
                    (a) =>
                      !a.checkInTime &&
                      dayjs(a.appointmentDateTime).isBefore(dayjs())
                  ).length
                }
              </Typography.Title>
              <Typography.Text type="secondary">
                Không đến (quá giờ)
              </Typography.Text>
            </Card>
          </Col>
        </Row>

        {/* Header tùy chỉnh: tiêu đề + search + add */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <Typography.Title level={5} style={{ margin: 0 }}>
            {filteredAppointments.length}/{appointments.length} lịch hẹn trong
            ngày
          </Typography.Title>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Input.Search
              allowClear
              placeholder="Tìm tên hoặc mã KH"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={(v) => setSearch(v)}
              style={{ width: 240 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                setModal({
                  open: true,
                  mode: "add",
                  data: {
                    appointmentDateTime: selectedDate
                      .hour(9)
                      .minute(0)
                      .toDate(),
                  },
                })
              }
            >
              Thêm lịch hẹn
            </Button>
          </div>
        </div>

        {/* ✅ Bảng lịch hẹn */}
        <AppointmentTable
          data={filteredAppointments}
          loading={appointmentsLoading || appointmentsFetching}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showHeader={false}
          showCheckInOut={true}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onConfirm={handleConfirm}
          onNoShow={handleNoShow}
        />
      </Card>

      {/* Modal */}
      <AppointmentModal
        open={modal.open}
        mode={modal.mode}
        data={modal.data}
        onCancel={() => setModal({ open: false, mode: "add" })}
        onFinish={handleFinish}
        loading={loading}
        dentists={allEmployees}
      />
    </div>
  );
}
