// src/features/appointments/components/AppointmentForm.tsx
import { Form, Input, DatePicker, Select, Row, Col, Button, Spin } from "antd";
import { useState, useCallback, useEffect } from "react"; // Thêm useEffect
import debounce from "lodash/debounce";
import type { Appointment } from "../type";
import { BRANCHES } from "@/constants";
import { useAppStore } from "@/stores/useAppStore";
import dayjs from "dayjs";
import { APPOINTMENT_STATUS_OPTIONS } from "../constants";

type Props = {
  form?: any;
  initialValues?: Partial<Appointment & { customer?: any }>; // Thêm customer vào initialValues
  onFinish: (values: Partial<Appointment>) => void;
  loading?: boolean;
  mode?: "add" | "edit";
  employees?: any[];
};

export default function AppointmentForm({
  form,
  initialValues = {},
  onFinish,
  loading = false,
  mode = "add",
  employees = [],
}: Props) {
  const employee = useAppStore((state) => state.employeeProfile);
  const [searching, setSearching] = useState(false);
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);

  useEffect(() => {
    if (mode === "edit" && initialValues.customer) {
      const customer = initialValues.customer;
      setCustomerOptions([
        {
          label: `${customer.fullName} - ${customer.phone}`,
          value: customer.id,
        },
      ]);
    }
  }, [initialValues, mode]);

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

  // Dùng debounce để tránh gọi API liên tục khi gõ
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
              showArrow={false}
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
        {/* Bác sĩ chính */}
        <Col span={12}>
          <Form.Item
            label="Bác sĩ chính"
            name="primaryDentistId"
            rules={[{ required: true, message: "Chọn bác sĩ chính" }]}
          >
            <Select
              showSearch
              options={employees.map((e) => ({
                label: e.fullName,
                value: e.id,
              }))}
              placeholder="Chọn bác sĩ"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
        {/* Bác sĩ phụ */}
        <Col span={12}>
          <Form.Item label="Bác sĩ phụ" name="secondaryDentistId">
            <Select
              showSearch
              options={employees.map((e) => ({
                label: e.fullName,
                value: e.id,
              }))}
              allowClear
              placeholder="Chọn bác sĩ phụ (nếu có)"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
        {/* Chi nhánh */}
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
        {/* Trạng thái */}
        <Col span={12}>
          <Form.Item label="Trạng thái" name="status">
            <Select options={APPOINTMENT_STATUS_OPTIONS} />
          </Form.Item>
        </Col>
        {/* Ghi chú */}
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
