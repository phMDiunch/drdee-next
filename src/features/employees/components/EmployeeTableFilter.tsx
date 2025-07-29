// src/features/employees/components/EmployeeTableFilter.tsx
"use client";
import { Input, Select, Row, Col, Space, Button } from "antd";
import { BRANCHES } from "@/constants";
import { TITLES, EMPLOYMENT_STATUS_OPTIONS } from "../constants";
import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";

type Props = {
  onFilter: (filters: {
    search?: string;
    clinicId?: string;
    title?: string;
    employmentStatus?: string;
  }) => void;
};

export default function EmployeeTableFilter({ onFilter }: Props) {
  const [search, setSearch] = useState("");
  const [clinicId, setClinicId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [employmentStatus, setEmploymentStatus] = useState<string | undefined>(
    undefined
  );

  const { employeeProfile } = useAppStore();
  const isAdmin = employeeProfile?.role === "admin";

  if (employeeProfile?.role === "employee") {
    return null; // Không hiển thị gì cả
  }

  const handleFilter = () => {
    onFilter({ search, clinicId, title, employmentStatus });
  };

  const handleReset = () => {
    setSearch("");
    setClinicId(undefined);
    setTitle(undefined);
    setEmploymentStatus(undefined);
    onFilter({});
  };

  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col>
        <Input.Search
          allowClear
          placeholder="Tìm kiếm tên, email, SĐT, mã NV..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={handleFilter}
          style={{ width: 220 }}
        />
      </Col>
      <Col>
        <Select
          allowClear
          placeholder="Chọn cơ sở"
          style={{ width: 160 }}
          value={clinicId}
          options={BRANCHES.map((b) => ({ label: b.label, value: b.value }))}
          onChange={(v) => setClinicId(v)}
          disabled={!isAdmin} // Chỉ cho phép admin chọn clinic
        />
      </Col>
      <Col>
        <Select
          allowClear
          placeholder="Chọn chức danh"
          style={{ width: 160 }}
          value={title}
          options={TITLES.map((t) => ({ label: t, value: t }))}
          onChange={(v) => setTitle(v)}
        />
      </Col>
      <Col>
        <Select
          allowClear
          placeholder="Trạng thái"
          style={{ width: 140 }}
          value={employmentStatus}
          options={EMPLOYMENT_STATUS_OPTIONS}
          onChange={(v) => setEmploymentStatus(v)}
        />
      </Col>
      <Col>
        <Space>
          <Button type="primary" onClick={handleFilter}>
            Lọc
          </Button>
          <Button onClick={handleReset}>Xoá lọc</Button>
        </Space>
      </Col>
    </Row>
  );
}
