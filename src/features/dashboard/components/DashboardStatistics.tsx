// src/features/dashboard/components/DashboardStatistics.tsx
"use client";

import React from "react";
import { Card, Row, Col, Typography, Statistic } from "antd";
import {
  CalendarOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useDashboardAppointments } from "../hooks/useDashboardAppointments";
import { useDashboardUnconfirmedServices } from "../hooks/useDashboardUnconfirmedServices";
import { useDashboardTodayServices } from "../hooks/useDashboardTodayServices";
import { useDashboardMonthlyRevenue } from "../hooks/useDashboardMonthlyRevenue";
import { useDashboardTreatmentRevenue } from "@/features/reports/hooks/useDashboardTreatmentRevenue";
import { formatCurrency } from "@/utils/date";

const { Title } = Typography;

type StatisticCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  onClick: () => void;
  active: boolean;
  customFormatter?: (value: number) => string;
};

const StatisticCard = ({
  title,
  value,
  icon,
  color,
  loading,
  onClick,
  active,
  customFormatter,
}: StatisticCardProps) => (
  <Card
    hoverable
    onClick={onClick}
    style={{
      borderColor: active ? color : undefined,
      backgroundColor: active ? `${color}10` : undefined,
      cursor: "pointer",
      transition: "all 0.3s ease",
    }}
    styles={{ body: { padding: "20px" } }}
  >
    <Statistic
      title={title}
      value={value}
      loading={loading}
      prefix={icon}
      valueStyle={{ color, fontSize: "24px", fontWeight: "bold" }}
      formatter={
        customFormatter ? (val) => customFormatter(val as number) : undefined
      }
    />
  </Card>
);

type Props = {
  onCardClick: (
    section:
      | "appointments"
      | "unconfirmed-services"
      | "today-services"
      | "monthly-revenue"
      | "treatment-revenue"
      | null
  ) => void;
  activeCard:
    | "appointments"
    | "unconfirmed-services"
    | "today-services"
    | "monthly-revenue"
    | "treatment-revenue"
    | null;
};

export const DashboardStatistics = ({ onCardClick, activeCard }: Props) => {
  const { data: appointments = [], isLoading: appointmentsLoading } =
    useDashboardAppointments();
  const {
    data: unconfirmedServices = [],
    isLoading: unconfirmedServicesLoading,
  } = useDashboardUnconfirmedServices();
  const { data: todayServices = [], isLoading: todayServicesLoading } =
    useDashboardTodayServices();
  const { data: monthlyRevenue, isLoading: monthlyRevenueLoading } =
    useDashboardMonthlyRevenue();
  const { data: treatmentRevenue = [], isLoading: treatmentRevenueLoading } =
    useDashboardTreatmentRevenue();

  const handleCardClick = (
    cardType:
      | "appointments"
      | "unconfirmed-services"
      | "today-services"
      | "monthly-revenue"
      | "treatment-revenue"
  ) => {
    const newActiveCard = activeCard === cardType ? null : cardType;
    onCardClick(newActiveCard);
  };

  return (
    <div>
      <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
        {/* Cột 1: Thống kê hôm nay */}
        <Col xs={24} lg={12}>
          <Title level={4} style={{ marginBottom: 16 }}>
            📊 Thống kê hôm nay
          </Title>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8}>
              <StatisticCard
                title="Tổng lịch hẹn hôm nay"
                value={appointments.length}
                icon={<CalendarOutlined />}
                color="#1890ff"
                loading={appointmentsLoading}
                onClick={() => handleCardClick("appointments")}
                active={activeCard === "appointments"}
              />
            </Col>

            <Col xs={24} sm={24} md={8}>
              <StatisticCard
                title="Tổng dịch vụ chưa chốt hôm qua"
                value={unconfirmedServices.length}
                icon={<ExclamationCircleOutlined />}
                color="#faad14"
                loading={unconfirmedServicesLoading}
                onClick={() => handleCardClick("unconfirmed-services")}
                active={activeCard === "unconfirmed-services"}
              />
            </Col>

            <Col xs={24} sm={24} md={8}>
              <StatisticCard
                title="Tổng dịch vụ tư vấn hôm nay"
                value={todayServices.length}
                icon={<MedicineBoxOutlined />}
                color="#52c41a"
                loading={todayServicesLoading}
                onClick={() => handleCardClick("today-services")}
                active={activeCard === "today-services"}
              />
            </Col>
          </Row>
        </Col>

        {/* Cột 2: Thống kê tháng này */}
        <Col xs={24} lg={12}>
          <Title level={4} style={{ marginBottom: 16 }}>
            📈 Thống kê tháng này
          </Title>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={24} xl={12}>
              <StatisticCard
                title="Doanh số tư vấn tháng này"
                value={monthlyRevenue?.totalRevenue || 0}
                icon={<MedicineBoxOutlined />}
                color="#722ed1"
                loading={monthlyRevenueLoading}
                onClick={() => handleCardClick("monthly-revenue")}
                active={activeCard === "monthly-revenue"}
                customFormatter={(value) => formatCurrency(value)}
              />
            </Col>

            <Col xs={24} sm={12} md={12} lg={24} xl={12}>
              <StatisticCard
                title="Doanh thu điều trị tháng này"
                value={treatmentRevenue.reduce(
                  (sum, item) => sum + item.amount,
                  0
                )}
                icon={<MedicineBoxOutlined />}
                color="#13c2c2"
                loading={treatmentRevenueLoading}
                onClick={() => handleCardClick("treatment-revenue")}
                active={activeCard === "treatment-revenue"}
                customFormatter={(value) => formatCurrency(value)}
              />
            </Col>
            {/* Có thể thêm cards khác ở đây trong tương lai */}
          </Row>
        </Col>
      </Row>

      {/* Instructions */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 16,
          padding: "8px 16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "6px",
          color: "#666",
        }}
      >
        💡 Nhấp vào các thẻ thống kê để xem chi tiết bảng dữ liệu
      </div>
    </div>
  );
};
