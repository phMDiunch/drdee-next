// src/features/appointments/pages/DailyAppointmentsPage.tsx // ✅ SỬA COMMENT
"use client";
import { useState, useEffect } from "react";
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
import { formatDateTimeVN } from "@/utils/date";
import dayjs from "dayjs";

const { Title } = Typography;

type AppointmentWithIncludes = Appointment & {
  customer: { id: string; fullName: string; phone: string };
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

  const { employeeProfile, activeEmployees, fetchActiveEmployees } =
    useAppStore();

  // Lọc dentists và nurses
  const dentistsAndNurses = activeEmployees.filter(
    (emp) => emp.title === "Bác sĩ" || emp.title === "Điều dưỡng"
  );

  // ✅ Fetch lịch hẹn theo ngày được chọn
  const fetchAppointmentsByDate = async (date: dayjs.Dayjs) => {
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
    } catch (error: any) {
      console.error("Fetch appointments error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeProfile?.clinicId) {
      fetchActiveEmployees(employeeProfile);
      fetchAppointmentsByDate(selectedDate);
    }
  }, [employeeProfile?.clinicId, fetchActiveEmployees, selectedDate]);

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

  // Handle Check-in
  const handleCheckIn = async (appointment: Appointment) => {
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
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle Check-out
  const handleCheckOut = async (appointment: Appointment) => {
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
    } catch (error: any) {
      toast.error(error.message);
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
    } catch (error: any) {
      console.error("Failed to fetch fresh appointment data:", error);
      toast.error(error.message);

      setModal({
        open: true,
        mode: "edit",
        data: {
          ...appt,
          appointmentDateTime: appt.appointmentDateTime
            ? dayjs(appt.appointmentDateTime)
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
    } catch (error: any) {
      console.error("Delete appointment error:", error);
      toast.error(error.message);
    }
  };

  // Handle Modal Submit
  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      if (values.appointmentDateTime?.$d) {
        values.appointmentDateTime = dayjs(
          values.appointmentDateTime
        ).toISOString();
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
        payload.clinicId = employeeProfile?.clinicId;
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
    } catch (error: any) {
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
          onAdd={() =>
            setModal({
              open: true,
              mode: "add",
              data: {
                appointmentDateTime: selectedDate.hour(9).minute(0), // Default 9:00 AM
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
        dentists={dentistsAndNurses}
      />
    </div>
  );
}
