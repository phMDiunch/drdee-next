// src/features/consulted-service/components/ConsultedServiceForm.tsx
"use client";
import { Form, Select, InputNumber, Row, Col, Button, Input, Tag } from "antd";
import { useState } from "react";
import type { DentalService, Employee } from "@prisma/client";
import ToothSelectionModal from "./ToothSelectionModal ";

const { TextArea } = Input;

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
  const [toothModalVisible, setToothModalVisible] = useState(false);
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);

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
        consultedServiceName: selectedService.name,
        consultedServiceUnit: selectedService.unit,
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

  // Xử lý chọn răng
  const handleOpenToothModal = () => {
    const currentTeeth = formInstance.getFieldValue("toothPositions") || [];
    setSelectedTeeth(currentTeeth);
    setToothModalVisible(true);
  };

  const handleToothModalOk = (teeth: string[]) => {
    setSelectedTeeth(teeth);
    formInstance.setFieldsValue({ toothPositions: teeth });
    setToothModalVisible(false);
  };

  const handleToothModalCancel = () => {
    setToothModalVisible(false);
  };

  return (
    <>
      <Form
        form={formInstance}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        initialValues={{
          quantity: 1,
        }}
      >
        <Row gutter={16}>
          {/* Dịch vụ */}
          <Col span={18}>
            <Form.Item
              label="Dịch vụ"
              name="dentalServiceId"
              rules={[{ required: true, message: "Vui lòng chọn dịch vụ" }]}
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

          {/* Đơn vị (readonly) */}
          <Col span={6}>
            <Form.Item label="Đơn vị" name="consultedServiceUnit">
              <Input disabled placeholder="Đơn vị" />
            </Form.Item>
          </Col>

          {/* Vị trí răng */}
          <Col span={24}>
            <Form.Item label="Vị trí răng" name="toothPositions">
              <div>
                <Button
                  onClick={handleOpenToothModal}
                  style={{ marginBottom: 8 }}
                >
                  Chọn vị trí răng ({selectedTeeth.length})
                </Button>
                <div>
                  {selectedTeeth.map((tooth) => (
                    <Tag key={tooth} color="blue">
                      {tooth}
                    </Tag>
                  ))}
                </div>
              </div>
            </Form.Item>
          </Col>

          {/* Giá cả */}
          <Col span={6}>
            <Form.Item label="Đơn giá (VNĐ)" name="price">
              <InputNumber
                style={{ width: "100%" }}
                disabled
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Giá ưu đãi (VNĐ)" name="preferentialPrice">
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Số lượng" name="quantity">
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          </Col>

          {/* Thành tiền */}
          <Col span={6}>
            <Form.Item label="Thành tiền (VNĐ)" name="finalPrice">
              <InputNumber
                style={{ width: "100%" }}
                disabled
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>

          {/* Nhân sự */}
          <Col span={8}>
            <Form.Item label="Bác sĩ tư vấn" name="consultingDoctorId">
              <Select
                showSearch
                allowClear
                placeholder="Chọn bác sĩ tư vấn"
                options={doctors.map((d) => ({
                  label: d.fullName,
                  value: d.id,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Sale tư vấn" name="consultingSaleId">
              <Select
                showSearch
                allowClear
                placeholder="Chọn sale tư vấn"
                options={sales.map((s) => ({ label: s.fullName, value: s.id }))}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Bác sĩ điều trị" name="treatingDoctorId">
              <Select
                showSearch
                allowClear
                placeholder="Chọn bác sĩ điều trị"
                options={doctors.map((d) => ({
                  label: d.fullName,
                  value: d.id,
                }))}
              />
            </Form.Item>
          </Col>

          {/* Ghi chú */}
          <Col span={24}>
            <Form.Item label="Ghi chú tình trạng" name="specificStatus">
              <TextArea
                rows={3}
                placeholder="Ghi chú của bác sĩ về tình trạng răng..."
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Footer */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ marginTop: 12 }}
            block
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </Form.Item>
      </Form>

      {/* Modal chọn răng */}
      <ToothSelectionModal
        visible={toothModalVisible}
        onOk={handleToothModalOk}
        onCancel={handleToothModalCancel}
        initialSelected={selectedTeeth}
      />
    </>
  );
}
