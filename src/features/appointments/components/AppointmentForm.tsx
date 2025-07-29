// src/features/appointments/components/AppointmentForm.tsx
"use client";
import { Form, Input, DatePicker, Select, Row, Col, Button, Spin } from "antd";
import { useState, useCallback } from "react"; // Bỏ useEffect
import debounce from "lodash/debounce";
import type { Appointment } from "../type";
import { BRANCHES } from "@/constants";
import { useAppStore } from "@/stores/useAppStore";
import dayjs from "dayjs";
import { APPOINTMENT_STATUS_OPTIONS } from "../constants";

type Props = {
  form?: any;
  initialValues?: Partial<Appointment & { customer?: any }>;
  onFinish: (values: Partial<Appointment>) => void;
  loading?: boolean;
  mode?: "add" | "edit";
  dentists?: any[];
};

export default function AppointmentForm({
  form,
  initialValues = {},
  onFinish,
  loading = false,
  mode = "add",
  dentists = [],
}: Props) {
  const employee = useAppStore((state) => state.employeeProfile);
  const [searching, setSearching] = useState(false);

  // --- THÊM DÒNG NÀY ĐỂ BẠN KIỂM TRA ---
  console.log("3. Dữ liệu 'dentists' nhận được tại Form:", dentists);

  // TỐI ƯU: Khởi tạo state với giá trị ban đầu, thay vì dùng useEffect
  const [customerOptions, setCustomerOptions] = useState<any[]>(() => {
    if (mode === "edit" && initialValues.customer) {
      const customer = initialValues.customer;
      return [
        {
          label: `${customer.fullName} - ${customer.phone}`,
          value: customer.id,
        },
      ];
    }
    return [];
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
        label: `${c.fullName} - ${c.phone}`,
        value: c.id,
      }));
      setCustomerOptions(options);
    } catch (error) {
      console.error("Failed to search customers:", error);
    }
    setSearching(false);
  };

  const debouncedFetchCustomers = useCallback(
    debounce(fetchCustomers, 500),
    []
  );

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialValues,
        status: initialValues.status || "Chờ xác nhận",
        clinicId: initialValues.clinicId || employee?.clinicId,
        appointmentDateTime: initialValues.appointmentDateTime
          ? dayjs(initialValues.appointmentDateTime)
          : undefined,
      }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Row gutter={16}>
        {/* Khách hàng */}
        <Col span={12}>
          <Form.Item
            label="Khách hàng"
            name="customerId"
            rules={[{ required: true, message: "Chọn khách hàng" }]}
          >
            <Select
              showSearch
              placeholder="Gõ tên hoặc SĐT để tìm khách hàng..."
              defaultActiveFirstOption={false}
              suffixIcon={null} // Tối ưu: Sửa lỗi warning của Antd
              filterOption={false}
              onSearch={debouncedFetchCustomers}
              notFoundContent={searching ? <Spin size="small" /> : null}
              options={customerOptions}
            />
          </Form.Item>
        </Col>
        {/* Thời gian hẹn */}
        <Col span={12}>
          <Form.Item
            label="Thời gian hẹn"
            name="appointmentDateTime"
            rules={[{ required: true, message: "Chọn thời gian hẹn" }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
              minuteStep={5}
              allowClear={false}
            />
          </Form.Item>
        </Col>
        {/* Bác sĩ chính & phụ */}
        <Col span={12}>
          <Form.Item
            label="Bác sĩ / Điều dưỡng chính"
            name="primaryDentistId"
            rules={[{ required: true, message: "Chọn người thực hiện chính" }]}
          >
            <Select
              showSearch
              options={dentists.map((e) => ({
                label: e.fullName,
                value: e.id,
              }))}
              placeholder="Chọn bác sĩ hoặc điều dưỡng"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Bác sĩ / Điều dưỡng phụ" name="secondaryDentistId">
            <Select
              showSearch
              options={dentists.map((e) => ({
                label: e.fullName,
                value: e.id,
              }))}
              allowClear
              placeholder="Chọn người phụ (nếu có)"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
        {/* Các trường khác */}
        <Col span={12}>
          <Form.Item label="Chi nhánh" name="clinicId">
            <Select
              options={BRANCHES.map((b) => ({
                label: b.label,
                value: b.value,
              }))}
              disabled={true}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Trạng thái" name="status">
            <Select options={APPOINTMENT_STATUS_OPTIONS} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea
              rows={2}
              placeholder="Nhập nội dung ghi chú (nếu có)"
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
