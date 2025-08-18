// src/features/appointments/pages/AppointmentListPage.tsx
"use client";
import { useState, useCallback } from "react";
import { Spin, Typography } from "antd";
import AppointmentModal from "@/features/appointments/components/AppointmentModal";
import AppointmentCalendar from "@/features/appointments/components/AppointmentCalendar";
import { Appointment } from "@/features/appointments/type";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore";
import { APPOINTMENT_STATUS_OPTIONS } from "@/features/appointments/constants";
import { toISOStringVN } from "@/utils/date";
import { useQueryClient } from "@tanstack/react-query";

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

export default function AppointmentListPage() {
  const [loading, setLoading] = useState(false); // general action state
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Partial<AppointmentWithIncludes>;
  }>({ open: false, mode: "add" });
  const { employeeProfile, activeEmployees } = useAppStore();
  const queryClient = useQueryClient();

  const allEmployees = activeEmployees; // dùng trực tiếp, không cần memo

  const invalidateRangeQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ["appointments-range"],
      exact: false,
    });
  };

  // Fetch events for calendar using React Query cache (range-based key)
  interface CalendarFetchInfo {
    startStr: string;
    endStr: string;
  }
  interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    backgroundColor: string;
    borderColor: string;
    extendedProps: AppointmentWithIncludes;
  }
  const handleFetchEvents = useCallback(
    (
      fetchInfo: CalendarFetchInfo,
      successCallback: (events: CalendarEvent[]) => void,
      failureCallback: (error: unknown) => void
    ) => {
      if (!employeeProfile) {
        successCallback([]);
        return;
      }
      const clinicIdParam =
        employeeProfile.role !== "admin"
          ? employeeProfile.clinicId || ""
          : undefined;
      const queryKey = [
        "appointments-range",
        fetchInfo.startStr,
        fetchInfo.endStr,
        clinicIdParam || "all",
      ];
      queryClient
        .fetchQuery({
          queryKey,
          queryFn: async () => {
            const params = new URLSearchParams({
              from: fetchInfo.startStr,
              to: fetchInfo.endStr,
            });
            if (clinicIdParam) params.set("clinicId", clinicIdParam);
            const res = await fetch(`/api/appointments?${params.toString()}`);
            if (!res.ok) throw new Error("Fetch appointments failed");
            return (await res.json()) as AppointmentWithIncludes[];
          },
        })
        .then((data) => {
          const mappedEvents = (data || []).map((a) => {
            const start = dayjs(a.appointmentDateTime);
            const end = start.add(a.duration || 30, "minute");
            return {
              id: a.id,
              title: `${a.customer?.fullName || "Khách lạ"} - ${
                a.primaryDentist?.fullName || "Chưa có BS"
              }`,
              start: start.toISOString(),
              end: end.toISOString(),
              backgroundColor:
                APPOINTMENT_STATUS_OPTIONS.find((s) => s.value === a.status)
                  ?.color || "#1890ff",
              borderColor: "#fff",
              extendedProps: a,
            };
          });
          successCallback(mappedEvents);
        })
        .catch((error) => {
          toast.error("Không thể tải lịch hẹn");
          failureCallback(error);
        });
    },
    [employeeProfile, queryClient]
  );

  // TODO: define a stronger form value type; using unknown map temporarily
  const handleFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const rawDate = values.appointmentDateTime as unknown;
      const isDayjsLike = (d: unknown): d is { $d: Date } =>
        !!d &&
        typeof d === "object" &&
        "$d" in d &&
        (d as { $d: unknown }).$d instanceof Date;
      if (isDayjsLike(rawDate)) {
        values.appointmentDateTime = toISOStringVN(rawDate.$d);
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
        if (employeeProfile?.clinicId) {
          payload.clinicId = employeeProfile.clinicId;
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
        setModal({ ...modal, open: false });
        invalidateRangeQueries();
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
          ...freshData, // Dùng fresh data thay vì stale data
          appointmentDateTime: freshData.appointmentDateTime
            ? dayjs(freshData.appointmentDateTime)
            : undefined,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fetch lỗi";
      console.error("Failed to fetch fresh appointment data:", err);
      toast.error(message);

      // Fallback to stale data nếu fetch thất bại
      setModal({
        open: true,
        mode: "edit",
        data: {
          ...appt,
          appointmentDateTime: appt.appointmentDateTime || undefined,
        },
      });
    }
  };

  // (Đã dọn: handler xóa bảng cũ)

  // Removed table workflow handlers; this page is now calendar-only.

  return (
    <div style={{ padding: 24 }}>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Quản lý lịch hẹn
          </Title>
          <div style={{ display: "flex", gap: 8 }}>
            {/* Place filters here (status, dentist, etc.) - currently none */}
          </div>
        </div>

        <Spin spinning={loading}>
          <AppointmentCalendar
            fetchEvents={handleFetchEvents}
            onCreate={(slot) =>
              setModal({
                open: true,
                mode: "add",
                data: { appointmentDateTime: new Date(slot.start) },
              })
            }
            onEdit={handleEdit}
            onChangeTime={async ({
              id,
              start,
              appointmentDateTime,
              duration,
            }) => {
              try {
                const updateData: Record<string, unknown> = {
                  appointmentDateTime: toISOStringVN(
                    appointmentDateTime || start
                  ),
                  updatedById: employeeProfile?.id,
                };
                if (duration !== undefined) updateData.duration = duration;
                const res = await fetch(`/api/appointments/${id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updateData),
                });
                if (!res.ok) {
                  const errorData = await res.json();
                  throw new Error(errorData.error || "Cập nhật thất bại");
                }
                toast.success("Đã cập nhật thời gian lịch hẹn!");
                invalidateRangeQueries();
              } catch (err) {
                const message =
                  err instanceof Error ? err.message : "Cập nhật thất bại";
                toast.error(message);
                throw err; // để calendar revert
              }
            }}
            onDelete={async (id) => {
              try {
                const res = await fetch(`/api/appointments/${id}`, {
                  method: "DELETE",
                });
                if (!res.ok) throw new Error("Xóa thất bại");
                toast.success("Đã xoá lịch hẹn!");
                invalidateRangeQueries();
              } catch (err) {
                const message =
                  err instanceof Error ? err.message : "Xóa thất bại";
                toast.error(message);
              }
            }}
          />
        </Spin>
      </div>

      <AppointmentModal
        open={modal.open}
        mode={modal.mode}
        data={modal.data}
        onCancel={() => setModal({ ...modal, open: false })}
        onFinish={handleFinish}
        loading={loading}
        dentists={allEmployees}
      />
    </div>
  );
}
