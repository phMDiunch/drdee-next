// src/features/reports/pages/ReportsOverviewPage.tsx
"use client";
import { useState } from "react";
import { Row, Col, Card, Statistic, Typography, Tag, Spin, Tabs } from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "@/utils/date";
import { useSimplifiedReportsData } from "../hooks/useSimplifiedReportsData";
import { useSimplifiedSalesData } from "../hooks/useSimplifiedSalesData";
import RevenueFilters from "../components/RevenueFilters";
import DailyRevenueTable from "../components/DailyRevenueTable";
import SalesDetailTable from "../components/SalesDetailTable";
import SalesByDoctorTable from "../components/SalesByDoctorTable";
import SalesBySaleTable from "../components/SalesBySaleTable";
import type { ReportsFilters } from "../type";
import { CHART_COLORS } from "../constants";

const { Title, Text } = Typography;

export default function ReportsOverviewPage() {
  const [filters, setFilters] = useState<ReportsFilters>({
    timeRange: "month",
  });

  const {
    loading: revenueLoading,
    revenueData,
    comparisonData,
    refetch: refetchRevenue,
  } = useSimplifiedReportsData(filters);

  const {
    data: salesResponse,
    loading: salesLoading,
    refetch: refetchSales,
  } = useSimplifiedSalesData(filters);

  const salesData = salesResponse?.current;
  const salesComparison = salesResponse;

  const loading = revenueLoading || salesLoading;

  const handleFiltersChange = (newFilters: ReportsFilters) => {
    setFilters(newFilters);
    // React Query sẽ tự động refetch khi filters thay đổi
  };

  const handleRefresh = () => {
    refetchRevenue();
    refetchSales();
  };

  const getGrowthIndicator = (value: number) => {
    if (value > 0) {
      return (
        <Tag color="success" icon={<RiseOutlined />}>
          +{value.toFixed(1)}%
        </Tag>
      );
    } else if (value < 0) {
      return (
        <Tag color="error" icon={<FallOutlined />}>
          {value.toFixed(1)}%
        </Tag>
      );
    }
    return <Tag color="default">0%</Tag>;
  };

  const tabItems = [
    {
      key: "revenue",
      label: "💰 Doanh thu theo ngày",
      children: (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <DailyRevenueTable
              data={revenueData?.byTime || []}
              loading={revenueLoading}
            />
          </Col>
        </Row>
      ),
    },
    {
      key: "sales",
      label: "📊 Doanh số theo nguồn",
      children: (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <SalesDetailTable
              data={salesData?.details || []}
              loading={salesLoading}
            />
          </Col>
        </Row>
      ),
    },
    {
      key: "sales-doctor",
      label: "👨‍⚕️ Doanh số tư vấn bác sĩ",
      children: (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <SalesByDoctorTable
              data={salesData?.details || []}
              loading={salesLoading}
            />
          </Col>
        </Row>
      ),
    },
    {
      key: "sales-sale",
      label: "👤 Doanh số tư vấn Sales",
      children: (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <SalesBySaleTable
              data={salesData?.details || []}
              loading={salesLoading}
            />
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          🏢 Báo cáo tháng theo Cơ sở
        </Title>
        <Text type="secondary">
          Báo cáo chi tiết doanh thu và doanh số của từng cơ sở theo thời gian,
          bao gồm phân tích phương thức thanh toán và chi tiết theo ngày
        </Text>
      </div>

      {/* Filters */}
      <RevenueFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        loading={loading}
        onRefresh={handleRefresh}
      />

      <Spin spinning={loading}>
        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card size="small">
              <Statistic
                title="📊 Tổng Doanh số"
                value={salesData?.totalSales || 0}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={
                  <ShoppingCartOutlined style={{ color: CHART_COLORS[1] }} />
                }
                valueStyle={{ color: CHART_COLORS[1], fontSize: "18px" }}
              />
              {salesComparison && (
                <div style={{ marginTop: 12 }}>
                  {/* So với tháng trước */}
                  <div style={{ marginBottom: 6 }}>
                    {getGrowthIndicator(
                      salesComparison.previousMonth.growth.sales
                    )}
                    <Text
                      type="secondary"
                      style={{ marginLeft: 8, fontSize: "11px" }}
                    >
                      so với {salesComparison.previousMonth.periodLabel}
                    </Text>
                  </div>

                  {/* So với năm trước */}
                  <div>
                    {getGrowthIndicator(
                      salesComparison.previousYear.growth.sales
                    )}
                    <Text
                      type="secondary"
                      style={{ marginLeft: 8, fontSize: "11px" }}
                    >
                      so với {salesComparison.previousYear.periodLabel}
                    </Text>
                  </div>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small">
              <Statistic
                title="💰 Tổng Doanh thu"
                value={revenueData?.totalRevenue || 0}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined style={{ color: CHART_COLORS[0] }} />}
                valueStyle={{ color: CHART_COLORS[0], fontSize: "18px" }}
              />
              {comparisonData && (
                <div style={{ marginTop: 12 }}>
                  {/* So với tháng trước */}
                  <div style={{ marginBottom: 6 }}>
                    {getGrowthIndicator(
                      comparisonData.previousMonth.growth.revenue
                    )}
                    <Text
                      type="secondary"
                      style={{ marginLeft: 8, fontSize: "11px" }}
                    >
                      so với {comparisonData.previousMonth.periodLabel}
                    </Text>
                  </div>

                  {/* So với năm trước */}
                  <div>
                    {getGrowthIndicator(
                      comparisonData.previousYear.growth.revenue
                    )}
                    <Text
                      type="secondary"
                      style={{ marginLeft: 8, fontSize: "11px" }}
                    >
                      so với {comparisonData.previousYear.periodLabel}
                    </Text>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Payment Methods Breakdown */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: "14px", color: "#666" }}>
                  💵 Tiền mặt
                </Text>
              </div>
              <div>
                <Text
                  strong
                  style={{ fontSize: "16px", color: CHART_COLORS[2] }}
                >
                  {formatCurrency(revenueData?.byPaymentMethod?.cash || 0)}
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: "14px", color: "#666" }}>
                  💳 Thẻ thường
                </Text>
              </div>
              <div>
                <Text
                  strong
                  style={{ fontSize: "16px", color: CHART_COLORS[3] }}
                >
                  {formatCurrency(
                    revenueData?.byPaymentMethod?.cardNormal || 0
                  )}
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: "14px", color: "#666" }}>
                  💎 Thẻ Visa
                </Text>
              </div>
              <div>
                <Text
                  strong
                  style={{ fontSize: "16px", color: CHART_COLORS[4] }}
                >
                  {formatCurrency(revenueData?.byPaymentMethod?.cardVisa || 0)}
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: "14px", color: "#666" }}>
                  🏦 Chuyển khoản
                </Text>
              </div>
              <div>
                <Text
                  strong
                  style={{ fontSize: "16px", color: CHART_COLORS[5] }}
                >
                  {formatCurrency(revenueData?.byPaymentMethod?.transfer || 0)}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Tabs for Revenue and Sales Details */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Tabs
              defaultActiveKey="revenue"
              items={tabItems}
              size="large"
              style={{ marginTop: 8 }}
            />
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
