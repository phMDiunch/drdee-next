import { EMPLOYMENT_STATUS_OPTIONS } from "../constants";
import { Button, Space, Popconfirm } from "antd";
import { useState } from "react";
import { Employee } from "../types";

type Props = {
  employee: Employee;
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
};

export default function EmployeeStatusSwitcher({
  employee,
  onStatusChange,
}: Props) {
  const [loading, setLoading] = useState(false);

  // Tìm trạng thái có thể chuyển sang
  let possible = EMPLOYMENT_STATUS_OPTIONS.filter(
    (opt) => opt.value !== employee.employmentStatus
  );
  // Nếu muốn customize logic chỉ 2 nút theo trạng thái hiện tại:
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
    setLoading(true);
    await onStatusChange(employee.id, newStatus);
    setLoading(false);
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
            loading={loading}
            style={{ color: opt.color, borderColor: opt.color }}
          >
            {opt.label}
          </Button>
        </Popconfirm>
      ))}
    </Space>
  );
}
