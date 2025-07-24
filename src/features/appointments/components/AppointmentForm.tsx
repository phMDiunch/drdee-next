// src/features/appointments/components/AppointmentForm.tsx
import { Form, Input, DatePicker, Select, Row, Col, Button } from "antd";
import type { Appointment } from "../type";
import { BRANCHES } from "@/constants";
import { useEmployeeProfile } from "@/features/auth/hooks/useAuth";
import dayjs from "dayjs";
import { APPOINTMENT_STATUS_OPTIONS } from "../constants";

type Props = {
  form?: any;
  initialValues?: Partial<Appointment>;
  onFinish: (values: Partial<Appointment>) => void;
  loading?: boolean;
  mode?: "add" | "edit";
  customers?: any[]; // danh sách khách hàng
  employees?: any[]; // danh sách nhân viên (bác sĩ)
};

export default function AppointmentForm({
  form,
  initialValues = {},
  onFinish,
  loading = false,
  mode = "add",
  customers = [],
  employees = [],
}: Props) {
  const { employee } = useEmployeeProfile();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialValues,
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
              options={customers.map((c) => ({
                label: c.fullName + " - " + c.phone,
                value: c.id,
              }))}
              placeholder="Chọn khách hàng"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
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
          <Form.Item
            label="Trạng thái"
            name="status"
            initialValue="Chờ xác nhận"
          >
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
