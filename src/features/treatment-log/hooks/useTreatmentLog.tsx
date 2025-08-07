// src/features/treatment-log/hooks/useTreatmentLog.tsx
import { useState, useCallback } from "react";
import type { AppointmentForTreatment } from "../type";

export function useTreatmentLog() {
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentForTreatment[]>(
    []
  );

  // Lấy danh sách appointments đã check-in của customer
  const fetchCheckedInAppointments = useCallback(async (customerId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/appointments/checked-in?customerId=${customerId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      setAppointments(data);
      return data;
    } catch (error) {
      console.error("Error fetching checked-in appointments:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo treatment log mới
  const createTreatmentLog = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        const response = await fetch("/api/treatment-logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to create treatment log");
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("Error creating treatment log:", error);
        throw error;
      }
    },
    []
  );

  // Cập nhật treatment log
  const updateTreatmentLog = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      try {
        const response = await fetch(`/api/treatment-logs/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to update treatment log");
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("Error updating treatment log:", error);
        throw error;
      }
    },
    []
  );

  // Xóa treatment log
  const deleteTreatmentLog = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/treatment-logs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete treatment log");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting treatment log:", error);
      throw error;
    }
  }, []);

  return {
    loading,
    appointments,
    fetchCheckedInAppointments,
    createTreatmentLog,
    updateTreatmentLog,
    deleteTreatmentLog,
  };
}
