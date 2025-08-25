// src/features/dashboard/components/DashboardDailyAppointment.tsx
"use client";

import { Card, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useDashboardAppointments } from "../hooks/useDashboardAppointments";
import { DashboardAppointment } from "../type";
import { APPOINTMENT_STATUS_COLORS, EMPTY_STATE_MESSAGE } from "../constants";
import Link from "next/link";
import dayjs from "dayjs";

export const DashboardDailyAppointment = () => {
  const {
    data: appointments = [],
    isLoading: loading,
    error,
  } = useDashboardAppointments();

  const columns: ColumnsType<DashboardAppointment> = [
    // ✅ Mã khách hàng (theo pattern của AppointmentTable)
    {
      title: "Mã KH",
      dataIndex: ["customer", "customerCode"],
      key: "customerCode",
      render: (customerCode: string | null) => customerCode || "-",
    },
    // ✅ Khách hàng (clickable link như trong AppointmentTable) - width giảm
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (customer: {
        fullName: string;
        id?: string;
        customerCode?: string;
        phone?: string | null;
      }) => {
        const customerInfo = (
          <div>
            <div style={{ fontWeight: 500 }}>{customer?.fullName || "-"}</div>
            {customer?.customerCode && (
              <div style={{ fontSize: 12, color: "#666" }}>
                Mã: {customer.customerCode}
              </div>
            )}
          </div>
        );

        return customer?.id ? (
          <Link href={`/customers/${customer.id}`} style={{ color: "#1890ff" }}>
            {customerInfo}
          </Link>
        ) : (
          customerInfo
        );
      },
    },
    // ✅ Thời gian hẹn - chỉ hiển thị giờ + sorting
    {
      title: "Thời gian hẹn",
      dataIndex: "appointmentDateTime",
      key: "appointmentDateTime",

      sorter: (a: DashboardAppointment, b: DashboardAppointment) =>
        dayjs(a.appointmentDateTime).unix() -
        dayjs(b.appointmentDateTime).unix(),
      defaultSortOrder: "ascend" as const,
      render: (dateTime: string, record: DashboardAppointment) => {
        if (!dateTime) return "";
        const timeStr = dayjs(dateTime).format("HH:mm"); // ✅ Chỉ hiển thị giờ
        const duration = record.duration;
        return typeof duration === "number" && duration > 0 ? (
          <Tooltip title={`Thời lượng: ${duration} phút`}>{timeStr}</Tooltip>
        ) : (
          timeStr
        );
      },
    },
    // ✅ Bác sĩ chính
    {
      title: "Bác sĩ chính",
      dataIndex: "primaryDentist",
      key: "primaryDentist",

      render: (dentist: { fullName: string }) => dentist?.fullName || "-",
    },
    // ✅ Bác sĩ phụ
    {
      title: "Bác sĩ phụ",
      dataIndex: "secondaryDentist",
      key: "secondaryDentist",

      render: (dentist: { fullName: string } | null) =>
        dentist?.fullName || "-",
    },
    // ✅ Trạng thái - thêm sorting
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",

      sorter: (a: DashboardAppointment, b: DashboardAppointment) => {
        // ✅ Sắp xếp theo thứ tự ưu tiên của trạng thái
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
      render: (status: string) => (
        <Tag
          color={
            APPOINTMENT_STATUS_COLORS[
              status as keyof typeof APPOINTMENT_STATUS_COLORS
            ] || "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    // ✅ Check-in - thêm sorting
    {
      title: "Check-in",
      dataIndex: "checkInTime",
      key: "checkInTime",

      sorter: (a: DashboardAppointment, b: DashboardAppointment) => {
        if (!a.checkInTime && !b.checkInTime) return 0;
        if (!a.checkInTime) return 1; // null values last
        if (!b.checkInTime) return -1;
        return dayjs(a.checkInTime).unix() - dayjs(b.checkInTime).unix();
      },
      render: (checkInTime: string | null) =>
        checkInTime ? dayjs(checkInTime).format("HH:mm") : "-",
    },
    // ✅ Check-out - thêm sorting
    {
      title: "Check-out",
      dataIndex: "checkOutTime",
      key: "checkOutTime",

      sorter: (a: DashboardAppointment, b: DashboardAppointment) => {
        if (!a.checkOutTime && !b.checkOutTime) return 0;
        if (!a.checkOutTime) return 1; // null values last
        if (!b.checkOutTime) return -1;
        return dayjs(a.checkOutTime).unix() - dayjs(b.checkOutTime).unix();
      },
      render: (checkOutTime: string | null) =>
        checkOutTime ? dayjs(checkOutTime).format("HH:mm") : "-",
    },
    // ✅ Ghi chú
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      //   ellipsis: true,
      render: (notes: string) => notes || "-",
    },
  ];

  if (error) {
    return (
      <Card title="Lịch hẹn trong ngày của bạn">
        <div style={{ color: "red" }}>Lỗi: {error.message}</div>
      </Card>
    );
  }

  return (
    <Card title="Lịch hẹn trong ngày của bạn" style={{ marginBottom: 24 }}>
      <Table
        columns={columns}
        dataSource={appointments}
        loading={loading}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: EMPTY_STATE_MESSAGE,
        }}
        scroll={{ x: 1000 }}
        size="small"
        // ✅ THÊM: Row styling để làm mờ những khách đã check-out
        onRow={(record: DashboardAppointment) => ({
          style: record.checkOutTime
            ? {
                backgroundColor: "#f5f5f5",
                opacity: 0.6,
              }
            : undefined,
        })}
      />
    </Card>
  );
};
