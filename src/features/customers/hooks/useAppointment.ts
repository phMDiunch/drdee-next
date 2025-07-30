// src/features/customers/hooks/useAppointment.ts
import { useState } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useAppStore } from "@/stores/useAppStore";
import { formatDateTimeVN } from "@/utils/date";
import type { Appointment } from "@/features/appointments/type";

export function useAppointment(customer: any, setCustomer: any) {
  const [appointmentModal, setAppointmentModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Partial<Appointment>;
  }>({ open: false, mode: "add" });

  const { employeeProfile } = useAppStore();

  const handleAddAppointment = () => {
    setAppointmentModal({
      open: true,
      mode: "add",
      data: {
        customerId: customer.id,
        customer: {
          id: customer.id,
          fullName: customer.fullName,
          phone: customer.phone,
        },
      },
    });
  };

  const handleEditAppointment = (appointment: any) => {
    setAppointmentModal({
      open: true,
      mode: "edit",
      data: {
        ...appointment,
        customer: {
          id: customer.id,
          fullName: customer.fullName,
          phone: customer.phone,
        },
      },
    });
  };

  const handleFinishAppointment = async (values: any) => {
    try {
      const isEdit = appointmentModal.mode === "edit";
      const url = isEdit
        ? `/api/appointments/${appointmentModal.data?.id}`
        : "/api/appointments";
      const method = isEdit ? "PUT" : "POST";

      if (values.appointmentDateTime?.$d) {
        values.appointmentDateTime = dayjs(
          values.appointmentDateTime
        ).toISOString();
      }

      const payload = {
        ...values,
        customerId: customer.id,
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

      setCustomer((prev: any) => {
        const updated = { ...prev };
        if (isEdit) {
          updated.appointments = prev.appointments.map((appt: any) =>
            appt.id === appointmentModal.data?.id ? responseData : appt
          );
        } else {
          updated.appointments = [responseData, ...prev.appointments];
        }
        return updated;
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

      setCustomer((prev: any) => ({
        ...prev,
        appointments: prev.appointments.filter(
          (appt: any) => appt.id !== appointment.id
        ),
      }));

      toast.success("Đã xóa lịch hẹn thành công!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    appointmentModal,
    setAppointmentModal,
    handleAddAppointment,
    handleEditAppointment,
    handleFinishAppointment,
    handleDeleteAppointment,
  };
}
