// src/features/payment/pages/PaymentListPage.tsx
"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Button, Col, Input, Row, Segmented, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import PaymentVoucherTable from "@/features/payment/components/PaymentVoucherTable";
import PaymentVoucherModal from "@/features/payment/components/PaymentVoucherModal";
import { PaymentVoucherWithDetails } from "@/features/payment/type";
import { toast } from "react-toastify";
import { useAppStore } from "@/stores/useAppStore";

const { Title } = Typography;

export default function PaymentListPage() {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "view";
    data?: PaymentVoucherWithDetails;
  }>({ open: false, mode: "add" });

  const [tablePayments, setTablePayments] = useState<
    PaymentVoucherWithDetails[]
  >([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(20);
  const [tableTotal, setTableTotal] = useState(0);
  const [tableSearch, setTableSearch] = useState("");

  const { employeeProfile, activeEmployees } = useAppStore();

  // Lọc danh sách employees
  const employees = useMemo(() => {
    return activeEmployees.filter(
      (emp) => emp.title === "Thu ngân" || emp.title === "Lễ tân"
    );
  }, [activeEmployees]);

  const fetchTablePayments = useCallback(async () => {
    if (!employeeProfile) return;
    setTableLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(tablePage),
        pageSize: String(tablePageSize),
        search: tableSearch.trim(),
      });
      if (employeeProfile.role !== "admin") {
        params.set("clinicId", employeeProfile.clinicId || "");
      }
      const res = await fetch(`/api/payment-vouchers?${params.toString()}`);
      const data = await res.json();
      setTablePayments(data.vouchers || []);
      setTableTotal(data.total || 0);
    } catch {
      toast.error("Không thể tải danh sách phiếu thu");
    }
    setTableLoading(false);
  }, [tablePage, tablePageSize, tableSearch, employeeProfile]);

  useEffect(() => {
    if (employeeProfile) {
      fetchTablePayments();
    }
  }, [fetchTablePayments, employeeProfile]);

  const refetchData = () => {
    fetchTablePayments();
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        createdById: employeeProfile?.id,
        clinicId: employeeProfile?.clinicId,
      };

      const res = await fetch("/api/payment-vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Tạo phiếu thu thành công!");
        setModal({ ...modal, open: false });
        refetchData();
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

  const handleView = (voucher: PaymentVoucherWithDetails) => {
    setModal({
      open: true,
      mode: "view",
      data: voucher,
    });
  };

  const handleDelete = async (voucher: PaymentVoucherWithDetails) => {
    if (employeeProfile?.role !== "admin") {
      toast.error("Chỉ Admin mới có quyền xóa phiếu thu!");
      return;
    }

    const confirmed = window.confirm(
      `Bạn chắc chắn muốn XÓA phiếu thu ${voucher.paymentNumber}? Hành động này sẽ cập nhật lại công nợ của khách hàng.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/payment-vouchers/${voucher.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Xóa phiếu thu thất bại");
      }

      toast.success("Xóa phiếu thu thành công!");
      refetchData();
    } catch (error: any) {
      console.error("Delete payment error:", error);
      toast.error(error.message);
    }
  };

  const handlePageChange = (p: number, ps: number) => {
    setTablePage(p);
    setTablePageSize(ps);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Search Controls */}
      <Row align="middle" gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Input.Search
            allowClear
            placeholder="Tìm số phiếu, tên khách hàng..."
            style={{ width: 300 }}
            onSearch={(v) => {
              setTablePage(1);
              setTableSearch(v);
            }}
          />
        </Col>
      </Row>

      {/* Payment Voucher Table */}
      <PaymentVoucherTable
        data={tablePayments}
        loading={tableLoading}
        total={tableTotal}
        page={tablePage}
        pageSize={tablePageSize}
        onAdd={() => setModal({ open: true, mode: "add", data: undefined })}
        onView={handleView}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        showHeader={true}
        title="Quản lý phiếu thu"
        hideCustomerColumn={false} // Show customer column in list view
      />

      {/* Payment Voucher Modal */}
      <PaymentVoucherModal
        open={modal.open}
        mode={modal.mode}
        data={modal.data}
        onCancel={() => setModal({ ...modal, open: false })}
        onFinish={modal.mode === "add" ? handleFinish : undefined}
        loading={loading}
        availableServices={[]} // Will be populated when customer is selected
        employees={employees}
      />
    </div>
  );
}
