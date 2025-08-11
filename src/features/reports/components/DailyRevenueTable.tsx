// src/features/reports/components/DailyRevenueTable.tsx
"use client";
import { Card, Table, Typography } from "antd";
import { formatCurrency } from "@/utils/date";
import dayjs from "dayjs";

const { Title } = Typography;

interface DailyData {
  date: string;
  revenue: number;
  transactions: number;
  cash: number;
  cardNormal: number;
  cardVisa: number;
  transfer: number;
}

interface Props {
  data: DailyData[];
  loading?: boolean;
}

export default function DailyRevenueTable({ data, loading = false }: Props) {
  const columns = [
    {
      title: "📅 Ngày",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a: DailyData, b: DailyData) =>
        dayjs(a.date).unix() - dayjs(b.date).unix(),
      fixed: "left" as const,
      width: 120,
    },
    {
      title: "💰 Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value: number) => formatCurrency(value),
      sorter: (a: DailyData, b: DailyData) => a.revenue - b.revenue,
      align: "right" as const,
      width: 130,
    },
    {
      title: "💵 Tiền mặt",
      dataIndex: "cash",
      key: "cash",
      render: (value: number) => formatCurrency(value),
      sorter: (a: DailyData, b: DailyData) => a.cash - b.cash,
      align: "right" as const,
      width: 130,
    },
    {
      title: "💳 Thẻ thường",
      dataIndex: "cardNormal",
      key: "cardNormal",
      render: (value: number) => formatCurrency(value),
      sorter: (a: DailyData, b: DailyData) => a.cardNormal - b.cardNormal,
      align: "right" as const,
      width: 150,
    },
    {
      title: "� Thẻ Visa",
      dataIndex: "cardVisa",
      key: "cardVisa",
      render: (value: number) => formatCurrency(value),
      sorter: (a: DailyData, b: DailyData) => a.cardVisa - b.cardVisa,
      align: "right" as const,
      width: 140,
    },
    {
      title: "🏦 Chuyển khoản",
      dataIndex: "transfer",
      key: "transfer",
      render: (value: number) => formatCurrency(value),
      sorter: (a: DailyData, b: DailyData) => a.transfer - b.transfer,
      align: "right" as const,
      width: 140,
    },
  ];

  // Sort data by date (A-Z - oldest first) as default
  const sortedData = [...data].sort(
    (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
  );

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 16 }}>
        📈 Chi tiết doanh thu theo ngày
      </Title>
      <Table
        columns={columns}
        dataSource={sortedData}
        rowKey="date"
        loading={loading}
        pagination={{
          pageSize: 100,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} ngày`,
        }}
        scroll={{ x: 1000 }}
        size="small"
        summary={(pageData) => {
          const totalRevenue = pageData.reduce(
            (sum, record) => sum + record.revenue,
            0
          );
          const totalCash = pageData.reduce(
            (sum, record) => sum + record.cash,
            0
          );
          const totalCardNormal = pageData.reduce(
            (sum, record) => sum + record.cardNormal,
            0
          );
          const totalCardVisa = pageData.reduce(
            (sum, record) => sum + record.cardVisa,
            0
          );
          const totalTransfer = pageData.reduce(
            (sum, record) => sum + record.transfer,
            0
          );

          return (
            <Table.Summary>
              <Table.Summary.Row
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                <Table.Summary.Cell index={0}>
                  <strong>📊 Tổng cộng</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong>{formatCurrency(totalRevenue)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <strong>{formatCurrency(totalCash)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <strong>{formatCurrency(totalCardNormal)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <strong>{formatCurrency(totalCardVisa)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <strong>{formatCurrency(totalTransfer)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />
    </Card>
  );
}
