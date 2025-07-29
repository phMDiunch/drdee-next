// src/features/customers/pages/CustomerDetailPage.tsx
"use client";
import { useEffect, useState } from "react";
import { Spin, Tabs, Typography, Descriptions, Card } from "antd";
import type { TabsProps } from "antd"; // <-- Thêm import này
import { toast } from "react-toastify";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

type CustomerDetails = any; // Sẽ định nghĩa chi tiết sau

type Props = {
  customerId: string;
};

export default function CustomerDetailPage({ customerId }: Props) {
  const [customer, setCustomer] = useState<CustomerDetails>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/customers/detail/${customerId}`);
          if (!res.ok) {
            throw new Error("Không thể tải thông tin khách hàng");
          }
          const data = await res.json();
          setCustomer(data);
        } catch (error: any) {
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [customerId]);

  if (loading) {
    return <Spin style={{ display: "block", margin: "100px auto" }} />;
  }

  if (!customer) {
    return <Title level={3}>Không tìm thấy thông tin khách hàng.</Title>;
  }
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Thông tin chung",
      children: (
        <Card>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Họ tên">
              {customer.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {customer.phone || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {customer.dob
                ? new Date(customer.dob).toLocaleDateString("vi-VN")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {customer.gender || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {customer.email || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {customer.address || "N/A"}
            </Descriptions.Item>
            {customer.primaryContact && (
              <Descriptions.Item label="Người liên hệ chính">
                {`${customer.primaryContact.fullName} (${customer.relationshipToPrimary}) - ${customer.primaryContact.phone}`}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      ),
    },
    {
      key: "2",
      label: `Dịch vụ đã tư vấn (${customer.consultedServices.length})`,
      children: <p>Nội dung cho Dịch vụ đã tư vấn sẽ được xây dựng ở đây.</p>,
    },
    {
      key: "3",
      label: `Lịch sử điều trị (${customer.treatmentLogs.length})`,
      children: <p>Nội dung cho Lịch sử điều trị sẽ được xây dựng ở đây.</p>,
    },
    {
      key: "4",
      label: `Lịch sử thanh toán (${customer.paymentVouchers.length})`,
      children: <p>Nội dung cho Lịch sử thanh toán sẽ được xây dựng ở đây.</p>,
    },
    {
      key: "5",
      label: `Lịch hẹn (${customer.appointments.length})`,
      children: <p>Nội dung cho Lịch hẹn sẽ được xây dựng ở đây.</p>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Link
        href="/customers"
        style={{ marginBottom: 16, display: "inline-block" }}
      >
        <ArrowLeftOutlined /> Quay lại danh sách
      </Link>
      <Title level={2}>
        {customer.fullName} -{" "}
        <Text type="secondary">{customer.customerCode}</Text>
      </Title>

      {/* --- THAY ĐỔI CÁCH SỬ DỤNG TABS --- */}
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}
