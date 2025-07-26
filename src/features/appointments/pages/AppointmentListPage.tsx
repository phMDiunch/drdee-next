// src/features/appointments/pages/AppointmentListPage.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { Button, Col, Input, Row, Segmented, Spin } from "antd";
import AppointmentTable from "@/features/appointments/components/AppointmentTable";
import AppointmentModal from "@/features/appointments/components/AppointmentModal";
import AppointmentCalendar from "@/features/appointments/components/AppointmentCalendar";
import { Appointment } from "@/features/appointments/type";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore";
import { APPOINTMENT_STATUS_OPTIONS } from "@/features/appointments/constants";

// Định nghĩa kiểu cho Lịch hẹn đã bao gồm dữ liệu gộp
type AppointmentWithIncludes = Appointment & {
  customer: { fullName: string };
  primaryDentist: { fullName: string };
  secondaryDentist?: { fullName: string } | null;
};

export default function AppointmentListPage() {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Partial<Appointment>;
  }>({ open: false, mode: "add" });

  // State cho filter/phân trang (sẽ dùng trong tương lai)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(1000); // Tạm thời lấy nhiều
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"calendar" | "table">("calendar");

  // Lấy state và action từ Zustand store cho các dropdown
  const { employeeProfile } = useAppStore();
  const activeEmployees = useAppStore((state) => state.activeEmployees);
  const fetchActiveEmployees = useAppStore(
    (state) => state.fetchActiveEmployees
  );

  const handleFetchEvents = useCallback(
    (
      fetchInfo: { startStr: string; endStr: string },
      successCallback: (events: any[]) => void,
      failureCallback: (error: any) => void
    ) => {
      setLoading(true);
      const params = new URLSearchParams({
        from: fetchInfo.startStr,
        to: fetchInfo.endStr,
        // clinicId, doctorId có thể thêm ở đây
      });

      fetch(`/api/appointments?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          // Mapping dữ liệu trả về thành định dạng event của FullCalendar
          const mappedEvents = (data || []).map(
            (a: AppointmentWithIncludes) => ({
              id: a.id,
              title: `${a.customer?.fullName || "Khách lạ"} - ${
                a.primaryDentist?.fullName || "Chưa có BS"
              }`,
              start: a.appointmentDateTime,
              end: a.appointmentDateTime,
              backgroundColor:
                APPOINTMENT_STATUS_OPTIONS.find((s) => s.value === a.status)
                  ?.color || "#1890ff",
              borderColor: "#fff",
              extendedProps: { ...a },
            })
          );
          successCallback(mappedEvents);
        })
        .catch((error) => {
          toast.error("Không thể tải lịch hẹn");
          failureCallback(error);
        })
        .finally(() => setLoading(false));
    },
    []
  ); // Thêm các dependency nếu có filter động

  const [calendarKey, setCalendarKey] = useState(1);

  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
  };

  const handleFinish = async (values: any) => {
    try {
      if (values.appointmentDateTime?.$d)
        values.appointmentDateTime = dayjs(
          values.appointmentDateTime
        ).toISOString();

      if (modal.mode === "add") {
        values.clinicId = employeeProfile?.clinicId;
        values.createdById = employeeProfile?.id;
        values.updatedById = employeeProfile?.id;

        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (res.ok) {
          toast.success(`Đã tạo lịch hẹn thành công!`);
          setModal({ ...modal, open: false });
          // fetchAppointments();
          setCalendarKey((prev) => prev + 1);
        } else {
          const { error } = await res.json();
          toast.error(error || "Lỗi không xác định");
        }
      } else if (modal.mode === "edit" && modal.data) {
        values.updatedById = employeeProfile?.id;
        const res = await fetch(`/api/appointments/${modal.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (res.ok) {
          toast.success("Cập nhật lịch hẹn thành công!");
          setModal({ ...modal, open: false });
          // fetchAppointments();
          setCalendarKey((prev) => prev + 1);
        } else {
          const { error } = await res.json();
          toast.error(error || "Lỗi cập nhật");
        }
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleEdit = (appt: Appointment) => {
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
  };

  // ---- Mapping events cho calendar (ĐÃ SỬA) ----
  const events = appointments?.map((a) => ({
    id: a.id,
    title: `${a.customer?.fullName || "Khách lạ"} - ${
      a.primaryDentist?.fullName || "Chưa có BS"
    }`,
    start: a.appointmentDateTime,
    end: a.appointmentDateTime,
    backgroundColor:
      APPOINTMENT_STATUS_OPTIONS.find((s) => s.value === a.status)?.color ||
      "#1890ff",
    borderColor: "#fff",
    extendedProps: { ...a },
  }));

  // ---- Chức năng calendar nâng cao (thêm/sửa/xoá/di chuyển lịch) ----
  return (
    <div style={{ padding: 24 }}>
      <Row align="middle" gutter={16} style={{ marginBottom: 16 }}>
        <Col flex={1}>
          <h2 style={{ margin: 0 }}>Quản lý lịch hẹn</h2>
        </Col>
        <Col>
          <Segmented
            options={[
              { label: "Lịch", value: "calendar" },
              { label: "Danh sách", value: "table" },
            ]}
            value={view}
            onChange={(val) => setView(val as any)}
          />
        </Col>
        <Col>
          <Input.Search
            allowClear
            placeholder="Tìm kiếm lịch hẹn..."
            style={{ width: 240 }}
            onSearch={(v) => {
              setPage(1);
              setSearch(v.trim());
            }}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={() => setModal({ open: true, mode: "add", data: {} })}
          >
            Thêm lịch hẹn
          </Button>
        </Col>
      </Row>

      {view === "table" ? (
        <AppointmentTable
          data={appointments}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          onEdit={handleEdit}
          onPageChange={handlePageChange}
        />
      ) : (
        <Spin spinning={loading}>
          <AppointmentCalendar
            key={calendarKey} // <-- Thêm key vào đây
            fetchEvents={handleFetchEvents}
            events={events}
            onCreate={(slot) =>
              setModal({
                open: true,
                mode: "add",
                data: { appointmentDateTime: dayjs(slot.start) },
              })
            }
            onEdit={handleEdit}
            onChangeTime={async ({ id, start }) => {
              await fetch(`/api/appointments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ appointmentDateTime: start }),
              });
              fetchAppointments();
              toast.success("Đã cập nhật thời gian lịch hẹn!");
            }}
            onDelete={async (id) => {
              await fetch(`/api/appointments/${id}`, { method: "DELETE" });
              fetchAppointments();
              toast.success("Đã xoá lịch hẹn!");
            }}
          />
        </Spin>
      )}
      <AppointmentModal
        open={modal.open}
        mode={modal.mode}
        data={modal.data}
        onCancel={() => setModal({ ...modal, open: false })}
        onFinish={handleFinish}
        loading={loading}
        employees={activeEmployees}
      />
    </div>
  );
}
