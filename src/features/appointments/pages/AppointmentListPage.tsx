// src/features/appointments/pages/AppointmentListPage.tsx
"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Button, Col, Input, Row, Segmented, Spin } from "antd";
import AppointmentTable from "@/features/appointments/components/AppointmentTable";
import AppointmentModal from "@/features/appointments/components/AppointmentModal";
import AppointmentCalendar from "@/features/appointments/components/AppointmentCalendar";
import { Appointment } from "@/features/appointments/type";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore";
import { APPOINTMENT_STATUS_OPTIONS } from "@/features/appointments/constants";

type AppointmentWithIncludes = Appointment & {
  customer: { id: string; fullName: string; phone: string };
  primaryDentist: { id: string; fullName: string };
  secondaryDentist?: { id: string; fullName: string } | null;
};

export default function AppointmentListPage() {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Partial<AppointmentWithIncludes>;
  }>({ open: false, mode: "add" });
  const [view, setView] = useState<"calendar" | "table">("table");
  const [calendarKey, setCalendarKey] = useState(1);

  const [tableAppointments, setTableAppointments] = useState<
    AppointmentWithIncludes[]
  >([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(20);
  const [tableTotal, setTableTotal] = useState(0);
  const [tableSearch, setTableSearch] = useState("");

  const { employeeProfile, activeEmployees, fetchActiveEmployees } =
    useAppStore();

  // TỐI ƯU: Lọc danh sách Bác sĩ và Điều dưỡng từ state chung
  const dentistsAndNurses = useMemo(() => {
    return activeEmployees.filter(
      (emp) => emp.title === "Bác sĩ" || emp.title === "Điều dưỡng"
    );
  }, [activeEmployees]);

  console.log("1. Dữ liệu 'dentistsAndNurses':", dentistsAndNurses);

  const fetchTableAppointments = useCallback(async () => {
    if (!employeeProfile) return;
    setTableLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(tablePage),
        pageSize: String(tablePageSize),
        search: tableSearch.trim(),
      });
      if (employeeProfile.role !== "admin") {
        params.set("clinicId", employeeProfile.clinicId || "");
      }
      const res = await fetch(`/api/appointments?${params.toString()}`);
      const data = await res.json();
      setTableAppointments(data.appointments || []);
      setTableTotal(data.total || 0);
    } catch {
      toast.error("Không thể tải danh sách lịch hẹn");
    }
    setTableLoading(false);
  }, [tablePage, tablePageSize, tableSearch, employeeProfile]);

  // SỬA LỖI: Xử lý dữ liệu trả về từ fetch
  const handleFetchEvents = useCallback(
    (
      fetchInfo: { startStr: string; endStr: string },
      successCallback: (events: any[]) => void,
      failureCallback: (error: any) => void
    ) => {
      if (!employeeProfile) return;
      setLoading(true);
      const params = new URLSearchParams({
        from: fetchInfo.startStr,
        to: fetchInfo.endStr,
      });
      if (employeeProfile.role !== "admin") {
        params.set("clinicId", employeeProfile.clinicId || "");
      }
      fetch(`/api/appointments?${params.toString()}`)
        .then((res) => res.json())
        .then((data: AppointmentWithIncludes[]) => {
          const mappedEvents = (data || []).map((a) => ({
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
            extendedProps: a,
          }));
          successCallback(mappedEvents);
        })
        .catch((error) => {
          toast.error("Không thể tải lịch hẹn");
          failureCallback(error);
        })
        .finally(() => setLoading(false));
    },
    [employeeProfile]
  );

  // TỐI ƯU: Gộp 2 useEffect thành 1
  useEffect(() => {
    if (employeeProfile) {
      fetchActiveEmployees(employeeProfile);
      if (view === "table") {
        fetchTableAppointments();
      }
    }
  }, [fetchActiveEmployees, view, fetchTableAppointments, employeeProfile]);

  const refetchData = () => {
    if (view === "table") {
      fetchTableAppointments();
    } else {
      setCalendarKey((prev) => prev + 1);
    }
  };

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
        setModal({ ...modal, open: false });
        refetchData();
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

  const handleEdit = (appt: AppointmentWithIncludes) => {
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

  const handlePageChange = (p: number, ps: number) => {
    setTablePage(p);
    setTablePageSize(ps);
  };

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
        {view === "table" && (
          <Col>
            <Input.Search
              allowClear
              placeholder="Tìm kiếm..."
              style={{ width: 240 }}
              onSearch={(v) => {
                setTablePage(1);
                setTableSearch(v);
              }}
            />
          </Col>
        )}
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
          data={tableAppointments}
          loading={tableLoading}
          total={tableTotal}
          page={tablePage}
          pageSize={tablePageSize}
          onEdit={handleEdit}
          onPageChange={handlePageChange}
        />
      ) : (
        <Spin spinning={loading}>
          <AppointmentCalendar
            key={calendarKey}
            fetchEvents={handleFetchEvents}
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
              refetchData();
              toast.success("Đã cập nhật thời gian lịch hẹn!");
            }}
            onDelete={async (id) => {
              await fetch(`/api/appointments/${id}`, { method: "DELETE" });
              refetchData();
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
        loading={tableLoading || loading}
        dentists={dentistsAndNurses}
      />
    </div>
  );
}
