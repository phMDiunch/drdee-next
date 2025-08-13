// src/features/reports/components/SalesDetailTable.tsx
"use client";
import { Card, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatCurrency } from "@/utils/date";
import dayjs from "dayjs";
import { SalesDetailData } from "../type";
import { useMemo } from "react";

const { Title } = Typography;

interface Props {
  data: SalesDetailData[];
  loading?: boolean;
}

export default function SalesDetailTable({ data, loading = false }: Props) {
  // Create filter options from unique customer sources in data
  const customerSourceFilters = useMemo(() => {
    const uniqueSources = [
      ...new Set(data.map((item) => item.customerSource || "Chưa cập nhật")),
    ];
    return uniqueSources.map((source) => ({
      text: source,
      value: source === "Chưa cập nhật" ? "__null__" : source, // Use string placeholder for null
    }));
  }, [data]);

  const columns: ColumnsType<SalesDetailData> = [
    {
      title: "🏷️ Nguồn khách",
      dataIndex: "customerSource",
      key: "customerSource",
      render: (source: string | null) => source || "Chưa cập nhật",
      sorter: (a: SalesDetailData, b: SalesDetailData) =>
        (a.customerSource || "").localeCompare(b.customerSource || ""),
      filters: customerSourceFilters,
      onFilter: (value, record: SalesDetailData) => {
        if (value === "__null__") {
          return (
            record.customerSource === null ||
            record.customerSource === undefined
          );
        }
        return record.customerSource === value;
      },
      filterMultiple: true,
      width: 150,
    },
    {
      title: "🆔 Mã KH",
      dataIndex: "customerCode",
      key: "customerCode",
      render: (code: string | null) => code || "Chưa có",
      sorter: (a: SalesDetailData, b: SalesDetailData) =>
        (a.customerCode || "").localeCompare(b.customerCode || ""),
      width: 120,
    },
    {
      title: "👤 Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      sorter: (a: SalesDetailData, b: SalesDetailData) =>
        a.customerName.localeCompare(b.customerName),
      width: 200,
    },
    {
      title: "🦷 Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
      sorter: (a: SalesDetailData, b: SalesDetailData) =>
        a.serviceName.localeCompare(b.serviceName),
      width: 250,
    },
    {
      title: "💰 Giá trị",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (value: number) => formatCurrency(value),
      sorter: (a: SalesDetailData, b: SalesDetailData) =>
        a.finalPrice - b.finalPrice,
      align: "right" as const,
      width: 150,
    },
    {
      title: "📅 Ngày chốt",
      dataIndex: "serviceConfirmDate",
      key: "serviceConfirmDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a: SalesDetailData, b: SalesDetailData) =>
        dayjs(a.serviceConfirmDate).unix() - dayjs(b.serviceConfirmDate).unix(),
      defaultSortOrder: "descend" as const,
      width: 130,
    },
  ];

  // Sort data by date (newest first) as default
  const sortedData = [...data].sort(
    (a, b) =>
      dayjs(b.serviceConfirmDate).unix() - dayjs(a.serviceConfirmDate).unix()
  );

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 16 }}>
        📊 Chi tiết doanh số theo dịch vụ chốt
      </Title>
      <Table
        columns={columns}
        dataSource={sortedData}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 300,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} dịch vụ`,
        }}
        scroll={{ x: 800 }}
        size="small"
        summary={(pageData) => {
          const totalValue = pageData.reduce(
            (sum, record) => sum + record.finalPrice,
            0
          );
          const totalServices = pageData.length;

          return (
            <Table.Summary>
              <Table.Summary.Row
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                <Table.Summary.Cell index={0} colSpan={4}>
                  <strong>📈 Tổng cộng ({totalServices} dịch vụ)</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <strong>{formatCurrency(totalValue)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  {/* Empty cell for date column */}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />
    </Card>
  );
}
