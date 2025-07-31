// src/features/payment/components/PaymentVoucherForm.tsx
"use client";
import {
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  Button,
  Table,
  Input,
} from "antd";
import { useState, useEffect } from "react";
import type { ConsultedService } from "@prisma/client";
import { formatCurrency } from "@/utils/date";

const { TextArea } = Input;

type Props = {
  form?: any;
  onFinish: (values: any) => void;
  loading?: boolean;
  availableServices: ConsultedService[];
  employees: any[];
};

export default function PaymentVoucherForm({
  form,
  onFinish,
  loading = false,
  availableServices = [],
  employees = [],
}: Props) {
  const [formInstance] = Form.useForm(form);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  const cashiers = employees.filter(
    (e) => e.title === "Kế toán" || e.title === "Lễ tân" || e.role === "admin"
  );

  const handleServiceSelect = (serviceId: string) => {
    const service = availableServices.find((s) => s.id === serviceId);
    if (!service) return;

    const remainingDebt = service.finalPrice - service.amountPaid;

    const newService = {
      consultedServiceId: serviceId,
      serviceName: service.consultedServiceName,
      remainingDebt: remainingDebt,
      amount: remainingDebt, // ✅ SỬA: Mặc định = full debt
      paymentMethod: "Tiền mặt",
    };

    setSelectedServices((prev) => [...prev, newService]);
    calculateTotal([...selectedServices, newService]);
  };

  const removeService = (index: number) => {
    const newServices = selectedServices.filter((_, i) => i !== index);
    setSelectedServices(newServices);
    calculateTotal(newServices);
  };

  const calculateTotal = (services: any[]) => {
    const total = services.reduce((sum, service) => sum + service.amount, 0);
    formInstance.setFieldsValue({ totalAmount: total });
  };

  const columns = [
    {
      title: "Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Còn nợ",
      dataIndex: "remainingDebt",
      key: "remainingDebt",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Số tiền thu",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record: any, index: number) => (
        <InputNumber
          value={amount}
          min={0}
          max={record.remainingDebt}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => {
            const newServices = [...selectedServices];
            newServices[index].amount = value || 0;
            setSelectedServices(newServices);
            calculateTotal(newServices);
          }}
        />
      ),
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string, record: any, index: number) => (
        <Select
          value={method}
          onChange={(value) => {
            const newServices = [...selectedServices];
            newServices[index].paymentMethod = value;
            setSelectedServices(newServices);
          }}
          options={[
            { label: "Tiền mặt", value: "Tiền mặt" },
            { label: "Chuyển khoản", value: "Chuyển khoản" },
            { label: "Quẹt thẻ", value: "Quẹt thẻ" },
          ]}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: any, index: number) => (
        <Button size="small" danger onClick={() => removeService(index)}>
          Xóa
        </Button>
      ),
    },
  ];

  const handleFinish = (values: any) => {
    onFinish({
      ...values,
      details: selectedServices.map((service) => ({
        consultedServiceId: service.consultedServiceId,
        amount: service.amount,
        paymentMethod: service.paymentMethod,
      })),
    });
  };

  return (
    <Form
      form={formInstance}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        paymentMethod: "Tiền mặt",
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Thu ngân"
            name="cashierId"
            rules={[{ required: true, message: "Vui lòng chọn thu ngân" }]}
          >
            <Select
              placeholder="Chọn thu ngân"
              options={cashiers.map((c) => ({
                label: c.fullName,
                value: c.id,
              }))}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Tổng tiền" name="totalAmount">
            <InputNumber
              style={{ width: "100%" }}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="Ghi chú" name="notes">
            <TextArea rows={2} placeholder="Ghi chú về phiếu thu..." />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="Chọn dịch vụ thanh toán">
            <Select
              placeholder="Chọn dịch vụ cần thanh toán"
              onSelect={(value) => handleServiceSelect(value, 0)}
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
                  label: `${s.consultedServiceName} - Còn nợ: ${formatCurrency(
                    s.finalPrice - s.amountPaid
                  )}`,
                  value: s.id,
                }))}
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Table
            columns={columns}
            dataSource={selectedServices}
            rowKey="consultedServiceId"
            pagination={false}
            size="small"
          />
        </Col>
      </Row>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={selectedServices.length === 0}
          block
          style={{ marginTop: 16 }}
        >
          Tạo phiếu thu
        </Button>
      </Form.Item>
    </Form>
  );
}
