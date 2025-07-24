// src/features/employees/components/EmployeeStatusSwitcher.tsx
"use client";
import { EMPLOYMENT_STATUS_OPTIONS } from "../constants";
import { Button, Space, Popconfirm } from "antd";
import { useState } from "react";
import type { Employee } from "../type";

type Props = {
  employee: Employee;
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
};

export default function EmployeeStatusSwitcher({
  employee,
  onStatusChange,
}: Props) {
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);

  // Tìm trạng thái có thể chuyển sang
  let possible = EMPLOYMENT_STATUS_OPTIONS.filter(
    (opt) => opt.value !== employee.employmentStatus
  );
  // Customize chỉ 2 nút chuyển nhanh
  if (employee.employmentStatus === "Đang làm việc") {
    possible = EMPLOYMENT_STATUS_OPTIONS.filter((opt) =>
      ["Thử việc", "Nghỉ việc"].includes(opt.value)
    );
  } else if (employee.employmentStatus === "Nghỉ việc") {
    possible = EMPLOYMENT_STATUS_OPTIONS.filter((opt) =>
      ["Đang làm việc", "Thử việc"].includes(opt.value)
    );
  }

  const handleChange = async (newStatus: string) => {
    setLoadingStatus(newStatus);
    await onStatusChange(employee.id, newStatus);
    setLoadingStatus(null);
  };

  return (
    <Space>
      {possible.map((opt) => (
        <Popconfirm
          key={opt.value}
          title={`Chuyển trạng thái nhân viên sang "${opt.label}"?`}
          onConfirm={() => handleChange(opt.value)}
        >
          <Button
            size="small"
            type="dashed"
            loading={loadingStatus === opt.value}
            style={
              opt.color
                ? { color: opt.color, borderColor: opt.color }
                : undefined
            }
          >
            {opt.label}
          </Button>
        </Popconfirm>
      ))}
    </Space>
  );
}
