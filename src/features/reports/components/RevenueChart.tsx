// src/features/reports/components/RevenueChart.tsx
"use client";
import { Card, Typography, Empty, Spin, Row, Col, Statistic } from "antd";
import { useMemo } from "react";
import { formatCurrency } from "@/utils/date";
import type { ChartDataPoint } from "../type";
import { CHART_COLORS } from "../constants";

const { Title, Text } = Typography;

interface Props {
  title: string;
  data: ChartDataPoint[];
  loading?: boolean;
  height?: number;
  color?: string;
  valueFormatter?: (value: number) => string;
}

// Simple mini chart component using CSS
const MiniChart = ({
  data,
  color,
}: {
  data: ChartDataPoint[];
  color: string;
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "end",
        height: "60px",
        gap: "2px",
        marginTop: "8px",
      }}
    >
      {data.map((point, index) => {
        const height = ((point.value - minValue) / range) * 50 + 10;
        return (
          <div
            key={index}
            style={{
              width: `${Math.max(100 / data.length - 1, 4)}%`,
              height: `${height}px`,
              backgroundColor: color,
              borderRadius: "2px",
              opacity: 0.8,
              transition: "opacity 0.2s",
            }}
            title={`${point.date}: ${formatCurrency(point.value)}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
          />
        );
      })}
    </div>
  );
};

export default function RevenueChart({
  title,
  data,
  loading = false,
  height = 300,
  color = CHART_COLORS[0],
  valueFormatter = formatCurrency,
}: Props) {
  const chartStats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map((d) => d.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const avg = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { total, avg, max, min };
  }, [data]);

  if (loading) {
    return (
      <Card size="small">
        <Title level={5} style={{ marginBottom: 16 }}>
          {title}
        </Title>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card size="small">
        <Title level={5} style={{ marginBottom: 16 }}>
          {title}
        </Title>
        <Empty description="Không có dữ liệu" style={{ padding: "40px 0" }} />
      </Card>
    );
  }

  return (
    <Card size="small">
      <Title level={5} style={{ marginBottom: 8, color }}>
        {title}
      </Title>

      {chartStats && (
        <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
          <Col span={12}>
            <Statistic
              title="Tổng"
              value={chartStats.total}
              formatter={(value) => valueFormatter(Number(value))}
              valueStyle={{ fontSize: "14px", color }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Trung bình"
              value={chartStats.avg}
              formatter={(value) => valueFormatter(Number(value))}
              valueStyle={{ fontSize: "14px", color }}
            />
          </Col>
        </Row>
      )}

      <MiniChart data={data} color={color} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <Text type="secondary">
          {data[0]?.date
            ? new Date(data[0].date).toLocaleDateString("vi-VN")
            : ""}
        </Text>
        <Text type="secondary">
          {data[data.length - 1]?.date
            ? new Date(data[data.length - 1].date).toLocaleDateString("vi-VN")
            : ""}
        </Text>
      </div>
    </Card>
  );
}
