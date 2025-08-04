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
  Alert,
  Table,
} from "antd";
import { useState, useEffect, useMemo } from "react";
import { DollarOutlined } from "@ant-design/icons";
import { formatCurrency } from "@/utils/date";
import { useAppStore } from "@/stores/useAppStore";
import { PAYMENT_METHODS } from "../constants";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface PaymentVoucherFormProps {
  mode: "add" | "view";
  initialData?: any;
  onFinish: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  availableServices?: any[];
  employees?: any[];
  customerId?: string; // ✅ THÊM PROP NÀY
  currentCustomer?: { id: string; fullName: string; phone: string }; // ✅ THÊM CURRENT CUSTOMER
}

export default function PaymentVoucherForm({
  mode,
  initialData,
  onFinish,
  onCancel,
  loading = false,
  availableServices = [],
  employees = [],
  customerId,
  currentCustomer, // ✅ THÊM PROP MỚI
}: PaymentVoucherFormProps) {
  const [form] = Form.useForm();
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [outstandingServices, setOutstandingServices] = useState<any[]>([]);
  const [loadingOutstanding, setLoadingOutstanding] = useState(false);
  const { employeeProfile, customers = [], fetchCustomers } = useAppStore(); // ✅ Add fallback

  // ✅ Fetch outstanding services when customer is selected
  const fetchOutstandingServices = async (customerId: string) => {
    if (!customerId) return;

    setLoadingOutstanding(true);
    try {
      const response = await fetch(
        `/api/customers/${customerId}/outstanding-services`
      );
      const data = await response.json();

      if (data.success) {
        setOutstandingServices(data.data || []);
      } else {
        console.error("Failed to fetch outstanding services:", data.error);
        setOutstandingServices([]);
      }
    } catch (error) {
      console.error("Error fetching outstanding services:", error);
      setOutstandingServices([]);
    } finally {
      setLoadingOutstanding(false);
    }
  };

  // ✅ THÊM: Fetch customers khi component mount
  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers();
    }
  }, [customers.length, fetchCustomers]);

  // ✅ Fetch outstanding services khi customerId thay đổi
  useEffect(() => {
    if (customerId) {
      fetchOutstandingServices(customerId);
    }
  }, [customerId]);

  // ✅ THÊM useEffect để tự động set customerId
  useEffect(() => {
    if (mode === "add" && customerId && form && customers.length > 0) {
      // Kiểm tra xem customer có tồn tại trong danh sách không
      const customerExists = customers.some(
        (customer) => customer.id === customerId
      );
      if (customerExists) {
        form.setFieldsValue({
          customerId: customerId,
        });
        // Fetch outstanding services for this customer
        fetchOutstandingServices(customerId);
      }
    }
  }, [mode, customerId, form, customers]);

  // ✅ Debug log để kiểm tra
  useEffect(() => {
    if (customerId && customers.length > 0) {
      const customer = customers.find((c) => c.id === customerId);
      console.log("Debug PaymentForm:", {
        customerId,
        customerExists: !!customer,
        customerName: customer?.fullName,
        totalCustomers: customers.length,
      });
    }
  }, [customerId, customers]);

  const handleServiceSelect = (serviceId: string) => {
    const service = availableServices.find((s) => s.id === serviceId);
    if (!service) return;

    const remainingDebt = service.finalPrice - service.amountPaid;
    const newService = {
      consultedServiceId: serviceId,
      serviceName: service.consultedServiceName,
      remainingDebt: remainingDebt,
      amount: remainingDebt,
      paymentMethod: PAYMENT_METHODS[0].value, // Default to first payment method
    };

    setSelectedServices((prev) => [...prev, newService]);
  };

  // ✅ Handler for outstanding services
  const handleOutstandingServiceSelect = (service: any) => {
    const newService = {
      consultedServiceId: service.id,
      serviceName: service.consultedServiceName,
      remainingDebt: service.outstanding,
      amount: service.outstanding, // Default to full outstanding amount
      paymentMethod: PAYMENT_METHODS[0].value,
    };

    setSelectedServices((prev) => [...prev, newService]);
  };

  // ✅ Handler to remove outstanding service from selection
  const handleRemoveOutstandingService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.filter((service) => service.consultedServiceId !== serviceId)
    );
  };

  // ✅ New handlers for table-based form
  const handleServiceToggle = (service: any, checked: boolean) => {
    if (checked) {
      // Add service to selection with default values
      const newService = {
        consultedServiceId: service.id,
        serviceName: service.consultedServiceName,
        remainingDebt: service.outstanding,
        amount: 0, // ✅ Default to 0 instead of full outstanding amount
        paymentMethod: PAYMENT_METHODS[0].value,
      };
      setSelectedServices((prev) => [...prev, newService]);

      // Set form field value
      form.setFieldValue(`amount_${service.id}`, 0);
    } else {
      // Remove service from selection
      handleRemoveOutstandingService(service.id);

      // Clear form field value
      form.setFieldValue(`amount_${service.id}`, undefined);
    }
  };

  const handleAmountChange = (serviceId: string, amount: number) => {
    // Update selectedServices state
    setSelectedServices((prev) =>
      prev.map((service) =>
        service.consultedServiceId === serviceId
          ? { ...service, amount }
          : service
      )
    );

    // Update form field value
    form.setFieldValue(`amount_${serviceId}`, amount);
  };

  const handlePaymentMethodChange = (
    serviceId: string,
    paymentMethod: string
  ) => {
    setSelectedServices((prev) =>
      prev.map((service) =>
        service.consultedServiceId === serviceId
          ? { ...service, paymentMethod }
          : service
      )
    );
  };

  const totalAmount = selectedServices.reduce((sum, s) => sum + s.amount, 0);

  const handleFinish = (values: any) => {
    // ✅ SỬA: Filter chỉ lấy các field hợp lệ, loại bỏ amount_${serviceId}
    const validFields = Object.keys(values).filter(
      (key) => !key.startsWith("amount_")
    );
    const cleanValues = validFields.reduce((obj, key) => {
      obj[key] = values[key];
      return obj;
    }, {} as any);

    const processedData = {
      ...cleanValues,
      // ✅ SỬA: Không cần set cashierId ở đây vì usePayment sẽ set
      totalAmount,
      details: selectedServices.map((service) => ({
        consultedServiceId: service.consultedServiceId,
        amount: service.amount,
        paymentMethod: service.paymentMethod,
      })),
    };

    console.log("PaymentForm - handleFinish data:", {
      processedData,
      selectedServices,
      employeeProfile: employeeProfile?.id,
      totalAmount,
    });

    onFinish(processedData);
  };

  // ✅ SAFE MAPPING với fallback - combine store customers và currentCustomer
  const allCustomers = useMemo(() => {
    const storeCustomers = customers || [];
    if (
      currentCustomer &&
      !storeCustomers.find((c) => c.id === currentCustomer.id)
    ) {
      return [currentCustomer, ...storeCustomers];
    }
    return storeCustomers;
  }, [customers, currentCustomer]);

  const customerOptions = allCustomers.map((customer) => ({
    value: customer.id,
    label: `${customer.fullName} - ${customer.phone}`,
  }));

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
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={
          mode === "add"
            ? {
                paymentDate: dayjs(),
                customerId: customerId, // ✅ SET INITIAL VALUE
              }
            : {
                ...initialData,
                paymentDate: initialData?.paymentDate
                  ? dayjs(initialData.paymentDate)
                  : dayjs(),
              }
        }
      >
        {/* Hidden paymentDate field - auto set to current time */}
        <Form.Item name="paymentDate" hidden>
          <input type="hidden" />
        </Form.Item>

        {/* Customer Selection - New Section */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Chọn khách hàng:
          </Text>
          <Form.Item
            name="customerId"
            label="Khách hàng"
            rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
          >
            <Select
              placeholder="Chọn khách hàng"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={customerOptions} // ✅ Use safe options
              disabled={mode === "view" || !!customerId}
              onChange={(value) => {
                if (value) {
                  fetchOutstandingServices(value);
                  // Clear selected services when customer changes
                  setSelectedServices([]);
                }
              }}
            />
          </Form.Item>
        </Card>

        {/* Outstanding Services - Table Format with Form Controls */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text strong>Dịch vụ cần thu tiền:</Text>
            <Text type="secondary">
              {outstandingServices.length > 0
                ? `${outstandingServices.length} dịch vụ còn nợ`
                : "Không có dịch vụ nào còn nợ"}
            </Text>
          </div>

          {loadingOutstanding ? (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#999" }}
            >
              Đang tải dịch vụ...
            </div>
          ) : outstandingServices.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#999",
                backgroundColor: "#fafafa",
                borderRadius: "8px",
              }}
            >
              Khách hàng này không có dịch vụ nào còn nợ
            </div>
          ) : (
            <Table
              size="small"
              dataSource={outstandingServices}
              rowKey="id"
              pagination={false}
              bordered
              scroll={{ x: true }}
              columns={[
                {
                  title: "Chọn",
                  dataIndex: "selected",
                  width: 60,
                  align: "center" as const,
                  render: (_, service) => {
                    const isSelected = selectedServices.some(
                      (s) => s.consultedServiceId === service.id
                    );
                    return (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          handleServiceToggle(service, e.target.checked)
                        }
                        style={{ transform: "scale(1.2)" }}
                      />
                    );
                  },
                },
                {
                  title: "Dịch vụ",
                  dataIndex: "consultedServiceName",
                  ellipsis: true,
                  render: (name, service) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{name}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Tổng: {formatCurrency(service.finalPrice)} • Đã thu:{" "}
                        {formatCurrency(service.totalPaid)}
                      </Text>
                    </div>
                  ),
                },
                {
                  title: "Còn nợ",
                  dataIndex: "outstanding",
                  width: 120,
                  align: "right" as const,
                  render: (amount) => (
                    <Text type="danger" strong style={{ fontSize: 14 }}>
                      {formatCurrency(amount)}
                    </Text>
                  ),
                },
                {
                  title: "Số tiền thu",
                  dataIndex: "amount",
                  width: 140,
                  render: (_, service) => {
                    const selectedService = selectedServices.find(
                      (s) => s.consultedServiceId === service.id
                    );
                    const isSelected = selectedServices.some(
                      (s) => s.consultedServiceId === service.id
                    );
                    const amount = selectedService?.amount || 0;

                    return (
                      <Form.Item
                        name={`amount_${service.id}`}
                        style={{ margin: 0 }}
                        rules={
                          isSelected
                            ? [
                                {
                                  required: true,
                                  message: "Vui lòng nhập số tiền",
                                },
                                {
                                  type: "number",
                                  min: 1,
                                  message: "Số tiền phải lớn hơn 0",
                                },
                                {
                                  type: "number",
                                  max: service.outstanding,
                                  message: `Số tiền không được vượt quá ${formatCurrency(
                                    service.outstanding
                                  )}`,
                                },
                              ]
                            : []
                        }
                      >
                        <InputNumber
                          value={amount}
                          min={0}
                          max={service.outstanding}
                          style={{ width: "100%" }}
                          placeholder="Nhập số tiền"
                          disabled={!isSelected}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                          onChange={(value) =>
                            handleAmountChange(service.id, value || 0)
                          }
                        />
                      </Form.Item>
                    );
                  },
                },
                {
                  title: "Phương thức",
                  dataIndex: "paymentMethod",
                  width: 140,
                  render: (_, service) => {
                    const selectedService = selectedServices.find(
                      (s) => s.consultedServiceId === service.id
                    );
                    return (
                      <Select
                        value={
                          selectedService?.paymentMethod ||
                          PAYMENT_METHODS[0].value
                        }
                        style={{ width: "100%" }}
                        disabled={
                          !selectedServices.some(
                            (s) => s.consultedServiceId === service.id
                          )
                        }
                        onChange={(value) =>
                          handlePaymentMethodChange(service.id, value)
                        }
                        options={PAYMENT_METHODS.map((method) => ({
                          label: method.label,
                          value: method.value,
                        }))}
                      />
                    );
                  },
                },
              ]}
            />
          )}
        </Card>

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
              styles={{
                body: {
                  textAlign: "center",
                  backgroundColor: "#f0f9ff",
                  padding: 16,
                },
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
