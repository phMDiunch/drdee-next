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
import { useEmployeeProfile } from "@/features/auth/hooks/useAuth";
import { APPOINTMENT_STATUS_OPTIONS } from "@/features/appointments/constants";

// ==== CHÚ Ý: đã loại bỏ các import không dùng, như message (antd) ====

// ---- Component chính ----
export default function AppointmentListPage() {
  // State chính
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Appointment;
  }>({ open: false, mode: "add" });

  // Dữ liệu phụ trợ
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Table paging/search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // Chế độ xem: Lịch / Danh sách
  const [view, setView] = useState<"table" | "calendar">("calendar");

  const { employee } = useEmployeeProfile();

  // ==== Tối ưu: gom các hàm fetch vào useCallback để tránh re-create khi re-render ====
  const fetchAppointments = useCallback(
    async (pg = page, ps = pageSize, s = search) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pg + "",
          pageSize: ps + "",
        });
        if (s) params.set("search", s.trim());
        const res = await fetch(`/api/appointments?${params.toString()}`);
        const json = await res.json();
        setAppointments(json.appointments || json);
        setTotal(json.total);
      } catch {
        toast.error("Không thể tải danh sách lịch hẹn");
      }
      setLoading(false);
    },
    [page, pageSize, search]
  );

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers?page=1&pageSize=1000");
      const json = await res.json();
      setCustomers(json.customers || []);
    } catch {}
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/employees");
      const json = await res.json();
      setEmployees(json.employees || json);
    } catch {}
  }, []);

  // ---- Effect load dữ liệu ----
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchCustomers();
    fetchEmployees();
  }, [fetchCustomers, fetchEmployees]);

  // ---- Hàm xử lý phân trang ----
  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
  };

  // ---- Hàm xử lý submit (thêm/sửa) ----
  const handleFinish = async (values: any) => {
    try {
      // Chuẩn hóa time
      if (values.appointmentDateTime?.$d)
        values.appointmentDateTime = dayjs(
          values.appointmentDateTime
        ).toISOString();

      if (modal.mode === "add") {
        values.clinicId = employee?.clinicId;
        values.createdById = employee?.id;
        values.updatedById = employee?.id;

        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (res.ok) {
          toast.success(`Đã tạo lịch hẹn cho khách hàng thành công!`);
          setModal({ ...modal, open: false });
          fetchAppointments(1, pageSize, search);
        } else {
          const { error } = await res.json();
          toast.error(error || "Lỗi không xác định");
        }
      } else if (modal.mode === "edit" && modal.data) {
        values.updatedById = employee?.id;
        const res = await fetch(`/api/appointments/${modal.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (res.ok) {
          toast.success("Cập nhật lịch hẹn thành công!");
          setModal({ ...modal, open: false });
          fetchAppointments(page, pageSize, search);
        } else {
          const { error } = await res.json();
          toast.error(error || "Lỗi cập nhật");
        }
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  // ---- Hàm mở modal edit ----
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

  // ---- Mapping events cho calendar ----
  const events = appointments?.map((a) => ({
    id: a.id,
    title: `${
      customers.find((c) => c.id === a.customerId)?.fullName || "Khách"
    } - ${employees.find((e) => e.id === a.primaryDentistId)?.fullName || ""}`,
    start: a.appointmentDateTime,
    end: a.appointmentDateTime, // Nếu có duration, tính thêm ở đây
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
          customers={customers}
          employees={employees}
        />
      ) : (
        <Spin spinning={loading}>
          <AppointmentCalendar
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
        customers={customers}
        employees={employees}
      />
    </div>
  );
}
