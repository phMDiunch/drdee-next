// src/features/suppliers/components/SupplierFilters.tsx
"use client";

import { Input, Select, Space, Button } from "antd";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";
import { SUPPLIER_RATING_OPTIONS, SUPPLIER_STATUS_OPTIONS } from "../constants";
import CategorySelect from "./CategorySelect";
import type { SupplierFilters as SupplierFiltersType } from "../type";

const { Search } = Input;

interface SupplierFiltersProps {
  filters: SupplierFiltersType;
  onFiltersChange: (filters: SupplierFiltersType) => void;
  loading?: boolean;
}

export default function SupplierFilters({
  filters,
  onFiltersChange,
  loading = false,
}: SupplierFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
      page: 1, // Reset to first page when searching
    });
  };

  const handleCategoryChange = (categoryType?: string) => {
    onFiltersChange({
      ...filters,
      categoryType: categoryType as SupplierFiltersType["categoryType"],
      page: 1,
    });
  };

  const handleStatusChange = (isActive?: boolean) => {
    onFiltersChange({
      ...filters,
      isActive,
      page: 1,
    });
  };

  const handleRatingChange = (rating?: number) => {
    onFiltersChange({
      ...filters,
      rating,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit || 10,
    });
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.categoryType ||
    filters.isActive !== undefined ||
    filters.rating
  );

  return (
    <Space wrap size="middle" style={{ marginBottom: 16 }}>
      <Search
        placeholder="Tìm theo tên, mã, SĐT, người liên hệ..."
        value={filters.search || ""}
        onChange={(e) => handleSearchChange(e.target.value)}
        onSearch={handleSearchChange}
        style={{ width: 300 }}
        allowClear
        disabled={loading}
        prefix={<SearchOutlined />}
      />

      <CategorySelect
        value={filters.categoryType}
        onChange={handleCategoryChange}
        placeholder="Tất cả loại"
        allowClear
        disabled={loading}
        style={{ width: 180 }}
      />

      <Select
        value={filters.isActive}
        onChange={handleStatusChange}
        placeholder="Tất cả trạng thái"
        allowClear
        disabled={loading}
        style={{ width: 150 }}
        options={SUPPLIER_STATUS_OPTIONS.map((status) => ({
          value: status.value,
          label: status.label,
        }))}
      />

      <Select
        value={filters.rating}
        onChange={handleRatingChange}
        placeholder="Tất cả đánh giá"
        allowClear
        disabled={loading}
        style={{ width: 160 }}
        options={SUPPLIER_RATING_OPTIONS.map((rating) => ({
          value: rating.value,
          label: `${rating.value}+ sao`,
        }))}
      />

      {hasActiveFilters && (
        <Button
          icon={<ClearOutlined />}
          onClick={handleClearFilters}
          disabled={loading}
        >
          Xóa bộ lọc
        </Button>
      )}
    </Space>
  );
}
