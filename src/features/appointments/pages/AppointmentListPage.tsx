// src/features/appointments/pages/AppointmentListPage.tsx
"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Button, Col, Input, Row, Segmented, Spin, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AppointmentTable from "@/features/appointments/components/AppointmentTable";
import AppointmentModal from "@/features/appointments/components/AppointmentModal";
import AppointmentCalendar from "@/features/appointments/components/AppointmentCalendar";
import { Appointment } from "@/features/appointments/type";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore";
import { APPOINTMENT_STATUS_OPTIONS } from "@/features/appointments/constants";
import { formatDateTimeVN } from "@/utils/date";

const { Title } = Typography;

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
          console.log("📊 Raw API data:", data);

          const mappedEvents = (data || []).map((a) => {
            const start = dayjs(a.appointmentDateTime);
            const end = start.add(a.duration || 30, "minute");

            const event = {
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
              extendedProps: a, // Đảm bảo notes có trong đây
            };

            console.log("🗓️ Mapped event:", event);
            return event;
          });

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
        throw new Error("Xóa lịch hẹn thất bại");
      }

      toast.success("Đã xóa lịch hẹn thành công!");
      refetchData();
    } catch (error: any) {
      console.error("Delete appointment error:", error);
      toast.error(error.message);
    }
  };

  const handlePageChange = (p: number, ps: number) => {
    setTablePage(p);
    setTablePageSize(ps);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Chỉ giữ lại phần control và search, bỏ header và nút "Thêm" */}
      <Row align="middle" gutter={16} style={{ marginBottom: 16 }}>
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
      </Row>

      {view === "table" ? (
        <AppointmentTable
          data={tableAppointments}
          loading={tableLoading}
          total={tableTotal}
          page={tablePage}
          pageSize={tablePageSize}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handlePageChange}
          showHeader={true}
          onAdd={() => setModal({ open: true, mode: "add", data: {} })}
          title="Quản lý lịch hẹn"
        />
      ) : (
        <div>
          {/* ✅ DÙNG CHUNG HEADER PATTERN */}
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModal({ open: true, mode: "add", data: {} })}
            >
              Thêm lịch hẹn
            </Button>
          </div>

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
              onChangeTime={async ({
                id,
                start,
                end,
                appointmentDateTime,
                duration,
              }) => {
                try {
                  const updateData: any = {
                    appointmentDateTime: appointmentDateTime || start,
                    updatedById: employeeProfile?.id,
                  };

                  // Nếu có duration mới (từ resize), cập nhật luôn
                  if (duration !== undefined) {
                    updateData.duration = duration;
                  }

                  console.log("📤 Sending update data:", updateData);

                  const res = await fetch(`/api/appointments/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updateData),
                  });

                  console.log("📥 Response status:", res.status);

                  if (!res.ok) {
                    const errorData = await res.json();
                    console.log("❌ Error response:", errorData);
                    throw new Error(errorData.error || "Cập nhật thất bại");
                  }

                  const responseData = await res.json();
                  console.log("✅ Success response:", responseData);

                  toast.success("Đã cập nhật thời gian lịch hẹn!");

                  // Không refetch, để calendar tự cập nhật
                } catch (error: any) {
                  console.error("❌ API update failed:", error);
                  toast.error(error.message);
                  throw error; // Throw để calendar revert
                }
              }}
              onDelete={async (id) => {
                try {
                  const res = await fetch(`/api/appointments/${id}`, {
                    method: "DELETE",
                  });

                  if (!res.ok) {
                    throw new Error("Xóa thất bại");
                  }

                  toast.success("Đã xoá lịch hẹn!");
                  // Calendar sẽ tự refetch sau khi xóa
                } catch (error: any) {
                  toast.error(error.message);
                }
              }}
            />
          </Spin>
        </div>
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
