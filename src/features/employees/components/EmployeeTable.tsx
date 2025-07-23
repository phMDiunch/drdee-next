import { Button, Space, Table, Tag } from "antd";
import { Employee } from "../types";
import { BRANCHES } from "@/constants";
import { EMPLOYMENT_STATUS_OPTIONS } from "../constants";
import { formatDateTimeVN } from "@/utils/date";
import EmployeeStatusSwitcher from "./EmployeeStatusSwitcher";

export default function EmployeeTable({
  data,
  loading,
  onEdit,
  onChangeStatus,
}: {
  data: Employee[];
  loading: boolean;
  onEdit: (employee: Employee) => void;
  onChangeStatus: (id: string, newStatus: string) => Promise<void>;
}) {
  const columns = [
    { title: "Tên nhân viên", dataIndex: "fullName", key: "fullName" },
    {
      title: "Chi nhánh",
      dataIndex: "clinicId",
      render: (v: string) => {
        const branch = BRANCHES.find((b) => b.value === v);
        return branch ? <Tag color={branch.color}>{branch.value}</Tag> : null;
      },
    },
    { title: "Số ĐT", dataIndex: "phone", key: "phone" },
    { title: "Vai trò", dataIndex: "role", key: "role" },
    {
      title: "Trạng thái",
      dataIndex: "employmentStatus",
      key: "employmentStatus",
      render: (v: string) => {
        const status = EMPLOYMENT_STATUS_OPTIONS.find(
          (item) => item.value === v
        );
        return status ? <Tag color={status.color}>{status.label}</Tag> : null;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => formatDateTimeVN(v),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Employee) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <EmployeeStatusSwitcher
            employee={record}
            onStatusChange={onChangeStatus}
          />
        </Space>
      ),
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      bordered
    />
  );
}
