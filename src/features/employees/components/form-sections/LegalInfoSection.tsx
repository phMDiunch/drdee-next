// src/features/employees/components/form-sections/LegalInfoSection.tsx
import { Form, Input, DatePicker, Row, Col, Typography } from "antd";

const { Title } = Typography;

export default function LegalInfoSection() {
  return (
    <>
      <Title level={5}>Pháp lý & Bảo hiểm</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="CCCD" name="nationalId">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Ngày cấp CCCD" name="nationalIdIssueDate">
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Nơi cấp CCCD" name="nationalIdIssuePlace">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Mã số thuế" name="taxId">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Số BHXH" name="insuranceNumber">
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
