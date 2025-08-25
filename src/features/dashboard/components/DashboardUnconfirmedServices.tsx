// src/features/dashboard/components/DashboardUnconfirmedServices.tsx
"use client";

import { Card, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useDashboardUnconfirmedServices } from "../hooks/useDashboardUnconfirmedServices";
import { DashboardConsultedService } from "../type";
import {
  SERVICE_STATUS_COLORS,
  TREATMENT_STATUS_COLORS,
  EMPTY_STATE_MESSAGE,
} from "../constants";
import { formatCurrency } from "@/utils/date";
import Link from "next/link";

export const DashboardUnconfirmedServices = () => {
  const {
    data: unconfirmedServices = [],
    isLoading: loading,
    error,
  } = useDashboardUnconfirmedServices();

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

    // ✅ Dịch vụ
    {
      title: "Dịch vụ",
      key: "service",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {record.consultedServiceName}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Đơn vị: {record.consultedServiceUnit || "N/A"}
          </div>
        </div>
      ),
    },

    // ✅ Số lượng
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      width: 60,
      align: "center",
    },

    // ✅ Giá ưu đãi
    {
      title: "Giá ưu đãi",
      dataIndex: "preferentialPrice",
      key: "preferentialPrice",
      width: 120,
      align: "right",
      render: (price: number) => formatCurrency(price),
    },

    // ✅ Thành tiền
    {
      title: "Thành tiền",
      dataIndex: "finalPrice",
      key: "finalPrice",
      width: 120,
      align: "right",
      render: (price: number) => (
        <strong style={{ color: "#d32f2f" }}>{formatCurrency(price)}</strong>
      ),
    },

    // ✅ Trạng thái dịch vụ
    {
      title: "Trạng thái DV",
      dataIndex: "serviceStatus",
      key: "serviceStatus",
      width: 120,
      render: (status: string) => (
        <Tag
          color={
            (SERVICE_STATUS_COLORS as Record<string, string>)[status] ||
            "default"
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
            (TREATMENT_STATUS_COLORS as Record<string, string>)[status] ||
            "default"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  if (error) {
    return (
      <Card title="🦷 Dịch vụ chưa chốt hôm qua">
        <div style={{ textAlign: "center", color: "#ff4d4f", padding: 20 }}>
          Lỗi: {error}
        </div>
      </Card>
    );
  }

  return (
    <Card title="🦷 Dịch vụ chưa chốt hôm qua">
      <Table
        columns={columns}
        dataSource={unconfirmedServices}
        loading={loading}
        rowKey="id"
        size="small"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} dịch vụ`,
        }}
        locale={{
          emptyText: EMPTY_STATE_MESSAGE,
        }}
        scroll={{ x: 800 }}
      />
    </Card>
  );
};
