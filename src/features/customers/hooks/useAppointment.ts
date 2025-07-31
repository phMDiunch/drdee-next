// src/features/customers/hooks/useAppointment.ts
import { useState } from "react";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore";
import type { Customer } from "../type";
import type { Appointment } from "@/features/appointments/type";
import dayjs from "dayjs";
import { formatDateTimeVN } from "@/utils/date"; // ✅ THÊM IMPORT NÀY

export function useAppointment(
  customer: Customer | null,
  setCustomer: (customer: Customer) => void
) {
  const [appointmentModal, setAppointmentModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: any;
  }>({ open: false, mode: "add" });

  const { employeeProfile } = useAppStore();

  // Handle Add Appointment
  const handleAddAppointment = () => {
    setAppointmentModal({
      open: true,
      mode: "add",
      data: {
        customer: customer
          ? {
              id: customer.id,
              fullName: customer.fullName,
              phone: customer.phone,
            }
          : null,
        customerId: customer?.id,
      },
    });
  };

  // Handle Edit Appointment
  const handleEditAppointment = async (appointment: Appointment) => {
    try {
      // Fetch fresh data from API
      const res = await fetch(`/api/appointments/${appointment.id}`);

      if (!res.ok) {
        throw new Error("Không thể tải thông tin lịch hẹn");
      }

      const freshData = await res.json();

      setAppointmentModal({
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

      // Fallback to stale data
      setAppointmentModal({
        open: true,
        mode: "edit",
        data: {
          ...appointment,
          appointmentDateTime: appointment.appointmentDateTime
            ? dayjs(appointment.appointmentDateTime)
            : undefined,
        },
      });
    }
  };

  // Handle Delete Appointment
  const handleDeleteAppointment = async (appointment: Appointment) => {
    const confirmed = window.confirm(
      `Bạn chắc chắn muốn xóa lịch hẹn vào ${formatDateTimeVN(
        appointment.appointmentDateTime
      )}?` // ✅ SỬA: Dùng formatDateTimeVN đã import
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Xóa lịch hẹn thất bại");
      }

      const result = await res.json();
      toast.success(result.message || "Đã xóa lịch hẹn thành công!");

      // Update customer data - remove deleted appointment
      if (customer) {
        const updatedCustomer = {
          ...customer,
          appointments:
            customer.appointments?.filter(
              (appt) => appt.id !== appointment.id
            ) || [],
        };
        setCustomer(updatedCustomer);

        // Refresh customer details
        const refreshRes = await fetch(
          `/api/customers/${customer.id}?includeDetails=true`
        );
        if (refreshRes.ok) {
          const refreshedCustomer = await refreshRes.json();
          setCustomer(refreshedCustomer);
        }
      }
    } catch (error: any) {
      console.error("Delete appointment error:", error);
      toast.error(error.message);
    }
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

      // Update customer data
      if (customer) {
        const updatedCustomer = {
          ...customer,
          appointments:
            customer.appointments?.map((appt) =>
              appt.id === appointment.id ? updatedAppointment : appt
            ) || [],
        };
        setCustomer(updatedCustomer);
      }

      toast.success(
        `Đã check-in cho ${
          appointment.customer?.fullName || customer?.fullName
        }!`
      );
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

      // Update customer data
      if (customer) {
        const updatedCustomer = {
          ...customer,
          appointments:
            customer.appointments?.map((appt) =>
              appt.id === appointment.id ? updatedAppointment : appt
            ) || [],
        };
        setCustomer(updatedCustomer);
      }

      toast.success(
        `Đã check-out cho ${
          appointment.customer?.fullName || customer?.fullName
        }!`
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle Appointment Finish (Create/Update)
  const handleFinishAppointment = async (values: any) => {
    try {
      if (values.appointmentDateTime?.$d) {
        values.appointmentDateTime = dayjs(
          values.appointmentDateTime
        ).toISOString();
      }

      const isEdit = appointmentModal.mode === "edit";
      const url = isEdit
        ? `/api/appointments/${appointmentModal.data?.id}`
        : "/api/appointments";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
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
        const result = await res.json();
        toast.success(
          isEdit
            ? "Cập nhật lịch hẹn thành công!"
            : "Đã tạo lịch hẹn thành công!"
        );

        setAppointmentModal({ open: false, mode: "add" });

        // Update customer data
        if (customer) {
          if (isEdit) {
            // Update existing appointment
            const updatedCustomer = {
              ...customer,
              appointments:
                customer.appointments?.map((appt) =>
                  appt.id === appointmentModal.data?.id ? result : appt
                ) || [],
            };
            setCustomer(updatedCustomer);
          } else {
            // Add new appointment
            const updatedCustomer = {
              ...customer,
              appointments: [...(customer.appointments || []), result],
            };
            setCustomer(updatedCustomer);
          }

          // Refresh customer details
          const refreshRes = await fetch(
            `/api/customers/${customer.id}?includeDetails=true`
          );
          if (refreshRes.ok) {
            const refreshedCustomer = await refreshRes.json();
            setCustomer(refreshedCustomer);
          }
        }
      } else {
        const { error } = await res.json();
        toast.error(error || "Lỗi không xác định");
      }
    } catch (error: any) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return {
    appointmentModal,
    setAppointmentModal,
    handleAddAppointment,
    handleEditAppointment,
    handleDeleteAppointment,
    handleCheckIn,
    handleCheckOut,
    handleFinishAppointment,
  };
}
