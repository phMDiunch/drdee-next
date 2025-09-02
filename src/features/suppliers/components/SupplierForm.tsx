// src/features/suppliers/components/SupplierForm.tsx
"use client";

import { Form, Input, Rate, Switch, Button, Row, Col, Space } from "antd";
import { useEffect } from "react";
import CategorySelect from "./CategorySelect";
import type { CreateSupplierData, SupplierWithRelations } from "../type";

const { TextArea } = Input;

interface SupplierFormProps {
  initialData?: SupplierWithRelations;
  onSubmit: (data: CreateSupplierData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  mode?: "create" | "edit";
}

export default function SupplierForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode = "create",
}: SupplierFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
    }
  }, [form, initialData]);

  const handleSubmit = async (values: CreateSupplierData) => {
    try {
      await onSubmit(values);

      if (mode === "create") {
        form.resetFields();
      }
    } catch (error) {
      // Error handling is done in parent component
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      disabled={loading}
      initialValues={{
        rating: 5,
        isActive: true,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Tên nhà cung cấp"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhà cung cấp" },
              { max: 255, message: "Tên không được quá 255 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="categoryType"
            label="Loại nhà cung cấp"
            rules={[
              { required: true, message: "Vui lòng chọn loại nhà cung cấp" },
            ]}
          >
            <CategorySelect placeholder="Chọn loại nhà cung cấp" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              {
                pattern: /^[0-9+\-\s()]+$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="contactPerson" label="Người liên hệ">
            <Input placeholder="Nhập tên người liên hệ" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="contactPhone"
            label="SĐT người liên hệ"
            rules={[
              {
                pattern: /^[0-9+\-\s()]+$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Nhập SĐT người liên hệ" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="address" label="Địa chỉ">
        <TextArea
          placeholder="Nhập địa chỉ nhà cung cấp"
          rows={2}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="website"
        label="Website"
        rules={[{ type: "url", message: "Website không hợp lệ" }]}
      >
        <Input placeholder="https://example.com" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="taxId" label="Mã số thuế">
            <Input placeholder="Nhập mã số thuế" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="businessLicense" label="Số giấy phép kinh doanh">
            <Input placeholder="Nhập số giấy phép KD" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="bankName" label="Ngân hàng">
            <Input placeholder="Nhập tên ngân hàng" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="bankAccount" label="Số tài khoản">
            <Input placeholder="Nhập số tài khoản" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="rating" label="Đánh giá">
            <Rate />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="ratingNote" label="Ghi chú đánh giá">
        <TextArea
          placeholder="Ghi chú về chất lượng dịch vụ..."
          rows={2}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item name="description" label="Mô tả khác">
        <TextArea
          placeholder="Mô tả thêm về nhà cung cấp..."
          rows={3}
          maxLength={1000}
          showCount
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
          >
            {mode === "create" ? "Tạo mới" : "Cập nhật"}
          </Button>

          {onCancel && (
            <Button onClick={onCancel} disabled={loading} size="large">
              Hủy
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
}
