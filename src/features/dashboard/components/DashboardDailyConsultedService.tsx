// src/features/dashboard/components/DashboardDailyConsultedService.tsx
"use client";

import { Card, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useDashboardConsultedServices } from "../hooks/useDashboardConsultedServices";
import { DashboardConsultedService } from "../type";
import {
  SERVICE_STATUS_COLORS,
  TREATMENT_STATUS_COLORS,
  EMPTY_STATE_MESSAGE,
} from "../constants";
import { formatCurrency } from "@/utils/date";
import Link from "next/link";

export const DashboardDailyConsultedService = () => {
  const { consultedServices, loading, error } = useDashboardConsultedServices();

  const columns: ColumnsType<DashboardConsultedService> = [
    // ✅ Khách hàng (clickable link như trong ConsultedServiceTable)
    {
      title: "Khách hàng",
      key: "customer",
      width: 160,
      render: (_, record) => {
        const customerInfo = (
          <div>
            <div style={{ fontWeight: 500 }}>{record.customer.fullName}</div>
            <div style={{ marginTop: 4 }}>
              <Tag
                color="blue"
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  padding: "2px 8px",
                }}
              >
                {record.customer.customerCode || "N/A"}
              </Tag>
            </div>
          </div>
        );

        return record.customer.id ? (
          <Link
            href={`/customers/${record.customer.id}`}
            style={{ color: "#1890ff" }}
          >
            {customerInfo}
          </Link>
        ) : (
          customerInfo
        );
      },
    },
    // ✅ Tên dịch vụ (theo pattern của ConsultedServiceTable)
    {
      title: "Tên dịch vụ",
      dataIndex: "consultedServiceName",
      key: "serviceName",
      width: 220,
      ellipsis: true,
    },
    // ✅ Đơn giá (theo pattern của ConsultedServiceTable)
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      align: "right",
      render: (price: number) => formatCurrency(price),
    },
    // ✅ Số lượng
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      align: "center",
    },
    // ✅ Thành tiền (theo pattern của ConsultedServiceTable)
    {
      title: "Thành tiền",
      dataIndex: "finalPrice",
      key: "finalPrice",
      width: 120,
      align: "right",
      render: (price: number) => formatCurrency(price),
    },
    // ✅ Bác sĩ tư vấn (theo pattern của ConsultedServiceTable)
    {
      title: "Bác sĩ tư vấn",
      key: "consultingDoctor",
      width: 140,
      render: (_, record) => (
        <span>{record.consultingDoctor?.fullName || "-"}</span>
      ),
    },
    // ✅ Sale tư vấn (theo pattern của ConsultedServiceTable)
    {
      title: "Sale tư vấn",
      key: "consultingSale",
      width: 140,
      render: (_, record) => (
        <span>{record.consultingSale?.fullName || "-"}</span>
      ),
    },
    // ✅ Trạng thái dịch vụ
    {
      title: "Trạng thái DV",
      dataIndex: "serviceStatus",
      key: "serviceStatus",
      width: 110,
      render: (status: string) => (
        <Tag
          color={
            SERVICE_STATUS_COLORS[
              status as keyof typeof SERVICE_STATUS_COLORS
            ] || "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    // ✅ Trạng thái điều trị
    {
      title: "Trạng thái ĐT",
      dataIndex: "treatmentStatus",
      key: "treatmentStatus",
      width: 130,
      render: (status: string) => (
        <Tag
          color={
            TREATMENT_STATUS_COLORS[
              status as keyof typeof TREATMENT_STATUS_COLORS
            ] || "default"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  if (error) {
    return (
      <Card title="Dịch vụ bạn tư vấn hôm qua">
        <div style={{ color: "red" }}>Lỗi: {error}</div>
      </Card>
    );
  }

  return (
    <Card title="Dịch vụ bạn tư vấn hôm qua" style={{ marginBottom: 24 }}>
      <Table
        columns={columns}
        dataSource={consultedServices}
        loading={loading}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: EMPTY_STATE_MESSAGE,
        }}
        scroll={{ x: 1100 }}
        size="small"
      />
    </Card>
  );
};
