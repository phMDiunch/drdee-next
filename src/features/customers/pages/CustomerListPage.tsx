// src/features/customers/pages/CustomerListPage.tsx
"use client";
import { useEffect, useState } from "react";
import { Button, Col, Input, message, Row } from "antd";
import CustomerTable from "@/features/customers/components/CustomerTable";
import CustomerModal from "@/features/customers/components/CustomerModal";
import { Customer } from "@/features/customers/type";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useEmployeeProfile } from "@/features/auth/hooks/useAuth";

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data?: Customer;
  }>({ open: false, mode: "add" });

  // ---------- THÊM state phân trang & search ----------
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const { employee } = useEmployeeProfile();

  const fetchCustomers = async (pg = page, ps = pageSize, s = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pg + "",
        pageSize: ps + "",
      });
      if (s) params.set("search", s.trim());
      const res = await fetch(`/api/customers?${params.toString()}`);
      const json = await res.json();
      setCustomers(json.customers);
      setTotal(json.total);
    } catch (err) {
      toast.error("Không thể tải danh sách khách hàng");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers(page, pageSize, search);
    // eslint-disable-next-line
  }, [page, pageSize, search]);

  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
  };

  const handleFinish = async (values: any) => {
    try {
      if (values.dob?.$d) values.dob = dayjs(values.dob).toISOString();
      if (modal.mode === "add") {
        values.clinicId = employee?.clinicId;
        values.createdById = employee?.id;
        values.updatedById = employee?.id;

        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (res.ok) {
          const created = await res.json(); // <-- Lấy object vừa tạo
          toast.success(
            `Khách hàng ${created.fullName} (mã ${created.customerCode}) đã được tạo thành công!`
          );
          setModal({ ...modal, open: false });
          fetchCustomers(1, pageSize, search); // Sau khi thêm, về page 1
        } else {
          const { error } = await res.json();
          toast.error(error || "Lỗi không xác định");
        }
      } else if (modal.mode === "edit" && modal.data) {
        values.updatedById = employee?.id;
        const res = await fetch(`/api/customers/${modal.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (res.ok) {
          toast.success("Cập nhật thành công!");
          setModal({ ...modal, open: false });
          fetchCustomers(page, pageSize, search);
        } else {
          const { error } = await res.json();
          toast.error(error || "Lỗi cập nhật");
        }
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleEdit = (customer: Customer) => {
    setModal({
      open: true,
      mode: "edit",
      data: {
        ...customer,
        dob: customer.dob ? dayjs(customer.dob) : undefined,
      },
    });
  };

  return (
    <div style={{ padding: 24 }}>
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
            onClick={() =>
              setModal({
                open: true,
                mode: "add",
                data: {},
              })
            }
          >
            Thêm khách hàng
          </Button>
        </Col>
      </Row>
      <CustomerTable
        data={customers}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onEdit={handleEdit}
        onPageChange={handlePageChange}
      />
      <CustomerModal
        open={modal.open}
        mode={modal.mode}
        data={modal.data}
        onCancel={() => setModal({ ...modal, open: false })}
        onFinish={handleFinish}
      />
    </div>
  );
}
