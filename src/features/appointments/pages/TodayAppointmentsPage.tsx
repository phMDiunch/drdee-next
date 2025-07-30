// src/features/appointments/pages/TodayAppointmentsPage.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, message } from "antd";
import { toast } from "react-toastify";
import AppointmentTable from "../components/AppointmentTable";
import { useAppStore } from "@/stores/useAppStore";
import type { Appointment } from "../type";
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
  const { employeeProfile } = useAppStore();

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
      fetchTodayAppointments();
    }
  }, [employeeProfile?.clinicId]);

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

  const handleEdit = (appointment: Appointment) => {
    // TODO: Implement edit modal
    message.info("Chức năng sửa sẽ được triển khai sau");
  };

  const handleDelete = (appointment: Appointment) => {
    // TODO: Implement delete
    message.info("Chức năng xóa sẽ được triển khai sau");
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
          showCheckInOut={true} // ✅ Hiển thị check-in/out
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      </Card>
    </div>
  );
}
