// src/features/payment/pages/PaymentDailyPage.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  Statistic,
  DatePicker,
  Button,
  Spin,
  Space,
  Tabs,
} from "antd";
import {
  DollarOutlined,
  CalendarOutlined,
  ReloadOutlined,
  PrinterOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore";
import { formatCurrency } from "@/utils/date";
import { categorizePaymentMethods } from "../constants";
import PaymentVoucherTable from "../components/PaymentVoucherTable";
import PaymentVoucherModal from "../components/PaymentVoucherModal";
import type { PaymentVoucherWithDetails } from "../type";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function PaymentDailyPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Single date like appointments
  const [loading, setLoading] = useState(false);

  // ✅ ADD: Clinic management for admin (like other pages)
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");

  const [dailyPayments, setDailyPayments] = useState<
    PaymentVoucherWithDetails[]
  >([]);
  const [paymentSummary, setPaymentSummary] = useState({
    totalAmount: 0,
    totalVouchers: 0,
    cash: 0,
    cardNormal: 0,
    cardVisa: 0,
    transfer: 0,
  });

  // Modal states
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add";
    data?: undefined;
  }>({ open: false, mode: "add" });

  const { employeeProfile, activeEmployees } = useAppStore();

  // ✅ UPDATED: Clinic scope logic like other pages
  const activeClinicScope =
    employeeProfile?.role === "admin"
      ? selectedClinicId || employeeProfile?.clinicId || ""
      : employeeProfile?.clinicId || "";

  // ✅ UPDATED: Fetch daily payments with clinic scope
  const fetchPaymentsByDate = useCallback(
    async (date: dayjs.Dayjs) => {
      if (!activeClinicScope) return;

      setLoading(true);
      try {
        const startDate = date.startOf("day").toISOString();
        const endDate = date.endOf("day").toISOString();

        const params = new URLSearchParams({
          startDate,
          endDate,
          page: "1",
          pageSize: "1000", // Get all for daily view
          clinicId: activeClinicScope, // ✅ Always use clinic scope
        });

        const res = await fetch(`/api/payment-vouchers?${params.toString()}`);
        const data = await res.json();

        if (res.ok) {
          const payments = data.vouchers || [];
          setDailyPayments(payments);

          // Calculate summary
          const allDetails = payments.flatMap(
            (p: PaymentVoucherWithDetails) => p.details || []
          );
          const summary = categorizePaymentMethods(allDetails);

          setPaymentSummary({
            totalAmount:
              summary.cash +
              summary.cardNormal +
              summary.cardVisa +
              summary.transfer,
            totalVouchers: payments.length,
            ...summary,
          });
        }
      } catch (error) {
        console.error("Fetch daily payments error:", error);
        toast.error("Không thể tải dữ liệu thanh toán");
      }
      setLoading(false);
    },
    [activeClinicScope]
  );

  useEffect(() => {
    if (activeClinicScope) {
      fetchPaymentsByDate(selectedDate);
    }
  }, [activeClinicScope, selectedDate, fetchPaymentsByDate]);

  // ✅ ADD: Fetch clinics for admin (like other pages)
  useEffect(() => {
    const loadClinics = async () => {
      if (employeeProfile?.role !== "admin") return;
      try {
        const res = await fetch("/api/clinics");
        if (!res.ok) throw new Error("Không thể tải danh sách cơ sở");
        let data: { id: string; name: string }[] = await res.json();
        if (!Array.isArray(data)) data = [];

        // Ensure admin's clinic id present
        if (
          employeeProfile.clinicId &&
          !data.find((c) => c.id === employeeProfile.clinicId)
        ) {
          data.push({
            id: employeeProfile.clinicId,
            name: employeeProfile.clinicId,
          });
        }

        setClinics(data);
        // Default selection: keep current or use admin's clinic
        if (!selectedClinicId) {
          setSelectedClinicId(employeeProfile.clinicId || data[0]?.id || "");
        }
      } catch (e) {
        console.error(e);
        toast.error("Lỗi tải danh sách cơ sở");
      }
    };
    loadClinics();
  }, [employeeProfile?.role, employeeProfile?.clinicId, selectedClinicId]);

  // ✅ ADD: Initialize selectedClinicId early for admin
  useEffect(() => {
    if (
      employeeProfile?.role === "admin" &&
      !selectedClinicId &&
      employeeProfile?.clinicId
    ) {
      setSelectedClinicId(employeeProfile.clinicId);
    }
  }, [employeeProfile?.role, employeeProfile?.clinicId, selectedClinicId]);

  // Date navigation functions
  const goToPreviousDay = () => {
    const prevDay = selectedDate.subtract(1, "day");
    setSelectedDate(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = selectedDate.add(1, "day");
    setSelectedDate(nextDay);
  };

  const goToToday = () => {
    setSelectedDate(dayjs());
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Check date states
  const isToday = selectedDate.isSame(dayjs(), "day");
  const isYesterday = selectedDate.isSame(dayjs().subtract(1, "day"), "day");
  const isTomorrow = selectedDate.isSame(dayjs().add(1, "day"), "day");

  // Get date label
  const getDateLabel = () => {
    if (isToday) return "Hôm nay";
    if (isYesterday) return "Hôm qua";
    if (isTomorrow) return "Ngày mai";
    return selectedDate.format("DD/MM/YYYY");
  };

  const handleAdd = () => {
    setModal({
      open: true,
      mode: "add",
      data: undefined,
    });
  };

  const handleFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        createdById: employeeProfile?.id,
        clinicId: activeClinicScope, // ✅ Use activeClinicScope instead of employeeProfile.clinicId
      };

      const res = await fetch("/api/payment-vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Tạo phiếu thu thành công!");
        setModal({ ...modal, open: false });
        fetchPaymentsByDate(selectedDate); // Refresh data
      } else {
        const { error } = await res.json();
        toast.error(error || "Lỗi không xác định");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (voucher: PaymentVoucherWithDetails) => {
    if (employeeProfile?.role !== "admin") {
      toast.error("Chỉ Admin mới có quyền xóa phiếu thu!");
      return;
    }

    const confirmed = window.confirm(
      `Bạn chắc chắn muốn XÓA phiếu thu ${voucher.paymentNumber}?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/payment-vouchers/${voucher.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Xóa phiếu thu thành công!");
        fetchPaymentsByDate(selectedDate); // Refresh data
      } else {
        throw new Error("Xóa phiếu thu thất bại");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  const printDailySummary = () => {
    const printContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2>BÁO CÁO THANH TOÁN NGÀY</h2>
        <p><strong>Ngày:</strong> ${selectedDate.format("DD/MM/YYYY")}</p>
        <p><strong>Thu ngân:</strong> ${employeeProfile?.fullName}</p>
        <hr/>
        <h3>TỔNG KẾT</h3>
        <p>Tổng số phiếu thu: <strong>${
          paymentSummary.totalVouchers
        }</strong></p>
        <p>Tổng tiền thu: <strong>${formatCurrency(
          paymentSummary.totalAmount
        )}</strong></p>
        <hr/>
        <h3>CHI TIẾT THEO PHƯƠNG THỨC</h3>
        <p>💵 Tiền mặt: <strong>${formatCurrency(
          paymentSummary.cash
        )}</strong></p>
        <p>💳 Quẹt thẻ thường: <strong>${formatCurrency(
          paymentSummary.cardNormal
        )}</strong></p>
        <p>💎 Quẹt thẻ Visa: <strong>${formatCurrency(
          paymentSummary.cardVisa
        )}</strong></p>
        <p>🏦 Chuyển khoản: <strong>${formatCurrency(
          paymentSummary.transfer
        )}</strong></p>
      </div>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Báo cáo thanh toán ngày</title></head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* Header with date navigation */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              💰 Thanh toán - {getDateLabel()}
            </Title>
            <Text type="secondary">
              {selectedDate.format("dddd, DD/MM/YYYY")}
            </Text>
          </Col>

          <Col>
            <Row gutter={8} align="middle">
              {/* Date Picker */}
              <Col>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  suffixIcon={<CalendarOutlined />}
                />
              </Col>

              {/* Navigation Buttons */}
              <Col>
                <Space.Compact>
                  <Button
                    icon={<LeftOutlined />}
                    onClick={goToPreviousDay}
                    title="Ngày trước"
                  />
                  <Button
                    onClick={goToToday}
                    type={isToday ? "primary" : "default"}
                    title="Hôm nay"
                  >
                    Hôm nay
                  </Button>
                  <Button
                    icon={<RightOutlined />}
                    onClick={goToNextDay}
                    title="Ngày sau"
                  />
                </Space.Compact>
              </Col>

              {/* Action Buttons */}
              <Col>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchPaymentsByDate(selectedDate)}
                    loading={loading}
                    title="Làm mới"
                  />
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={printDailySummary}
                    disabled={paymentSummary.totalVouchers === 0}
                    title="In báo cáo"
                  >
                    In báo cáo
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* ✅ ADD: Admin clinic tabs (like other pages) */}
        {employeeProfile?.role === "admin" && (
          <div style={{ marginBottom: 16 }}>
            <Tabs
              size="small"
              activeKey={selectedClinicId}
              onChange={(key) => {
                setSelectedClinicId(key);
                // Data will refetch automatically via useEffect dependency
              }}
              items={clinics.map((c) => ({ key: c.id, label: c.name }))}
            />
          </div>
        )}

        {/* Summary Cards */}
        <Spin spinning={loading}>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {/* Total Amount Card - Made smaller and simpler */}
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng tiền thu"
                  value={paymentSummary.totalAmount}
                  formatter={(value) => formatCurrency(Number(value))}
                  prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a", fontSize: "20px" }}
                />
                <Text type="secondary">
                  {paymentSummary.totalVouchers} phiếu thu
                </Text>
              </Card>
            </Col>

            {/* Payment Method Cards */}
            <Col xs={12} sm={6} lg={4}>
              <Card size="small">
                <Statistic
                  title="💵 Tiền mặt"
                  value={paymentSummary.cash}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: "#52c41a", fontSize: "16px" }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={4}>
              <Card size="small">
                <Statistic
                  title="💳 Thẻ thường"
                  value={paymentSummary.cardNormal}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: "#1890ff", fontSize: "16px" }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={5}>
              <Card size="small">
                <Statistic
                  title="💎 Thẻ Visa"
                  value={paymentSummary.cardVisa}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: "#722ed1", fontSize: "16px" }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={6} lg={5}>
              <Card size="small">
                <Statistic
                  title="🏦 Chuyển khoản"
                  value={paymentSummary.transfer}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: "#fa8c16", fontSize: "16px" }}
                />
              </Card>
            </Col>
          </Row>
        </Spin>

        {/* Payments Table */}
        <PaymentVoucherTable
          data={dailyPayments}
          loading={loading}
          onAdd={handleAdd}
          onView={() => {}} // Empty function since we removed the view button
          onDelete={handleDelete}
          showHeader={true}
          title={`Phiếu thu ngày ${selectedDate.format("DD/MM/YYYY")}`}
          hideCustomerColumn={false}
        />

        {/* Payment Voucher Modal */}
        <PaymentVoucherModal
          open={modal.open}
          mode={modal.mode}
          data={undefined}
          onCancel={() => setModal({ ...modal, open: false })}
          onFinish={handleFinish}
          loading={loading}
          availableServices={[]} // Will be populated when customer is selected
          employees={activeEmployees}
        />
      </Card>
    </div>
  );
}
