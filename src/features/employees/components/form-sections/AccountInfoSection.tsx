// src/features/employees/components/form-sections/AccountInfoSection.tsx
import { Form, Input, Select, Row, Col, Typography } from "antd";
import { ROLE_OPTIONS } from "../../constants";

const { Title } = Typography;

export default function AccountInfoSection() {
  return (
    <>
      <Title level={5} style={{ marginTop: 0 }}>
        Thông tin tài khoản
      </Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, type: "email", message: "Email là bắt buộc" },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Chọn vai trò" }]}
          >
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
