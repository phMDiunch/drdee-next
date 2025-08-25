// src/features/dashboard/components/DashboardMonthlyRevenue.tsx
"use client";

import { Card, Table, Tag, Divider } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useDashboardMonthlyRevenue } from "../hooks/useDashboardMonthlyRevenue";
import { DashboardConsultedService } from "../type";
import {
  SERVICE_STATUS_COLORS,
  TREATMENT_STATUS_COLORS,
  EMPTY_STATE_MESSAGE,
} from "../constants";
import { formatCurrency, formatDateVN } from "@/utils/date";
import Link from "next/link";
import dayjs from "dayjs";

export const DashboardMonthlyRevenue = () => {
  const { data, isLoading: loading, error } = useDashboardMonthlyRevenue();

  const services = data?.services || [];

  // Group services by date
  const groupedServices = services.reduce((acc, service) => {
    const date = dayjs(service.consultationDate).format("YYYY-MM-DD");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(service);
    return acc;
  }, {} as Record<string, DashboardConsultedService[]>);

  const columns: ColumnsType<DashboardConsultedService> = [
    // Khách hàng (clickable link như trong ConsultedServiceTable)
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (customer: {
        fullName: string;
        id?: string;
        customerCode: string;
      }) => (
        <div>
          <Link
            href={`/customers/${customer.id}`}
            style={{ color: "#1890ff", textDecoration: "none" }}
          >
            {customer.fullName}
          </Link>
          <br />
          <Tag color="default">{customer.customerCode}</Tag>
        </div>
      ),
    },
    // Tên dịch vụ
    {
      title: "Tên dịch vụ",
      dataIndex: ["dentalService", "name"],
      key: "serviceName",
      render: (serviceName: string) => serviceName || "-",
    },
    // Thành tiền (Final Price)
    {
      title: "Thành tiền",
      dataIndex: "finalPrice",
      key: "finalPrice",
      align: "right",
      render: (finalPrice: number) => (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>
          {formatCurrency(finalPrice)}
        </span>
      ),
      sorter: (a, b) => (a.finalPrice || 0) - (b.finalPrice || 0),
    },
    // Bác sĩ tư vấn
    {
      title: "BS tư vấn",
      dataIndex: ["consultingDoctor", "fullName"],
      key: "consultingDoctor",
      render: (doctorName: string) => doctorName || "-",
    },
    // Sale tư vấn
    {
      title: "Sale tư vấn",
      dataIndex: ["consultingSale", "fullName"],
      key: "consultingSale",
      render: (saleName: string) => saleName || "-",
    },
    // Trạng thái dịch vụ
    {
      title: "Trạng thái DV",
      dataIndex: "serviceStatus",
      key: "serviceStatus",
      render: (status: string) => (
        <Tag color={(SERVICE_STATUS_COLORS as any)[status] || "default"}>
          {status}
        </Tag>
      ),
    },
    // Trạng thái điều trị
    {
      title: "Trạng thái ĐT",
      dataIndex: "treatmentStatus",
      key: "treatmentStatus",
      render: (status: string) => (
        <Tag color={(TREATMENT_STATUS_COLORS as any)[status] || "default"}>
          {status}
        </Tag>
      ),
    },
  ];

  if (error) {
    return (
      <Card title="Doanh số tư vấn tháng này">
        <div style={{ color: "red" }}>Lỗi: {error.message}</div>
      </Card>
    );
  }

  return (
    <Card
      title="💰 Doanh số tư vấn tháng này"
      size="small"
      style={{ marginBottom: 24 }}
    >
      {Object.keys(groupedServices).length === 0 ? (
        <div>{EMPTY_STATE_MESSAGE}</div>
      ) : (
        <div>
          {Object.entries(groupedServices)
            .sort(([a], [b]) => b.localeCompare(a)) // Sort dates descending
            .map(([date, dateServices]) => {
              const dailyTotal = dateServices.reduce(
                (sum, service) => sum + (service.finalPrice || 0),
                0
              );

              return (
                <div key={date} style={{ marginBottom: 24 }}>
                  <Divider orientation="left">
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                      {formatDateVN(date)} - Tổng: {formatCurrency(dailyTotal)}
                    </span>
                  </Divider>
                  <Table
                    columns={columns}
                    dataSource={dateServices}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ x: 1000 }}
                    loading={loading}
                  />
                </div>
              );
            })}
        </div>
      )}
    </Card>
  );
};
