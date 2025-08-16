// src/features/customers/components/CustomerInfo.tsx
import { Card, Descriptions, Button, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { formatDateTimeVN } from "@/utils/date";
import type { Customer } from "../type";

type Props = {
  customer: Customer;
  onEdit?: () => void;
};

export default function CustomerInfo({ customer, onEdit }: Props) {
  if (!customer) return null;

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Không có";
    return formatDateTimeVN(date.toString(), "DD/MM/YYYY");
  };

  const formatArray = (arr: string[] | null) => {
    if (!arr || arr.length === 0) return "Không có";
    return arr.map((item, index) => (
      <Tag key={index} color="blue">
        {item}
      </Tag>
    ));
  };

  return (
    <Card
      title="Thông tin chi tiết"
      extra={
        <Button icon={<EditOutlined />} onClick={onEdit}>
          Sửa
        </Button>
      }
    >
      <Descriptions bordered column={2} size="small">
        {/* Thông tin cơ bản */}
        <Descriptions.Item label="Mã khách hàng">
          {customer.customerCode || "Chưa có"}
        </Descriptions.Item>
        <Descriptions.Item label="Họ và tên">
          {customer.fullName}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày sinh">
          {formatDate(customer.dob)}
        </Descriptions.Item>
        <Descriptions.Item label="Giới tính">
          {customer.gender || "Không có"}
        </Descriptions.Item>

        {/* Thông tin liên hệ */}
        <Descriptions.Item label="Số điện thoại">
          {customer.phone || "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {customer.email || "Không có"}
        </Descriptions.Item>

        <Descriptions.Item label="Địa chỉ" span={2}>
          {customer.address || "Không có"}
        </Descriptions.Item>

        <Descriptions.Item label="Thành phố">
          {customer.city || "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Quận/Huyện">
          {customer.district || "Không có"}
        </Descriptions.Item>

        {/* Thông tin phân loại */}
        <Descriptions.Item label="Nghề nghiệp">
          {customer.occupation || "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Nguồn khách">
          {customer.source || "Không có"}
        </Descriptions.Item>

        <Descriptions.Item label="Ghi chú nguồn" span={2}>
          {customer.sourceNotes || "Không có"}
        </Descriptions.Item>

        <Descriptions.Item label="Dịch vụ quan tâm" span={2}>
          {formatArray(customer.servicesOfInterest)}
        </Descriptions.Item>

        {/* Thông tin liên hệ chính */}
        {customer.relationshipToPrimary && (
          <Descriptions.Item label="Mối quan hệ với người liên hệ chính">
            {customer.relationshipToPrimary}
          </Descriptions.Item>
        )}

        {customer.primaryContact?.fullName && (
          <>
            <Descriptions.Item label="Tên người liên hệ chính">
              {customer.primaryContact.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="SĐT người liên hệ chính">
              {customer.primaryContact?.phone || "Không có"}
            </Descriptions.Item>
          </>
        )}

        {/* Metadata */}
        <Descriptions.Item label="Ngày tạo">
          {formatDate(customer.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày cập nhật">
          {formatDate(customer.updatedAt)}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
