// src/features/customers/components/CustomerInfo.tsx
import { Card, Descriptions } from "antd";

type Props = {
  customer: any;
};

export default function CustomerInfo({ customer }: Props) {
  if (!customer) return null;

  return (
    <Card>
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Mã khách hàng">
          {customer.customerCode}
        </Descriptions.Item>
        <Descriptions.Item label="Họ và tên">
          {customer.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {customer.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">
          {customer.address}
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú">
          {customer.notes || "Không có"}
        </Descriptions.Item>

        {customer.primaryContact?.fullName && (
          <>
            <Descriptions.Item label="Tên Primary Contact">
              {customer.primaryContact.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="SĐT Primary Contact">
              {customer.primaryContact?.phone || "Không có"}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>
    </Card>
  );
}
