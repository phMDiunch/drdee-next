// src/features/reports/components/SalesByDoctorTable.tsx
"use client";
import { Card, Table, Typography, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatCurrency } from "@/utils/date";
import dayjs from "dayjs";
import { SalesDetailData } from "../type";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

const { Title } = Typography;

interface Props {
  data: SalesDetailData[];
  loading?: boolean;
}

export default function SalesByDoctorTable({ data, loading = false }: Props) {
  const router = useRouter();

  // Create filter options from unique consulting doctors in data
  const consultingDoctorFilters = useMemo(() => {
    const uniqueDoctors = [
      ...new Set(
        data.map((item) => item.consultingDoctorName || "Chưa phân công")
      ),
    ];
    return uniqueDoctors.map((doctor) => ({
      text: doctor,
      value: doctor === "Chưa phân công" ? "__null__" : doctor,
    }));
  }, [data]);

  const columns: ColumnsType<SalesDetailData> = [
    {
      title: "👨‍⚕️ BS tư vấn",
      dataIndex: "consultingDoctorName",
      key: "consultingDoctorName",
      render: (name: string | null) => name || "Chưa phân công",
      sorter: (a: SalesDetailData, b: SalesDetailData) =>
        (a.consultingDoctorName || "").localeCompare(
          b.consultingDoctorName || ""
        ),
      filters: consultingDoctorFilters,
      onFilter: (value, record: SalesDetailData) => {
        if (value === "__null__") {
          return (
            record.consultingDoctorName === null ||
            record.consultingDoctorName === undefined
          );
        }
        return record.consultingDoctorName === value;
      },
      filterMultiple: true,
      width: 150,
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
      render: (customerName: string, record: SalesDetailData) => (
        <Button
          type="link"
          onClick={() => router.push(`/customers/${record.customerId}`)}
          style={{ padding: 0, height: "auto", textAlign: "left" }}
        >
          {customerName}
        </Button>
      ),
      sorter: (a: SalesDetailData, b: SalesDetailData) =>
        a.customerName.localeCompare(b.customerName),
      width: 200,
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
        👨‍⚕️ Doanh số tư vấn bác sĩ
      </Title>
      <Table
        columns={columns}
        dataSource={sortedData}
        rowKey="id"
        loading={loading}
        pagination={false}
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
