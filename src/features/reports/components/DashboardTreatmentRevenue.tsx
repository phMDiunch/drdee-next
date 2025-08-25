import React from "react";
import { Card, Table, Tag, Divider } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  useDashboardTreatmentRevenue,
  TreatmentRevenueData,
} from "../hooks/useDashboardTreatmentRevenue";
import { formatCurrency, formatDateVN } from "@/utils/date";
import Link from "next/link";
import dayjs from "dayjs";

export const DashboardTreatmentRevenue: React.FC = () => {
  const {
    data: treatmentRevenue = [],
    isLoading: loading,
    error,
  } = useDashboardTreatmentRevenue();

  if (error) {
    return (
      <Card title="Doanh thu điều trị tháng này">
        <div style={{ color: "red" }}>Lỗi: {error.message}</div>
      </Card>
    );
  }

  // Group by payment date
  const groupedServices = treatmentRevenue.reduce((acc, service) => {
    const date = dayjs(service.paymentDate).format("YYYY-MM-DD");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(service);
    return acc;
  }, {} as Record<string, TreatmentRevenueData[]>);

  const columns: ColumnsType<TreatmentRevenueData> = [
    // Mã khách hàng
    {
      title: "Mã KH",
      dataIndex: "customerCode",
      key: "customerCode",
      width: 100,
      render: (customerCode: string) => (
        <Tag color="default">{customerCode}</Tag>
      ),
    },
    // Khách hàng (clickable link)
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customer",
      width: 150,
      render: (customerName: string, record: TreatmentRevenueData) => (
        <Link
          href={`/customers/${record.customerId}`}
          style={{ color: "#1890ff", textDecoration: "none" }}
        >
          {customerName}
        </Link>
      ),
    },
    // Tên dịch vụ
    {
      title: "Tên dịch vụ",
      dataIndex: "consultedServiceName",
      key: "serviceName",
      width: 200,
      render: (serviceName: string) => serviceName || "-",
    },
    // Thành tiền
    {
      title: "Thành tiền",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right",
      render: (amount: number) => (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>
          {formatCurrency(amount)}
        </span>
      ),
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
    // Bác sĩ điều trị
    {
      title: "BS điều trị",
      dataIndex: "treatingDoctorName",
      key: "treatingDoctor",
      width: 120,
      render: (doctorName: string) => doctorName || "-",
    },
  ];

  const renderContent = () => {
    if (Object.keys(groupedServices).length === 0) {
      return (
        <div style={{ textAlign: "center", padding: 20 }}>
          Không có dữ liệu doanh thu điều trị
        </div>
      );
    }

    return (
      <div>
        {Object.entries(groupedServices)
          .sort(([a], [b]) => b.localeCompare(a)) // Sort dates descending
          .map(([date, dateServices]) => {
            const dailyTotal = dateServices.reduce(
              (sum, service) => sum + (service.amount || 0),
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
                  rowKey={(record) =>
                    `${record.consultedServiceId}-${record.customerId}-${record.paymentDate}`
                  }
                  pagination={false}
                  size="small"
                  scroll={{ x: 1000 }}
                  loading={loading}
                />
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <Card
      title="💰 Doanh thu điều trị tháng này"
      size="small"
      style={{ marginBottom: 24 }}
    >
      {renderContent()}
    </Card>
  );
};

export default DashboardTreatmentRevenue;
