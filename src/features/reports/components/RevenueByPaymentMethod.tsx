// src/features/reports/components/RevenueByPaymentMethod.tsx
"use client";
import { Card, Typography, Row, Col, Progress, Tag, Statistic } from "antd";
import { formatCurrency } from "@/utils/date";
import { PAYMENT_METHOD_COLORS } from "../constants";

const { Title, Text } = Typography;

interface PaymentMethodData {
  cash: number;
  cardNormal: number;
  cardVisa: number;
  transfer: number;
}

interface Props {
  data: PaymentMethodData;
  loading?: boolean;
  title?: string;
}

export default function RevenueByPaymentMethod({
  data,
  loading = false,
  title = "Doanh thu theo phương thức thanh toán",
}: Props) {
  const total = data.cash + data.cardNormal + data.cardVisa + data.transfer;

  const methods = [
    {
      name: "Tiền mặt",
      key: "cash" as keyof PaymentMethodData,
      icon: "💵",
      color: PAYMENT_METHOD_COLORS["Tiền mặt"],
    },
    {
      name: "Quẹt thẻ thường",
      key: "cardNormal" as keyof PaymentMethodData,
      icon: "💳",
      color: PAYMENT_METHOD_COLORS["Quẹt thẻ thường"],
    },
    {
      name: "Quẹt thẻ Visa",
      key: "cardVisa" as keyof PaymentMethodData,
      icon: "💎",
      color: PAYMENT_METHOD_COLORS["Quẹt thẻ Visa"],
    },
    {
      name: "Chuyển khoản",
      key: "transfer" as keyof PaymentMethodData,
      icon: "🏦",
      color: PAYMENT_METHOD_COLORS["Chuyển khoản"],
    },
  ];

  return (
    <Card size="small" loading={loading}>
      <Title level={5} style={{ marginBottom: 16 }}>
        {title}
      </Title>

      {/* Total */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Statistic
          title="Tổng doanh thu"
          value={total}
          formatter={(value) => formatCurrency(Number(value))}
          valueStyle={{
            color: "#52c41a",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        />
      </div>

      {/* Payment Methods Breakdown */}
      <Row gutter={[0, 16]}>
        {methods.map((method) => {
          const value = data[method.key];
          const percentage = total > 0 ? (value / total) * 100 : 0;

          return (
            <Col span={24} key={method.key}>
              <div style={{ marginBottom: 8 }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Tag color={method.color} style={{ marginRight: 4 }}>
                      {method.icon}
                    </Tag>
                    <Text strong>{method.name}</Text>
                  </Col>
                  <Col>
                    <Text strong style={{ color: method.color }}>
                      {formatCurrency(value)}
                    </Text>
                  </Col>
                </Row>
                <Progress
                  percent={percentage}
                  strokeColor={method.color}
                  showInfo={false}
                  size="small"
                  style={{ marginTop: 4 }}
                />
                <Row justify="space-between" style={{ marginTop: 2 }}>
                  <Col>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {percentage.toFixed(1)}%
                    </Text>
                  </Col>
                </Row>
              </div>
            </Col>
          );
        })}
      </Row>

      {/* Summary Stats */}
      {total > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: "12px",
            backgroundColor: "#f5f5f5",
            borderRadius: "6px",
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Phương thức chính:
              </Text>
              <br />
              <Text strong style={{ color: methods[0].color }}>
                {
                  methods.reduce((prev, curr) =>
                    data[curr.key] > data[prev.key] ? curr : prev
                  ).name
                }
              </Text>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Tỷ lệ tiền mặt:
              </Text>
              <br />
              <Text strong style={{ color: PAYMENT_METHOD_COLORS["Tiền mặt"] }}>
                {total > 0 ? ((data.cash / total) * 100).toFixed(1) : 0}%
              </Text>
            </Col>
          </Row>
        </div>
      )}
    </Card>
  );
}
