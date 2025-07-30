// src/features/appointments/components/AppointmentTable.tsx
"use client";
import { Table, Tag, Space, Button, Typography, Tooltip } from "antd";
import { PlusOutlined, LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import type { Appointment } from "../type";
import { BRANCHES } from "@/constants";
import { formatDateTimeVN } from "@/utils/date";
import {
  APPOINTMENT_STATUS_OPTIONS,
  CHECKIN_ALLOWED_STATUSES,
} from "../constants";
import dayjs from "dayjs";

const { Title } = Typography;

// Kiểu dữ liệu nhận vào giờ đã bao gồm object con
type AppointmentWithIncludes = Appointment & {
  customer: { fullName: string };
  primaryDentist: { fullName: string };
};

type Props = {
  data: AppointmentWithIncludes[];
  loading: boolean;
  total?: number; // Optional cho customer detail page
  page?: number; // Optional cho customer detail page
  pageSize?: number; // Optional cho customer detail page
  onEdit: (appt: Appointment) => void;
  onDelete: (appt: Appointment) => void;
  onPageChange?: (page: number, pageSize: number) => void; // Optional
  hideCustomerColumn?: boolean;
  // Thêm props như ConsultedServiceTable
  onAdd?: () => void;
  showHeader?: boolean; // Có hiển thị header và nút Add không
  title?: string; // Title tùy chỉnh
  // ✅ THÊM PROPS MỚI
  onCheckIn?: (appt: Appointment) => void;
  onCheckOut?: (appt: Appointment) => void;
  showCheckInOut?: boolean; // Có hiển thị nút check-in/out không
};

export default function AppointmentTable({
  data,
  loading,
  total,
  page,
  pageSize,
  onEdit,
  onDelete,
  onPageChange,
  hideCustomerColumn = false,
  onAdd,
  showHeader = false, // Default false để không ảnh hưởng existing code
  title = "Danh sách lịch hẹn",
  // ✅ PROPS MỚI
  onCheckIn,
  onCheckOut,
  showCheckInOut = false,
}: Props) {
  console.log("AppointmentTable data:", data);

  // ✅ HELPER FUNCTIONS
  const canCheckIn = (appointment: Appointment) => {
    return (
      CHECKIN_ALLOWED_STATUSES.includes(appointment.status) &&
      !appointment.checkInTime
    );
  };

  const canCheckOut = (appointment: Appointment) => {
    return appointment.checkInTime && !appointment.checkOutTime;
  };

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (customer: { fullName: string }) => customer?.fullName || "-",
    },
    {
      title: "Thời gian hẹn",
      dataIndex: "appointmentDateTime",
      key: "appointmentDateTime",
      render: (v: string) => (v ? formatDateTimeVN(v, "HH:mm DD/MM/YYYY") : ""),
    },
    // ✅ THÊM CỘT CHECK-IN/OUT TIME
    ...(showCheckInOut
      ? [
          {
            title: "Check-in",
            dataIndex: "checkInTime",
            key: "checkInTime",
            render: (v: string) =>
              v ? formatDateTimeVN(v, "HH:mm DD/MM") : "-",
          },
          {
            title: "Check-out",
            dataIndex: "checkOutTime",
            key: "checkOutTime",
            render: (v: string) =>
              v ? formatDateTimeVN(v, "HH:mm DD/MM") : "-",
          },
        ]
      : []),
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => `${duration} phút`,
    },
    {
      title: "Bác sĩ chính",
      dataIndex: "primaryDentist",
      key: "primaryDentist",
      render: (dentist: { fullName: string }) => dentist?.fullName || "-",
    },
    {
      title: "Bác sĩ phụ",
      dataIndex: "secondaryDentist",
      key: "secondaryDentist",
      render: (dentist: { fullName: string } | null) =>
        dentist?.fullName || "-",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => notes || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: string) => {
        const status = APPOINTMENT_STATUS_OPTIONS.find(
          (opt) => opt.value === v
        );
        return <Tag color={status?.color}>{status?.label || v}</Tag>;
      },
    },
    {
      title: "Chi nhánh",
      dataIndex: "clinicId",
      key: "clinicId",
      render: (v: string) => {
        const branch = BRANCHES.find((b) => b.value === v);
        return branch ? <Tag color={branch.color}>{branch.label}</Tag> : null;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Appointment) => {
        // ✅ KIỂM TRA LỊCH TRONG QUÁ KHỨ
        const isPastAppointment = dayjs(record.appointmentDateTime).isBefore(
          dayjs(),
          "day"
        );

        return (
          <Space>
            {/* Check-in/out buttons */}
            {showCheckInOut && onCheckIn && canCheckIn(record) && (
              <Tooltip title="Check-in khách hàng">
                <Button
                  size="small"
                  type="primary"
                  icon={<LoginOutlined />}
                  onClick={() => onCheckIn(record)}
                >
                  Check-in
                </Button>
              </Tooltip>
            )}

            {showCheckInOut && onCheckOut && canCheckOut(record) && (
              <Tooltip title="Check-out khách hàng">
                <Button
                  size="small"
                  icon={<LogoutOutlined />}
                  onClick={() => onCheckOut(record)}
                >
                  Check-out
                </Button>
              </Tooltip>
            )}

            {/* ✅ DISABLE SỬA/XÓA CHO LỊCH QUÁ KHỨ */}
            <Tooltip
              title={
                isPastAppointment ? "Không thể sửa lịch trong quá khứ" : ""
              }
            >
              <Button
                size="small"
                onClick={() => onEdit(record)}
                disabled={isPastAppointment}
              >
                Sửa
              </Button>
            </Tooltip>

            <Tooltip
              title={
                isPastAppointment ? "Không thể xóa lịch trong quá khứ" : ""
              }
            >
              <Button
                size="small"
                danger
                onClick={() => onDelete(record)}
                disabled={isPastAppointment}
              >
                Xóa
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const showColumns = hideCustomerColumn
    ? columns.filter((col) => col.key !== "customer")
    : columns;

  return (
    <div>
      {/* Header giống như ConsultedServiceTable */}
      {showHeader && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            {title}
          </Title>
          {onAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              Thêm lịch hẹn
            </Button>
          )}
        </div>
      )}

      <Table
        columns={showColumns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        bordered
        size="small" // Giống ConsultedServiceTable
        pagination={
          total !== undefined && page !== undefined && pageSize !== undefined
            ? {
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                onChange: onPageChange,
              }
            : false // Không có pagination cho customer detail page
        }
      />
    </div>
  );
}
