// src/features/employees/components/form-sections/BankInfoSection.tsx
import { Form, Input, Row, Col, Typography } from "antd";

const { Title } = Typography;

export default function BankInfoSection() {
  return (
    <>
      <Title level={5}>Ngân hàng</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Số tài khoản" name="bankAccountNumber">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Tên ngân hàng" name="bankName">
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
