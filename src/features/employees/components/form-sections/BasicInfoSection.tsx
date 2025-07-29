// src/features/employees/components/form-sections/BasicInfoSection.tsx
import { Form, Input, DatePicker, Select, Row, Col, Typography } from "antd";
import { GENDER_OPTIONS } from "@/constants";

const { Title } = Typography;

export default function BasicInfoSection() {
  return (
    <>
      <Title level={5}>Thông tin cơ bản</Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Mã nhân viên" name="employeeCode">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: "Họ tên là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Ngày sinh" name="dob">
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Giới tính" name="gender">
            <Select options={GENDER_OPTIONS} allowClear />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Ảnh đại diện (URL)" name="avatarUrl">
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
