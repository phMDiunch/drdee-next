// src/features/treatment-care/components/CandidatesTable.tsx
"use client";
import {
  Button,
  Flex,
  Input,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  DatePicker,
  Tooltip,
} from "antd";
import { PhoneOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import dayjs from "dayjs";
import { useAftercareCandidates } from "../hooks/useCandidates";
import { CandidateItem } from "../type";
import CreateCareModal from "./CreateCareModal";

const { Title } = Typography;

export default function CandidatesTable() {
  const [date, setDate] = useState(
    dayjs().subtract(1, "day").format("YYYY-MM-DD")
  );
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState<{ visible: boolean; item?: CandidateItem }>({
    visible: false,
  });

  const { data, isLoading, refetch } = useAftercareCandidates({
    date,
    keyword: keyword || undefined,
  });

  const columns: import("antd").TableProps<CandidateItem>["columns"] = [
    {
      title: "Mã KH",
      dataIndex: "customerCode",
      key: "customerCode",
      width: 120,
    },
    {
      title: "Họ tên",
      dataIndex: "customerName",
      key: "customerName",
      render: (text: string, r: CandidateItem) => (
        <Link href={`/customers/${r.customerId}`}>{text}</Link>
      ),
    },
    {
      title: "Liên hệ",
      key: "phoneIcon",
      width: 80,
      render: (_: unknown, r: CandidateItem) =>
        r.phone ? (
          <Tooltip title={r.phone}>
            <a href={`tel:${r.phone}`}>
              <PhoneOutlined />
            </a>
          </Tooltip>
        ) : null,
    },
    {
      title: "Dịch vụ điều trị",
      key: "treatmentServiceNames",
      render: (_: unknown, r: CandidateItem) => (
        <Space wrap>
          {r.treatmentServiceNames.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "BS điều trị",
      key: "treatingDoctorNames",
      render: (_: unknown, r: CandidateItem) => (
        <Space wrap>
          {r.treatingDoctorNames.map((s) => (
            <Tag color="blue" key={s}>
              {s}
            </Tag>
          ))}
        </Space>
      ),
    },
    { title: "Số lần CS", dataIndex: "careCount", width: 100 },
    {
      title: "",
      key: "actions",
      width: 140,
      render: (_: unknown, r: CandidateItem) => (
        <Button
          type="primary"
          onClick={() => setOpen({ visible: true, item: r })}
        >
          Chăm sóc
        </Button>
      ),
    },
  ];

  return (
    <Flex vertical gap={12}>
      <Flex justify="space-between" align="center" gap={12} wrap>
        <Title level={4} style={{ margin: 0 }}>
          Khách hàng cần chăm sóc
        </Title>
        <Space>
          <Button
            onClick={() =>
              setDate(dayjs(date).subtract(1, "day").format("YYYY-MM-DD"))
            }
          >
            {"<"}
          </Button>
          <DatePicker
            value={dayjs(date)}
            onChange={(d) =>
              setDate(
                d
                  ? d.format("YYYY-MM-DD")
                  : dayjs().subtract(1, "day").format("YYYY-MM-DD")
              )
            }
          />
          <Button
            onClick={() =>
              setDate(dayjs(date).add(1, "day").format("YYYY-MM-DD"))
            }
          >
            {">"}
          </Button>
          <Input.Search
            allowClear
            placeholder="Tìm tên/mã/điện thoại"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={() => refetch()}
          />
        </Space>
      </Flex>

      {isLoading ? (
        <Spin />
      ) : (
        <Table<CandidateItem>
          rowKey={(r) => r.customerId}
          columns={columns}
          dataSource={data || []}
          pagination={false}
          size="small"
        />
      )}

      <CreateCareModal
        open={open.visible}
        onClose={() => setOpen({ visible: false })}
        customerId={open.item?.customerId || ""}
        treatmentDate={date}
      />
    </Flex>
  );
}
