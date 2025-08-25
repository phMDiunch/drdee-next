// src/features/consulted-service/components/ConsultedServiceForm.tsx
"use client";
import { Form, Select, InputNumber, Row, Col, Button, Input, Tag } from "antd";
import { useState, useMemo } from "react";
import type { DentalService, Employee } from "@prisma/client";
import type { FormInstance } from "antd";
import { useAppStore } from "@/stores/useAppStore";
import { calculateDaysSinceConfirm } from "@/utils/date";
import type { ConsultedServiceWithDetails } from "../type";
import ToothSelectionModal from "./ToothSelectionModal ";

const { TextArea } = Input;

type Props = {
  form: FormInstance; // Required form instance
  onFinish: (values: Record<string, unknown>) => void;
  loading?: boolean;
  dentalServices: DentalService[];
  employees: Employee[];
  initialData?: Partial<ConsultedServiceWithDetails>; // ✅ ADD: To check edit permissions
};

export default function ConsultedServiceForm({
  form,
  onFinish,
  loading = false,
  dentalServices = [],
  employees = [],
  initialData, // ✅ ADD: Initial data for permission checking
}: Props) {
  const [toothModalVisible, setToothModalVisible] = useState(false);
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);

  // ✅ ADD: Get current user profile for permission checking
  const { employeeProfile } = useAppStore();

  // ✅ UPDATED: Sử dụng tất cả employees thay vì filter theo chức danh
  const allEmployees = employees; // Không filter gì cả

  // ✅ ADD: Check if user can edit employee fields (doctors, sale)
  const canEditEmployeeFields = useMemo(() => {
    const isAdmin = employeeProfile?.role === "admin";

    if (isAdmin) return true;

    // Service chưa chốt thì vẫn sửa được
    if (
      !initialData?.serviceConfirmDate ||
      initialData?.serviceStatus !== "Đã chốt"
    ) {
      return true;
    }

    const confirmDateStr =
      typeof initialData.serviceConfirmDate === "string"
        ? initialData.serviceConfirmDate
        : initialData.serviceConfirmDate.toISOString();
    const daysSinceConfirm = calculateDaysSinceConfirm(confirmDateStr);
    return daysSinceConfirm <= 33;
  }, [employeeProfile?.role, initialData]);

  // ✅ NEW: Check if user can edit other fields (non-employee fields)
  const canEditOtherFields = useMemo(() => {
    // Nếu service chưa chốt thì sửa được tất cả
    if (
      !initialData?.serviceConfirmDate ||
      initialData?.serviceStatus !== "Đã chốt"
    ) {
      return true;
    }

    // Nếu service đã chốt thì không được sửa các trường khác
    return false;
  }, [initialData]);

  // Thêm console.log để debug:
  console.log("All employees:", employees); // ✅ DEBUG
  console.log("All employees (same as above):", allEmployees); // ✅ DEBUG
  console.log(
    "Available titles:",
    employees.map((e) => e.title)
  ); // ✅ DEBUG

  // Hàm xử lý khi chọn một dịch vụ
  const handleServiceChange = (dentalServiceId: string) => {
    const selectedService = dentalServices.find(
      (s) => s.id === dentalServiceId
    );
    if (selectedService) {
      form.setFieldsValue({
        price: selectedService.price,
        preferentialPrice: selectedService.price,
        quantity: 1,
        consultedServiceName: selectedService.name,
        consultedServiceUnit: selectedService.unit,
      });
      // Tự động tính thành tiền
      handleValuesChange({}, form.getFieldsValue());
    }
  };

  // Hàm tự động tính toán lại các giá trị
  const handleValuesChange = (
    _: Record<string, unknown>,
    allValues: Record<string, unknown>
  ) => {
    const { quantity = 1, preferentialPrice = 0 } = allValues;
    const finalPrice = (quantity as number) * (preferentialPrice as number);
    form.setFieldsValue({ finalPrice });
  };

  // Xử lý chọn răng
  const handleOpenToothModal = () => {
    const currentTeeth = form.getFieldValue("toothPositions") || [];
    setSelectedTeeth(currentTeeth);
    setToothModalVisible(true);
  };

  const handleToothModalOk = (teeth: string[]) => {
    setSelectedTeeth(teeth);
    form.setFieldsValue({ toothPositions: teeth });
    setToothModalVisible(false);
  };

  const handleToothModalCancel = () => {
    setToothModalVisible(false);
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          console.log("📋 Form onFinish - submitted values:", {
            preferentialPrice: values.preferentialPrice,
            finalPrice: values.finalPrice,
            quantity: values.quantity,
            isPreferentialPriceZero: values.preferentialPrice === 0,
            isPreferentialPriceUndefined:
              values.preferentialPrice === undefined,
            allValues: values,
          });
          onFinish(values);
        }}
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
                disabled={!canEditOtherFields}
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
                  disabled={!canEditOtherFields}
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
                disabled={!canEditOtherFields}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Số lượng" name="quantity">
              <InputNumber
                style={{ width: "100%" }}
                disabled={!canEditOtherFields}
                min={1}
              />
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
                disabled={!canEditEmployeeFields}
                placeholder="Chọn bác sĩ tư vấn"
                options={allEmployees.map((d) => ({
                  label: d.fullName,
                  value: d.id,
                }))}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Sale tư vấn" name="consultingSaleId">
              <Select
                showSearch
                allowClear
                disabled={!canEditEmployeeFields}
                placeholder="Chọn sale tư vấn"
                options={allEmployees.map((s) => ({
                  label: s.fullName,
                  value: s.id,
                }))}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Bác sĩ điều trị" name="treatingDoctorId">
              <Select
                showSearch
                allowClear
                disabled={!canEditEmployeeFields}
                placeholder="Chọn bác sĩ điều trị"
                options={allEmployees.map((d) => ({
                  label: d.fullName,
                  value: d.id,
                }))}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          {/* Ghi chú */}
          <Col span={24}>
            <Form.Item label="Ghi chú tình trạng" name="specificStatus">
              <TextArea
                rows={3}
                disabled={!canEditOtherFields}
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
