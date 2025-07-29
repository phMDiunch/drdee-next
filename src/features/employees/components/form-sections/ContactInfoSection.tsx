// src/features/employees/components/form-sections/ContactInfoSection.tsx
import { Form, Input, Row, Col, Typography } from "antd";

const { Title } = Typography;

export default function ContactInfoSection() {
  return (
    <>
      <Title level={5}>Thông tin liên hệ</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Số điện thoại là bắt buộc" },
              { pattern: /^0\d{9}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Địa chỉ hiện tại" name="currentAddress">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Quê quán" name="hometown">
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
