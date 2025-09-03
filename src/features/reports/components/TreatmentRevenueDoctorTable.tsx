// src/features/reports/components/TreatmentRevenueDoctorTable.tsx
"use client";
import { Card, Table, Typography, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatCurrency } from "@/utils/date";
import dayjs from "dayjs";
import { TreatmentRevenueDetailData } from "../type";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

const { Title } = Typography;

interface Props {
  data: TreatmentRevenueDetailData[];
  loading?: boolean;
}

export default function TreatmentRevenueDoctorTable({
  data,
  loading = false,
}: Props) {
  const router = useRouter();

  // Create filter options from unique treating doctors in data
  const treatingDoctorFilters = useMemo(() => {
    const uniqueDoctors = [
      ...new Set(
        data.map((item) => item.treatingDoctorName || "Chưa phân công")
      ),
    ];
    return uniqueDoctors.map((doctor) => ({
      text: doctor,
      value: doctor === "Chưa phân công" ? "__null__" : doctor,
    }));
  }, [data]);

  const handleCustomerClick = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  const columns: ColumnsType<TreatmentRevenueDetailData> = [
    {
      title: "👨‍⚕️ Bác sĩ điều trị",
      dataIndex: "treatingDoctorName",
      key: "treatingDoctorName",
      render: (name: string | null) => name || "Chưa phân công",
      sorter: (a: TreatmentRevenueDetailData, b: TreatmentRevenueDetailData) =>
        (a.treatingDoctorName || "").localeCompare(b.treatingDoctorName || ""),
      filters: treatingDoctorFilters,
      onFilter: (value, record: TreatmentRevenueDetailData) => {
        if (value === "__null__") {
          return (
            record.treatingDoctorName === null ||
            record.treatingDoctorName === undefined
          );
        }
        return record.treatingDoctorName === value;
      },
      width: 180,
    },
    {
      title: "🦷 Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
      render: (name: string) => name || "N/A",
      sorter: (a: TreatmentRevenueDetailData, b: TreatmentRevenueDetailData) =>
        a.serviceName.localeCompare(b.serviceName),
      ellipsis: true,
    },
    {
      title: "🏷️ Mã KH",
      dataIndex: "customerCode",
      key: "customerCode",
      render: (code: string | null) => code || "N/A",
      sorter: (a: TreatmentRevenueDetailData, b: TreatmentRevenueDetailData) =>
        (a.customerCode || "").localeCompare(b.customerCode || ""),
      width: 100,
    },
    {
      title: "👤 Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (name: string, record: TreatmentRevenueDetailData) => (
        <Button
          type="link"
          style={{ padding: 0, height: "auto", textAlign: "left" }}
          onClick={() => handleCustomerClick(record.customerId)}
        >
          {name}
        </Button>
      ),
      sorter: (a: TreatmentRevenueDetailData, b: TreatmentRevenueDetailData) =>
        a.customerName.localeCompare(b.customerName),
      ellipsis: true,
      width: 150,
    },
    {
      title: "💰 Số tiền thu",
      dataIndex: "amountReceived",
      key: "amountReceived",
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: TreatmentRevenueDetailData, b: TreatmentRevenueDetailData) =>
        a.amountReceived - b.amountReceived,
      align: "right" as const,
      width: 130,
    },
    {
      title: "📅 Ngày thu",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a: TreatmentRevenueDetailData, b: TreatmentRevenueDetailData) =>
        dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix(),
      defaultSortOrder: "descend" as const,
      width: 130,
    },
  ];

  // Sort data by payment date (newest first) as default
  const sortedData = [...data].sort(
    (a, b) => dayjs(b.paymentDate).unix() - dayjs(a.paymentDate).unix()
  );

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 16 }}>
        💰 Doanh thu điều trị bác sĩ
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
          const totalRevenue = pageData.reduce(
            (sum, record) => sum + record.amountReceived,
            0
          );
          const totalPayments = pageData.length;

          return (
            <Table.Summary>
              <Table.Summary.Row
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                <Table.Summary.Cell index={0} colSpan={4}>
                  <strong>📈 Tổng cộng ({totalPayments} khoản thu)</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <strong>{formatCurrency(totalRevenue)}</strong>
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
