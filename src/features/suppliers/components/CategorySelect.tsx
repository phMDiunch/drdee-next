// src/features/suppliers/components/CategorySelect.tsx
"use client";

import { Select } from "antd";
import { SUPPLIER_CATEGORIES, getSupplierCategoryColor } from "../constants";
import type { SupplierCategoryType } from "../type";

interface CategorySelectProps {
  value?: SupplierCategoryType;
  onChange?: (value: SupplierCategoryType) => void;
  placeholder?: string;
  allowClear?: boolean;
  size?: "small" | "middle" | "large";
  disabled?: boolean;
  style?: React.CSSProperties;
}

export default function CategorySelect({
  value,
  onChange,
  placeholder = "Chọn loại nhà cung cấp",
  allowClear = true,
  size = "middle",
  disabled = false,
  style,
}: CategorySelectProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      allowClear={allowClear}
      size={size}
      disabled={disabled}
      style={style}
      showSearch
      optionFilterProp="label"
      options={SUPPLIER_CATEGORIES.map((category) => ({
        value: category.value,
        label: (
          <span>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: getSupplierCategoryColor(category.value),
                marginRight: "8px",
              }}
            />
            {category.label}
          </span>
        ),
      }))}
    />
  );
}
