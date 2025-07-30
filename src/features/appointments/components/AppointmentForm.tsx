// src/features/appointments/components/AppointmentForm.tsx
"use client";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Button,
  Spin,
  InputNumber,
  Alert,
} from "antd";
import { useState, useCallback } from "react";
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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    initialValues.customerId || initialValues.customer?.id || null
  );
  const [dateValidationError, setDateValidationError] = useState<string>("");

  console.log("3. Dữ liệu 'dentists' nhận được tại Form:", dentists);

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
    if (mode === "add" && initialValues.customer) {
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

  // ✅ VALIDATION: Kiểm tra ngày được chọn
  const handleDateChange = async (date: dayjs.Dayjs | null) => {
    setDateValidationError("");

    if (!date) return;

    // Kiểm tra không được chọn ngày trong quá khứ
    if (date.isBefore(dayjs(), "minute")) {
      setDateValidationError("Không thể đặt lịch hẹn trong quá khứ!");
      return;
    }

    // Kiểm tra khách hàng đã có lịch trong ngày chưa (chỉ khi có customer)
    if (selectedCustomerId && mode === "add") {
      try {
        const params = new URLSearchParams({
          customerId: selectedCustomerId,
          date: date.format("YYYY-MM-DD"),
        });

        const res = await fetch(
          `/api/appointments/check-conflict?${params.toString()}`
        );
        const data = await res.json();

        if (data.hasConflict) {
          setDateValidationError(
            `Khách hàng đã có lịch hẹn vào ngày ${date.format(
              "DD/MM/YYYY"
            )} lúc ${dayjs(data.existingAppointment.appointmentDateTime).format(
              "HH:mm"
            )}!`
          );
        }
      } catch (error) {
        console.error("Error checking date conflict:", error);
      }
    }
  };

  // ✅ VALIDATION: Khi thay đổi khách hàng
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setDateValidationError(""); // Reset error khi đổi khách hàng
  };

  // ✅ DISABLE DATES: Disable ngày trong quá khứ
  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current.isBefore(dayjs(), "day");
  };

  // ✅ DISABLE TIMES: Disable giờ trong quá khứ cho ngày hôm nay
  const disabledTime = (current: dayjs.Dayjs | null) => {
    if (!current || !current.isSame(dayjs(), "day")) {
      return {}; // Không disable gì nếu không phải hôm nay
    }

    const now = dayjs();
    return {
      disabledHours: () => {
        const hours = [];
        for (let i = 0; i < now.hour(); i++) {
          hours.push(i);
        }
        return hours;
      },
      disabledMinutes: (selectedHour: number) => {
        if (selectedHour < now.hour()) {
          return [];
        }
        if (selectedHour === now.hour()) {
          const minutes = [];
          for (let i = 0; i <= now.minute(); i++) {
            minutes.push(i);
          }
          return minutes;
        }
        return [];
      },
    };
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialValues,
        status: initialValues.status || "Chờ xác nhận",
        duration: initialValues.duration || 30,
        clinicId: initialValues.clinicId || employee?.clinicId,
        appointmentDateTime: initialValues.appointmentDateTime
          ? dayjs(initialValues.appointmentDateTime)
          : undefined,
        customerId: initialValues.customerId || initialValues.customer?.id,
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
              suffixIcon={null}
              filterOption={false}
              onSearch={debouncedFetchCustomers}
              onChange={handleCustomerChange}
              notFoundContent={searching ? <Spin size="small" /> : null}
              options={customerOptions}
              disabled={
                (mode === "add" && initialValues.customerId) ||
                (mode === "add" && initialValues.customer)
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
            validateStatus={dateValidationError ? "error" : ""}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
              minuteStep={15}
              allowClear={false}
              disabledDate={disabledDate}
              disabledTime={disabledTime}
              onChange={handleDateChange}
            />
          </Form.Item>
        </Col>

        {/* Alert nếu có lỗi validation */}
        {dateValidationError && (
          <Col span={24}>
            <Alert
              message={dateValidationError}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
        )}

        {/* Các trường khác giữ nguyên */}
        <Col span={12}>
          <Form.Item
            label="Thời lượng (phút)"
            name="duration"
            rules={[{ required: true, message: "Nhập thời lượng" }]}
          >
            <InputNumber style={{ width: "100%" }} min={5} step={5} />
          </Form.Item>
        </Col>

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
          disabled={!!dateValidationError} // Disable nếu có lỗi validation
        >
          Lưu
        </Button>
      </Form.Item>
    </Form>
  );
}
