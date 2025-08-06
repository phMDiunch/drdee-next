// src/features/appointments/pages/DailyAppointmentsPage.tsx // ✅ SỬA COMMENT
"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, Button, Typography, Row, Col, DatePicker, Space } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
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
  const [appointments, setAppointments] = useState<AppointmentWithIncludes[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // Modal states
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Partial<AppointmentWithIncludes>;
  }>({ open: false, mode: "add" });

  const { employeeProfile, activeEmployees } = useAppStore();

  // ✅ UPDATED: Sử dụng tất cả employees thay vì filter theo chức danh
  const allEmployees = activeEmployees; // Không filter gì cả

  // ✅ Fetch lịch hẹn theo ngày được chọn
  const fetchAppointmentsByDate = useCallback(
    async (date: dayjs.Dayjs) => {
      try {
        setLoading(true);
        const dateStr = date.format("YYYY-MM-DD");

        const res = await fetch(
          `/api/appointments/today?date=${dateStr}&clinicId=${employeeProfile?.clinicId}`
        );

        if (!res.ok) {
          throw new Error("Không thể tải danh sách lịch hẹn");
        }

        const data = await res.json();
        setAppointments(data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Fetch appointments error:", error);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [employeeProfile?.clinicId]
  );

  useEffect(() => {
    if (employeeProfile?.clinicId) {
      fetchAppointmentsByDate(selectedDate);
    }
  }, [employeeProfile?.clinicId, selectedDate, fetchAppointmentsByDate]);

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

  // ✅ Handle Confirm - Xác nhận lịch hẹn
  const handleConfirm = async (appointment: AppointmentWithIncludes) => {
    try {
      const res = await fetch(`/api/appointments/${appointment.id}/confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updatedById: employeeProfile?.id,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Xác nhận lịch hẹn thất bại");
      }

      const updatedAppointment = await res.json();

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointment.id ? updatedAppointment : appt
        )
      );

      toast.success(
        `Đã xác nhận lịch hẹn cho ${appointment.customer?.fullName}!`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  // ✅ Handle No Show - Đánh dấu không đến
  const handleNoShow = async (appointment: AppointmentWithIncludes) => {
    try {
      const res = await fetch(`/api/appointments/${appointment.id}/no-show`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updatedById: employeeProfile?.id,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Đánh dấu không đến thất bại");
      }

      const updatedAppointment = await res.json();

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointment.id ? updatedAppointment : appt
        )
      );

      toast.success(
        `Đã đánh dấu không đến cho ${appointment.customer?.fullName}!`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  // Handle Check-in
  const handleCheckIn = async (appointment: AppointmentWithIncludes) => {
    try {
      const res = await fetch(`/api/appointments/${appointment.id}/checkin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updatedById: employeeProfile?.id,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Check-in thất bại");
      }

      const updatedAppointment = await res.json();

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointment.id ? updatedAppointment : appt
        )
      );

      toast.success(`Đã check-in cho ${appointment.customer?.fullName}!`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  // Handle Check-out
  const handleCheckOut = async (appointment: AppointmentWithIncludes) => {
    try {
      const res = await fetch(`/api/appointments/${appointment.id}/checkout`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updatedById: employeeProfile?.id,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Check-out thất bại");
      }

      const updatedAppointment = await res.json();

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointment.id ? updatedAppointment : appt
        )
      );

      toast.success(`Đã check-out cho ${appointment.customer?.fullName}!`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

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

      fetchAppointmentsByDate(selectedDate);
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
        payload.clinicId = employeeProfile?.clinicId || "";
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
        fetchAppointmentsByDate(selectedDate);
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

  if (loading && appointments.length === 0) {
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
              📅 Lịch hẹn - {getDateLabel()}
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
            </Row>
          </Col>
        </Row>

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
              <Typography.Text type="secondary">Chưa đến</Typography.Text>
            </Card>
          </Col>
        </Row>

        {/* ✅ Bảng lịch hẹn */}
        <AppointmentTable
          data={appointments}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showHeader={true}
          title={`${appointments.length} lịch hẹn trong ngày`}
          showCheckInOut={true}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onConfirm={handleConfirm} // ✅ THÊM PROP MỚI
          onNoShow={handleNoShow} // ✅ THÊM PROP MỚI
          employees={allEmployees} // ✅ TRUYỀN EMPLOYEES
          onAdd={() =>
            setModal({
              open: true,
              mode: "add",
              data: {
                appointmentDateTime: selectedDate.hour(9).minute(0).toDate(), // ✅ CONVERT TO DATE
              },
            })
          }
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
