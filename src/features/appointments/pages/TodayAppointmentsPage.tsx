// src/features/appointments/pages/TodayAppointmentsPage.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, message } from "antd";
import { toast } from "react-toastify";
import AppointmentTable from "../components/AppointmentTable";
import AppointmentModal from "../components/AppointmentModal";
import { useAppStore } from "@/stores/useAppStore";
import type { Appointment } from "../type";
import { formatDateTimeVN } from "@/utils/date";
import dayjs from "dayjs";

type AppointmentWithIncludes = Appointment & {
  customer: { id: string; fullName: string; phone: string };
  primaryDentist: { id: string; fullName: string };
  secondaryDentist?: { id: string; fullName: string } | null;
};

export default function TodayAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithIncludes[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // ✅ THÊM STATES CHO MODAL VÀ DENTISTS
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Partial<AppointmentWithIncludes>;
  }>({ open: false, mode: "add" });

  const { employeeProfile, activeEmployees, fetchActiveEmployees } =
    useAppStore();

  // ✅ THÊM - Lọc dentists và nurses
  const dentistsAndNurses = activeEmployees.filter(
    (emp) => emp.title === "Bác sĩ" || emp.title === "Điều dưỡng"
  );

  // Fetch lịch hẹn hôm nay
  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const today = dayjs().format("YYYY-MM-DD");

      const res = await fetch(
        `/api/appointments/today?date=${today}&clinicId=${employeeProfile?.clinicId}`
      );

      if (!res.ok) {
        throw new Error("Không thể tải danh sách lịch hẹn");
      }

      const data = await res.json();
      setAppointments(data);
    } catch (error: any) {
      console.error("Fetch today appointments error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeProfile?.clinicId) {
      fetchActiveEmployees(employeeProfile); // ✅ THÊM - Fetch dentists
      fetchTodayAppointments();
    }
  }, [employeeProfile?.clinicId, fetchActiveEmployees]);

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

      // Cập nhật local state
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

      // Cập nhật local state
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

  // ✅ IMPLEMENT EDIT - Copy từ AppointmentListPage
  const handleEdit = async (appt: AppointmentWithIncludes) => {
    try {
      // Fetch fresh data from API trước khi mở modal
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

      // Fallback to stale data nếu fetch thất bại
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

  // ✅ IMPLEMENT DELETE - Copy từ AppointmentListPage
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

      // Refresh data
      fetchTodayAppointments();
    } catch (error: any) {
      console.error("Delete appointment error:", error);
      toast.error(error.message);
    }
  };

  // ✅ IMPLEMENT MODAL SUBMIT - Copy từ AppointmentListPage
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
        fetchTodayAppointments(); // Refresh data
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

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <AppointmentTable
          data={appointments}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showHeader={true}
          title={`Lịch hẹn hôm nay (${dayjs().format("DD/MM/YYYY")})`}
          showCheckInOut={true}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      </Card>

      {/* ✅ THÊM MODAL */}
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
