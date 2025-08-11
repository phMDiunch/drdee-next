// src/features/reports/components/RevenueByEmployee.tsx
"use client";
import { Card, Typography, Table, Tag, Statistic, Row, Col } from "antd";
import { formatCurrency } from "@/utils/date";
import { RiseOutlined, FallOutlined } from "@ant-design/icons";
import type { EmployeeReportData } from "../type";
import { CHART_COLORS } from "../constants";

const { Title, Text } = Typography;

interface Props {
  data: EmployeeReportData[];
  loading?: boolean;
  title?: string;
  type?: "revenue" | "sales";
}

export default function RevenueByEmployee({
  data,
  loading = false,
  title = "Doanh thu theo nhân viên",
  type = "revenue",
}: Props) {
  const sortedData = [...data].sort((a, b) =>
    type === "revenue" ? b.revenue - a.revenue : b.sales - a.sales
  );

  const totalValue = data.reduce(
    (sum, emp) => sum + (type === "revenue" ? emp.revenue : emp.sales),
    0
  );

  const columns = [
    {
      title: "Thứ hạng",
      key: "rank",
      width: 80,
      render: (_: unknown, __: unknown, index: number) => (
        <Tag
          color={index < 3 ? ["gold", "silver", "#cd7f32"][index] : "default"}
        >
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: EmployeeReportData) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.role === "consultingSale" && "Sale tư vấn"}
            {record.role === "consultingDoctor" && "BS tư vấn"}
            {record.role === "treatingDoctor" && "BS điều trị"}
          </Text>
        </div>
      ),
    },
    {
      title: type === "revenue" ? "Doanh thu" : "Doanh số",
      key: "value",
      align: "right" as const,
      render: (record: EmployeeReportData) => {
        const value = type === "revenue" ? record.revenue : record.sales;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

        return (
          <div>
            <Text strong style={{ color: CHART_COLORS[0] }}>
              {formatCurrency(value)}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {percentage.toFixed(1)}%
            </Text>
          </div>
        );
      },
    },
    {
      title: "Giao dịch",
      dataIndex: "transactions",
      key: "transactions",
      align: "center" as const,
      render: (transactions: number) => <Tag color="blue">{transactions}</Tag>,
    },
    {
      title: "Tăng trưởng",
      key: "growth",
      align: "center" as const,
      render: (record: EmployeeReportData) => {
        if (!record.growth) return <Text type="secondary">-</Text>;

        const growthValue =
          type === "revenue" ? record.growth.revenue : record.growth.sales;

        const isPositive = growthValue > 0;

        return (
          <div style={{ textAlign: "center" }}>
            {isPositive ? (
              <RiseOutlined style={{ color: "#52c41a", marginRight: 4 }} />
            ) : (
              <FallOutlined style={{ color: "#ff4d4f", marginRight: 4 }} />
            )}
            <Text style={{ color: isPositive ? "#52c41a" : "#ff4d4f" }}>
              {Math.abs(growthValue).toFixed(1)}%
            </Text>
          </div>
        );
      },
    },
  ];

  return (
    <Card size="small" loading={loading}>
      <Title level={5} style={{ marginBottom: 16 }}>
        {title}
      </Title>

      {/* Summary Stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic
            title="Tổng cộng"
            value={totalValue}
            formatter={(value) => formatCurrency(Number(value))}
            valueStyle={{ fontSize: "14px", color: CHART_COLORS[0] }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Nhân viên"
            value={data.length}
            valueStyle={{ fontSize: "14px", color: CHART_COLORS[1] }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Trung bình/NV"
            value={data.length > 0 ? totalValue / data.length : 0}
            formatter={(value) => formatCurrency(Number(value))}
            valueStyle={{ fontSize: "14px", color: CHART_COLORS[2] }}
          />
        </Col>
      </Row>

      {/* Employee Table */}
      <Table
        dataSource={sortedData}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ y: 300 }}
        rowClassName={(record, index) => {
          if (index < 3) return "top-performer";
          return "";
        }}
      />

      {/* Top Performer Highlight */}
      {sortedData.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: "12px",
            backgroundColor: "#f6ffed",
            borderRadius: "6px",
            border: "1px solid #b7eb8f",
          }}
        >
          <Text style={{ fontSize: "12px", color: "#52c41a" }}>
            🏆 <strong>{sortedData[0].name}</strong> dẫn đầu với{" "}
            <strong>
              {formatCurrency(
                type === "revenue" ? sortedData[0].revenue : sortedData[0].sales
              )}
            </strong>
          </Text>
        </div>
      )}
    </Card>
  );
}
