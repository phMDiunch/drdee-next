// src/features/treatment-care/components/TreatmentCareTable.tsx
"use client";
import {
  Button,
  Checkbox,
  DatePicker,
  Flex,
  Space,
  Table,
  Tag,
  Typography,
  Popconfirm,
} from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState } from "react";
import { TreatmentCareRecord } from "../type";
import {
  useDeleteTreatmentCareRecord,
  useTreatmentCareRecords,
} from "../hooks/useTreatmentCareRecords";
import TreatmentCareDetail from "./TreatmentCareDetail";

const { Title, Text } = Typography;

interface TreatmentCareTableProps {
  data?: TreatmentCareRecord[];
  loading?: boolean;
  hideCustomerColumn?: boolean;
  onDelete?: (id: string) => void;
  onView?: (record: TreatmentCareRecord) => void;
  title?: string;
  showHeader?: boolean;
  customerId?: string; // For customer detail view
}

export default function TreatmentCareTable({
  data: propData,
  loading: propLoading,
  hideCustomerColumn = false,
  onDelete,
  onView,
  title,
  showHeader = true,
  customerId,
}: TreatmentCareTableProps) {
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [onlyMine, setOnlyMine] = useState(false);
  const [detail, setDetail] = useState<TreatmentCareRecord | undefined>();
  const del = useDeleteTreatmentCareRecord();
  const from = dayjs(to).subtract(34, "day").format("YYYY-MM-DD");

  // Use the same hook but with different parameters based on usage
  const { data: fetchedData, isLoading: fetchedLoading } =
    useTreatmentCareRecords({
      customerId, // Pass customerId if provided
      from: customerId ? undefined : from, // Only use date filters for non-customer view
      to: customerId ? undefined : to,
      groupBy: customerId ? undefined : "day", // Group by day only for general view
      onlyMine: customerId ? false : onlyMine, // Only apply onlyMine filter for general view
    });

  // Determine which data to use - flatten grouped data if needed
  let actualData: TreatmentCareRecord[] = [];
  if (propData) {
    actualData = propData;
  } else if (fetchedData) {
    if (customerId) {
      // Customer-specific data is already flat array
      actualData = fetchedData as TreatmentCareRecord[];
    } else {
      // General data is grouped by day, need to flatten
      const groupedData = fetchedData as {
        day: string;
        items: TreatmentCareRecord[];
      }[];
      actualData = groupedData.flatMap((group) => group.items);
    }
  }

  const actualLoading = propLoading ?? fetchedLoading;

  // Handle view/delete actions
  const handleView = (record: TreatmentCareRecord) => {
    if (onView) {
      onView(record);
    } else {
      setDetail(record);
    }
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    } else {
      del.mutate(id);
    }
  };

  const columns = [
    // Customer column (conditional)
    ...(!hideCustomerColumn
      ? [
          {
            title: "Khách hàng",
            key: "customer",
            render: (_: unknown, record: TreatmentCareRecord) => (
              <div>
                <Text strong>{record.customer?.fullName}</Text>
                <br />
                <Text type="secondary">
                  ({record.customer?.customerCode || ""})
                </Text>
              </div>
            ),
            width: 150,
          },
        ]
      : []),
    {
      title: "Thời gian",
      dataIndex: "careAt",
      key: "careAt",
      render: (careAt: string) => (
        <div>
          <div>{dayjs(careAt).format("DD/MM/YYYY")}</div>
          <Text type="secondary">{dayjs(careAt).format("HH:mm")}</Text>
        </div>
      ),
      width: 120,
      sorter: (a: TreatmentCareRecord, b: TreatmentCareRecord) =>
        dayjs(a.careAt).unix() - dayjs(b.careAt).unix(),
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Trạng thái",
      dataIndex: "careStatus",
      key: "careStatus",
      render: (status: string) => <Tag color="blue">{status}</Tag>,
      width: 120,
    },
    {
      title: "Dịch vụ điều trị",
      key: "treatmentServices",
      render: (_: unknown, record: TreatmentCareRecord) => (
        <Space wrap>
          {record.treatmentServiceNames.map((service: string) => (
            <Tag key={service}>{service}</Tag>
          ))}
        </Space>
      ),
      width: 200,
    },
    {
      title: "Bác sĩ điều trị",
      key: "treatingDoctors",
      render: (_: unknown, record: TreatmentCareRecord) => (
        <Space wrap>
          {record.treatingDoctorNames.map((doctor: string) => (
            <Tag color="green" key={doctor}>
              {doctor}
            </Tag>
          ))}
        </Space>
      ),
      width: 150,
    },
    {
      title: "Nhân viên chăm sóc",
      key: "careStaff",
      dataIndex: ["careStaff", "fullName"],
      render: (staffName: string) => staffName || "-",
      width: 120,
    },
    {
      title: "Nội dung chăm sóc",
      dataIndex: "careContent",
      key: "careContent",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right" as const,
      width: 120,
      render: (_: unknown, record: TreatmentCareRecord) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={del.isPending}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {showHeader && (
        <Flex
          justify="space-between"
          align="center"
          wrap
          gap={12}
          style={{ marginBottom: 16 }}
        >
          <Title level={4} style={{ margin: 0 }}>
            {title || "Nhật ký chăm sóc (35 ngày)"}
          </Title>
          {!customerId && !propData && (
            <Space>
              <Checkbox
                checked={onlyMine}
                onChange={(e) => setOnlyMine(e.target.checked)}
              >
                Chỉ của tôi
              </Checkbox>
              <DatePicker
                value={dayjs(to)}
                onChange={(d) => setTo((d || dayjs()).format("YYYY-MM-DD"))}
              />
            </Space>
          )}
        </Flex>
      )}

      <Table
        columns={columns}
        dataSource={actualData}
        rowKey="id"
        loading={actualLoading}
        bordered
        size="middle"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} bản ghi`,
        }}
        scroll={{ x: hideCustomerColumn ? 1000 : 1200 }}
      />

      {!onView && (
        <TreatmentCareDetail
          open={!!detail}
          onClose={() => setDetail(undefined)}
          record={detail}
        />
      )}
    </div>
  );
}
