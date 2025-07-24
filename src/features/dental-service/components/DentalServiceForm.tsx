// src/features/dental-service/components/DentalServiceForm.tsx
"use client";
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Row,
  Col,
  Select,
  Button,
  Typography,
  Divider,
} from "antd";
import type { DentalService } from "../type";
import {
  SERVICE_UNIT_OPTIONS,
  SERVICE_GROUP_OPTIONS,
  DEPARTMENT_OPTIONS,
} from "../constants";

const { TextArea } = Input;
const { Title } = Typography;

type DentalServiceFormProps = {
  form: any;
  initialValues?: Partial<DentalService>;
  onFinish: (values: Partial<DentalService>) => void;
  loading?: boolean;
};

export default function DentalServiceForm({
  form,
  initialValues = {},
  onFinish,
  loading = false,
}: DentalServiceFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialValues,
        isActive: initialValues?.isActive ?? true,
      }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Title level={5} style={{ marginTop: 0 }}>
        Thông tin dịch vụ
      </Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Tên dịch vụ"
            name="name"
            rules={[{ required: true, message: "Nhập tên dịch vụ!" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Nhóm dịch vụ" name="serviceGroup">
            <Select allowClear options={SERVICE_GROUP_OPTIONS} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Bộ môn" name="department">
            <Select allowClear options={DEPARTMENT_OPTIONS} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Đơn vị tính"
            name="unit"
            rules={[{ required: true, message: "Chọn đơn vị!" }]}
          >
            <Select options={SERVICE_UNIT_OPTIONS} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Đơn giá"
            name="price"
            rules={[{ required: true, message: "Nhập giá!" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Bảo hành chính hãng" name="officialWarranty">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Bảo hành phòng khám" name="clinicWarranty">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Xuất xứ" name="origin">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Số phút điều trị TB" name="avgTreatmentMinutes">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Số buổi điều trị TB" name="avgTreatmentSessions">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <Form.Item label="Mô tả chi tiết" name="description">
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item
        label="Trạng thái sử dụng"
        name="isActive"
        valuePropName="checked"
      >
        <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
      </Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        style={{ marginTop: 12 }}
        block
      >
        Lưu
      </Button>
    </Form>
  );
}
