// src/features/consulted-service/components/ConsultedServiceForm.tsx
"use client";
import { Form, Select, InputNumber, Row, Col, Button, DatePicker } from "antd";
import type { DentalService, Employee } from "@prisma/client";
import { useAppStore } from "@/stores/useAppStore";

type Props = {
  form?: any;
  onFinish: (values: any) => void;
  loading?: boolean;
  dentalServices: DentalService[];
  employees: Employee[];
};

export default function ConsultedServiceForm({
  form,
  onFinish,
  loading = false,
  dentalServices = [],
  employees = [],
}: Props) {
  const [formInstance] = Form.useForm(form);

  // Lọc ra danh sách bác sĩ và sale
  const doctors = employees.filter((e) => e.title === "Bác sĩ");
  const sales = employees.filter(
    (e) => e.title === "Sale online" || e.title === "Sale offline"
  );

  // Hàm xử lý khi chọn một dịch vụ
  const handleServiceChange = (dentalServiceId: string) => {
    const selectedService = dentalServices.find(
      (s) => s.id === dentalServiceId
    );
    if (selectedService) {
      formInstance.setFieldsValue({
        price: selectedService.price,
        preferentialPrice: selectedService.price,
        quantity: 1,
      });
      // Tự động tính thành tiền
      handleValuesChange({}, formInstance.getFieldsValue());
    }
  };

  // Hàm tự động tính toán lại các giá trị
  const handleValuesChange = (_: any, allValues: any) => {
    const { quantity = 1, preferentialPrice = 0 } = allValues;
    const finalPrice = quantity * preferentialPrice;
    formInstance.setFieldsValue({ finalPrice });
  };

  return (
    <Form
      form={formInstance}
      layout="vertical"
      onFinish={onFinish}
      onValuesChange={handleValuesChange}
      initialValues={{
        quantity: 1,
        serviceStatus: "Chưa chốt",
        treatmentStatus: "Chưa điều trị",
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Dịch vụ"
            name="dentalServiceId"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              placeholder="Chọn dịch vụ"
              options={dentalServices.map((s) => ({
                label: s.name,
                value: s.id,
              }))}
              onChange={handleServiceChange}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Đơn giá (VNĐ)" name="price">
            <InputNumber style={{ width: "100%" }} disabled />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Giá ưu đãi (VNĐ)" name="preferentialPrice">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Số lượng" name="quantity">
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Thành tiền (VNĐ)" name="finalPrice">
            <InputNumber style={{ width: "100%" }} disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Bác sĩ tư vấn" name="consultingDoctorId">
            <Select
              showSearch
              allowClear
              placeholder="Chọn bác sĩ tư vấn"
              options={doctors.map((d) => ({ label: d.fullName, value: d.id }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Sale tư vấn" name="consultingSaleId">
            <Select
              showSearch
              allowClear
              placeholder="Chọn sale tư vấn"
              options={sales.map((s) => ({ label: s.fullName, value: s.id }))}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          style={{ marginTop: 16 }}
        >
          Lưu
        </Button>
      </Form.Item>
    </Form>
  );
}
