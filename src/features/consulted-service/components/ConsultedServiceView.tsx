// src/features/consulted-service/components/ConsultedServiceView.tsx
"use client";
import { Descriptions, Tag, Typography, Divider, Space } from "antd";
import { formatCurrency, formatDateTimeVN } from "@/utils/date";
import type { ConsultedServiceWithDetails } from "../type";

const { Title, Text } = Typography;

type Props = {
  service: ConsultedServiceWithDetails;
};

export default function ConsultedServiceView({ service }: Props) {
  // Helper function để render status tag
  const renderServiceStatus = (status: string) => (
    <Tag color={status === "Đã chốt" ? "green" : "orange"}>{status}</Tag>
  );

  const renderTreatmentStatus = (status: string) => (
    <Tag
      color={
        status === "Hoàn thành"
          ? "green"
          : status === "Đang điều trị"
          ? "blue"
          : "default"
      }
    >
      {status}
    </Tag>
  );

  return (
    <div>
      {/* Thông tin khách hàng */}
      {service.customer && (
        <>
          <Title level={5}>Thông tin khách hàng</Title>
          <Descriptions
            bordered
            size="small"
            column={2}
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Mã khách hàng" span={1}>
              <Tag
                color="blue"
                style={{ fontSize: "14px", fontWeight: "bold" }}
              >
                {service.customer.customerCode}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Họ và tên" span={1}>
              <Text strong>{service.customer.fullName}</Text>
            </Descriptions.Item>
          </Descriptions>
          <Divider />
        </>
      )}

      {/* Thông tin dịch vụ và thanh toán */}
      <Title level={5}>Thông tin dịch vụ</Title>
      <Descriptions
        bordered
        size="small"
        column={2}
        style={{ marginBottom: 24 }}
      >
        <Descriptions.Item label="Tên dịch vụ" span={2}>
          <Text strong>{service.consultedServiceName}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Đơn vị" span={1}>
          {service.consultedServiceUnit || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Số lượng" span={1}>
          <Text strong>{service.quantity}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Đơn giá" span={1}>
          <Text type="secondary">{formatCurrency(service.price)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Giá ưu đãi" span={1}>
          <Text strong>
            {formatCurrency(service.preferentialPrice || service.price)}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Thành tiền" span={1}>
          <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
            {formatCurrency(service.finalPrice)}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Còn nợ" span={1}>
          <Text
            strong
            style={{
              color: service.debt && service.debt > 0 ? "#ff4d4f" : "#52c41a",
            }}
          >
            {formatCurrency(service.debt || 0)}
          </Text>
        </Descriptions.Item>
      </Descriptions>

      {/* Vị trí răng (nếu có) */}
      {service.toothPositions && service.toothPositions.length > 0 && (
        <>
          <Title level={5}>Vị trí răng điều trị</Title>
          <div style={{ marginBottom: 24 }}>
            <Space wrap>
              {service.toothPositions.map((tooth) => (
                <Tag key={tooth} color="blue">
                  Răng {tooth}
                </Tag>
              ))}
            </Space>
          </div>
        </>
      )}

      {/* Trạng thái và thời gian */}
      <Title level={5}>Trạng thái & Thời gian</Title>
      <Descriptions
        bordered
        size="small"
        column={2}
        style={{ marginBottom: 24 }}
      >
        <Descriptions.Item label="Trạng thái dịch vụ" span={1}>
          {renderServiceStatus(service.serviceStatus)}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái điều trị" span={1}>
          {renderTreatmentStatus(service.treatmentStatus)}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tư vấn" span={1}>
          {formatDateTimeVN(service.consultationDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày chốt" span={1}>
          {service.serviceConfirmDate
            ? formatDateTimeVN(service.serviceConfirmDate)
            : "Chưa chốt"}
        </Descriptions.Item>
      </Descriptions>

      {/* Ghi chú đặc biệt */}
      {service.specificStatus && (
        <>
          <Title level={5}>Ghi chú đặc biệt</Title>
          <div
            style={{
              padding: 12,
              backgroundColor: "#f0f2f5",
              borderRadius: 6,
              marginBottom: 24,
            }}
          >
            <Text>{service.specificStatus}</Text>
          </div>
        </>
      )}

      {/* Thông tin bác sĩ */}
      <Title level={5}>Thông tin bác sĩ</Title>
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Bác sĩ tư vấn" span={1}>
          {service.consultingDoctor?.fullName || "Chưa có"}
        </Descriptions.Item>
        <Descriptions.Item label="Bác sĩ điều trị" span={1}>
          {service.treatingDoctor?.fullName || "Chưa có"}
        </Descriptions.Item>
        <Descriptions.Item label="Nhân viên tư vấn" span={2}>
          {service.consultingSale?.fullName || "Chưa có"}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}
