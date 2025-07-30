// src/features/customers/pages/CustomerListPage.tsx
"use client";
import { useEffect, useState } from "react";
import { Button, Col, Input, Row, Modal, Form, Select } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import CustomerTable from "@/features/customers/components/CustomerTable";
import CustomerModal from "@/features/customers/components/CustomerModal";
import { Customer } from "@/features/customers/type";
import { formatDateTimeVN } from "@/utils/date";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore";

export default function CustomerListPage() {
  // States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // Customer modal
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Customer;
  }>({ open: false, mode: "add" });

  // Check-in modal
  const [checkInModal, setCheckInModal] = useState<{
    open: boolean;
    customer?: Customer;
  }>({ open: false });
  const [checkingIn, setCheckingIn] = useState(false);

  // Hooks
  const { employeeProfile, activeEmployees } = useAppStore();
  const [form] = Form.useForm();

  // Computed
  const dentists = activeEmployees.filter((emp) => emp.title === "Bác sĩ");

  // Fetch customers
  const fetchCustomers = async (pg = page, ps = pageSize, s = search) => {
    if (!employeeProfile?.clinicId) {
      setCustomers([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pg.toString(),
        pageSize: ps.toString(),
        clinicId: employeeProfile.clinicId,
        includeToday: "true",
      });

      if (s) params.set("search", s.trim());

      const res = await fetch(`/api/customers?${params.toString()}`);
      const json = await res.json();

      setCustomers(json.customers);
      setTotal(json.total);
    } catch (err) {
      toast.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (employeeProfile) {
      fetchCustomers(page, pageSize, search);
    }
  }, [page, pageSize, search, employeeProfile]);

  // Handlers
  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
  };

  const handleCheckIn = (customer: Customer) => {
    if (customer.todayAppointment?.checkInTime) {
      toast.info("Khách hàng đã check-in rồi!");
      return;
    }

    setCheckInModal({ open: true, customer });
    form.resetFields();

    // Pre-fill nếu có lịch hẹn
    if (customer.todayAppointment) {
      form.setFieldsValue({
        notes: `Check-in cho lịch hẹn ${formatDateTimeVN(
          customer.todayAppointment.appointmentDateTime
        )}`,
      });
    }
  };

  const handleCheckInSubmit = async (values: any) => {
    if (!checkInModal.customer) return;

    try {
      setCheckingIn(true);
      const res = await fetch(
        `/api/customers/${checkInModal.customer.id}/checkin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            updatedById: employeeProfile?.id,
          }),
        }
      );

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Check-in thất bại");
      }

      const responseData = await res.json();
      toast.success(responseData.message);

      setCheckInModal({ open: false });
      form.resetFields();
      fetchCustomers(page, pageSize, search);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCustomerSubmit = async (values: any) => {
    try {
      // Process date
      if (values.dob?.$d) {
        values.dob = dayjs(values.dob).toISOString();
      }

      const processedValues = {
        ...values,
        primaryContactId: values.primaryContactId || null,
        relationshipToPrimary: values.primaryContactId
          ? values.relationshipToPrimary
          : null,
        email: values.email || null,
        updatedById: employeeProfile?.id,
      };

      let res;

      if (modal.mode === "add") {
        processedValues.clinicId = employeeProfile?.clinicId;
        processedValues.createdById = employeeProfile?.id;

        res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(processedValues),
        });
      } else if (modal.mode === "edit" && modal.data) {
        res = await fetch(`/api/customers/${modal.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(processedValues),
        });
      }

      if (res?.ok) {
        const result = await res.json();
        toast.success(
          modal.mode === "add"
            ? `Khách hàng ${result.fullName} (${result.customerCode}) đã được tạo thành công!`
            : "Cập nhật thành công!"
        );

        setModal({ open: false, mode: "add" });
        fetchCustomers(modal.mode === "add" ? 1 : page, pageSize, search);
      } else {
        const { error } = await res?.json();
        toast.error(error || "Có lỗi xảy ra");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Row align="middle" gutter={16} style={{ marginBottom: 16 }}>
        <Col flex={1}>
          <h2 style={{ margin: 0 }}>Danh sách khách hàng</h2>
        </Col>
        <Col>
          <Input.Search
            allowClear
            placeholder="Tìm kiếm khách hàng..."
            style={{ width: 280 }}
            onSearch={(v) => {
              setPage(1);
              setSearch(v.trim());
            }}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={() => setModal({ open: true, mode: "add" })}
          >
            Thêm khách hàng
          </Button>
        </Col>
      </Row>

      {/* Table */}
      <CustomerTable
        data={customers}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onCheckIn={handleCheckIn}
      />

      {/* Customer Modal */}
      <CustomerModal
        open={modal.open}
        mode={modal.mode}
        data={modal.data}
        onCancel={() => setModal({ open: false, mode: "add" })}
        onFinish={handleCustomerSubmit}
        customers={customers}
      />

      {/* Check-in Modal */}
      <Modal
        title={`Check-in: ${checkInModal.customer?.fullName}`}
        open={checkInModal.open}
        onCancel={() => setCheckInModal({ open: false })}
        footer={null}
        width={500}
      >
        {checkInModal.customer && (
          <Form form={form} layout="vertical" onFinish={handleCheckInSubmit}>
            {/* Customer Info */}
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                background: "#f5f5f5",
                borderRadius: 6,
              }}
            >
              <div>
                <strong>Khách hàng:</strong> {checkInModal.customer.fullName}
              </div>
              <div>
                <strong>SĐT:</strong> {checkInModal.customer.phone}
              </div>

              {checkInModal.customer.todayAppointment ? (
                <div style={{ marginTop: 8 }}>
                  <div style={{ color: "green" }}>✅ Có lịch hẹn hôm nay</div>
                  <div>
                    🕐{" "}
                    {formatDateTimeVN(
                      checkInModal.customer.todayAppointment.appointmentDateTime
                    )}
                  </div>
                  <div>
                    👨‍⚕️{" "}
                    {
                      checkInModal.customer.todayAppointment.primaryDentist
                        .fullName
                    }
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 8, color: "orange" }}>
                  ⚠️ Chưa có lịch hẹn → Sẽ tạo lịch mới
                </div>
              )}
            </div>

            {/* Dentist Selection - only if no appointment */}
            {!checkInModal.customer.todayAppointment && (
              <Form.Item
                label="Bác sĩ chính"
                name="primaryDentistId"
                rules={[{ required: true, message: "Vui lòng chọn bác sĩ" }]}
              >
                <Select placeholder="Chọn bác sĩ chính">
                  {dentists.map((dentist) => (
                    <Select.Option key={dentist.id} value={dentist.id}>
                      {dentist.fullName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {/* Notes */}
            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea rows={3} placeholder="Ghi chú thêm (tùy chọn)" />
            </Form.Item>

            {/* Actions */}
            <Form.Item style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={checkingIn}
                  icon={<LoginOutlined />}
                >
                  {checkInModal.customer.todayAppointment
                    ? "Check-in"
                    : "Tạo lịch & Check-in"}
                </Button>
                <Button onClick={() => setCheckInModal({ open: false })}>
                  Hủy
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
