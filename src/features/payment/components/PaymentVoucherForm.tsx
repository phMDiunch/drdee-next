// src/features/payment/components/PaymentVoucherForm.tsx
"use client";
import {
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  Button,
  Input,
  Card,
  Typography,
  Space,
  List,
  Tag,
  Alert,
} from "antd";
import { useState } from "react";
import { DeleteOutlined, DollarOutlined } from "@ant-design/icons";
import type { ConsultedService } from "@prisma/client";
import { formatCurrency } from "@/utils/date";
import { useAppStore } from "@/stores/useAppStore";

const { TextArea } = Input;
const { Title, Text } = Typography;

type Props = {
  form?: any;
  onFinish: (values: any) => void;
  loading?: boolean;
  availableServices: ConsultedService[];
  employees: any[];
  customers: any[]; // Thêm prop customers
};

export default function PaymentVoucherForm({
  form,
  onFinish,
  loading = false,
  availableServices = [],
  employees = [],
  customers = [], // Thêm prop customers
}: Props) {
  const [formInstance] = Form.useForm(form);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const { employeeProfile } = useAppStore();

  const handleServiceSelect = (serviceId: string) => {
    const service = availableServices.find((s) => s.id === serviceId);
    if (!service) return;

    const remainingDebt = service.finalPrice - service.amountPaid;
    const newService = {
      consultedServiceId: serviceId,
      serviceName: service.consultedServiceName,
      remainingDebt: remainingDebt,
      amount: remainingDebt,
      paymentMethod: "Tiền mặt",
    };

    setSelectedServices((prev) => [...prev, newService]);
  };

  const removeService = (index: number) => {
    const newServices = selectedServices.filter((_, i) => i !== index);
    setSelectedServices(newServices);
  };

  const updateServiceAmount = (index: number, amount: number) => {
    const newServices = [...selectedServices];
    newServices[index].amount = amount;
    setSelectedServices(newServices);
  };

  const updatePaymentMethod = (index: number, method: string) => {
    const newServices = [...selectedServices];
    newServices[index].paymentMethod = method;
    setSelectedServices(newServices);
  };

  const totalAmount = selectedServices.reduce((sum, s) => sum + s.amount, 0);

  const handleFinish = (values: any) => {
    onFinish({
      ...values,
      cashierId: employeeProfile?.id,
      totalAmount,
      details: selectedServices.map((service) => ({
        consultedServiceId: service.consultedServiceId,
        amount: service.amount,
        paymentMethod: service.paymentMethod,
      })),
    });
  };

  return (
    <div>
      {/* Header - Compact Info */}
      <Alert
        message={`Thu ngân: ${
          employeeProfile?.fullName
        } | ${new Date().toLocaleDateString("vi-VN")}`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Main Form */}
      <Form form={formInstance} layout="vertical" onFinish={handleFinish}>
        {/* Customer Selection - New Section */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Chọn khách hàng:
          </Text>
          <Form.Item
            name="customerId"
            rules={[{ required: true, message: "Vui lòng chọn khách hàng!" }]}
          >
            <Select
              placeholder="Chọn khách hàng..."
              showSearch
              optionFilterProp="children"
              // onSelect={handleCustomerSelect} // Hàm xử lý khi chọn khách hàng
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={customers.map((customer) => ({
                label: customer.fullName,
                value: customer.id,
              }))}
            />
          </Form.Item>
        </Card>

        {/* Service Selection - Simplified */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Chọn dịch vụ cần thu tiền:
          </Text>
          <Select
            placeholder="Tìm dịch vụ..."
            size="large"
            style={{ width: "100%" }}
            showSearch
            value=""
            onSelect={handleServiceSelect}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={availableServices
              .filter(
                (s) =>
                  s.serviceStatus === "Đã chốt" &&
                  s.finalPrice > s.amountPaid &&
                  !selectedServices.some(
                    (sel) => sel.consultedServiceId === s.id
                  )
              )
              .map((s) => ({
                label: `${s.consultedServiceName} (Nợ: ${formatCurrency(
                  s.finalPrice - s.amountPaid
                )})`,
                value: s.id,
              }))}
          />
        </Card>

        {/* Selected Services - Clean List */}
        {selectedServices.length > 0 && (
          <Card
            size="small"
            title={`Đã chọn ${selectedServices.length} dịch vụ`}
            style={{ marginBottom: 16 }}
          >
            <List
              dataSource={selectedServices}
              renderItem={(service, index) => (
                <List.Item
                  key={service.consultedServiceId}
                  style={{
                    backgroundColor: "#fafafa",
                    marginBottom: 8,
                    padding: 12,
                    borderRadius: 6,
                  }}
                >
                  <Row style={{ width: "100%" }} gutter={8} align="middle">
                    {/* Service Name */}
                    <Col span={8}>
                      <Text strong>{service.serviceName}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Còn nợ: {formatCurrency(service.remainingDebt)}
                      </Text>
                    </Col>

                    {/* Amount Input */}
                    <Col span={6}>
                      <InputNumber
                        value={service.amount}
                        min={0}
                        max={service.remainingDebt}
                        style={{ width: "100%" }}
                        placeholder="Số tiền"
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                        onChange={(value) =>
                          updateServiceAmount(index, value || 0)
                        }
                      />
                    </Col>

                    {/* Payment Method */}
                    <Col span={6}>
                      <Select
                        value={service.paymentMethod}
                        style={{ width: "100%" }}
                        onChange={(value) => updatePaymentMethod(index, value)}
                        options={[
                          { label: "Tiền mặt", value: "Tiền mặt" },
                          { label: "Chuyển khoản", value: "Chuyển khoản" },
                          { label: "Quẹt thẻ", value: "Quẹt thẻ" },
                        ]}
                      />
                    </Col>

                    {/* Delete Button */}
                    <Col span={4} style={{ textAlign: "right" }}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeService(index)}
                      />
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Total & Notes */}
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item label="Ghi chú" name="notes">
              <TextArea rows={2} placeholder="Ghi chú (không bắt buộc)..." />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Card
              size="small"
              bodyStyle={{
                textAlign: "center",
                backgroundColor: "#f0f9ff",
                padding: 16,
              }}
            >
              <DollarOutlined style={{ fontSize: 24, color: "#1890ff" }} />
              <br />
              <Text type="secondary">TỔNG CỘNG</Text>
              <br />
              <Title level={3} style={{ color: "#1890ff", margin: "4px 0" }}>
                {formatCurrency(totalAmount)}
              </Title>
            </Card>
          </Col>
        </Row>

        {/* Submit Button */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
            disabled={selectedServices.length === 0}
            style={{
              minWidth: 200,
              height: 48,
              fontSize: 16,
            }}
          >
            Tạo phiếu thu ({selectedServices.length} dịch vụ)
          </Button>
        </div>
      </Form>
    </div>
  );
}
