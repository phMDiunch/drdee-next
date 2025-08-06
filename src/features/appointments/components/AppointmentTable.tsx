// src/features/appointments/components/AppointmentTable.tsx
"use client";
import {
  Table,
  Tag,
  Space,
  Button,
  Typography,
  Tooltip,
  Popconfirm,
} from "antd";
import type { Key } from "antd/es/table/interface";
import {
  PlusOutlined,
  LoginOutlined,
  LogoutOutlined,
  CheckOutlined,
  CloseOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import type { Appointment } from "../type";
import { BRANCHES } from "@/constants";
import { APPOINTMENT_STATUS_OPTIONS } from "../constants";
import dayjs from "dayjs";
import Link from "next/link";
import { useMemo } from "react";

const { Title } = Typography;

// Kiểu dữ liệu nhận vào giờ đã bao gồm object con
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

type Props = {
  data: AppointmentWithIncludes[];
  loading: boolean;
  total?: number; // Optional cho customer detail page
  page?: number; // Optional cho customer detail page
  pageSize?: number; // Optional cho customer detail page
  onEdit: (appt: AppointmentWithIncludes) => void;
  onDelete: (appt: AppointmentWithIncludes) => void;
  onPageChange?: (page: number, pageSize: number) => void; // Optional
  hideCustomerColumn?: boolean;
  // Thêm props như ConsultedServiceTable
  onAdd?: () => void;
  showHeader?: boolean; // Có hiển thị header và nút Add không
  title?: string; // Title tùy chỉnh
  // ✅ PROPS CŨ
  onCheckIn?: (appt: AppointmentWithIncludes) => void | Promise<void>;
  onCheckOut?: (appt: AppointmentWithIncludes) => void | Promise<void>;
  showCheckInOut?: boolean; // Có hiển thị nút check-in/out không
  // ✅ PROPS MỚI CHO WORKFLOW
  onConfirm?: (appt: AppointmentWithIncludes) => void | Promise<void>;
  onNoShow?: (appt: AppointmentWithIncludes) => void | Promise<void>;
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
  // ✅ PROPS CŨ
  onCheckIn,
  onCheckOut,
  showCheckInOut = false,
  // ✅ PROPS MỚI CHO WORKFLOW
  onConfirm,
  onNoShow,
}: Props) {
  console.log("AppointmentTable data:", data);

  // ✅ Tự động tạo filter bác sĩ từ dữ liệu appointments
  const doctorFilters = useMemo(() => {
    const doctors = new Map<string, string>();
    data.forEach((appointment) => {
      if (appointment.primaryDentist) {
        doctors.set(
          appointment.primaryDentist.id,
          appointment.primaryDentist.fullName
        );
      }
      if (appointment.secondaryDentist) {
        doctors.set(
          appointment.secondaryDentist.id,
          appointment.secondaryDentist.fullName
        );
      }
    });
    return Array.from(doctors.entries()).map(([id, name]) => ({
      text: name,
      value: id,
    }));
  }, [data]);

  // ✅ HELPER FUNCTIONS - CẬP NHẬT THEO WORKFLOW MỚI
  const canCheckIn = (appointment: Appointment) => {
    // ✅ Show check-in cho appointments hôm nay && chưa có checkInTime
    const isToday = dayjs(appointment.appointmentDateTime).isSame(
      dayjs(),
      "day"
    );
    return isToday && !appointment.checkInTime;
  };

  const canCheckOut = (appointment: Appointment) => {
    // ✅ Show check-out khi: Ngày hôm nay && có checkInTime && chưa có checkOutTime
    const isToday = dayjs(appointment.appointmentDateTime).isSame(
      dayjs(),
      "day"
    );
    return isToday && appointment.checkInTime && !appointment.checkOutTime;
  };

  // ✅ THÊM: Helper functions cho workflow mới
  const canConfirm = (appointment: Appointment) => {
    // ✅ Show confirm khi: Status "Chờ xác nhận" hoặc "Chưa đến" && ngày mai trở đi
    const isFuture = dayjs(appointment.appointmentDateTime).isAfter(
      dayjs(),
      "day"
    );
    return (
      (appointment.status === "Chờ xác nhận" ||
        appointment.status === "Chưa đến") &&
      isFuture
    );
  };

  const canMarkNoShow = (appointment: Appointment) => {
    // ✅ Show "Không đến" khi:
    // - Ngày hôm nay && sau 5PM && status "Đã xác nhận"
    // - HOẶC ngày quá khứ && status "Đã xác nhận" (manual cleanup)
    const isToday = dayjs(appointment.appointmentDateTime).isSame(
      dayjs(),
      "day"
    );
    const isPast = dayjs(appointment.appointmentDateTime).isBefore(
      dayjs(),
      "day"
    );
    const isAfter5PM = dayjs().hour() >= 17;

    return (
      appointment.status === "Đã xác nhận" &&
      ((isToday && isAfter5PM) || isPast)
    );
  };

  const columns = [
    // ✅ THÊM CỘT MÃ KHÁCH HÀNG
    {
      title: "Mã KH",
      dataIndex: ["customer", "customerCode"],
      key: "customerCode",
      width: 100,
      render: (customerCode: string | null) => customerCode || "-",
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (
        customer: {
          fullName: string;
          id?: string;
          customerCode?: string;
          phone?: string | null;
        },
        record: AppointmentWithIncludes
      ) => {
        const customerId = customer?.id || record.customerId;
        const phone = customer?.phone || record.customer?.phone;

        const customerInfo = (
          <div>
            <div>{customer?.fullName || "-"}</div>
            {phone && (
              <Tooltip title={phone} placement="top">
                <div
                  style={{
                    fontSize: "14px",
                    color: "#1890ff",
                    marginTop: "2px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <PhoneOutlined />
                </div>
              </Tooltip>
            )}
          </div>
        );

        return customerId ? (
          <Link href={`/customers/${customerId}`} style={{ color: "#1890ff" }}>
            {customerInfo}
          </Link>
        ) : (
          customerInfo
        );
      },
    },
    {
      title: "Thời gian hẹn",
      dataIndex: "appointmentDateTime",
      key: "appointmentDateTime",
      sorter: (a: AppointmentWithIncludes, b: AppointmentWithIncludes) =>
        dayjs(a.appointmentDateTime).unix() -
        dayjs(b.appointmentDateTime).unix(),
      defaultSortOrder: "ascend" as const,
      render: (v: string | Date) =>
        v ? dayjs(v).format("HH:mm DD/MM/YYYY") : "",
    },

    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      render: (duration: number) => `${duration} phút`,
    },
    {
      title: "Bác sĩ chính",
      dataIndex: "primaryDentist",
      key: "primaryDentist",
      filters: doctorFilters,
      onFilter: (value: boolean | Key, record: AppointmentWithIncludes) =>
        record.primaryDentistId === String(value),
      sorter: (a: AppointmentWithIncludes, b: AppointmentWithIncludes) =>
        (a.primaryDentist?.fullName || "").localeCompare(
          b.primaryDentist?.fullName || ""
        ),
      render: (dentist: { fullName: string }) => dentist?.fullName || "-",
    },
    {
      title: "Bác sĩ phụ",
      dataIndex: "secondaryDentist",
      key: "secondaryDentist",
      sorter: (a: AppointmentWithIncludes, b: AppointmentWithIncludes) =>
        (a.secondaryDentist?.fullName || "").localeCompare(
          b.secondaryDentist?.fullName || ""
        ),
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
      filters: APPOINTMENT_STATUS_OPTIONS.map((status) => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value: boolean | Key, record: AppointmentWithIncludes) =>
        record.status === String(value),
      sorter: (a: AppointmentWithIncludes, b: AppointmentWithIncludes) => {
        // Sắp xếp theo thứ tự ưu tiên của trạng thái
        const statusOrder = [
          "Chờ xác nhận",
          "Đã xác nhận",
          "Đã đến",
          "Không đến",
          "Đã hủy",
        ];
        const aIndex = statusOrder.indexOf(a.status);
        const bIndex = statusOrder.indexOf(b.status);
        return aIndex - bIndex;
      },
      render: (v: string) => {
        const status = APPOINTMENT_STATUS_OPTIONS.find(
          (opt) => opt.value === v
        );
        return <Tag color={status?.color}>{status?.label || v}</Tag>;
      },
    },
    // ✅ THÊM CỘT CHECK-IN/OUT TIME
    ...(showCheckInOut
      ? [
          {
            title: "Check-in",
            dataIndex: "checkInTime",
            key: "checkInTime",
            render: (v: string | Date) =>
              v ? dayjs(v).format("HH:mm DD/MM") : "-",
          },
          {
            title: "Check-out",
            dataIndex: "checkOutTime",
            key: "checkOutTime",
            render: (v: string | Date) =>
              v ? dayjs(v).format("HH:mm DD/MM") : "-",
          },
        ]
      : []),
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
      render: (_: unknown, record: AppointmentWithIncludes) => {
        // ✅ KIỂM TRA LỊCH TRONG QUÁ KHỨ
        const isPastAppointment = dayjs(record.appointmentDateTime).isBefore(
          dayjs(),
          "day"
        );
        const isCheckedIn = !!record.checkInTime;
        const isLocked = isPastAppointment || isCheckedIn;

        const getTooltipTitle = () => {
          if (isPastAppointment) {
            return "Không thể sửa/xóa lịch trong quá khứ";
          }
          if (isCheckedIn) {
            return "Không thể sửa/xóa lịch đã check-in";
          }
          return "";
        };

        return (
          <Space>
            {/* ✅ BUTTON XÁC NHẬN - Show khi status = "Chờ xác nhận" */}
            {onConfirm && canConfirm(record) && (
              <Popconfirm
                title="Xác nhận lịch hẹn"
                description={`Xác nhận lịch hẹn cho khách hàng ${record.customer?.fullName}?`}
                onConfirm={() => onConfirm(record)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Tooltip title="Xác nhận lịch hẹn với khách hàng">
                  <Button size="small" type="primary" icon={<CheckOutlined />}>
                    Xác nhận
                  </Button>
                </Tooltip>
              </Popconfirm>
            )}

            {/* ✅ BUTTON CHECK-IN - Chỉ show khi status = "Đã xác nhận" && chưa check-in */}
            {showCheckInOut && onCheckIn && canCheckIn(record) && (
              <Popconfirm
                title="Xác nhận check-in"
                description={`Xác nhận check-in cho khách hàng ${record.customer?.fullName}?`}
                onConfirm={() => onCheckIn(record)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Tooltip title="Check-in khách hàng">
                  <Button size="small" type="primary" icon={<LoginOutlined />}>
                    Check-in
                  </Button>
                </Tooltip>
              </Popconfirm>
            )}

            {/* ✅ BUTTON CHECK-OUT - Show khi đã check-in && chưa check-out */}
            {showCheckInOut && onCheckOut && canCheckOut(record) && (
              <Popconfirm
                title="Xác nhận check-out"
                description={`Xác nhận check-out cho khách hàng ${record.customer?.fullName}?`}
                onConfirm={() => onCheckOut(record)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Tooltip title="Check-out khách hàng">
                  <Button size="small" icon={<LogoutOutlined />}>
                    Check-out
                  </Button>
                </Tooltip>
              </Popconfirm>
            )}

            {/* ✅ BUTTON KHÔNG ĐẾN - Show khi đã xác nhận && qua giờ hẹn && chưa check-in */}
            {onNoShow && canMarkNoShow(record) && (
              <Popconfirm
                title="Đánh dấu không đến"
                description={`Xác nhận khách hàng ${record.customer?.fullName} không đến khám?`}
                onConfirm={() => onNoShow(record)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Tooltip title="Đánh dấu khách hàng không đến">
                  <Button size="small" danger icon={<CloseOutlined />}>
                    Không đến
                  </Button>
                </Tooltip>
              </Popconfirm>
            )}

            {/* ✅ DISABLE SỬA/XÓA CHO LỊCH QUÁ KHỨ */}
            <Tooltip title={getTooltipTitle()}>
              {/* Nút Sửa */}
              <Button
                size="small"
                onClick={() => onEdit(record)}
                disabled={isLocked}
              >
                Sửa
              </Button>
            </Tooltip>

            <Tooltip title={getTooltipTitle()}>
              {/* Nút Xóa */}
              <Button
                size="small"
                danger
                onClick={() => onDelete(record)}
                disabled={isLocked}
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
