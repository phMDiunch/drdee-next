// src/features/suppliers/components/SupplierTable.tsx
"use client";

import { Table, Tag, Button, Space, Typography, Rate, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  getSupplierCategoryLabel,
  getSupplierCategoryColor,
} from "../constants";
import type { SupplierWithRelations } from "../type";
import dayjs from "dayjs";

const { Text } = Typography;

interface SupplierTableProps {
  data: SupplierWithRelations[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onView?: (supplier: SupplierWithRelations) => void;
  onEdit?: (supplier: SupplierWithRelations) => void;
  onDelete?: (supplier: SupplierWithRelations) => void;
}

export default function SupplierTable({
  data,
  loading = false,
  pagination,
  onView,
  onEdit,
  onDelete,
}: SupplierTableProps) {
  const columns: ColumnsType<SupplierWithRelations> = [
    {
      title: "Mã NCC",
      dataIndex: "supplierCode",
      key: "supplierCode",
      width: 120,
      render: (code) => <Text code>{code || "Chưa có"}</Text>,
    },
    {
      title: "Tên nhà cung cấp",
      dataIndex: "name",
      key: "name",
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: "Loại",
      dataIndex: "categoryType",
      key: "categoryType",
      width: 150,
      render: (categoryType) => (
        <Tag color={getSupplierCategoryColor(categoryType)}>
          {getSupplierCategoryLabel(categoryType)}
        </Tag>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div>
          {record.contactPerson && (
            <div>
              <Text type="secondary">Người LH: </Text>
              <Text>{record.contactPerson}</Text>
            </div>
          )}
          {record.phone && (
            <div>
              <Text type="secondary">SĐT: </Text>
              <Text>{record.phone}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 120,
      render: (rating) => (
        <Rate disabled value={rating} style={{ fontSize: 14 }} />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => (
        <Text type="secondary">{dayjs(date).format("DD/MM/YYYY")}</Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {onView && (
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              title="Xem chi tiết"
            />
          )}
          {onEdit && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              title="Chỉnh sửa"
            />
          )}
          {onDelete && (
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn vô hiệu hóa nhà cung cấp này?"
              onConfirm={() => onDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
                title="Xóa"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={
        pagination
          ? {
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: pagination.onChange,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} nhà cung cấp`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }
          : false
      }
      scroll={{ x: 1200 }}
      size="small"
    />
  );
}
