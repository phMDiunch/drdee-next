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
  Spin,
} from "antd";
import type { DentalService } from "../type"; // Import type chuẩn
import { useEmployeeProfile } from "@/features/auth/hooks/useAuth";

// Đưa các constant lên file constants.ts nếu dùng nhiều nơi
const UNITS = ["Răng", "Hàm", "Lần", "Ca", "Ống", "Chiếc"];
const SERVICE_GROUPS = [
  "Nha chu",
  "Phục hình",
  "Tổng quát",
  "Chỉnh nha",
  "Implant",
  "Khác",
];
const DEPARTMENTS = ["Tổng quát", "Phục hình", "Chỉnh nha", "Implant", "Khác"];

const { TextArea } = Input;

type Props = {
  initialValues?: Partial<DentalService>;
  onFinish: (values: Partial<DentalService>) => void;
  loading?: boolean;
};

export default function DentalServiceForm({
  initialValues = {},
  onFinish,
  loading = false,
}: Props) {
  const [form] = Form.useForm();
  const { employee, loading: loadingProfile } = useEmployeeProfile();

  if (loadingProfile) return <Spin />;

  // Nếu không có employee, không cho submit (phòng trường hợp user chưa có record)
  if (!employee)
    return (
      <div style={{ color: "red" }}>
        Bạn chưa được cấu hình profile nhân viên!
      </div>
    );

  // Khi submit, tự thêm createdById/updatedById từ employee.id
  const handleFinish = (values: any) => {
    onFinish({
      ...values,
      price: Number(values.price),
      isActive: values.isActive ?? true,
      createdById: employee.id,
      updatedById: employee.id,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialValues,
        isActive: initialValues?.isActive ?? true,
      }}
      onFinish={handleFinish}
      autoComplete="off"
    >
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
            <Select
              allowClear
              options={SERVICE_GROUPS.map((x) => ({ value: x, label: x }))}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Bộ môn" name="department">
            <Select
              allowClear
              options={DEPARTMENTS.map((x) => ({ value: x, label: x }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Đơn vị tính"
            name="unit"
            rules={[{ required: true, message: "Chọn đơn vị!" }]}
          >
            <Select options={UNITS.map((x) => ({ value: x, label: x }))} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
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
      </Row>
      <Row gutter={16}>
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
      </Row>
      <Row gutter={16}>
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
      <Form.Item label="Mô tả chi tiết" name="description">
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item
        label="Trạng thái sử dụng"
        name="isActive"
        valuePropName="checked"
      >
        <Switch checkedChildren="Active" unCheckedChildren="Disable" />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ marginTop: 12 }}
          block
        >
          Lưu
        </Button>
      </Form.Item>
    </Form>
  );
}
