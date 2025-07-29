// src/features/customers/components/CustomerForm.tsx
"use client";
import { Form, Input, DatePicker, Select, Row, Col, Button, Spin } from "antd";
import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import type { Customer } from "../type";
import { BRANCHES, GENDER_OPTIONS } from "@/constants";
import { useAppStore } from "@/stores/useAppStore";

type Props = {
  form?: any;
  initialValues?: Partial<Customer & { primaryContact: any }>;
  onFinish: (values: Partial<Customer>) => void;
  loading?: boolean;
  mode?: "add" | "edit";
  customers?: any[];
};

export default function CustomerForm({
  form: formProp,
  initialValues = {},
  onFinish,
  loading = false,
  customers = [],
  mode = "add",
}: Props) {
  const [form] = Form.useForm(formProp);
  const employee = useAppStore((state) => state.employeeProfile);

  const [searching, setSearching] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // --- THAY ĐỔI LỚN: Khởi tạo state từ prop `customers` ---
  const [customerOptions, setCustomerOptions] = useState<any[]>(() => {
    // 1. Chuyển danh sách khách hàng có sẵn thành options
    const initialOptions = customers.map((c) => ({
      label: `${c.fullName} - ${c.phone || "Chưa có SĐT"}`,
      value: c.id,
    }));

    // 2. Nếu là mode Edit, đảm bảo người liên hệ chính luôn có trong danh sách
    if (mode === "edit" && initialValues.primaryContact) {
      const contact = initialValues.primaryContact as any;
      const contactExists = initialOptions.some(
        (opt) => opt.value === initialValues.primaryContactId
      );

      if (!contactExists) {
        initialOptions.push({
          label: `${contact.fullName} - ${contact.phone || "Chưa có SĐT"}`,
          value: initialValues.primaryContactId,
        });
      }
    }
    return initialOptions;
  });

  const fetchCustomers = async (searchValue: string) => {
    if (!searchValue) {
      setCustomerOptions([]);
      return;
    }
    setSearching(true);
    try {
      const params = new URLSearchParams({
        search: searchValue,
        pageSize: "50",
      });
      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      const options = (data.customers || []).map((c: any) => ({
        label: `${c.fullName} - ${c.phone || "Chưa có SĐT"}`,
        value: c.id,
      }));
      setCustomerOptions(options);
    } catch (error) {
      console.error("Lỗi tìm kiếm khách hàng:", error);
    }
    setSearching(false);
  };

  const debouncedFetchCustomers = useCallback(
    debounce(fetchCustomers, 500),
    []
  );

  const checkPhoneNumber = useCallback(
    debounce(async (phone: string) => {
      if (mode !== "add" || !/^0\d{9}$/.test(phone)) {
        setDuplicateWarning(null);
        return;
      }
      try {
        const res = await fetch(
          `/api/customers/check-phone?phone=${encodeURIComponent(phone)}`
        );
        const data = await res.json();
        if (data.exists) {
          setDuplicateWarning(
            `SĐT đã tồn tại: ${data.customer.customerCode} - ${data.customer.fullName}`
          );
        } else {
          setDuplicateWarning(null);
        }
      } catch (error) {
        setDuplicateWarning(null);
      }
    }, 500),
    [mode]
  );

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialValues,
        clinicId: initialValues.clinicId || employee?.clinicId,
      }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: "Nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            dependencies={["primaryContactId"]}
            help={duplicateWarning}
            validateStatus={duplicateWarning ? "warning" : ""}
            rules={[
              ({ getFieldValue }) => ({
                required: !getFieldValue("primaryContactId"),
                message: "Phải nhập SĐT hoặc chọn Người liên hệ chính",
              }),
              { pattern: /^0\d{9}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input
              placeholder="Để trống nếu chọn người liên hệ"
              onChange={(e) => checkPhoneNumber(e.target.value)}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Người liên hệ chính"
            name="primaryContactId"
            dependencies={["phone"]}
            rules={[
              ({ getFieldValue }) => ({
                required: !getFieldValue("phone"),
                message: "Phải chọn Người liên hệ chính hoặc nhập SĐT",
              }),
            ]}
          >
            <Select
              showSearch
              placeholder="Tìm theo Tên hoặc SĐT..."
              defaultActiveFirstOption={false}
              filterOption={false}
              onSearch={debouncedFetchCustomers}
              notFoundContent={searching ? <Spin size="small" /> : null}
              options={customerOptions}
              allowClear
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.primaryContactId !== currentValues.primaryContactId
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("primaryContactId") ? (
                <Form.Item
                  label="Mối quan hệ"
                  name="relationshipToPrimary"
                  rules={[{ required: true, message: "Nhập mối quan hệ" }]}
                >
                  <Input placeholder="Ví dụ: Con trai, Mẹ..." />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Email" name="email">
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
          <Form.Item label="Chi nhánh" name="clinicId">
            <Select
              options={BRANCHES.map((b) => ({
                label: b.label,
                value: b.value,
              }))}
              allowClear
              disabled={true}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Địa chỉ" name="address">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Tỉnh/Thành phố" name="city">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Quận/Huyện" name="district">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Nghề nghiệp" name="occupation">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Nguồn khách" name="source">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Ghi chú nguồn" name="sourceNotes">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Dịch vụ quan tâm" name="servicesOfInterest">
            <Select
              mode="tags"
              allowClear
              placeholder="Nhập hoặc chọn dịch vụ"
            />
          </Form.Item>
        </Col>
      </Row>

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
