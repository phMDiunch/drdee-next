// src/features/reports/pages/ReportsOverviewPage.tsx
"use client";
import { useState } from "react";
import { Row, Col, Card, Statistic, Typography, Tag, Spin } from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "@/utils/date";
import { useSimplifiedReportsData } from "../hooks/useSimplifiedReportsData";
import RevenueFilters from "../components/RevenueFilters";
import DailyRevenueTable from "../components/DailyRevenueTable";
import type { ReportsFilters } from "../type";
import { CHART_COLORS } from "../constants";

const { Title, Text } = Typography;

export default function ReportsOverviewPage() {
  const [filters, setFilters] = useState<ReportsFilters>({
    timeRange: "month",
  });

  const { loading, revenueData, comparisonData, refetch } =
    useSimplifiedReportsData(filters);

  const handleFiltersChange = (newFilters: ReportsFilters) => {
    setFilters(newFilters);
    // React Query sẽ tự động refetch khi filters thay đổi
  };

  const handleRefresh = () => {
    refetch(); // Dùng refetch của React Query
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

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          🏢 Báo cáo Doanh thu & Doanh số theo Cơ sở
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

          <Col xs={24} lg={12}>
            <Card size="small">
              <Statistic
                title="� Tổng Doanh số"
                value={revenueData?.totalSales || 0}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={
                  <ShoppingCartOutlined style={{ color: CHART_COLORS[1] }} />
                }
                valueStyle={{ color: CHART_COLORS[1], fontSize: "18px" }}
              />
              {comparisonData && (
                <div style={{ marginTop: 12 }}>
                  {/* So với tháng trước */}
                  <div style={{ marginBottom: 6 }}>
                    {getGrowthIndicator(
                      comparisonData.previousMonth.growth.sales
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
                      comparisonData.previousYear.growth.sales
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
                  � Tiền mặt
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
                  💳 Thẻ Visa
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

        {/* Daily Revenue and Sales Table */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <DailyRevenueTable
              data={revenueData?.byTime || []}
              loading={loading}
            />
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
